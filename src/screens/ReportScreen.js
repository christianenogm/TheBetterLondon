/**
 * ReportScreen - TheBetterLondon
 * Stack Navigator for Issue Reporting Flow
 * Epic 2: Report Issues (US-201 to US-205)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

// Import report flow screens
import SelectCategoryScreen from './Report/SelectCategoryScreen';
import TakePhotosScreen from './Report/TakePhotosScreen';
import AddLocationScreen from './Report/AddLocationScreen';
import AddDetailsScreen from './Report/AddDetailsScreen';
import ReviewSubmitScreen from './Report/ReviewSubmitScreen';

const Stack = createNativeStackNavigator();

const ReportScreen = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.neutral[0],
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          ...theme.typography.h3,
          fontWeight: theme.fontWeight.semibold,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="SelectCategory"
        component={SelectCategoryScreen}
        options={{ title: 'Report Issue' }}
      />
      <Stack.Screen
        name="TakePhotos"
        component={TakePhotosScreen}
        options={{ title: 'Add Photos' }}
      />
      <Stack.Screen
        name="AddLocation"
        component={AddLocationScreen}
        options={{ title: 'Location' }}
      />
      <Stack.Screen
        name="AddDetails"
        component={AddDetailsScreen}
        options={{ title: 'Details' }}
      />
      <Stack.Screen
        name="ReviewSubmit"
        component={ReviewSubmitScreen}
        options={{ title: 'Review' }}
      />
    </Stack.Navigator>
  );
};

export default ReportScreen;
