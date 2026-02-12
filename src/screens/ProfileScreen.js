/**
 * ProfileScreen - TheBetterLondon
 * US-106: Log Out of My Account
 * US-105: View My Profile and Stats (partial)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ScreenContainer,
  Card,
  PrimaryButton,
  SecondaryButton,
} from '../components';

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  return (
    <ScreenContainer>
      <Text>Profile Screen - User info and stats will be displayed here</Text>
    </ScreenContainer>
  );
};

export default ProfileScreen;
