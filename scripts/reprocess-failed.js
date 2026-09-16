#!/usr/bin/env node
/**
 * Reprocess links stuck in `error` status.
 *
 * Runs the same `processLink` pipeline the API uses, straight against MongoDB.
 * Dry-run by default: it prints what it would do and touches nothing.
 *
 * Usage:
 *   node scripts/reprocess-failed.js                      # dry run, all errored links
 *   node scripts/reprocess-failed.js --apply              # actually reprocess
 *   node scripts/reprocess-failed.js --filter=timeout     # only errors matching /timeout/i
 *   node scripts/reprocess-failed.js --limit=5 --apply    # reprocess the 5 most recent
 *
 * Requires in .env:
 *   MONGODB_URI     always
 *   OPENAI_API_KEY  to reprocess pages and text
 *   GITHUB_TOKEN    to re-dispatch videos (Instagram, YouTube, TikTok, Vimeo)
 */

const fs = require('fs');
const path = require('path');

// ── Load env files before anything imports the OpenAI client ──
// Later files do not override values already set, so the order below is the
// precedence order: a real shell env wins, then .env, then what Vercel gave us.
// Run `vercel env pull --environment=production .env.production.local` to
// populate the last one. Every .env* file is gitignored.
const ENV_FILES = ['.env', '.env.production.local', '.env.local'];
for (const name of ENV_FILES) {
  const envPath = path.join(__dirname, '..', name);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    // An empty assignment (KEY=) must not shadow a real value from a later file.
    if (!process.env[match[1]] && value) process.env[match[1]] = value;
  }
}

// ── Parse flags ──
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const filterArg = args.find(a => a.startsWith('--filter='));
const limitArg = args.find(a => a.startsWith('--limit='));
const filter = filterArg ? new RegExp(filterArg.split('=')[1], 'i') : null;
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;

function preflight() {
  const problems = [];
  if (!process.env.MONGODB_URI) problems.push('MONGODB_URI is missing. Nothing can run without it.');
  if (!process.env.OPENAI_API_KEY) problems.push('OPENAI_API_KEY is missing. Pages and text links will fail.');
  if (!process.env.GITHUB_TOKEN) problems.push('GITHUB_TOKEN is missing. Video links will fail to dispatch.');
  return problems;
}

async function main() {
  const problems = preflight();
  if (problems.length) {
    console.log('\nEnvironment warnings:');
    for (const p of problems) console.log('  - ' + p);
    console.log('');
  }
  if (!process.env.MONGODB_URI) process.exit(1);

  const mongoose = require('mongoose');
  const { connectDB, Link, Category } = require('../api/_db');

  // Loaded lazily: api/_process.js builds the OpenAI client at module scope and
  // throws on import when OPENAI_API_KEY is empty, which would break dry runs.
  const processLink = apply ? require('../api/_process').processLink : null;

  await connectDB();

  const query = { status: 'error' };
  let cursor = Link.find(query).sort({ submitted_at: -1 });
  if (limit > 0) cursor = cursor.limit(limit);
  let links = await cursor;

  if (filter) {
    links = links.filter(l => filter.test(String(l.error_message || '')));
  }

  if (!links.length) {
    console.log('No links in error status match the filter. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${links.length} link(s) in error status.`);
  console.log(apply ? 'Mode: APPLY (will reprocess)\n' : 'Mode: DRY RUN (nothing will be written)\n');

  let ok = 0;
  let dispatched = 0;
  let failed = 0;

  for (const link of links) {
    const shortUrl = String(link.url || '').slice(0, 78);
    const shortErr = String(link.error_message || '').replace(/\s+/g, ' ').slice(0, 70);

    if (!apply) {
      console.log(`[dry] ${shortUrl}`);
      console.log(`      was: ${shortErr}`);
      continue;
    }

    process.stdout.write(`${shortUrl} ... `);
    try {
      // Clear the stale failure so a crash mid-run leaves an honest state.
      await Link.updateOne({ _id: link._id }, {
        $set: { status: 'processing', error_message: null, processing_started_at: new Date() },
      });

      const updates = await processLink(link, Category, link.user_id, Link, link.language || 'en');

      if (updates.status === 'processing') {
        // Video path: handed off to the GitHub Actions worker, which writes the
        // final result itself. Leave the document as the worker expects it.
        dispatched++;
        console.log('dispatched to video worker');
        continue;
      }

      await Link.updateOne({ _id: link._id }, { $set: updates });
      ok++;
      console.log(`done: ${String(updates.title || '(untitled)').slice(0, 50)}`);
    } catch (err) {
      failed++;
      const message = String(err.message).slice(0, 500);
      await Link.updateOne({ _id: link._id }, {
        $set: { status: 'error', error_message: message },
      });
      console.log(`FAILED: ${message.slice(0, 90)}`);
    }
  }

  if (apply) {
    console.log(`\nProcessed inline: ${ok}. Dispatched to video worker: ${dispatched}. Still failing: ${failed}.`);
    if (dispatched) {
      console.log('Video links finish asynchronously. Re-run without --apply in a minute to see what is left.');
    }
  } else {
    console.log('\nDry run only. Re-run with --apply to reprocess these links.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
