/**
 * ForgotPasswordScreen - TheBetterLondon
 * US-104: Reset Password via Email
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { resetPassword } from '../services/authService';
import {
  ScreenContainer,
  TextInput,
  PrimaryButton,
  Alert,
} from '../components';

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing[4],
    },
    backButton: {
      marginTop: theme.spacing[6],
      marginBottom: theme.spacing[4],
      alignSelf: 'flex-start',
    },
    header: {
      marginBottom: theme.spacing[8],
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    subtitle: {
      ...theme.typography.body1,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[16],
    },
    successIcon: {
      marginBottom: theme.spacing[6],
    },
    successTitle: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing[3],
    },
    successBody: {
      ...theme.typography.body1,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing[8],
    },
    emailHighlight: {
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
    },
    backToSignIn: {
      marginTop: theme.spacing[4],
    },
    backToSignInText: {
      ...theme.typography.body1,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
      textAlign: 'center',
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing[4],
    },
    resendText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
    },
    resendLink: {
      ...theme.typography.body2,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
      marginLeft: theme.spacing[1],
    },
  });

  // ── Success state ────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <Icon
            name="email-check-outline"
            size={80}
            color={theme.colors.primary[500]}
            style={styles.successIcon}
          />
          <Text style={styles.successTitle}>Check Your Inbox</Text>
          <Text style={styles.successBody}>
            We've sent a password reset link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>.{'\n\n'}
            Click the link in the email to create a new password. Check your
            spam folder if you don't see it within a few minutes.
          </Text>

          <PrimaryButton
            title="Back to Sign In"
            onPress={() => navigation.navigate('SignIn')}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive it?</Text>
            <TouchableOpacity onPress={() => { setSent(false); }}>
              <Text style={styles.resendLink}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-left"
            size={theme.iconSize.lg}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </Text>
        </View>

        {error ? <Alert type="error" message={error} /> : null}

        <TextInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          leftIcon="email-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />

        <PrimaryButton
          title="Send Reset Link"
          onPress={handleSend}
          loading={loading}
          disabled={loading}
        />

        <TouchableOpacity
          style={styles.backToSignIn}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.backToSignInText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

export default ForgotPasswordScreen;
