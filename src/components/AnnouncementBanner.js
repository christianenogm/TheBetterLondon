/**
 * AnnouncementBanner - TheBetterLondon
 * Displays an admin-controlled announcement on the Home screen.
 * Types: 'info' (blue), 'warning' (amber), 'success' (green)
 * Dismissal persists across sessions via AsyncStorage, keyed by content hash
 * so a new announcement from the admin always re-appears.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

const DISMISSED_KEY = '@dismissed_announcement_id';

const TYPE_STYLES = {
  success: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    title: '#166534',
    text: '#15803D',
    icon: 'check-circle-outline',
    iconColor: '#22C55E',
  },
  warning: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    title: '#92400E',
    text: '#B45309',
    icon: 'alert-outline',
    iconColor: '#F59E0B',
  },
  info: {
    bg: '#DBEAFE',
    border: '#93C5FD',
    title: '#1E3A8A',
    text: '#1E40AF',
    icon: 'information-outline',
    iconColor: '#3B82F6',
  },
};

const AnnouncementBanner = () => {
  const { announcement } = useAppSettings();
  // null = haven't checked AsyncStorage yet; true/false = known state
  const [dismissed, setDismissed] = useState(null);

  // Unique key for this specific announcement content
  const announcementId = announcement?.enabled
    ? `${announcement.title}__${announcement.updatedAt ?? ''}`
    : null;

  useEffect(() => {
    if (!announcementId) {
      setDismissed(false);
      return;
    }
    AsyncStorage.getItem(DISMISSED_KEY)
      .then(stored => setDismissed(stored === announcementId))
      .catch(() => setDismissed(false));
  }, [announcementId]);

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, announcementId);
    } catch {
      // Dismiss in UI even if storage fails
    }
  };

  if (!announcement?.enabled || !announcement.title || !announcement.message || dismissed !== false) {
    return null;
  }

  const s = TYPE_STYLES[announcement.type] ?? TYPE_STYLES.info;

  return (
    <View style={[styles.container, { backgroundColor: s.bg, borderColor: s.border }]}>
      <MaterialCommunityIcons name={s.icon} size={20} color={s.iconColor} style={styles.leadIcon} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: s.title }]}>{announcement.title}</Text>
        <Text style={[styles.message, { color: s.text }]}>{announcement.message}</Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialCommunityIcons name="close" size={18} color={s.title} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  leadIcon: {
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AnnouncementBanner;
