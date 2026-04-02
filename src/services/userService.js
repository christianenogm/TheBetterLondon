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
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { getNewlyUnlockedBadges, getBadgeById } from './gamificationService';

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
      resolvedCount: 0,
      totalUpvotesReceived: 0,
      badges: [],
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('initUserProfile error:', error);
  }
};

/**
 * Increment one or more stat counters on a user document.
 * All fields are optional — pass only the ones you want to change.
 *
 * @param {string} userId
 * @param {{ points?: number, reportsCount?: number, resolvedCount?: number, totalUpvotesReceived?: number }} delta
 */
export const updateUserStats = async (userId, {
  points = 0,
  reportsCount = 0,
  resolvedCount = 0,
  totalUpvotesReceived = 0,
} = {}) => {
  if (!userId) return;
  try {
    const ref = doc(db, USERS_COLLECTION, userId);
    const updates = { updatedAt: serverTimestamp() };
    if (points !== 0)               updates.points               = increment(points);
    if (reportsCount !== 0)         updates.reportsCount         = increment(reportsCount);
    if (resolvedCount !== 0)        updates.resolvedCount        = increment(resolvedCount);
    if (totalUpvotesReceived !== 0) updates.totalUpvotesReceived = increment(totalUpvotesReceived);
    await setDoc(ref, updates, { merge: true });
  } catch (error) {
    console.error('updateUserStats error:', error);
  }
};

/**
 * Award points and log the transaction to the pointsHistory sub-collection.
 */
export const awardPoints = async (userId, { points, reason }) => {
  if (!userId || !points) return;
  try {
    await updateUserStats(userId, { points });
    const histRef = collection(db, USERS_COLLECTION, userId, 'pointsHistory');
    await addDoc(histRef, {
      points,
      reason,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('awardPoints error:', error);
  }
};

/**
 * Checks the user's current stats against all badge requirements and awards
 * any newly unlocked badges. Returns the array of newly unlocked badge IDs.
 */
export const checkAndAwardBadges = async (userId) => {
  if (!userId) return [];
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return [];
    const newBadgeIds = getNewlyUnlockedBadges(profile);
    if (newBadgeIds.length === 0) return [];
    const ref = doc(db, USERS_COLLECTION, userId);
    await updateDoc(ref, { badges: arrayUnion(...newBadgeIds) });

    // Fire an immediate local notification for each newly unlocked badge
    for (const id of newBadgeIds) {
      const badge = getBadgeById(id);
      if (badge) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🏆 Badge Unlocked!',
            body: `${badge.emoji} ${badge.title} — ${badge.description}`,
            sound: true,
          },
          trigger: null,
        }).catch(() => {}); // Ignore if notifications not permitted
      }
    }

    return newBadgeIds;
  } catch (error) {
    console.error('checkAndAwardBadges error:', error);
    return [];
  }
};

/**
 * Fetch a user's points transaction history, newest first.
 */
export const getPointsHistory = async (userId) => {
  if (!userId) return [];
  try {
    const histRef = collection(db, USERS_COLLECTION, userId, 'pointsHistory');
    const q = query(histRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error('getPointsHistory error:', error);
    return [];
  }
};

/**
 * Fetch the top contributors sorted by points for the leaderboard.
 */
export const getLeaderboard = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('points', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return [];
  }
};
