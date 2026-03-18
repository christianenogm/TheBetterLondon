/**
 * ModernSearchResultCard - Modern card for search results
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/designSystem';

export const SearchResultCard = ({ result, onPress, isFavorite, onGetDirections }) => {
  const isStop = result.type === 'stop';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isStop ? `${colors.primary.main}15` : `${colors.secondary.main}15` }]}>
        <MaterialCommunityIcons
          name={isStop ? 'bus-stop' : 'map-marker'}
          size={28}
          color={isStop ? colors.primary.main : colors.secondary.main}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {result.name}
        </Text>
        
        {isStop ? (
          <>
            <Text style={styles.subtitle}>
              Stop #{result.code}
            </Text>
            {result.routes && result.routes.length > 0 && (
              <View style={styles.routesRow}>
                <MaterialCommunityIcons name="bus" size={14} color={colors.text.secondary} />
                <Text style={styles.routesText} numberOfLines={1}>
                  {result.routes.join(', ')}
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.subtitle}>Destination</Text>
        )}

        {result.distance && (
          <View style={styles.distanceRow}>
            <MaterialCommunityIcons name="walk" size={14} color={colors.text.secondary} />
            <Text style={styles.distanceText}>
              {result.distance.toFixed(2)} km away
            </Text>
          </View>
        )}

        {/* Get Directions Button for Destinations */}
        {!isStop && onGetDirections && (
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={(e) => {
              e.stopPropagation();
              onGetDirections();
            }}
          >
            <MaterialCommunityIcons name="directions" size={16} color="#FFFFFF" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        )}
      </View>

      {isStop && isFavorite && (
        <MaterialCommunityIcons
          name="star"
          size={24}
          color={colors.warning.main}
          style={styles.favoriteIcon}
        />
      )}

      {!isStop && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text.hint}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.low,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.title.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  routesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  routesText: {
    ...typography.body.small,
    color: colors.text.secondary,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distanceText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  favoriteIcon: {
    marginLeft: spacing.xs,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  directionsText: {
    ...typography.label.medium,
    color: '#FFFFFF',
  },
});

export default SearchResultCard;
