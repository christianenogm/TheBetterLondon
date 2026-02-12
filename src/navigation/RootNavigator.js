/**
 * Root Navigator - TheBetterLondon
 * Handles navigation between Auth and Main app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
