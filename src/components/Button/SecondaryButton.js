/**
 * SecondaryButton Component - TheBetterLondon
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SecondaryButton = ({ 
  title,
  children,
  onPress, 
  disabled = false, 
  loading = false,
  style,
  textStyle 
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      ...theme.components.button.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    },
    text: {
      ...theme.typography.button,
      color: theme.colors.primary[500],
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary[500]} />
      ) : (
        <Text style={[styles.text, textStyle]}>{children || title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default SecondaryButton;
