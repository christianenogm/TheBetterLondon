/**
 * User Service - TheBetterLondon
 * Manages persistent user profile data (points, reportsCount) in Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

/**
 * Fetch a user's profile from Firestore.
 * Returns null if the document doesn't exist yet.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  try {
    const ref = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
};

/**
 * Create a user profile on first sign-up.
 * Does nothing if the document already exists, so points/reportsCount are never reset.
 */
export const initUserProfile = async (userId, { name, email }) => {
  if (!userId) return;
  try {
    const ref = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return; // Already initialised — don't overwrite stats

    await setDoc(ref, {
      name,
      email,
      points: 0,
      reportsCount: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('initUserProfile error:', error);
  }
};

/**
 * Award points to a user and/or increment their report count.
 * All fields are optional — pass only the ones you want to change.
 *
 * @param {string} userId
 * @param {{ points?: number, reportsCount?: number }} delta
 */
export const updateUserStats = async (userId, { points = 0, reportsCount = 0 }) => {
  if (!userId) return;
  try {
    const ref = doc(db, USERS_COLLECTION, userId);

    const updates = { updatedAt: serverTimestamp() };
    if (points !== 0) updates.points = increment(points);
    if (reportsCount !== 0) updates.reportsCount = increment(reportsCount);

    // Use setDoc merge so the doc is created automatically if missing
    await setDoc(ref, updates, { merge: true });
  } catch (error) {
    console.error('updateUserStats error:', error);
  }
};
