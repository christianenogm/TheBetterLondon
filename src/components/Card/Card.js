/**
 * Card Component - TheBetterLondon
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, style, noPadding = false, noShadow = false }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      ...theme.components.card,
      padding: noPadding ? 0 : theme.spacing[4],
      ...(noShadow ? {} : theme.shadows.md),
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
};

export default Card;
