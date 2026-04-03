/**
 * Root Navigator - TheBetterLondon
 * Handles navigation between Onboarding, Auth, and Main app
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { Loading } from '../components';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingScreen, { isOnboardingComplete } from '../screens/OnboardingScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import { navigationRef } from './navigationRef';

const RootNavigator = () => {
  const { user, loading } = useAuth();
  const { isMaintenanceMode, loading: settingsLoading } = useAppSettings();

  // null = still checking AsyncStorage, true/false = resolved
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    isOnboardingComplete().then(done => setOnboardingDone(done));
  }, []);

  if (loading || settingsLoading || onboardingDone === null) {
    return <Loading fullScreen />;
  }

  if (isMaintenanceMode) {
    return <MaintenanceScreen />;
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen onDone={() => setOnboardingDone(true)} />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
