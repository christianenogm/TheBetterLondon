/**
 * SignUpScreen - TheBetterLondon
 * US-101: Create an Account with Email
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { signUpWithEmail } from '../services/authService';
import {
  ScreenContainer,
  TextInput,
  PrimaryButton,
  GoogleSignInButton,
  Alert,
} from '../components';

const SignUpScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await signUpWithEmail(name, email, password);

      if (result.success) {
        await signIn(result.user);
        // Navigation will be handled by AuthContext
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (user) => {
    try {
      await signIn(user);
      // Navigation will be handled by AuthContext
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing[4],
    },
    header: {
      marginTop: theme.spacing[8],
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
    },
    form: {
      marginBottom: theme.spacing[4],
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing[6],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border.default,
    },
    dividerText: {
      ...theme.typography.body2,
      color: theme.colors.text.hint,
      marginHorizontal: theme.spacing[4],
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing[4],
    },
    footerText: {
      ...theme.typography.body1,
      color: theme.colors.text.secondary,
    },
    footerLink: {
      ...theme.typography.body1,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
      marginLeft: theme.spacing[1],
    },
  });

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join The Better London community and start reporting issues
          </Text>
        </View>

        {error ? <Alert type="error" message={error} /> : null}

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            leftIcon={theme.icons.profile}
            autoCapitalize="words"
            editable={!loading}
          />

          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon={theme.icons.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            leftIcon={theme.icons.password}
            secureTextEntry
            helperText="At least 6 characters"
            editable={!loading}
          />

          <TextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            leftIcon={theme.icons.password}
            secureTextEntry
            editable={!loading}
          />

          <PrimaryButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={{ marginTop: theme.spacing[4] }}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton
          onSuccess={handleGoogleSignIn}
          onError={handleGoogleError}
          disabled={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SignUpScreen;
