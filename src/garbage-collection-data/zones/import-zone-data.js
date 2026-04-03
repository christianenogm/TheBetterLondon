/**
 * import-zone-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time seed script: imports garbage/recycling collection zone schedules
 * from local JSON files into Firebase Firestore.
 *
 * Usage (from this directory):
 *   node import-zone-data.js
 *
 * Prerequisites:
 *   npm install firebase dotenv          (run from project root first)
 *
 * Firestore structure written:
 *
 *   garbageZones/                        ← collection
 *     {zoneId}/                          ← document, e.g. "A1", "CORE-EAST"
 *       zone:          string            e.g. "A1"
 *       label:         string            e.g. "Zone A1"
 *       isCore:        boolean
 *       updatedAt:     Timestamp
 *
 *       pickups/                         ← sub-collection
 *         {YYYY-MM-DD}/                  ← document keyed by date
 *           date:        string          "2026-04-10"
 *           types:       CollectionEntry[]
 *
 *   CollectionEntry {
 *     typeCode:    string   "10" | "20" | "30" | "11" | "STAT"
 *     typeName:    string   "Garbage" | "Green Bin & Recycling" | …
 *     color:       string   hex color code
 *     isHoliday:   boolean
 *     holidayName: string?  (stat holidays only)
 *   }
 *
 * Admin dashboard note:
 *   The top-level zone documents are the entry point for a future admin UI.
 *   Each doc holds metadata; the pickups sub-collection is paginated naturally
 *   by date-keyed documents — no scanning needed for range queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');

// ─── Zone file manifest ───────────────────────────────────────────────────────
const ZONE_FILES = [
  { file: 'a1.json',         id: 'A1',         label: 'Zone A1',    isCore: false },
  { file: 'a2.json',         id: 'A2',         label: 'Zone A2',    isCore: false },
  { file: 'b1.json',         id: 'B1',         label: 'Zone B1',    isCore: false },
  { file: 'b2.json',         id: 'B2',         label: 'Zone B2',    isCore: false },
  { file: 'c1.json',         id: 'C1',         label: 'Zone C1',    isCore: false },
  { file: 'c2.json',         id: 'C2',         label: 'Zone C2',    isCore: false },
  { file: 'd1.json',         id: 'D1',         label: 'Zone D1',    isCore: false },
  { file: 'd2.json',         id: 'D2',         label: 'Zone D2',    isCore: false },
  { file: 'e1.json',         id: 'E1',         label: 'Zone E1',    isCore: false },
  { file: 'e2.json',         id: 'E2',         label: 'Zone E2',    isCore: false },
  { file: 'core-east.json',  id: 'CORE-EAST',  label: 'Core East',  isCore: true  },
  { file: 'core-west.json',  id: 'CORE-WEST',  label: 'Core West',  isCore: true  },
];

// ─── Firestore batch size limit ───────────────────────────────────────────────
const BATCH_LIMIT = 490; // Firestore max is 500, leave headroom

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a plain YYYY-MM-DD string from either:
 *  - FormattedShortSpecialPickUpDate / FormattedShortPickUpDate  → already "YYYY-MM-DD"
 *  - CollectionDate / SpecialPickUpDate  → "/Date(ms)/" format
 */
function resolveDate(entry) {
  const short =
    entry.FormattedShortSpecialPickUpDate ||
    entry.FormattedShortPickUpDate ||
    entry.FormattedShortStatDate;
  if (short) return short;

  // Fallback: parse the /Date(ms)/ value
  const raw = entry.CollectionDate || entry.SpecialPickUpDate || entry.StatDate;
  if (raw) {
    const ms = parseInt(raw.replace(/\/Date\((\d+)\)\//, '$1'), 10);
    const d = new Date(ms);
    return d.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Build a minimal CollectionEntry object from a raw pickup row.
 */
function buildEntry(raw, isHoliday = false) {
  return {
    typeCode:    raw.CollectionTypeCode   || 'UNKNOWN',
    typeName:    raw.CollectionTypeDisplayName || 'Unknown',
    color:       raw.CollectionColorCode  || '#888888',
    isHoliday,
    ...(isHoliday && raw.StatName ? { holidayName: raw.StatName } : {}),
  };
}

/**
 * Merge all pickups for a zone into a Map keyed by "YYYY-MM-DD".
 * Each value is an array of CollectionEntry objects (multiple types can share a date).
 *
 * Standard zones use PickUpDateList + SpecialPickUpList + StatHolidayList.
 * Core zones use SpecialPickUpList + StatHolidayList (PickUpDateList is empty).
 */
function buildPickupMap(data) {
  const map = new Map(); // date string → CollectionEntry[]

  const add = (dateStr, entry) => {
    if (!dateStr) return;
    if (!map.has(dateStr)) map.set(dateStr, []);
    // Avoid duplicates (same typeCode on same date)
    const existing = map.get(dateStr);
    if (!existing.find(e => e.typeCode === entry.typeCode)) {
      existing.push(entry);
    }
  };

  // Regular pickups (zones A–E)
  for (const p of (data.PickUpDateList || [])) {
    add(resolveDate(p), buildEntry(p, false));
  }

  // Special pickups (all zones — core zones use this as their primary list)
  for (const p of (data.SpecialPickUpList || [])) {
    add(resolveDate(p), buildEntry(p, false));
  }

  // Stat holidays (added to any date they fall on)
  for (const h of (data.StatHolidayList || [])) {
    add(resolveDate(h), buildEntry(h, true));
  }

  return map;
}

// ─── Firebase init ────────────────────────────────────────────────────────────

function initFirebase() {
  if (getApps().length > 0) return getFirestore();

  // Prefer a service account key file if present alongside this script
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  let credential;

  try {
    const sa = require(serviceAccountPath);
    credential = cert(sa);
    console.log('Using service account key from serviceAccountKey.json');
  } catch {
    // Fall back to Application Default Credentials
    // (works if GOOGLE_APPLICATION_CREDENTIALS env var is set or running on GCP)
    const { applicationDefault } = require('firebase-admin/app');
    credential = applicationDefault();
    console.log('Using Application Default Credentials');
  }

  const projectId =
    process.env.FIREBASE_projectId ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.error('ERROR: No Firebase project ID found.');
    console.error('Set FIREBASE_projectId in your .env file, or place serviceAccountKey.json next to this script.');
    process.exit(1);
  }

  initializeApp({ credential, projectId });
  return getFirestore();
}

// ─── Main import ──────────────────────────────────────────────────────────────

async function importZone(db, zoneConfig) {
  const { file, id, label, isCore } = zoneConfig;
  const data = require(path.join(__dirname, file));

  console.log(`\n▶ ${id} (${file})`);

  // 1. Write/update the top-level zone document
  const zoneRef = db.collection('garbageZones').doc(id);
  await zoneRef.set(
    {
      zone:      id,
      label,
      isCore,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );

  // 2. Build the full pickup map
  const pickupMap = buildPickupMap(data);
  console.log(`   ${pickupMap.size} unique pickup dates`);

  if (pickupMap.size === 0) {
    console.log('   No pickup dates found — skipping sub-collection.');
    return;
  }

  // 3. Write pickups in batches
  const pickupsRef = zoneRef.collection('pickups');
  const entries = Array.from(pickupMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let batch = db.batch();
  let opCount = 0;
  let batchCount = 0;

  for (const [dateStr, types] of entries) {
    const docRef = pickupsRef.doc(dateStr);
    batch.set(docRef, { date: dateStr, types });
    opCount++;

    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      batchCount++;
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    batchCount++;
  }

  console.log(`   ✓ Written in ${batchCount} batch(es)`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log(' TheBetterLondon — Garbage Zone Data Import    ');
  console.log('═══════════════════════════════════════════════');

  const db = initFirebase();

  for (const zoneConfig of ZONE_FILES) {
    try {
      await importZone(db, zoneConfig);
    } catch (err) {
      console.error(`✗ Failed to import ${zoneConfig.id}:`, err.message);
    }
  }

  console.log('\n✅ Import complete.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
