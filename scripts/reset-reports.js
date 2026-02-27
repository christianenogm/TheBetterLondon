#!/usr/bin/env node
/**
 * reset-reports.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes ALL documents from the Firestore `reports` collection and ALL files
 * under `reports/` in Firebase Storage.
 *
 * SETUP (one-time):
 *  1. Go to Firebase Console → Project Settings → Service Accounts
 *  2. Click "Generate new private key" → save the downloaded JSON as:
 *       scripts/service-account.json
 *  3. That file is gitignored — never commit it.
 *
 * USAGE:
 *   npm run reset:reports        # deletes Firestore reports + Storage images
 *   npm run reset:reports -- --dry-run  # preview only, nothing deleted
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ─── Config ───────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const FIRESTORE_COLLECTION = 'reports';
const STORAGE_PREFIX = 'reports/';  // folder in Firebase Storage
const BATCH_SIZE = 400;             // Firestore max batch size is 500
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Colour helpers ───────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};
const log = (msg) => console.log(msg);
const ok = (msg) => console.log(`${c.green}✔${c.reset} ${msg}`);
const warn = (msg) => console.log(`${c.yellow}⚠${c.reset}  ${msg}`);
const err = (msg) => console.error(`${c.red}✖${c.reset}  ${msg}`);
const info = (msg) => console.log(`${c.cyan}ℹ${c.reset}  ${msg}`);

// ─── Init ─────────────────────────────────────────────────────────────────────
function initAdmin() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    err(`Service account file not found at: ${SERVICE_ACCOUNT_PATH}`);
    log('');
    log(`${c.bold}Setup:${c.reset}`);
    log('  1. Firebase Console → Project Settings → Service Accounts');
    log('  2. Click "Generate new private key"');
    log(`  3. Save the file as: ${c.cyan}scripts/service-account.json${c.reset}`);
    log('');
    process.exit(1);
  }

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  const storageBucket =
    process.env.FIREBASE_storageBucket ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });

  return {
    db: admin.firestore(),
    bucket: admin.storage().bucket(),
  };
}

// ─── Firestore: delete entire collection in batches ───────────────────────────
async function deleteCollection(db, collectionName) {
  const collRef = db.collection(collectionName);
  let totalDeleted = 0;

  while (true) {
    const snapshot = await collRef.limit(BATCH_SIZE).get();
    if (snapshot.empty) break;

    info(`  Found ${snapshot.size} documents — ${DRY_RUN ? 'dry run, skipping delete' : 'deleting batch…'}`);

    if (!DRY_RUN) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    totalDeleted += snapshot.size;
    if (snapshot.size < BATCH_SIZE) break; // last batch
  }

  return totalDeleted;
}

// ─── Storage: delete all files under prefix ───────────────────────────────────
async function deleteStorageFolder(bucket, prefix) {
  const [files] = await bucket.getFiles({ prefix });

  if (files.length === 0) {
    info('  No storage files found under reports/');
    return 0;
  }

  info(`  Found ${files.length} file(s) — ${DRY_RUN ? 'dry run, skipping delete' : 'deleting…'}`);

  if (!DRY_RUN) {
    await Promise.all(files.map((file) => file.delete()));
  } else {
    files.forEach((f) => log(`    ${c.dim}${f.name}${c.reset}`));
  }

  return files.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  log('');
  log(`${c.bold}TheBetterLondon — Reset Reports${c.reset}`);
  if (DRY_RUN) warn('DRY RUN — nothing will be deleted\n');

  const { db, bucket } = initAdmin();

  // ── Firestore ──
  log(`\n${c.bold}[1/2] Firestore — collection: "${FIRESTORE_COLLECTION}"${c.reset}`);
  try {
    const deleted = await deleteCollection(db, FIRESTORE_COLLECTION);
    if (deleted === 0) {
      info('  Collection is already empty.');
    } else {
      ok(`  ${DRY_RUN ? 'Would delete' : 'Deleted'} ${deleted} document(s).`);
    }
  } catch (e) {
    err(`  Firestore error: ${e.message}`);
    process.exit(1);
  }

  // ── Storage ──
  log(`\n${c.bold}[2/2] Storage — folder: "${STORAGE_PREFIX}"${c.reset}`);
  try {
    const deleted = await deleteStorageFolder(bucket, STORAGE_PREFIX);
    if (deleted > 0) {
      ok(`  ${DRY_RUN ? 'Would delete' : 'Deleted'} ${deleted} file(s).`);
    }
  } catch (e) {
    err(`  Storage error: ${e.message}`);
    process.exit(1);
  }

  log('');
  if (DRY_RUN) {
    warn('Dry run complete. Re-run without --dry-run to apply deletions.');
  } else {
    ok(`${c.bold}Reset complete.${c.reset} All reports data has been wiped.`);
  }
  log('');
  process.exit(0);
})();
