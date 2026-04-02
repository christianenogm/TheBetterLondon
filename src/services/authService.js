/**
 * Authentication Service - TheBetterLondon
 * Handles Firebase authentication operations
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { generateUniqueDisplayName } from '../utils/displayNameUtils';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session for Google Sign-In
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign up with email and password.
 * Display name is auto-generated (unique adjective+animal+4digits).
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Result object with success and user data
 */
export const signUpWithEmail = async (email, password) => {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      };
    }

    // Generate a unique display name before creating the account
    const displayName = await generateUniqueDisplayName();

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Persist the generated display name in Firebase Auth
    await updateProfile(userCredential.user, { displayName });

    return {
      success: true,
      user: {
        id: userCredential.user.uid,
        name: displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        points: 0,
        reportsCount: 0,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Result object with success and user data
 */
export const signInWithEmail = async (email, password) => {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    if (!password) {
      return {
        success: false,
        error: 'Please enter your password',
      };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || 'User',
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        points: 0, // TODO: Fetch from Firestore
        reportsCount: 0, // TODO: Fetch from Firestore
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Sign in with Google
 * @param {string} idToken - Google ID token
 * @returns {Promise<Object>} Result object with success and user data
 */
export const signInWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    return {
      success: true,
      user: {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || 'User',
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        points: 0, // TODO: Fetch from Firestore
        reportsCount: 0, // TODO: Fetch from Firestore
      },
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Result object with success
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out. Please try again.',
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>} Result object with success
 */
export const resetPassword = async (email) => {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Change the current user's password after re-authenticating.
 * Only works for email/password accounts.
 * @returns {{ success: boolean, error?: string }}
 */
export const changePassword = async (currentPassword, newPassword) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, error: 'Not authenticated.' };

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
    return { success: true };
  } catch (error) {
    console.error('changePassword error:', error);
    return { success: false, error: handleAuthError(error) };
  }
};

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email,
      photoURL: user.photoURL,
    };
  }
  return null;
};

/**
 * Handle Firebase auth errors
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
const handleAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};
