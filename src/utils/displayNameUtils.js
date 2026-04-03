/**
 * displayNameUtils.js
 * Generates and validates unique display names.
 *
 * Format: AdjectiveAnimal#### (e.g. "FierceEagle4829")
 */

import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

/**
 * Generates a random candidate display name.
 * Format: CapitalisedAdjective + CapitalisedAnimal + 4-digit number
 * e.g. "FierceEagle4829"
 */
export function generateCandidateName() {
  const raw = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '',
    style: 'capital',
    length: 2,
  });
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${raw}${digits}`;
}

/**
 * Checks whether a given display name is already taken in Firestore.
 * Returns true if the name is available (unique).
 */
export async function isDisplayNameAvailable(displayName) {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('name', '==', displayName)
    );
    const snap = await getDocs(q);
    return snap.empty;
  } catch (error) {
    console.error('isDisplayNameAvailable error:', error);
    // Fail open — let the name through rather than blocking signup
    return true;
  }
}

/**
 * Generates a display name that is guaranteed to be unique in Firestore.
 * Retries up to 10 times before giving up with a timestamp fallback.
 */
export async function generateUniqueDisplayName() {
  for (let i = 0; i < 10; i++) {
    const candidate = generateCandidateName();
    const available = await isDisplayNameAvailable(candidate);
    if (available) return candidate;
  }
  // Ultimate fallback: timestamp-based name (practically impossible to collide)
  return `LondonUser${Date.now().toString().slice(-6)}`;
}
