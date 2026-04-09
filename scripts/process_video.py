"""
GitHub Actions worker: extract video metadata via yt-dlp and categorize with OpenAI.

Usage:
    python scripts/process_video.py <link_id>

Environment variables:
    MONGODB_URI   – MongoDB connection string
    OPENAI_API_KEY – OpenAI API key
"""

import json
import os
import sys
import traceback
from datetime import datetime, timezone

from bson import ObjectId
from pymongo import MongoClient
from openai import OpenAI

# ---------------------------------------------------------------------------
# MongoDB helpers
# ---------------------------------------------------------------------------

MONGODB_URI = os.environ["MONGODB_URI"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


def get_db():
    client = MongoClient(MONGODB_URI)
    return client.get_default_database()


# ---------------------------------------------------------------------------
# yt-dlp metadata extraction
# ---------------------------------------------------------------------------

def extract_video_metadata(url: str) -> dict | None:
    """Return metadata dict or None if yt-dlp fails."""
    try:
        import yt_dlp

        opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
            "socket_timeout": 30,
            # Don't extract comments or subtitles
            "getcomments": False,
            "writesubtitles": False,
        }

        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)

        if not info:
            return None

        return {
            "title": info.get("title"),
            "description": (info.get("description") or "")[:3000],
            "uploader": info.get("uploader") or info.get("channel"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "upload_date": info.get("upload_date"),
            "view_count": info.get("view_count"),
            "like_count": info.get("like_count"),
        }
    except Exception as exc:
        print(f"yt-dlp failed for {url}: {exc}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# OpenAI categorization (mirrors api/_process.js logic)
# ---------------------------------------------------------------------------

RECAT_HINTS = {
    "movie": "OVERRIDE: The user says this is a MOVIE (film). You MUST categorize it as a movie with extension_type \"movie\" and media_type \"movie\". Use the Peliculas category.",
    "tv": "OVERRIDE: The user says this is a TV SHOW/SERIES. You MUST categorize it as a TV show with extension_type \"movie\" and media_type \"tv\". Use the Series category.",
    "documentary": "OVERRIDE: The user says this is a DOCUMENTARY. You MUST categorize it with extension_type \"movie\" and media_type \"tv\" (or \"movie\" if it's a standalone documentary film). Use the Documentales category (slug: \"documentales\").",
    "recipe": "OVERRIDE: The user says this is a RECIPE. You MUST categorize it as a recipe with extension_type \"recipe\". Extract ingredients with quantities and steps.",
    "generic": "OVERRIDE: The user says this is GENERIC content. You MUST categorize it with extension_type \"generic\".",
    "short": "OVERRIDE: The user says this is a SHORT FILM (cortometraje). You MUST categorize it under Cortometrajes (slug: \"cortometrajes\") with extension_type \"generic\".",
    "book": "OVERRIDE: The user says this is a BOOK. You MUST categorize it with extension_type \"book\". Use the Libros category (slug: \"libros\").",
    "director": "OVERRIDE: The user says this is a DIRECTOR. You MUST categorize it with extension_type \"director\". Use the Directores category (slug: \"directores\").",
}


LANGUAGE_NAMES = {"en": "English", "es": "Spanish", "fr": "French"}

def categorize_content(content: str, url: str, categories: list, recat_hint: str | None, user_hint: str | None, language: str = "en") -> dict:
    """Call OpenAI to categorize content. Returns parsed JSON dict."""
    if categories:
        cats_desc = "\n".join(
            f'- "{c["name"]}" (slug: {c["slug"]}, type: {c.get("extension_type", "generic")})'
            for c in categories
        )
    else:
        cats_desc = "(no categories exist yet)"

    hint_block = ""
    if recat_hint and recat_hint in RECAT_HINTS:
        hint_block = f"\n\n{RECAT_HINTS[recat_hint]}\n"
    if user_hint:
        hint_block += f"\nADDITIONAL CONTEXT FROM USER: {user_hint}\n"

    lang_name = LANGUAGE_NAMES.get(language, "English")
    lang_instruction = ""
    if language and language != "en":
        lang_instruction = f'\n\nLANGUAGE: Create all category names, titles, and summaries in {lang_name}. For example, use "Pel\u00edculas" not "Movies" for Spanish, "Films" not "Movies" for French. All user-facing text in the response must be in {lang_name}.\n'

    system_prompt = "You are a link categorizer and content extractor. Respond with ONLY valid JSON (no markdown fences, no explanation)."

    user_prompt = f"""Analyze the following content from this URL: {url}{hint_block}{lang_instruction}

Existing categories:
{cats_desc}

Respond with ONLY valid JSON in this exact schema:
{{
  "title": "clean descriptive title (for recipes: the dish name, e.g. 'Matambre de cerdo', not clickbait like 'Un matambrito increible')",
  "summary": "2-3 sentence summary of the content",
  "category": {{
    "name": "Category Name",
    "slug": "category-slug",
    "extension_type": "movie | recipe | book | director | generic",
    "is_new": false,
    "icon_svg": null
  }},
  "extension_data": {{}}
}}

Rules:
- Use an EXISTING category if one fits. Only create a new one if nothing matches.
- DYNAMIC CATEGORY CREATION: If no existing category fits, create a NEW one. Set "is_new": true and provide "icon_svg" with SVG inner content (just the paths/shapes, NO outer <svg> tag). The icon must follow this style: viewBox assumes 0 0 24 24, fill="none", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round". Example icon_svg: "<circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><path d=\\"M12 6v6l4 2\\"/>". Keep it simple (2-4 elements max). For existing categories, set "is_new": false and "icon_svg": null.
- extension_type must be "movie" for movies AND TV shows/series, "recipe" for cooking recipes, "book" for books, "director" for film/TV directors, "generic" for everything else.
- IMPORTANT: Movies and TV shows must be in SEPARATE categories. Use a category like "Peliculas" (slug: "peliculas") for movies and a different category like "Series" (slug: "series") for TV shows/series. Never mix them.
- DOCUMENTARIES: If the content is a documentary (series or film), categorize it as "Documentales" (slug: "documentales") with extension_type "movie". Use media_type "tv" for documentary series, "movie" for standalone documentary films.
- SHORT FILMS: If the content is a short film (cortometraje), categorize it as "Cortometrajes" (slug: "cortometrajes") with extension_type "generic".
- For "movie" extension_type, set extension_data to: {{"search_title": "movie name in English (preferred for TMDB search)", "media_type": "movie" or "tv", "year": "2024", "rating": "8.5" (from content if available, or null)}}
- For "recipe" extension_type, set extension_data to: {{"prep_time": "10 min", "cook_time": "30 min", "servings": "4", "ingredients": ["200g harina", "2 huevos", "1 taza leche"], "steps": ["step1", "step2"]}}
  IMPORTANT: Each ingredient MUST include the quantity/amount.
- For "book" extension_type, use category "Libros" (slug: "libros"). Set extension_data to: {{"search_title": "book title in original language", "author": "author name", "year": "2024"}}
- For "director" extension_type, use category "Directores" (slug: "directores"). Set extension_data to: {{"search_name": "director full name"}}
- For "generic" extension_type, set extension_data to: {{}}
- MULTI-ITEM: If the content lists MULTIPLE movies or TV shows (e.g. "50 movies to watch", "top 10 series"), you MUST return ALL of them as an "items" array. Each item needs search_title, media_type, and year. Only use "items" when the content clearly lists multiple distinct titles.

--- CONTENT START ---
{content}
--- CONTENT END ---"""

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        timeout=120,
    )

    text = (response.choices[0].message.content or "").strip()
    if not text:
        raise RuntimeError("OpenAI returned empty output")

    # Strip markdown fences if present
    import re
    fence = re.search(r"```(?:json)?\s*\n([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find first { ... } balanced block
    start = text.find("{")
    if start == -1:
        raise RuntimeError(f"No JSON found in OpenAI output: {text[:300]}")

    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : i + 1])

    raise RuntimeError("Unclosed JSON in OpenAI output")


# ---------------------------------------------------------------------------
# Main processing
# ---------------------------------------------------------------------------

def process_video(link_id: str):
    db = get_db()
    links = db["links"]
    categories = db["categories"]

    # 1. Fetch link document
    link = links.find_one({"_id": ObjectId(link_id)})
    if not link:
        print(f"Link {link_id} not found in database", file=sys.stderr)
        sys.exit(1)

    url = link["url"].strip()
    user_id = link.get("user_id")
    language = link.get("language", "en")

    print(f"Processing video link: {url}")

    # 2. Extract metadata with yt-dlp
    meta = extract_video_metadata(url)

    # 3. Build content for AI categorization
    if meta and meta.get("title"):
        parts = []
        if meta["title"]:
            parts.append(f"Title: {meta['title']}")
        if meta.get("uploader"):
            parts.append(f"Channel/Uploader: {meta['uploader']}")
        if meta.get("description"):
            parts.append(f"Description: {meta['description']}")
        content = "\n".join(parts)
        thumbnail = meta.get("thumbnail")
        source_type = "video"
    else:
        # yt-dlp failed – fall back to URL-only categorization
        print("yt-dlp metadata extraction failed, falling back to URL-only mode")
        content = f"URL: {url}\n(Video content — metadata could not be extracted. Categorize based on the URL and domain.)"
        thumbnail = None
        source_type = "url-only"

    # 4. Fetch user's categories
    cat_query = {"user_id": user_id} if user_id else {}
    user_categories = list(categories.find(cat_query).sort("name", 1))
    cat_list = [
        {
            "_id": str(c["_id"]),
            "name": c["name"],
            "slug": c["slug"],
            "extension_type": c.get("extension_type", "generic"),
        }
        for c in user_categories
    ]

    # 5. AI categorization
    ext_data = link.get("extension_data") or {}
    recat_hint = ext_data.get("recategorize_as")
    user_hint = ext_data.get("user_hint")
    ai_result = categorize_content(content, url, cat_list, recat_hint, user_hint, language)

    # 6. Find or create category
    cat_info = ai_result["category"]
    cat_find_query = {"slug": cat_info["slug"]}
    if user_id:
        cat_find_query["user_id"] = user_id

    category = categories.find_one(cat_find_query)
    if not category:
        import re as _re

        cat_doc = {
            "name": cat_info["name"],
            "slug": cat_info["slug"],
            "extension_type": cat_info.get("extension_type", "generic"),
            "created_at": datetime.now(timezone.utc),
        }
        if user_id:
            cat_doc["user_id"] = user_id
        # Store AI-generated icon SVG for dynamically created categories
        if cat_info.get("is_new") and cat_info.get("icon_svg"):
            svg = cat_info["icon_svg"]
            if isinstance(svg, str) and _re.search(r"<(path|circle|rect|line|polyline|polygon|ellipse)\b", svg):
                cat_doc["icon_svg"] = svg

        result = categories.insert_one(cat_doc)
        category_id = result.inserted_id
    else:
        category_id = category["_id"]

    final_title = ai_result.get("title") or (meta.get("title") if meta else None)

    # 7. Build extension_data – merge video metadata with AI result
    final_extension_data = ai_result.get("extension_data") or {}
    if meta:
        video_meta = {}
        if meta.get("uploader"):
            video_meta["video_channel"] = meta["uploader"]
        if meta.get("duration"):
            video_meta["video_duration"] = meta["duration"]
        if meta.get("upload_date"):
            video_meta["video_upload_date"] = meta["upload_date"]
        if meta.get("view_count"):
            video_meta["video_view_count"] = meta["view_count"]
        if video_meta:
            final_extension_data.update(video_meta)

    # 8. Update the link document
    updates = {
        "status": "done",
        "error_message": None,
        "source_type": source_type,
        "title": final_title,
        "summary": ai_result.get("summary", ""),
        "thumbnail": thumbnail or link.get("thumbnail"),
        "category_id": category_id,
        "extension_data": final_extension_data,
        "processed_at": datetime.now(timezone.utc),
    }

    links.update_one({"_id": ObjectId(link_id)}, {"$set": updates})
    print(f"Done — title: {final_title}, category: {cat_info['name']}")


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_video.py <link_id>", file=sys.stderr)
        sys.exit(1)

    link_id = sys.argv[1]

    try:
        process_video(link_id)
    except Exception:
        # On any unhandled error, mark the link as error in DB and exit
        traceback.print_exc()
        try:
            db = get_db()
            db["links"].update_one(
                {"_id": ObjectId(link_id)},
                {"$set": {"status": "error", "error_message": traceback.format_exc()[:500]}},
            )
        except Exception:
            pass
        sys.exit(1)
