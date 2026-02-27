/**
 * Alert Component - TheBetterLondon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const Alert = ({ type = 'info', title, message, style }) => {
  const theme = useTheme();

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success + '10',
          borderColor: theme.colors.success,
          icon: 'check-circle',
          iconColor: theme.colors.success,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error + '10',
          borderColor: theme.colors.error,
          icon: 'alert-circle',
          iconColor: theme.colors.error,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning + '10',
          borderColor: theme.colors.warning,
          icon: 'alert',
          iconColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.info + '10',
          borderColor: theme.colors.info,
          icon: 'information',
          iconColor: theme.colors.info,
        };
    }
  };

  const config = getConfig();

  const styles = StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.base,
      padding: theme.spacing[4],
      marginHorizontal: theme.spacing[4],
      marginVertical: theme.spacing[2],
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: config.backgroundColor,
      borderLeftWidth: 4,
      borderLeftColor: config.borderColor,
    },
    iconContainer: {
      marginRight: theme.spacing[3],
    },
    content: {
      flex: 1,
    },
    title: {
      ...theme.typography.body1,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: title && message ? theme.spacing[1] : 0,
    },
    message: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name={config.icon} size={theme.iconSize.base} color={config.iconColor} />
      </View>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

export default Alert;
