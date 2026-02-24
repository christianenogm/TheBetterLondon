/**
 * AddLocationScreen - TheBetterLondon
 * US-203: Pinpoint the Location of the Issue - DONE
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, PrimaryButton, TextInput, Alert } from '../../components';

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
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const mapRef = useRef(null); 
  const [pin, setPin] = useState({
    ...LONDON_DEFAULT,   
  });   
  const [manualAddressValid, setManualAddressValid] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update address when pin changes
  useEffect(() => {
    const updateAddressFromPin = async () => {
      if (!pin) return;
      try {
        const revAddress = await Location.reverseGeocodeAsync(pin);
        if (revAddress.length > 0) {
          const addr = revAddress[0];
          setAddress(`${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`);
        }
      } catch (err) {
        console.log('Não foi possível obter endereço do pin:', err);
      }
    };
    updateAddressFromPin();
  }, [pin]);


  // Get current location with retries
  const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage('Location permission is required to pinpoint the issue location.');
      setLoading(false);
      return;
    }

    let loc = null;

    // Try to get location up to 3 times with a delay in between
    for (let i = 0; i < 3; i++) {
      try {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        break; 
      } catch (err) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }

    if (!loc) {
      setErrorMessage('Unable to get your location after 3 attempts. Please enter the address manually.');
      setLoading(false);
      return; 
    }
    // Set pin to current location
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setPin(coords); 
    setLoading(false);

  } catch (error) {
     setErrorMessage('Unexpected error while trying to get location. Please enter the address manually.');
    setLoading(false);
  }
};

// Update pin based on manual address input
const updatePinFromManualAddress = async () => {

  if (!manualAddress.trim()) {
    setErrorMessage('Please enter an address.');
    setManualAddressValid(false);
    return;
  }
  try {
    const geocode = await Location.geocodeAsync(manualAddress);
    
    if (!geocode || geocode.length === 0) {
      setErrorMessage('Address not found. Please enter a valid address.');
      setManualAddressValid(false);
      return;
    }
    const coords = {
      latitude: geocode[0].latitude,
      longitude: geocode[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setPin(coords);
    setErrorMessage('');
    setManualAddressValid(true);

    if (mapRef.current) {
      mapRef.current.animateToRegion(coords, 1000);
    }
  } catch (err) {
    setErrorMessage('Unable to find this address.');
    setManualAddressValid(false);
  }
};

// Continue to next screen with selected location
const continueHandler = async () => {

  if (manualAddress.trim() && !manualAddressValid) {

    await updatePinFromManualAddress();

    if (!manualAddressValid) {
      return;
    }
  }
  if (!pin) {
    setErrorMessage(
      'Please select a location on the map or enter a valid address.'
    );
    return;
  }
  navigation.navigate('AddDetails', {photos, category, location: pin, address: address });
};
return (
  <ScreenContainer scrollable edges={[]}>
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
           <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={pin} 
            onPress={(e) => {
              setPin({
                ...e.nativeEvent.coordinate,
                latitudeDelta: pin.latitudeDelta || 0.01,
                longitudeDelta: pin.longitudeDelta || 0.01,
              });
              setManualAddress(''); 
              setManualAddressValid(true);
            }}
          >
            {pin && (
              <Marker
                coordinate={pin}
                draggable
                onDragEnd={(e) => {
                  setPin({
                    ...e.nativeEvent.coordinate,
                    latitudeDelta: pin.latitudeDelta || 0.01,
                    longitudeDelta: pin.longitudeDelta || 0.01,
                  });
                  setManualAddress(''); 
                  setManualAddressValid(true);
                }}
              />
            )}
          </MapView>
        )}
      </View>

      {/* Selected Location */}
      <Text style={styles.subtitleBold}>Selected Location:</Text>
      <Text style={styles.selectedLocation}>{address || 'Loading...'}</Text>

      {/* Manual Address Input */}
      <Text style={styles.subtitleBold}>Or enter address manually</Text>
      <View style={{ marginHorizontal: 20, marginTop: 5 }}>
      <TextInput
        style={[styles.input, { width: '100%' }]}
        placeholder="123 Main St, London, ON"
        value={manualAddress}
        onChangeText={(text) => {
          setManualAddress(text);
          setErrorMessage('');
        }}
        onSubmitEditing={updatePinFromManualAddress}
        returnKeyType="done"
        blurOnSubmit={true}
      />
      </View>

      {/* Error Alert */}
      {errorMessage !== '' && (
        <Alert
          type="error"
          title="Error"
          message={errorMessage}
        />
      )}

      {/* Instruction */}
      <Text style={styles.instruction}>Drag the map to adjust the pin location</Text>
      
      {/* Continue Button */}
      <View style={{ marginHorizontal: 20, marginTop: 10 }}>
      <PrimaryButton
        title="Continue"
        onPress={continueHandler}
      /></View>
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
  subtitleBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginHorizontal: 20,
    marginTop: 12,
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
  selectedLocation: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 20,
    marginTop: 4,
  },
  instruction: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 20,    
  },
});

export default AddLocationScreen;
