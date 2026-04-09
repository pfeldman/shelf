const { JSDOM } = require('jsdom');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ── URL detection ──

const URL_RE = /https?:\/\/[^\s]+/;

function isUrl(text) {
  return text.startsWith('http://') || text.startsWith('https://');
}

function extractUrlAndText(raw) {
  const match = raw.match(URL_RE);
  if (!match) return { url: null, text: null };
  const url = match[0];
  const rest = (raw.slice(0, match.index) + raw.slice(match.index + match[0].length)).trim();
  return { url, text: rest || null };
}

// ── Web scraping ──

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function extractWebpage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const resp = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract og:image for thumbnail
    const ogImage = doc.querySelector('meta[property="og:image"]');
    const thumbnail = ogImage ? ogImage.getAttribute('content') : null;

    // Extract title
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    let title = ogTitle ? ogTitle.getAttribute('content') : null;
    if (!title) {
      const titleEl = doc.querySelector('title');
      title = titleEl ? titleEl.textContent.trim() : null;
    }

    // Remove script/style/nav/footer/header elements
    for (const tag of doc.querySelectorAll('script, style, nav, footer, header')) {
      tag.remove();
    }

    let text = doc.body ? doc.body.textContent : '';
    // Collapse whitespace
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    // Truncate to ~15k chars
    text = text.slice(0, 15000);

    return { source_type: 'webpage', title, thumbnail, content: text };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── AI categorization ──

const RECAT_HINTS = {
  movie: 'OVERRIDE: The user says this is a MOVIE (film). You MUST categorize it as a movie with extension_type "movie" and media_type "movie". Use the Peliculas category.',
  tv: 'OVERRIDE: The user says this is a TV SHOW/SERIES. You MUST categorize it as a TV show with extension_type "movie" and media_type "tv". Use the Series category.',
  documentary: 'OVERRIDE: The user says this is a DOCUMENTARY. You MUST categorize it with extension_type "movie" and media_type "tv" (or "movie" if it\'s a standalone documentary film). Use the Documentales category (slug: "documentales").',
  recipe: 'OVERRIDE: The user says this is a RECIPE. You MUST categorize it as a recipe with extension_type "recipe". Extract ingredients with quantities and steps.',
  generic: 'OVERRIDE: The user says this is GENERIC content. You MUST categorize it with extension_type "generic".',
  short: 'OVERRIDE: The user says this is a SHORT FILM (cortometraje). You MUST categorize it under Cortometrajes (slug: "cortometrajes") with extension_type "generic".',
  book: 'OVERRIDE: The user says this is a BOOK. You MUST categorize it with extension_type "book". Use the Libros category (slug: "libros").',
  director: 'OVERRIDE: The user says this is a DIRECTOR. You MUST categorize it with extension_type "director". Use the Directores category (slug: "directores").',
};

async function categorizeAndExtract(content, url, categories, recatHint, userHint) {
  const catsDesc = categories.length
    ? categories.map(c => `- "${c.name}" (slug: ${c.slug}, type: ${c.extension_type})`).join('\n')
    : '(no categories exist yet)';

  let hintBlock = '';
  if (recatHint && RECAT_HINTS[recatHint]) {
    hintBlock = `\n\n${RECAT_HINTS[recatHint]}\n`;
  }
  if (userHint) {
    hintBlock += `\nADDITIONAL CONTEXT FROM USER: ${userHint}\n`;
  }

  const systemPrompt = 'You are a link categorizer and content extractor. Respond with ONLY valid JSON (no markdown fences, no explanation).';

  const userPrompt = `Analyze the following content from this URL: ${url}${hintBlock}

Existing categories:
${catsDesc}

Respond with ONLY valid JSON in this exact schema:
{
  "title": "clean descriptive title (for recipes: the dish name, e.g. 'Matambre de cerdo', not clickbait like 'Un matambrito increible')",
  "summary": "2-3 sentence summary of the content",
  "category": {
    "name": "Category Name",
    "slug": "category-slug",
    "extension_type": "movie | recipe | book | director | generic",
    "is_new": false,
    "icon_svg": null
  },
  "extension_data": {}
}

Rules:
- Use an EXISTING category if one fits. Only create a new one if nothing matches.
- DYNAMIC CATEGORY CREATION: If no existing category fits, create a NEW one. Set "is_new": true and provide "icon_svg" with SVG inner content (just the paths/shapes, NO outer <svg> tag). The icon must follow this style: viewBox assumes 0 0 24 24, fill="none", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round". Example icon_svg: "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>". Keep it simple (2-4 elements max). For existing categories, set "is_new": false and "icon_svg": null.
- extension_type must be "movie" for movies AND TV shows/series, "recipe" for cooking recipes, "book" for books, "director" for film/TV directors, "generic" for everything else.
- IMPORTANT: Movies and TV shows must be in SEPARATE categories. Use a category like "Peliculas" (slug: "peliculas") for movies and a different category like "Series" (slug: "series") for TV shows/series. Never mix them.
- DOCUMENTARIES: If the content is a documentary (series or film), categorize it as "Documentales" (slug: "documentales") with extension_type "movie". Use media_type "tv" for documentary series, "movie" for standalone documentary films.
- SHORT FILMS: If the content is a short film (cortometraje), categorize it as "Cortometrajes" (slug: "cortometrajes") with extension_type "generic".
- For "movie" extension_type, set extension_data to: {"search_title": "movie name in English (preferred for TMDB search)", "media_type": "movie" or "tv", "year": "2024", "rating": "8.5" (from content if available, or null)}
- For "recipe" extension_type, set extension_data to: {"prep_time": "10 min", "cook_time": "30 min", "servings": "4", "ingredients": ["200g harina", "2 huevos", "1 taza leche"], "steps": ["step1", "step2"]}
  IMPORTANT: Each ingredient MUST include the quantity/amount.
- For "book" extension_type, use category "Libros" (slug: "libros"). Set extension_data to: {"search_title": "book title in original language", "author": "author name", "year": "2024"}
- For "director" extension_type, use category "Directores" (slug: "directores"). Set extension_data to: {"search_name": "director full name"}
- For "generic" extension_type, set extension_data to: {}
- MULTI-ITEM: If the content lists MULTIPLE movies or TV shows (e.g. "50 movies to watch", "top 10 series"), you MUST return ALL of them as an "items" array. Each item needs search_title, media_type, and year. Only use "items" when the content clearly lists multiple distinct titles.

--- CONTENT START ---
${content}
--- CONTENT END ---`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    timeout: 120000,
  });

  let text = (response.choices[0].message.content || '').trim();
  if (!text) throw new Error('OpenAI returned empty output');

  // Strip markdown fences if present
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Find first { ... } block
    const start = text.indexOf('{');
    if (start === -1) throw new Error(`No JSON found in OpenAI output: ${text.slice(0, 300)}`);
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(start, i + 1));
          } catch (e) {
            throw new Error(`Invalid JSON in OpenAI output: ${e.message}`);
          }
        }
      }
    }
    throw new Error(`Unclosed JSON in OpenAI output`);
  }
}

// ── Main processing function ──

async function processLink(link, Category, userId) {
  const url = link.url.trim();

  // 1. Extract content
  let sharedText = null;
  let resolvedUrl = url;

  if (!isUrl(url)) {
    const extracted = extractUrlAndText(url);
    if (extracted.url) {
      resolvedUrl = extracted.url;
      sharedText = extracted.text;
    }
  }

  let data;
  if (!isUrl(resolvedUrl)) {
    data = { content: resolvedUrl, source_type: 'text', title: null, thumbnail: null };
  } else {
    data = await extractWebpage(resolvedUrl);
  }

  let content = data.content;
  if (sharedText) {
    content += `\n\n--- USER NOTE (shared alongside the link) ---\n${sharedText}`;
  }

  // 2. Fetch categories (scoped to user if userId provided)
  const catQuery = userId ? { user_id: userId } : {};
  const categories = await Category.find(catQuery).sort({ name: 1 }).lean();
  const catList = categories.map(c => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    extension_type: c.extension_type,
  }));

  // 3. AI categorization
  const extData = link.extension_data || {};
  const recatHint = extData.recategorize_as || null;
  const userHint = extData.user_hint || sharedText || null;
  const aiResult = await categorizeAndExtract(content, resolvedUrl, catList, recatHint, userHint);

  // 4. Ensure category exists (scoped to user if userId provided)
  const catInfo = aiResult.category;
  const catFindQuery = { slug: catInfo.slug };
  if (userId) catFindQuery.user_id = userId;
  let category = await Category.findOne(catFindQuery);
  if (!category) {
    const catCreate = {
      name: catInfo.name,
      slug: catInfo.slug,
      extension_type: catInfo.extension_type,
      created_at: new Date(),
    };
    if (userId) catCreate.user_id = userId;
    // Store AI-generated icon SVG for dynamically created categories
    if (catInfo.is_new && catInfo.icon_svg) {
      try {
        // Basic validation: must contain at least one SVG element
        const svg = catInfo.icon_svg;
        if (svg && typeof svg === 'string' && /<(path|circle|rect|line|polyline|polygon|ellipse)\b/.test(svg)) {
          catCreate.icon_svg = svg;
        }
      } catch {
        // Skip invalid SVG, will fall back to default icon
      }
    }
    category = await Category.create(catCreate);
  }

  const finalTitle = aiResult.title || data.title;

  return {
    status: 'done',
    error_message: null,
    source_type: data.source_type,
    title: finalTitle,
    summary: aiResult.summary || '',
    thumbnail: data.thumbnail,
    category_id: category._id,
    extension_data: aiResult.extension_data || {},
    processed_at: new Date(),
  };
}

module.exports = { processLink, categorizeAndExtract, extractWebpage, isUrl, extractUrlAndText };
