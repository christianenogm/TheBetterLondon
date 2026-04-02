/**
 * garbageZoneService.js
 * Handles:
 *  - Zone lookup via point-in-polygon against local GeoJSON
 *  - Fetching pickup schedule from Firestore
 *  - Saving/loading the user's saved address from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { findZoneForCoordinate } from '../utils/pointInPolygon';
import { getPlaceDetails, searchPlaces } from './googlePlacesService';
import garbageZonesGeoJSON from '../garbage-collection-data/Garbage_26_Recycling_Collection_Zone_Boundaries.json';

const SAVED_ADDRESS_KEY = '@garbage_saved_address';

// Maps GeoJSON CollectionZone labels → Firestore document IDs
const ZONE_DOC_ID_MAP = {
  'A1':        'A1',
  'A2':        'A2',
  'B1':        'B1',
  'B2':        'B2',
  'C1':        'C1',
  'C2':        'C2',
  'D1':        'D1',
  'D2':        'D2',
  'E1':        'E1',
  'E2':        'E2',
  'CORE EAST': 'CORE-EAST',
  'CORE WEST': 'CORE-WEST',
};

// ─── Address → Zone ──────────────────────────────────────────────────────────

/**
 * Given a Google Place autocomplete result (with placeId), geocode it
 * and find the matching collection zone.
 *
 * @param {object} place - { placeId, name, address, ... } from searchPlaces()
 * @returns {{ zone, zoneDocId, address, location }} or throws
 */
export async function resolveZoneFromPlace(place) {
  const details = await getPlaceDetails(place.placeId);
  const { lat, lng } = details.location;
  const zone = findZoneForCoordinate(lat, lng, garbageZonesGeoJSON);

  if (!zone) {
    throw new Error('That address is outside a known collection zone. Please try a London, ON address.');
  }

  const zoneDocId = ZONE_DOC_ID_MAP[zone];
  if (!zoneDocId) {
    throw new Error(`Zone "${zone}" is not mapped to a schedule. Please contact support.`);
  }

  return {
    zone,
    zoneDocId,
    address: details.address,
    location: details.location,
  };
}

/**
 * Given a raw lat/lng (e.g. from device GPS), find the collection zone.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {{ zone, zoneDocId }} or throws
 */
export function resolveZoneFromCoords(lat, lng) {
  const zone = findZoneForCoordinate(lat, lng, garbageZonesGeoJSON);

  if (!zone) {
    throw new Error('Your location is outside a known collection zone.');
  }

  const zoneDocId = ZONE_DOC_ID_MAP[zone];
  if (!zoneDocId) {
    throw new Error(`Zone "${zone}" is not mapped to a schedule.`);
  }

  return { zone, zoneDocId };
}

// ─── Firestore schedule fetch ────────────────────────────────────────────────

/**
 * Fetches all pickup documents for a zone from today onwards.
 *
 * @param {string} zoneDocId - e.g. "B2", "CORE-EAST"
 * @returns {Array<{ date: string, types: CollectionEntry[] }>} sorted ascending
 */
export async function fetchZoneSchedule(zoneDocId) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const pickupsRef = collection(db, 'garbageZones', zoneDocId, 'pickups');
  const q = query(pickupsRef, where('date', '>=', today), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data());
}

// ─── Saved address (AsyncStorage) ────────────────────────────────────────────

/**
 * @typedef {object} SavedAddress
 * @property {string} zone        - e.g. "B2"
 * @property {string} zoneDocId   - e.g. "B2" or "CORE-EAST"
 * @property {string} address     - display address string
 * @property {{ lat: number, lng: number }} location
 * @property {string} savedAt     - ISO timestamp
 */

/**
 * Save the user's primary address for garbage schedule lookups.
 * @param {{ zone, zoneDocId, address, location }} data
 */
export async function saveAddress(data) {
  const payload = { ...data, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(payload));
}

/**
 * Load the user's saved address, or null if none.
 * @returns {SavedAddress|null}
 */
export async function loadSavedAddress() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_ADDRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove the saved address.
 */
export async function clearSavedAddress() {
  await AsyncStorage.removeItem(SAVED_ADDRESS_KEY);
}

// ─── Re-export search for convenience ────────────────────────────────────────
export { searchPlaces };
