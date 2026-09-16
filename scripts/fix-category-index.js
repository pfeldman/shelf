#!/usr/bin/env node
/**
 * Replace the global unique index on categories.slug with a per-user one.
 *
 * The collection carries `slug_1`, unique on `slug` alone. Categories are
 * per-user (api/_process.js looks them up with { slug, user_id }), so the
 * moment a second user needs a slug that someone else already owns, the
 * insert dies with:
 *
 *   E11000 duplicate key error collection: linker.categories
 *   index: slug_1 dup key: { slug: "social-media" }
 *
 * and the link lands in `error`. That is a hard ceiling on the whole
 * multi-user story, and on the AI inventing new categories for anyone who
 * is not the first user to claim a name.
 *
 * This swaps it for { user_id: 1, slug: 1 } unique, which enforces what the
 * code actually means: a slug is unique WITHIN one user.
 *
 * Dry-run by default.
 *
 * Usage:
 *   node scripts/fix-category-index.js           # inspect, change nothing
 *   node scripts/fix-category-index.js --apply   # perform the migration
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

const apply = process.argv.includes('--apply');
const OLD_INDEX = 'slug_1';
const NEW_KEY = { user_id: 1, slug: 1 };

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Aborting.');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'linker' });
  const categories = mongoose.connection.db.collection('categories');

  const indexes = await categories.indexes();
  console.log('Current indexes on categories:');
  for (const i of indexes) {
    console.log(`  ${i.name}  key=${JSON.stringify(i.key)}  unique=${!!i.unique}`);
  }
  console.log('');

  // Safety check: a category without user_id would collide under the new index
  // with every other ownerless category sharing its slug.
  const ownerless = await categories.countDocuments({
    $or: [{ user_id: null }, { user_id: { $exists: false } }],
  });
  if (ownerless > 0) {
    console.log(`WARNING: ${ownerless} category document(s) have no user_id.`);
    console.log('Give them an owner before migrating, or they may collide.\n');
  }

  // Safety check: the new index cannot be built if two categories already
  // share the same (user_id, slug) pair.
  const collisions = await categories.aggregate([
    { $group: { _id: { user_id: '$user_id', slug: '$slug' }, n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ]).toArray();

  if (collisions.length) {
    console.error('Cannot migrate. These (user_id, slug) pairs are duplicated:');
    for (const c of collisions) console.error(`  slug="${c._id.slug}" appears ${c.n} times for one user`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('No (user_id, slug) duplicates. The new index can be built safely.\n');

  const hasOld = indexes.some(i => i.name === OLD_INDEX);
  const hasNew = indexes.some(i => JSON.stringify(i.key) === JSON.stringify(NEW_KEY));

  if (!apply) {
    console.log('Planned changes:');
    console.log(hasOld ? `  - drop index ${OLD_INDEX} (unique on slug alone)` : `  - nothing to drop, ${OLD_INDEX} is already gone`);
    console.log(hasNew ? '  - the per-user index already exists' : '  - create unique index { user_id: 1, slug: 1 }');
    console.log('\nDry run only. Re-run with --apply to perform the migration.');
    await mongoose.disconnect();
    return;
  }

  // Create the replacement first, so a failure never leaves the collection
  // without any uniqueness guarantee.
  if (!hasNew) {
    await categories.createIndex(NEW_KEY, { unique: true, name: 'user_id_1_slug_1' });
    console.log('Created unique index { user_id: 1, slug: 1 }');
  } else {
    console.log('Per-user index already present, skipping creation');
  }

  if (hasOld) {
    await categories.dropIndex(OLD_INDEX);
    console.log(`Dropped ${OLD_INDEX}`);
  }

  console.log('\nIndexes now:');
  for (const i of await categories.indexes()) {
    console.log(`  ${i.name}  key=${JSON.stringify(i.key)}  unique=${!!i.unique}`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
