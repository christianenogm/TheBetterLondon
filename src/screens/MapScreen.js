/**
 * MapScreen - TheBetterLondon
 * Will show issues on map
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer, EmptyState } from '../components';

const MapScreen = () => {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <EmptyState
        icon={theme.icons.map}
        title="Issues Map"
        description="Map view of community issues will appear here"
      />
    </ScreenContainer>
  );
};

export default MapScreen;
