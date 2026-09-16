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

MAX_TRANSCRIBE_SECONDS = 900  # 15 minutes; past that the cost stops paying off


def extract_video_metadata(url: str) -> dict | None:
    """Return metadata dict or None if yt-dlp fails.

    `subtitle_tracks` carries the automatic-caption URLs yt-dlp advertises, so
    the caller can fetch the spoken content without downloading the video.
    """
    try:
        import yt_dlp

        opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
            "socket_timeout": 30,
            "getcomments": False,
            # Ask for automatic captions so their URLs show up in `info`.
            "writesubtitles": False,
            "writeautomaticsub": True,
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
            "subtitle_tracks": info.get("automatic_captions") or info.get("subtitles") or {},
        }
    except Exception as exc:
        print(f"yt-dlp failed for {url}: {exc}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Spoken content: captions first, local transcription as the fallback
# ---------------------------------------------------------------------------

def _strip_caption_markup(raw: str) -> str:
    """Turn a VTT or SRT payload into plain prose, without repeated lines."""
    import re

    lines = []
    for line in raw.splitlines():
        line = re.sub(r"<[^>]+>", "", line).strip()
        if not line:
            continue
        if line.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        if "-->" in line or line.isdigit():
            continue
        # Rolling captions repeat each line as the next one scrolls in.
        if lines and lines[-1] == line:
            continue
        lines.append(line)

    deduped = []
    for line in lines:
        if line not in deduped[-3:]:
            deduped.append(line)
    return " ".join(deduped)


def fetch_captions(meta: dict) -> str | None:
    """Download the best available caption track and return it as plain text."""
    tracks = (meta or {}).get("subtitle_tracks") or {}
    if not tracks:
        return None

    # Prefer the original language, then Spanish, then English, then anything.
    preferred = [c for c in tracks if c.endswith("-orig")]
    preferred += [c for c in tracks if c.startswith("es")]
    preferred += [c for c in tracks if c.startswith("en")]
    preferred += list(tracks)

    import urllib.request

    seen = set()
    for code in preferred:
        if code in seen:
            continue
        seen.add(code)
        for fmt in tracks.get(code) or []:
            if fmt.get("ext") not in ("vtt", "srt", "srv1", "ttml"):
                continue
            try:
                req = urllib.request.Request(fmt["url"], headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    raw = resp.read().decode("utf-8", errors="replace")
                text = _strip_caption_markup(raw)
                if len(text) > 40:
                    print(f"Captions found ({code}): {len(text)} chars")
                    return text[:6000]
            except Exception as exc:
                print(f"Caption fetch failed for {code}: {exc}", file=sys.stderr)
    return None


def transcribe_audio(url: str, duration: float | None) -> str | None:
    """Download the audio track and transcribe it locally with faster-whisper.

    Runs on the Actions runner, so it costs nothing beyond the minutes already
    being spent and needs no transcription model enabled on the OpenAI account.
    """
    if duration and duration > MAX_TRANSCRIBE_SECONDS:
        print(f"Skipping transcription: {duration:.0f}s exceeds the {MAX_TRANSCRIBE_SECONDS}s cap")
        return None

    import tempfile
    import glob as _glob

    try:
        import yt_dlp
        from faster_whisper import WhisperModel
    except ImportError as exc:
        print(f"Transcription unavailable: {exc}", file=sys.stderr)
        return None

    with tempfile.TemporaryDirectory() as tmp:
        target = os.path.join(tmp, "audio")
        opts = {
            "quiet": True,
            "no_warnings": True,
            "format": "bestaudio/best",
            "outtmpl": target + ".%(ext)s",
            "socket_timeout": 30,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "9",
            }],
        }
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])
        except Exception as exc:
            print(f"Audio download failed: {exc}", file=sys.stderr)
            return None

        files = _glob.glob(target + ".mp3") or _glob.glob(target + ".*")
        if not files:
            print("Audio download produced no file", file=sys.stderr)
            return None

        try:
            model = WhisperModel("base", device="cpu", compute_type="int8")
            segments, info = model.transcribe(files[0], beam_size=1)
            text = " ".join(s.text.strip() for s in segments).strip()
        except Exception as exc:
            print(f"Transcription failed: {exc}", file=sys.stderr)
            return None

    if len(text) < 40:
        return None
    print(f"Transcribed {info.duration:.0f}s of audio into {len(text)} chars ({info.language})")
    return text[:6000]


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


LANGUAGE_NAMES = {"en": "English", "es": "Spanish", "fr": "French", "pt": "Portuguese", "de": "German", "it": "Italian", "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "nl": "Dutch", "ru": "Russian", "ar": "Arabic", "hi": "Hindi", "tr": "Turkish"}

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
- NEVER use "General" or "general" as a category. Always find or create a SPECIFIC, descriptive category.
- Use an EXISTING category if one fits. Only create a new one if nothing matches.
- SPOKEN CONTENT: when the input includes a spoken track, treat it as the richest source about what the video actually shows, and use it to fill in details the caption omits, such as the real ingredients and steps of a recipe. But it can also be the lyrics of background music with no relation to the video. If the spoken text reads like song lyrics and contradicts the title and caption, ignore it completely and categorize from the caption instead.
- CATEGORIZE BY TOPIC, NEVER BY PLATFORM. The category must describe what the content is ABOUT, not where it was published. Instagram, TikTok, YouTube, Facebook, X and Reddit are sources, not categories. A sewing tutorial posted as an Instagram reel belongs in a sewing category; a book recommendation posted as a TikTok belongs in a books category. Only use a social-media category when the subject matter itself is social media, such as growth tactics or platform news.
- If the content could not be retrieved and all you have is a bare URL, do NOT invent a topic from the domain name. Categorize it as "Sin categorizar" (slug: "sin-categorizar", extension_type "generic") so it can be retried later.
- DYNAMIC CATEGORY CREATION: If no existing category fits, create a NEW one with a specific, descriptive name describing the SUBJECT (e.g. "Costura", "Podcasts", "Design", "Travel", NOT "General", "Other", or the name of a website). Set "is_new": true and provide "icon_svg" with SVG inner content (just the paths/shapes, NO outer <svg> tag). The icon must follow this style: viewBox assumes 0 0 24 24, fill="none", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round". Example icon_svg: "<circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><path d=\\"M12 6v6l4 2\\"/>". Keep it simple (2-4 elements max). For existing categories, set "is_new": false and "icon_svg": null.
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

    # 3. Build content for AI categorization.
    #    Each source is labelled separately so the model can weigh them: the
    #    caption is authored by the poster, the spoken track may well be the
    #    lyrics of background music rather than anything about the subject.
    spoken = None
    spoken_origin = None
    if meta and meta.get("title"):
        parts = []
        if meta["title"]:
            parts.append(f"Title: {meta['title']}")
        if meta.get("uploader"):
            parts.append(f"Channel/Uploader: {meta['uploader']}")
        if meta.get("description"):
            parts.append(f"Caption written by the poster: {meta['description']}")

        spoken = fetch_captions(meta)
        spoken_origin = "captions"
        if not spoken:
            spoken = transcribe_audio(url, meta.get("duration"))
            spoken_origin = "transcript"
        if spoken:
            origin_label = (
                "subtitles published with the video" if spoken_origin == "captions"
                else "automatic transcription of the audio track"
            )
            parts.append(
                f"Spoken content ({origin_label}). This may be narration about "
                f"the subject, or it may just be the lyrics of background music, "
                f"so ignore it if it does not match the caption: {spoken}"
            )

        content = "\n".join(parts)
        thumbnail = meta.get("thumbnail")
        source_type = "video"
    else:
        print("yt-dlp metadata extraction failed")

        # Extraction fails for reasons that have nothing to do with the link:
        # YouTube and Instagram block the runner's IP, videos get taken down.
        # If this link was already categorized from a successful extraction,
        # a failed retry must not replace real data with a guess from the
        # domain name. Keep what is there and stop.
        #
        # `source_type == "url-only"` means the existing data was itself guessed
        # from the domain, so there is nothing worth protecting and a retry is
        # the whole point.
        already_extracted = link.get("source_type") not in (None, "url-only")
        if already_extracted and link.get("title") and link.get("category_id"):
            print(f"Keeping existing data for this link: {link.get('title')!r}")
            links.update_one(
                {"_id": ObjectId(link_id)},
                {"$set": {"status": "done", "error_message": None},
                 "$unset": {"processing_step": "", "processing_started_at": ""}},
            )
            return

        # Nothing to lose: let the model work from the URL alone.
        print("Falling back to URL-only mode")
        content = f"URL: {url}\n(Video content could not be extracted. Categorize based on the URL and domain.)"
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

    # Keep the spoken text on the link so the app can show what the video says
    # and the user can read it instead of watching it.
    if spoken:
        final_extension_data["transcript"] = spoken
        final_extension_data["transcript_source"] = spoken_origin

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
