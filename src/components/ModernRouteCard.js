/**
 * ModernRouteCard - Improved route display card
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/designSystem';

const ModernRouteCard = ({ route, selected, onPress, onToggle }) => {
  const getTextColor = (bgColor) => {
    // Simple luminance calculation for text contrast
    if (!bgColor) return '#FFFFFF';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        elevation.low,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {/* Route Badge */}
        <View style={[styles.badge, { backgroundColor: route.color || colors.primary.main }]}>
          <Text style={[styles.badgeText, { color: getTextColor(route.color) }]}>
            {route.shortName || route.name || route.id}
          </Text>
        </View>

        {/* Route Name */}
        <Text style={styles.routeName} numberOfLines={1}>
          {route.longName || route.description || `Route ${route.shortName || route.id}`}
        </Text>

        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={selected ? 'eye' : 'eye-off'}
            size={24}
            color={selected ? colors.secondary.main : colors.text.disabled}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    backgroundColor: `${colors.primary.main}10`,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.label.large,
    fontWeight: 'bold',
  },
  routeName: {
    flex: 1,
    ...typography.body.large,
    color: colors.text.primary,
  },
  toggleButton: {
    padding: spacing.xs,
  },
});

export default ModernRouteCard;
