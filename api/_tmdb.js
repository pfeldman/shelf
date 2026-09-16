/**
 * TMDB client.
 *
 * The AI reads a page or a video and infers a title, a year and a rating. That
 * inference is often close and sometimes wrong, and it can never supply a
 * poster, a cast list or a person's filmography. This module turns the AI's
 * guess into a real record: it searches TMDB for the title, then pulls the
 * canonical details, credits and images.
 *
 * Requires TMDB_API_KEY. Both key formats work: the v3 key (a 32-character
 * hex string, sent as a query parameter) and the v4 read access token (a long
 * JWT, sent as a bearer header).
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB is an enrichment step, never the reason a link fails to process.
const TIMEOUT_MS = 10000;

function getKey() {
  return process.env.TMDB_API_KEY || null;
}

function isBearerToken(key) {
  // v4 read access tokens are JWTs; v3 keys are plain hex.
  return key.startsWith('eyJ') || key.length > 60;
}

async function tmdbFetch(endpoint, params = {}) {
  const key = getKey();
  if (!key) return null;

  const url = new URL(TMDB_BASE + endpoint);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const headers = { Accept: 'application/json' };
  if (isBearerToken(key)) {
    headers.Authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set('api_key', key);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) {
      console.log(`TMDB ${endpoint} returned ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (err) {
    clearTimeout(timeout);
    console.log(`TMDB ${endpoint} failed: ${err.message}`);
    return null;
  }
}

function imageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** TMDB speaks two-letter codes; the app's locale list maps onto them directly. */
function tmdbLanguage(language) {
  const map = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', de: 'de-DE', it: 'it-IT',
    ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', nl: 'nl-NL', ru: 'ru-RU', ar: 'ar-SA',
    hi: 'hi-IN', tr: 'tr-TR',
  };
  return map[language] || 'en-US';
}

/**
 * Find the TMDB record that best matches a title the AI produced.
 * `mediaType` is 'movie' or 'tv'; `year` narrows the search when present.
 */
async function search(title, mediaType, year, language) {
  if (!title) return null;
  const endpoint = mediaType === 'tv' ? '/search/tv' : '/search/movie';
  const yearParam = mediaType === 'tv' ? 'first_air_date_year' : 'year';

  let data = await tmdbFetch(endpoint, {
    query: title,
    [yearParam]: year || undefined,
    language: tmdbLanguage(language),
    include_adult: 'false',
  });

  // A wrong year is worse than no year: retry without it before giving up.
  if ((!data || !data.results || !data.results.length) && year) {
    data = await tmdbFetch(endpoint, {
      query: title,
      language: tmdbLanguage(language),
      include_adult: 'false',
    });
  }

  if (!data || !data.results || !data.results.length) return null;
  return data.results[0];
}

/** Full record for one title, including the people who made it. */
async function details(id, mediaType, language) {
  const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
  return tmdbFetch(endpoint, {
    language: tmdbLanguage(language),
    append_to_response: 'credits,watch/providers',
  });
}

function pickDirectors(credits, mediaType) {
  if (!credits) return [];
  if (mediaType === 'tv') {
    const creators = (credits.crew || []).filter(c => c.job === 'Creator' || c.department === 'Creator');
    if (creators.length) return creators;
  }
  return (credits.crew || []).filter(c => c.job === 'Director');
}

function personSummary(person) {
  return {
    id: person.id,
    name: person.name,
    character: person.character || null,
    job: person.job || null,
    profile_url: imageUrl(person.profile_path, 'w185'),
  };
}

/**
 * Look up a title and return the fields the app stores on a link.
 * Returns null when TMDB has no key, no match, or is unreachable, so callers
 * can simply merge whatever comes back.
 */
async function enrichTitle({ searchTitle, mediaType, year, language }) {
  if (!getKey()) return null;

  const hit = await search(searchTitle, mediaType, year, language);
  if (!hit) return null;

  const full = await details(hit.id, mediaType, language);
  const record = full || hit;
  const credits = full ? full.credits : null;

  const releaseDate = record.release_date || record.first_air_date || '';
  const providers = full && full['watch/providers'] && full['watch/providers'].results;

  return {
    tmdb_id: record.id,
    tmdb_url: `https://www.themoviedb.org/${mediaType === 'tv' ? 'tv' : 'movie'}/${record.id}`,
    search_title: record.title || record.name || searchTitle,
    media_type: mediaType,
    year: releaseDate ? releaseDate.slice(0, 4) : (year || null),
    rating: record.vote_average ? Number(record.vote_average).toFixed(1) : null,
    vote_count: record.vote_count || null,
    overview: record.overview || null,
    poster_url: imageUrl(record.poster_path, 'w500'),
    backdrop_url: imageUrl(record.backdrop_path, 'w780'),
    runtime: record.runtime || (record.episode_run_time || [])[0] || null,
    genre_names: (record.genres || []).map(g => g.name),
    directors: pickDirectors(credits, mediaType).slice(0, 4).map(personSummary),
    cast: ((credits && credits.cast) || []).slice(0, 12).map(personSummary),
    watch_providers: buildProviders(providers),
  };
}

/**
 * Flatten TMDB's per-country provider map into the shape the app renders:
 * one entry per streaming service, listing the countries it is available in.
 */
function buildProviders(results) {
  if (!results) return [];
  const byProvider = new Map();

  for (const [country, offer] of Object.entries(results)) {
    for (const item of offer.flatrate || []) {
      if (!byProvider.has(item.provider_id)) {
        byProvider.set(item.provider_id, {
          provider_id: item.provider_id,
          name: item.provider_name,
          logo_url: imageUrl(item.logo_path, 'w92'),
          countries: [],
        });
      }
      byProvider.get(item.provider_id).countries.push(country);
    }
  }

  return [...byProvider.values()]
    .sort((a, b) => b.countries.length - a.countries.length)
    .slice(0, 12);
}

/** Everything the person profile screen shows. */
async function getPerson(personId, language) {
  if (!getKey()) return null;

  const person = await tmdbFetch(`/person/${personId}`, {
    language: tmdbLanguage(language),
    append_to_response: 'combined_credits',
  });
  if (!person) return null;

  const credits = person.combined_credits || {};
  const seen = new Set();
  const works = [...(credits.cast || []), ...(credits.crew || [])]
    .filter(c => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key) || !(c.title || c.name)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 24)
    .map(c => {
      const date = c.release_date || c.first_air_date || '';
      return {
        tmdb_id: c.id,
        title: c.title || c.name,
        media_type: c.media_type === 'tv' ? 'tv' : 'movie',
        year: date ? date.slice(0, 4) : null,
        poster_url: imageUrl(c.poster_path, 'w342'),
        role: c.character || c.job || null,
      };
    });

  return {
    tmdb_id: person.id,
    name: person.name,
    biography: person.biography || null,
    birthday: person.birthday || null,
    deathday: person.deathday || null,
    place_of_birth: person.place_of_birth || null,
    known_for: person.known_for_department || null,
    profile_url: imageUrl(person.profile_path, 'w342'),
    tmdb_url: `https://www.themoviedb.org/person/${person.id}`,
    works,
  };
}

/** Resolve a bare name to a TMDB person, for links categorized as directors. */
async function searchPerson(name, language) {
  if (!getKey() || !name) return null;
  const data = await tmdbFetch('/search/person', {
    query: name,
    language: tmdbLanguage(language),
    include_adult: 'false',
  });
  if (!data || !data.results || !data.results.length) return null;
  const hit = data.results[0];
  return {
    tmdb_id: hit.id,
    name: hit.name,
    profile_url: imageUrl(hit.profile_path, 'w342'),
    known_for: hit.known_for_department || null,
    tmdb_url: `https://www.themoviedb.org/person/${hit.id}`,
  };
}

/**
 * Full profile for a link that IS a person, such as a director.
 * Field names match what the director detail screen already reads
 * (photo_url, tmdb_name, filmography) so the existing view fills up.
 */
async function enrichPerson(name, language) {
  const hit = await searchPerson(name, language);
  if (!hit) return null;

  const person = await getPerson(hit.tmdb_id, language);
  if (!person) return hit;

  return {
    tmdb_id: person.tmdb_id,
    tmdb_name: person.name,
    tmdb_url: person.tmdb_url,
    photo_url: person.profile_url,
    profile_url: person.profile_url,
    biography: person.biography,
    birthday: person.birthday,
    deathday: person.deathday,
    place_of_birth: person.place_of_birth,
    known_for: person.known_for,
    filmography: person.works.map(w => ({
      tmdb_id: w.tmdb_id,
      title: w.title,
      year: w.year,
      poster_url: w.poster_url,
      media_type: w.media_type,
    })),
  };
}

function isConfigured() {
  return !!getKey();
}

module.exports = { enrichTitle, enrichPerson, getPerson, searchPerson, isConfigured, imageUrl, tmdbLanguage };
