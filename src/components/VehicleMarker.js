/**
 * VehicleMarker - TheBetterLondon
 * Vehicle marker component with callout showing route info
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRouteDetails } from '../services/gtfsStaticService';

const VehicleMarker = ({ vehicle, onPress }) => {
  const routeDetails = getRouteDetails(vehicle.routeId);
  const routeColor = vehicle.color || (routeDetails && routeDetails.color) || '#1976D2';
  const shortName = (routeDetails && routeDetails.shortName) || vehicle.routeId || '?';
  const longName = (routeDetails && routeDetails.longName) || '';

  return (
    <Marker
      coordinate={{
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={false}
      rotation={vehicle.bearing || 0}
      tracksViewChanges={true}
      zIndex={1}
      onPress={onPress}
    >
      <View style={styles.busMarker}>
        <MaterialCommunityIcons name="navigation" size={28} color={routeColor} />
      </View>

      <Callout tooltip>
        <View style={styles.callout}>
          <View style={[styles.routeBadge, { backgroundColor: routeColor }]}>
            <MaterialCommunityIcons name="bus" size={13} color="#fff" />
            <Text style={styles.routeBadgeText}>{shortName}</Text>
          </View>
          {!!longName && (
            <Text style={styles.routeName}>{longName}</Text>
          )}
          <Text style={styles.routeSub}>Live bus · Route {shortName}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  busMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 140,
    maxWidth: 220,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
    gap: 4,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    marginBottom: 2,
  },
  routeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  routeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  routeSub: {
    fontSize: 11,
    color: '#757575',
  },
});

export default VehicleMarker;
