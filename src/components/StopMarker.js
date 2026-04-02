/**
 * StopMarker - TheBetterLondon
 * Image-based marker for bus stops. Using the `image` prop instead of a child
 * <View> bypasses the React render thread entirely — no JS bridge overhead per
 * marker. This is the single biggest win when rendering 1200+ stops on Android.
 */

import React, { memo } from 'react';
import { Marker } from 'react-native-maps';

// Pre-require once at module load — never re-resolved on re-renders
const STOP_ICON = require('../../assets/markers/stop.png');

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
      image={STOP_ICON}
      onPress={onPress}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if stop ID changes — static stops never move
  return prevProps.stop.id === nextProps.stop.id;
});

StopMarker.displayName = 'StopMarker';

export default StopMarker;
