/**
 * FloatingActionButton (FAB) - Modern Material Design component
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, elevation, borderRadius, sizing } from '../utils/designSystem';

const FloatingActionButton = ({ 
  icon, 
  label, 
  onPress, 
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'primary', // 'primary', 'secondary', 'accent'
  extended = false, // Extended FAB with label
  style,
  disabled = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return sizing.fab.sm;
      case 'lg': return sizing.fab.lg;
      default: return sizing.fab.md;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return [colors.secondary.main, colors.secondary.dark];
      case 'accent':
        return [colors.accent.main, colors.accent.dark];
      default:
        return [colors.primary.main, colors.primary.dark];
    }
  };

  const fabSize = getSize();
  const gradientColors = getColors();
  const iconSize = size === 'sm' ? sizing.icon.md : size === 'lg' ? sizing.icon.xl : sizing.icon.lg;

  if (extended) {
    return (
      <TouchableOpacity
        style={[
          styles.extendedFab,
          elevation.high,
          { opacity: disabled ? 0.6 : 1 },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.extendedGradient}
        >
          <MaterialCommunityIcons name={icon} size={sizing.icon.md} color="#FFFFFF" />
          <Text style={styles.extendedLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          opacity: disabled ? 0.6 : 1,
        },
        elevation.high,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={iconSize} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  extendedFab: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  extendedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  extendedLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default FloatingActionButton;
