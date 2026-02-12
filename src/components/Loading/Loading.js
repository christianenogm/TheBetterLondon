/**
 * Loading Component - TheBetterLondon
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Loading = ({ size = 'large', color, fullScreen = false }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: fullScreen ? 1 : undefined,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing[8],
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary[500]}
      />
    </View>
  );
};

export default Loading;
