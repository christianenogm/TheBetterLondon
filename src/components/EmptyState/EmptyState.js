/**
 * EmptyState Component - TheBetterLondon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import PrimaryButton from '../Button/PrimaryButton';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onActionPress,
  style 
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[8],
    },
    icon: {
      marginBottom: theme.spacing[4],
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing[2],
    },
    description: {
      ...theme.typography.body1,
      color: theme.colors.text.hint,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing[6],
    },
  });

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <Icon
          name={icon}
          size={theme.iconSize['2xl']}
          color={theme.colors.neutral[400]}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onActionPress && (
        <PrimaryButton onPress={onActionPress}>{actionLabel}</PrimaryButton>
      )}
    </View>
  );
};

export default EmptyState;
