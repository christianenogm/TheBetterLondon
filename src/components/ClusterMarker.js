/**
 * ClusterMarker - TheBetterLondon
 * Renders a stop-count badge at mid-zoom levels where showing individual stop
 * markers would flood the map. View-based (not image) because at this zoom
 * tier there are only ~15-40 clusters visible — far below the threshold where
 * JS-bridge overhead matters.
 *
 * Tapping a cluster zooms in smoothly via the onPress callback.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

const ClusterMarker = memo(({ cluster, onPress }) => {
  // Scale the badge slightly for larger clusters so they're easier to tap
  const size = cluster.count >= 20 ? 48 : cluster.count >= 10 ? 40 : 34;
  const fontSize = cluster.count >= 20 ? 14 : cluster.count >= 10 ? 13 : 12;

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={20}
      onPress={() => onPress && onPress(cluster)}
    >
      <View
        style={[
          styles.cluster,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={[styles.count, { fontSize }]}>{cluster.count}</Text>
      </View>
    </Marker>
  );
}, (prev, next) =>
  prev.cluster.id    === next.cluster.id &&
  prev.cluster.count === next.cluster.count
);

const styles = StyleSheet.create({
  cluster: {
    backgroundColor: '#1976D2',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow keeps the badge readable over any map tile colour
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  count: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 16,
  },
});

ClusterMarker.displayName = 'ClusterMarker';

export default ClusterMarker;
