/**
 * GarbageScreen - TheBetterLondon
 * Epic 11: Garbage & Recycling Collection Schedule
 * US-1101, US-1102, US-1103
 *
 * Shell screen — decides which view to render:
 *   • No saved address  → GarbageSetupView  (address search / GPS)
 *   • Has saved address → GarbageHomeView   (next collection + calendar)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loadSavedAddress, clearSavedAddress } from '../services/garbageZoneService';
import GarbageSetupView from './garbage/GarbageSetupView';
import GarbageHomeView from './garbage/GarbageHomeView';

const GarbageScreen = () => {
  const theme = useTheme();

  // null = still loading, object = has address, 'none' = no saved address
  const [savedAddress, setSavedAddress] = useState(null);
  const [booting, setBooting] = useState(true);

  // On mount, check AsyncStorage for a saved address
  useEffect(() => {
    loadSavedAddress()
      .then(addr => setSavedAddress(addr ?? 'none'))
      .catch(() => setSavedAddress('none'))
      .finally(() => setBooting(false));
  }, []);

  const handleAddressConfirmed = useCallback((resolved) => {
    setSavedAddress(resolved);
  }, []);

  const handleChangeAddress = useCallback(async () => {
    await clearSavedAddress();
    setSavedAddress('none');
  }, []);

  if (booting) {
    return (
      <View style={styles.bootWrap}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  if (!savedAddress || savedAddress === 'none') {
    return (
      <GarbageSetupView onAddressConfirmed={handleAddressConfirmed} />
    );
  }

  return (
    <GarbageHomeView
      savedAddress={savedAddress}
      onChangeAddress={handleChangeAddress}
    />
  );
};

const styles = StyleSheet.create({
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GarbageScreen;
