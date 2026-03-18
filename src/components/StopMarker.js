/**
 * StopMarker - TheBetterLondon
 * Memoized marker component for bus stops to optimize rendering performance
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

const StopMarker = memo(({ stop, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: stop.latitude,
        longitude: stop.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={10}
      tracksViewChanges={false}
      onPress={onPress}
    >
      <View style={styles.stopMarker} pointerEvents="auto" />
    </Marker>
  );
}, (prevProps, nextProps) => {
  // Only re-render if stop ID changes - ignore onPress function changes
  return prevProps.stop.id === nextProps.stop.id;
});

const styles = StyleSheet.create({
  stopMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

StopMarker.displayName = 'StopMarker';

export default StopMarker;
