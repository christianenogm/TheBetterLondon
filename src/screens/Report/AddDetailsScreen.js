/**
 * AddDetailsScreen - TheBetterLondon
 * US-204: Add a Title and Description
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, TextInput, PrimaryButton } from '../../components';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const AddDetailsScreen = ({ route, navigation }) => {
  const { category, photos, location } = route.params;
  const theme = useTheme();
  

  return (
    <ScreenContainer>
      <Text>Add Report Details Screen</Text>
    </ScreenContainer>
  );
};

export default AddDetailsScreen;
