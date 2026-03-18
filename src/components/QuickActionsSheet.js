/**
 * QuickActionsSheet - Modern bottom sheet for quick actions
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/designSystem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

const QuickActionsSheet = ({ visible, onClose, onActionSelect, userLocation, favoriteStops }) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const actions = [
    {
      id: 'nearby',
      icon: 'map-marker-radius',
      title: 'Nearby Stops',
      subtitle: `Find stops within 2km${userLocation ? '' : ' (enable location)'}`,
      color: colors.primary.main,
      disabled: !userLocation,
    },
    {
      id: 'favorites',
      icon: 'star',
      title: 'Favorite Stops',
      subtitle: favoriteStops?.length > 0 ? `${favoriteStops.length} saved stops` : 'No favorites yet',
      color: colors.warning.main,
      disabled: !favoriteStops || favoriteStops.length === 0,
    },
    {
      id: 'routes',
      icon: 'bus-multiple',
      title: 'All Routes',
      subtitle: 'View and filter all bus routes',
      color: colors.accent.main,
      disabled: false,
    },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View 
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Actions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Actions List */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                action.disabled && styles.actionCardDisabled,
              ]}
              onPress={() => {
                if (!action.disabled) {
                  onActionSelect(action.id);
                  onClose();
                }
              }}
              disabled={action.disabled}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
                <MaterialCommunityIcons 
                  name={action.icon} 
                  size={28} 
                  color={action.disabled ? colors.text.disabled : action.color} 
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={[
                  styles.actionTitle,
                  action.disabled && styles.actionTitleDisabled,
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  styles.actionSubtitle,
                  action.disabled && styles.actionSubtitleDisabled,
                ]}>
                  {action.subtitle}
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={action.disabled ? colors.text.disabled : colors.text.hint} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.surface.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    ...elevation.highest,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.main,
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    ...typography.title.large,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.low,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.title.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionTitleDisabled: {
    color: colors.text.disabled,
  },
  actionSubtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  actionSubtitleDisabled: {
    color: colors.text.disabled,
  },
});

export default QuickActionsSheet;
