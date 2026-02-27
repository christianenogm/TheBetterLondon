/**
 * SignInScreen - TheBetterLondon
 * US-102: Sign In to My Account
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail } from '../services/authService';
import {
  ScreenContainer,
  TextInput,
  PrimaryButton,
  SecondaryButton,
  GoogleSignInButton,
  Alert,
} from '../components';

const SignInScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);

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

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
      marginTop: theme.spacing[12],
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
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: theme.spacing[2],
      marginBottom: theme.spacing[6],
    },
    forgotPasswordText: {
      ...theme.typography.body2,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
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
      marginTop: theme.spacing[8],
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue reporting and tracking issues
          </Text>
        </View>

        {error ? <Alert type="error" message={error} /> : null}

        <View style={styles.form}>
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
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
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

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
        </View>

        <SecondaryButton
          title="Create New Account"
          onPress={() => navigation.navigate('SignUp')}
          disabled={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to London?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SignInScreen;
