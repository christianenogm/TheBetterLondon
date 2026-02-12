/**
 * SelectCategoryScreen - TheBetterLondon
 * US-201: Choose What Type of Issue to Report
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, Card } from '../../components';
import { ISSUE_CATEGORIES } from '../../utils/constants';

const SelectCategoryScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <Text>Select Issue Category Screen</Text>
    </ScreenContainer>
  );
};

export default SelectCategoryScreen;
