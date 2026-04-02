/**
 * Root Navigator - TheBetterLondon
 * Handles navigation between Onboarding, Auth, and Main app
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingScreen, { isOnboardingComplete } from '../screens/OnboardingScreen';

const RootNavigator = () => {
  const { user, loading } = useAuth();

  // null = still checking AsyncStorage, true/false = resolved
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    isOnboardingComplete().then(done => setOnboardingDone(done));
  }, []);

  if (loading || onboardingDone === null) {
    return <Loading fullScreen />;
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen onDone={() => setOnboardingDone(true)} />
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
