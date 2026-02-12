/**
 * IconButton Component - TheBetterLondon
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const IconButton = ({ 
  icon, 
  size = 'base', 
  color, 
  onPress, 
  style,
  backgroundColor = 'transparent',
  disabled = false
}) => {
  const theme = useTheme();

  const iconSizeMap = {
    sm: theme.iconSize.sm,
    base: theme.iconSize.base,
    lg: theme.iconSize.lg,
  };

  const styles = StyleSheet.create({
    button: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      opacity: disabled ? 0.5 : 1,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon
        name={icon}
        size={iconSizeMap[size]}
        color={color || theme.colors.text.primary}
      />
    </TouchableOpacity>
  );
};

export default IconButton;
