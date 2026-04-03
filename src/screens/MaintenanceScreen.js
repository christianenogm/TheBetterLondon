/**
 * MaintenanceScreen - TheBetterLondon
 * Shown when an admin enables maintenance mode from the dashboard.
 * Listens in real-time — disappears automatically when mode is turned off.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

const MaintenanceScreen = () => {
  const { maintenanceMessage } = useAppSettings();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <MaterialCommunityIcons name="wrench-clock" size={80} color="#2E7D32" style={styles.icon} />

      <Text style={styles.title}>Under Maintenance</Text>

      <Text style={styles.message}>
        {maintenanceMessage || 'We are currently performing maintenance. Please check back soon.'}
      </Text>

      <Text style={styles.footer}>
        We'll be back shortly. Thank you for your patience!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 32,
    opacity: 0.85,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  footer: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MaintenanceScreen;
