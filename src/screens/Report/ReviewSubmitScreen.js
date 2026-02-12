/**
 * ReviewSubmitScreen - TheBetterLondon
 * US-205: Review and Submit the Report
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, PrimaryButton, SecondaryButton, Card, Loading } from '../../components';


const POINTS_REWARD = 10;

const ReviewSubmitScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  

  return (
    <ScreenContainer>
      <Text>Review and Submit Report Screen</Text>
    </ScreenContainer>
  );
};

export default ReviewSubmitScreen;
