/**
 * TakePhotosScreen - TheBetterLondon
 * US-202: Take or Upload Photos of the Issue
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, PrimaryButton, SecondaryButton } from '../../components';

const MAX_PHOTOS = 5;

const TakePhotosScreen = ({ route, navigation }) => {
  const theme = useTheme();


  return (
    <ScreenContainer>
      <Text>Take/Upload Photos Screen</Text>
    </ScreenContainer>
  );
};

export default TakePhotosScreen;
