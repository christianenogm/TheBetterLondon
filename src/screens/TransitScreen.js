/**
 * TransitScreen - TheBetterLondon
 * Displays all bus stops on an interactive map (US-503)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer} from '../components';

const TransitScreen = ({ navigation, route }) => {
  const theme = useTheme();
  

  return (
    <ScreenContainer edges={[]}>
      <Text>Transit Screen</Text>
    </ScreenContainer>
  );
};

export default TransitScreen;
