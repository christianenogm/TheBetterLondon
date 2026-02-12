/**
 * HomeScreen - TheBetterLondon
 * Epic 3: View Reports Feed (US-301)
 * Display community-reported issues
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer, Card, Badge, EmptyState, Loading } from '../components';


const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);


  if (loading) {
    return <Loading />;
  }

  if (reports.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="clipboard-alert"
          title="No Reports Yet"
          description="Be the first to report an issue in your community!"
          actionLabel="Report an Issue"
          onActionPress={() => navigation.navigate('Report')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['left', 'right']}>
      <Text>All Community Reports display here</Text>
    </ScreenContainer>
  );
};

export default HomeScreen;
