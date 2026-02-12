/**
 * Badge Component - TheBetterLondon
 * For status indicators
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Status mapping for report statuses
const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'warning' },
  open: { label: 'Open', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
};

const Badge = ({ label, variant = 'default', style, textStyle }) => {
  const theme = useTheme();

  // If variant matches a status key, use the status config
  const statusConfig = STATUS_CONFIG[variant];
  const displayLabel = statusConfig ? statusConfig.label : label;
  const displayVariant = statusConfig ? statusConfig.variant : variant;

  const getBackgroundColor = () => {
    switch (displayVariant) {
      case 'success':
        return theme.colors.success.light;
      case 'warning':
        return theme.colors.warning.light;
      case 'error':
        return theme.colors.error.light;
      case 'info':
        return theme.colors.info.light;
      default:
        return theme.colors.neutral[100];
    }
  };

  const getTextColor = () => {
    switch (displayVariant) {
      case 'success':
        return theme.colors.success.dark;
      case 'warning':
        return theme.colors.warning.dark;
      case 'error':
        return theme.colors.error.dark;
      case 'info':
        return theme.colors.info.dark;
      default:
        return theme.colors.text.primary;
    }
  };

  const styles = StyleSheet.create({
    badge: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
      borderRadius: theme.borderRadius.base,
      backgroundColor: getBackgroundColor(),
      alignSelf: 'flex-start',
    },
    text: {
      ...theme.typography.caption,
      fontWeight: theme.fontWeight.semibold,
      color: getTextColor(),
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.text, textStyle]}>{displayLabel}</Text>
    </View>
  );
};

export default Badge;
