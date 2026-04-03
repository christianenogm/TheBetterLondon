import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AppSettingsProvider } from './src/context/AppSettingsContext';
import RootNavigator from './src/navigation/RootNavigator';
import { ActivityIndicator, View } from 'react-native';
import { navigate } from './src/navigation/navigationRef';

// Allow notifications to show as banners even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        MaterialCommunityIcons: require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Handle notification taps — navigate to the relevant screen
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'report_resolved' && data?.reportId) {
        navigate('ReportDetails', { reportId: data.reportId });
      } else if (data?.type === 'transit_alert') {
        navigate('Transit');
      }
    });
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppSettingsProvider>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}