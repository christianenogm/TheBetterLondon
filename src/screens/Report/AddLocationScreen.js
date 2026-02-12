/**
 * AddLocationScreen - TheBetterLondon
 * US-203: Pinpoint the Location of the Issue
 */

import React, { useState, useEffect } from 'react';
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

  return (
    <ScreenContainer edges={[]}>
      <Text>Add Report Location Screen</Text>
    </ScreenContainer>
  );
};

export default AddLocationScreen;
