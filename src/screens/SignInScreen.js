/**
 * SignInScreen - TheBetterLondon
 * US-102: Sign In to My Account
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
import { useAuth } from '../context/AuthContext';
import { signInWithEmail } from '../services/authService';
import { TextInput, PrimaryButton, GoogleSignInButton, Alert } from '../components';

const GRADIENT = ['#1B5E20', '#2E7D32', '#43A047'];

const SignInScreen = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSignIn = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password)     { setError('Please enter your password'); return; }
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        await signIn(result.user);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={GRADIENT} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Hero ── */}
      <View style={[s.hero, { paddingTop: insets.top + 28 }]}>
        <View style={s.logoBadge}>
          <Icon name="city" size={34} color="#4CAF50" />
        </View>
        <Text style={s.appName}>The Better London</Text>
        <Text style={s.tagline}>Report · Track · Improve</Text>
      </View>

      {/* ── White card ── */}
      <View style={s.card}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[s.cardContent, { paddingBottom: insets.bottom + 28 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.cardTitle}>Welcome Back</Text>
            <Text style={s.cardSub}>Sign in to your account to continue</Text>

            {!!error && <Alert type="error" message={error} style={s.alert} />}

            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              leftIcon={theme.icons.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              leftIcon={theme.icons.password}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity style={s.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[s.forgotText, { color: theme.colors.primary[600] }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton title="Sign In" onPress={handleSignIn} loading={loading} disabled={loading} />

            <View style={s.divider}>
              <View style={[s.divLine, { backgroundColor: theme.colors.border.default }]} />
              <Text style={[s.divText, { color: theme.colors.text.hint }]}>OR</Text>
              <View style={[s.divLine, { backgroundColor: theme.colors.border.default }]} />
            </View>

            <GoogleSignInButton
              onSuccess={async (user) => { try { await signIn(user); } catch { setError('Failed to sign in with Google.'); } }}
              onError={(msg) => setError(msg)}
              disabled={loading}
            />

            <View style={s.footer}>
              <Text style={[s.footerText, { color: theme.colors.text.secondary }]}>New to London?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[s.footerLink, { color: theme.colors.primary[700] }]}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#1B5E20' },
  hero:      { alignItems: 'center', paddingBottom: 32 },
  logoBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
  },
  appName:   { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.3, marginBottom: 4 },
  tagline:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: '500', letterSpacing: 1.4 },
  card:      { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  cardContent: { paddingHorizontal: 24, paddingTop: 28 },
  cardTitle: { fontSize: 26, fontWeight: '700', color: '#212121', marginBottom: 4 },
  cardSub:   { fontSize: 14, color: '#757575', marginBottom: 20, lineHeight: 20 },
  alert:     { marginBottom: 12 },
  forgotWrap:  { alignSelf: 'flex-end', marginTop: 4, marginBottom: 16 },
  forgotText:  { fontSize: 14, fontWeight: '600' },
  divider:   { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine:   { flex: 1, height: 1 },
  divText:   { marginHorizontal: 12, fontSize: 12, fontWeight: '600' },
  footer:    { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});

export default SignInScreen;
