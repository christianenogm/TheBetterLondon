/**
 * ScreenContainer Component - TheBetterLondon
 * Consistent screen wrapper with safe area
 */

import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const ScreenContainer = ({ 
  children, 
  scrollable = false,
  style,
  contentContainerStyle,
  backgroundColor,
  edges = []
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: backgroundColor || theme.colors.background,
    },
    container: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
  });

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        contentContainerStyle: [styles.content, contentContainerStyle],
        keyboardShouldPersistTaps: 'handled',
        showsVerticalScrollIndicator: false,
      }
    : { style: [styles.container, style] };

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Container {...containerProps}>{children}</Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ScreenContainer;
