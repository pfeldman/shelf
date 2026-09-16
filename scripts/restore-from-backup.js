#!/usr/bin/env node
/**
 * Restore link fields from a backup taken by scripts/backup-db.js.
 *
 * Built for one situation: a reprocess run replaced good data with a worse
 * result, and the previous version needs to come back. It only ever restores
 * the enrichment fields, never ownership or the URL, and it only touches links
 * whose current state actually differs from the backup.
 *
 * Dry-run by default.
 *
 * Usage:
 *   node scripts/restore-from-backup.js                          # newest backup, dry run
 *   node scripts/restore-from-backup.js --only-uncategorized     # just links that lost their category
 *   node scripts/restore-from-backup.js --only-uncategorized --apply
 *   node scripts/restore-from-backup.js --file=backups/x.json --apply
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
const onlyUncategorized = args.includes('--only-uncategorized');
const fileArg = args.find(a => a.startsWith('--file='));

// Enrichment only. user_id, url and submitted_at are never rewritten.
const RESTORABLE = ['title', 'summary', 'thumbnail', 'category_id', 'extension_data', 'source_type', 'status'];

function newestBackup() {
  const dir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}

async function main() {
  const backupPath = fileArg ? fileArg.split('=')[1] : newestBackup();
  if (!backupPath || !fs.existsSync(backupPath)) {
    console.error('No backup file found. Run scripts/backup-db.js first.');
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`Backup: ${backupPath}`);
  console.log(`Taken at ${backup.taken_at}, holds ${backup.links.length} links\n`);

  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'linker' });
  const db = mongoose.connection.db;

  const catNames = {};
  for (const c of await db.collection('categories').find({}).toArray()) {
    catNames[c._id.toString()] = c.name;
  }

  const backupById = new Map(backup.links.map(l => [String(l._id), l]));
  const current = await db.collection('links').find({}).toArray();

  const toRestore = [];
  for (const link of current) {
    const before = backupById.get(link._id.toString());
    if (!before) continue;

    const nowCat = catNames[String(link.category_id)] || null;
    const lostCategory = nowCat === 'Sin categorizar' || !link.category_id;
    const hadCategory = before.category_id && String(before.category_id) !== String(link.category_id);

    if (onlyUncategorized && !(lostCategory && hadCategory)) continue;
    if (!onlyUncategorized && String(before.title || '') === String(link.title || '')) continue;

    toRestore.push({ link, before, nowTitle: link.title, wasTitle: before.title });
  }

  if (!toRestore.length) {
    console.log('Nothing to restore: current data already matches the backup.');
    await mongoose.disconnect();
    return;
  }

  console.log(`${toRestore.length} link(s) would be restored.`);
  console.log(apply ? 'Mode: APPLY\n' : 'Mode: DRY RUN (nothing will be written)\n');

  let restored = 0;
  for (const item of toRestore) {
    const label = `${String(item.nowTitle || '(none)').slice(0, 32).padEnd(34)} <- ${String(item.wasTitle || '').slice(0, 42)}`;
    if (!apply) {
      console.log(`[dry] ${label}`);
      continue;
    }

    const updates = {};
    for (const field of RESTORABLE) {
      if (item.before[field] === undefined) continue;
      updates[field] = field === 'category_id' && item.before[field]
        ? new mongoose.Types.ObjectId(String(item.before[field]))
        : item.before[field];
    }
    updates.error_message = null;

    await db.collection('links').updateOne({ _id: item.link._id }, { $set: updates });
    restored++;
    console.log(`restored ${label}`);
  }

  console.log(apply
    ? `\nRestored ${restored} link(s).`
    : '\nDry run only. Re-run with --apply to restore.');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
