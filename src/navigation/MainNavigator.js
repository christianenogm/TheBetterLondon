/**
 * Bottom Tab Navigator - TheBetterLondon
 * US-401: Navigate Between App Sections
 */

import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ReportScreen from '../screens/ReportScreen';
import TransitScreen from '../screens/TransitScreen';
// import NearbyStopsScreen from '../screens/Transit/NearbyStopsScreen';
// import SearchTransitScreen from '../screens/Transit/SearchTransitScreen';
import ProfileScreen from '../screens/ProfileScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Transit Stack Navigator
const TransitStack = ({ navigation }) => {
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
        name="TransitMap"
        component={TransitScreen}
        options={({ navigation }) => ({
          title: 'London Transit',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // Trigger refresh by navigating to the same screen with a refresh param
                navigation.setParams({ refresh: Date.now() });
              }}
              style={{ marginRight: 8 }}
            >
              <Icon name="refresh" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ),
        })}
      />
      {/* <Stack.Screen
        name="NearbyStops"
        component={NearbyStopsScreen}
        options={{ title: 'Nearby Stops' }}
      /> */}
      {/* <Stack.Screen
        name="SearchTransit"
        component={SearchTransitScreen}
        options={{ title: 'Search Transit' }}
      /> */}
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = theme.icons.home;
              break;
            case 'Map':
              iconName = theme.icons.map;
              break;
            case 'Report':
              iconName = theme.icons.add;
              break;
            case 'Transit':
              iconName = 'bus';
              break;
            case 'Profile':
              iconName = theme.icons.profile;
              break;
            default:
              iconName = theme.icons.home;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
          backgroundColor: theme.colors.neutral[0],
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.neutral[0],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Reports',
          headerTitle: 'Community Reports',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: 'Map',
          headerTitle: 'Issues Map',
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          title: 'Report',
          headerShown: false, // Hide tab header, let stack navigator handle headers
        }}
      />
      <Tab.Screen 
        name="Transit" 
        component={TransitStack}
        options={{
          title: 'Transit',
          headerShown: false, // Let stack navigator handle headers
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="ReportDetails"
        component={ReportDetailsScreen}
        options={{
          title: 'Report Details',
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
      /> */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
