/**
 * ForgotPasswordScreen - TheBetterLondon
 * US-104: Reset Password via Email
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { resetPassword } from '../services/authService';
import { TextInput, PrimaryButton, Alert } from '../components';

const GRADIENT = ['#1B5E20', '#2E7D32', '#43A047'];

const ForgotPasswordScreen = ({ navigation }) => {
  const theme   = useTheme();
  const insets  = useSafeAreaInsets();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSend = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result.success) { setSent(true); } else { setError(result.error); }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <View style={s.root}>
        <LinearGradient colors={GRADIENT} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <View style={[s.hero, { paddingTop: insets.top + 28 }]}>
          <View style={s.logoBadge}>
            <Icon name="email-check-outline" size={34} color="#4CAF50" />
          </View>
          <Text style={s.appName}>Email Sent!</Text>
          <Text style={s.tagline}>Check your inbox</Text>
        </View>

        <View style={s.card}>
          <View style={[s.cardContent, { paddingBottom: insets.bottom + 28, alignItems: 'center' }]}>
            <Text style={s.cardTitle}>Check Your Inbox</Text>
            <Text style={[s.cardSub, { textAlign: 'center' }]}>
              {'We\'ve sent a reset link to\n'}
              <Text style={{ color: theme.colors.primary[600], fontWeight: '700' }}>{email}</Text>
              {'\n\nCheck your spam if you don\'t see it within a few minutes.'}
            </Text>
            <PrimaryButton
              title="Back to Sign In"
              onPress={() => navigation.navigate('SignIn')}
              style={{ width: '100%' }}
            />
            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setSent(false)}>
              <Text style={{ fontSize: 14, color: theme.colors.primary[600], fontWeight: '600' }}>
                Didn't receive it? Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <LinearGradient colors={GRADIENT} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero with back button */}
      <View style={[s.hero, { paddingTop: insets.top + 28 }]}>
        <TouchableOpacity style={[s.backBtn, { top: insets.top + 16 }]} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.logoBadge}>
          <Icon name="lock-reset" size={34} color="#4CAF50" />
        </View>
        <Text style={s.appName}>Reset Password</Text>
        <Text style={s.tagline}>We'll send you a reset link</Text>
      </View>

      {/* White card */}
      <View style={s.card}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[s.cardContent, { paddingBottom: insets.bottom + 28 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.cardTitle}>Forgot Password?</Text>
            <Text style={s.cardSub}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </Text>

            {!!error && <Alert type="error" message={error} style={s.alert} />}

            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              leftIcon="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <PrimaryButton
              title="Send Reset Link"
              onPress={handleSend}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity style={s.backToSignIn} onPress={() => navigation.navigate('SignIn')}>
              <Text style={[s.backToSignInText, { color: theme.colors.primary[600] }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#1B5E20' },
  hero:      { alignItems: 'center', paddingBottom: 28 },
  logoBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
  },
  appName:  { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.3, marginBottom: 4 },
  tagline:  { fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: '500', letterSpacing: 1.4 },
  card:     { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  cardContent: { paddingHorizontal: 24, paddingTop: 28 },
  cardTitle: { fontSize: 26, fontWeight: '700', color: '#212121', marginBottom: 4 },
  cardSub:   { fontSize: 14, color: '#757575', marginBottom: 20, lineHeight: 21 },
  alert:     { marginBottom: 12 },
  backBtn:   {
    position: 'absolute', left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backToSignIn:     { marginTop: 20, alignSelf: 'center' },
  backToSignInText: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPasswordScreen;
