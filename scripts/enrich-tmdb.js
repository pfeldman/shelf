#!/usr/bin/env node
/**
 * Add TMDB data to links that already have a title.
 *
 * This is deliberately NOT a reprocess. It never calls OpenAI, never changes a
 * link's category, title or summary, and never re-reads the source. It only
 * looks up what the model already decided the title is, and merges in what
 * TMDB knows: poster, real rating, genres, runtime, directors, cast and where
 * to watch. That makes it cheap to run over the whole library and safe to
 * repeat, because the risk of a reprocess is exactly what it avoids.
 *
 * Dry-run by default.
 *
 * Usage:
 *   node scripts/enrich-tmdb.js                       # dry run over everything eligible
 *   node scripts/enrich-tmdb.js --apply
 *   node scripts/enrich-tmdb.js --category=peliculas --apply
 *   node scripts/enrich-tmdb.js --limit=10 --apply
 *   node scripts/enrich-tmdb.js --force --apply       # re-fetch links already enriched
 */

const fs = require('fs');
const path = require('path');

const ENV_FILES = ['.env', '.env.production.local', '.env.local'];
for (const name of ENV_FILES) {
  const envPath = path.join(__dirname, '..', name);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[match[1]] && value) process.env[match[1]] = value;
  }
}

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const force = args.includes('--force');
const valueOf = name => {
  const found = args.find(a => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : null;
};
const categorySlug = valueOf('category');
const limit = valueOf('limit') ? parseInt(valueOf('limit'), 10) : 0;

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Aborting.');
    process.exit(1);
  }

  const tmdb = require('../api/_tmdb');
  if (!tmdb.isConfigured()) {
    console.error('TMDB_API_KEY is missing.');
    console.error('Get a key at https://www.themoviedb.org/settings/api and put it in .env');
    console.error('(and in the Vercel project settings, so the API enriches new links too).');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  const { connectDB, Link, Category, UserPref } = require('../api/_db');
  await connectDB();

  const query = { status: 'done' };
  if (categorySlug) {
    const cats = await Category.find({ slug: categorySlug }).lean();
    if (!cats.length) {
      console.log(`No category with slug "${categorySlug}".`);
      await mongoose.disconnect();
      return;
    }
    query.category_id = { $in: cats.map(c => c._id) };
  }

  const categories = await Category.find({}).lean();
  const catType = {};
  for (const c of categories) catType[c._id.toString()] = c.extension_type;

  let links = await Link.find(query).sort({ submitted_at: -1 });

  // An earlier integration stored cast and crew as name plus photo only, with
  // no TMDB person id. Those links look enriched but their people lead nowhere,
  // so a link counts as done only when its people can actually be opened.
  const peopleAreLinkable = ext => {
    const people = [...(ext.cast || []), ...(ext.directors || [])];
    if (!people.length) return false;
    return people.every(p => p && (p.id || p.tmdb_id));
  };

  links = links.filter(l => {
    const ext = l.extension_data || {};
    const type = catType[String(l.category_id)];
    // Only screen works and film people. Books carry a `search_title` too, and
    // looking one up on TMDB would staple an unrelated movie onto it.
    const isTitle = type === 'movie' && (ext.search_title || ext.media_type);
    const isPerson = type === 'director' && ext.search_name;
    if (!isTitle && !isPerson) return false;
    if (force) return true;
    if (!ext.tmdb_id) return true;
    // Person links have a filmography instead of a cast.
    if (type === 'director') return !(ext.filmography || []).length;
    return !peopleAreLinkable(ext);
  });

  if (limit > 0) links = links.slice(0, limit);

  if (!links.length) {
    console.log('Nothing to enrich. Every eligible link already has TMDB data.');
    console.log('Use --force to fetch them again.');
    await mongoose.disconnect();
    return;
  }

  console.log(`${links.length} link(s) eligible for TMDB enrichment.`);
  console.log(apply ? 'Mode: APPLY\n' : 'Mode: DRY RUN (nothing will be written)\n');

  const prefs = await UserPref.find({}).lean();
  const langByUser = {};
  for (const p of prefs) langByUser[p.user_id] = p.language;

  let enriched = 0;
  let missed = 0;

  for (const link of links) {
    const ext = link.extension_data || {};
    const type = catType[String(link.category_id)];
    const language = link.language || langByUser[link.user_id] || 'en';
    const label = String(link.title || '').slice(0, 44).padEnd(46);

    if (!apply) {
      console.log(`[dry] ${label} | ${ext.search_title || ext.search_name || ''}`);
      continue;
    }

    process.stdout.write(`${label} ... `);
    try {
      const hit = type === 'director'
        ? await tmdb.enrichPerson(ext.search_name, language)
        : await tmdb.enrichTitle({
            searchTitle: ext.search_title || link.title,
            mediaType: ext.media_type === 'tv' ? 'tv' : 'movie',
            year: ext.year,
            language,
          });

      if (!hit) {
        missed++;
        console.log('no match on TMDB');
        continue;
      }

      // Merge, never replace: fields TMDB has no opinion on stay as they were.
      const merged = { ...ext };
      for (const [k, v] of Object.entries(hit)) {
        if (v === null || v === undefined) continue;
        if (Array.isArray(v) && !v.length) continue;
        merged[k] = v;
      }

      await Link.updateOne({ _id: link._id }, { $set: { extension_data: merged } });
      enriched++;

      const bits = [
        hit.rating ? `rating ${hit.rating}` : null,
        (hit.cast || []).length ? `${hit.cast.length} in cast` : null,
        (hit.directors || []).length ? `${hit.directors.length} directing` : null,
        (hit.filmography || []).length ? `${hit.filmography.length} works` : null,
      ].filter(Boolean).join(', ');
      console.log(bits || 'enriched');
    } catch (err) {
      missed++;
      console.log(`failed: ${String(err.message).slice(0, 60)}`);
    }
  }

  console.log(apply
    ? `\nEnriched ${enriched}. Not found on TMDB: ${missed}.`
    : '\nDry run only. Re-run with --apply.');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
