/**
 * Auth Context - TheBetterLondon
 * Manages authentication state with Firebase
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, initUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure a Firestore profile exists (no-op if already there)
        await initUserProfile(firebaseUser.uid, {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
        });

        // Fetch persisted stats
        const profile = await getUserProfile(firebaseUser.uid);

        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          points: profile?.points ?? 0,
          reportsCount: profile?.reportsCount ?? 0,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = (userData) => {
    // Firebase handles persistence automatically
    setUser(userData);
  };

  const signOut = () => {
    // Firebase sign out is handled in authService
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
