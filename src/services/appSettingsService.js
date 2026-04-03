/**
 * App Settings Service - TheBetterLondon
 * Real-time listener and one-shot fetch for admin-controlled app settings.
 * Reads from Firestore collection: appSettings / doc: config
 *
 * NOTE: `subscribeToAppSettings` re-attaches the Firestore listener whenever
 * Firebase Auth state changes. This is necessary on Android where the Firestore
 * SDK has no local cache on first launch and the initial listener fires before
 * an auth token is available, causing a permission error that silently returns
 * default settings (announcement hidden, maintenance mode off).
 */

import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../config/firebase';

const SETTINGS_DOC = doc(db, 'appSettings', 'config');

const DEFAULT_SETTINGS = {
  maintenanceMode: {
    enabled: false,
    message: 'We are currently performing maintenance. Please check back soon.',
  },
  announcement: {
    enabled: false,
    title: '',
    message: '',
    type: 'info',
  },
};

/**
 * Subscribe to real-time app settings changes.
 * Re-attaches the Firestore listener each time auth state changes so that an
 * authenticated token is always present when the snapshot starts.
 * @param {(settings: object) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeToAppSettings = (callback) => {
  let firestoreUnsubscribe = null;

  const attachFirestoreListener = () => {
    // Clean up any existing listener before creating a new one
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }

    firestoreUnsubscribe = onSnapshot(
      SETTINGS_DOC,
      (snap) => {
        callback(snap.exists() ? snap.data() : DEFAULT_SETTINGS);
      },
      (error) => {
        console.error('appSettings listener error:', error);
        callback(DEFAULT_SETTINGS);
      }
    );
  };

  // Start listener immediately (covers the case where user is already signed in)
  attachFirestoreListener();

  // Re-attach whenever auth state changes (handles Android cold-start timing)
  const authUnsubscribe = onAuthStateChanged(auth, () => {
    attachFirestoreListener();
  });

  return () => {
    authUnsubscribe();
    if (firestoreUnsubscribe) firestoreUnsubscribe();
  };
};

/**
 * Fetch app settings once (no real-time updates).
 * @returns {Promise<object>}
 */
export const getAppSettings = async () => {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    return snap.exists() ? snap.data() : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('getAppSettings error:', error);
    return DEFAULT_SETTINGS;
  }
};
