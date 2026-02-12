/**
 * GoogleSignInButton Component - TheBetterLondon
 * Handles Google Sign-In with Firebase
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

const GoogleSignInButton = ({ onSuccess, onError, disabled }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Configure Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      setLoading(false);
      onError?.('Google Sign-In failed. Please try again.');
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
      setLoading(true);
      const result = await signInWithGoogle(idToken);

      if (result.success) {
        onSuccess?.(result.user);
      } else {
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      onError?.('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (!disabled && request) {
      setLoading(true);
      promptAsync();
    }
  };

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    icon: {
      marginRight: theme.spacing[3],
    },
    text: {
      ...theme.typography.button,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || loading || !request}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.text.primary} />
      ) : (
        <>
          <MaterialCommunityIcons
            name="google"
            size={24}
            color="#4285F4"
            style={styles.icon}
          />
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;
