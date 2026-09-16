#!/usr/bin/env node
/**
 * Dump the links and categories collections to a timestamped JSON file.
 *
 * Reprocessing overwrites title, summary, category_id and extension_data in
 * place, so run this before any bulk reprocess. Restoring is a manual decision,
 * which is why this only ever writes a file and never touches the database.
 *
 * Usage:
 *   node scripts/backup-db.js                 # writes ./backups/<timestamp>.json
 *   node scripts/backup-db.js --out /tmp/x.json
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
    // `vercel env pull` writes values wrapped in double quotes.
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[match[1]] && value) process.env[match[1]] = value;
  }
}

const outArg = process.argv.find(a => a.startsWith('--out='));

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Aborting.');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'linker' });
  const db = mongoose.connection.db;

  const links = await db.collection('links').find({}).toArray();
  const categories = await db.collection('categories').find({}).toArray();

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outPath = outArg
    ? outArg.split('=')[1]
    : path.join(__dirname, '..', 'backups', `shelf-${stamp}.json`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    taken_at: new Date().toISOString(),
    counts: { links: links.length, categories: categories.length },
    links,
    categories,
  }, null, 2));

  const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  console.log(`Backed up ${links.length} links and ${categories.length} categories`);
  console.log(`Written to ${outPath} (${sizeMb} MB)`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
