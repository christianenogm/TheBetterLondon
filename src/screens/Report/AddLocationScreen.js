/**
 * AddLocationScreen - TheBetterLondon
 * US-203: Pinpoint the Location of the Issue
 */

import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, PrimaryButton, TextInput } from '../../components';

// London, Ontario default coordinates
const LONDON_DEFAULT = {
  latitude: 42.9849,
  longitude: -81.2453,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const AddLocationScreen = ({ route, navigation }) => {
  
  const theme = useTheme();
  const { photos, category } = route.params || {};

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(LONDON_DEFAULT);    
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to pinpoint the issue location.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(coords);
      setPin(coords);
    
      const revAddress = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (revAddress.length > 0) {
        const addr = revAddress[0];
        setAddress(`${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`);
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location. Please try again.');
      setLoading(false);
    }
  };

  const continueHandler = () => {
    if(!pin) {
      Alert.alert('Select Location', 'Please select a location on the map or enter an address.');
      return;
    }
    navigation.navigate('AddDetailsScreen', { photos, category, location: pin, address });
  };


  return (
    <ScreenContainer edges={[]}>
      {/* Category Icon */}
      {category && (
        <View style={[styles.categoryBox, { backgroundColor: `${category.color}33` }]}>
          <Icon name={category.icon} size={24} color={category.color} />
          <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Where is it?</Text>
      <Text style={styles.subtitle}>Tap on the map or use your current location</Text>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <Text>Loading map...</Text>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={pin || LONDON_DEFAULT}
            onPress={(e) => setPin(e.nativeEvent.coordinate)}
          >
            {pin && <Marker coordinate={pin} draggable onDragEnd={(e) => setPin(e.nativeEvent.coordinate)} />}
          </MapView>
        )}
      </View>

      {/* Address Input */}
      <TextInput
        style={styles.input}
        placeholder="Or enter address manually"
        value={address}
        onChangeText={setAddress}
      />

      {/* Instruction */}
      <Text style={styles.instruction}>Drag the map to adjust the pin location</Text>

      {/* Continue Button */}
      <PrimaryButton
        title="Continue"
        onPress={continueHandler}
        style={{ marginTop: 20 }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  categoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  categoryLabel: {
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginHorizontal: 20,
  },
  mapContainer: {
    height: 250,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  map: {
    flex: 1,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  instruction: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 20,
    marginTop: 4,
  },
});

export default AddLocationScreen;
