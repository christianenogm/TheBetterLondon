/**
 * EditProfileScreen.js
 * US-1401: Edit My Profile Information
 *
 * - Update profile photo (camera or gallery → Firebase Storage)
 * - Change display name (uniqueness-checked, reflected on all reports)
 * - Change password (email/password accounts only, requires re-auth)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { updateDisplayName, updateProfilePhoto } from '../services/userService';
import { changePassword } from '../services/authService';
import { generateUniqueDisplayName } from '../utils/displayNameUtils';
import {
  ScreenContainer,
  TextInput,
  PrimaryButton,
  SecondaryButton,
} from '../components';

// ─── Inline status banner ────────────────────────────────────────────────────
const Banner = ({ type, text, theme }) => {
  const isError = type === 'error';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      borderRadius: 8, borderWidth: 1,
      paddingHorizontal: 12, paddingVertical: 8, marginTop: 8,
      backgroundColor: isError ? (theme.colors.error?.[50]  ?? '#FFEBEE') : '#E8F5E9',
      borderColor:      isError ? (theme.colors.error?.[200] ?? '#EF9A9A') : '#A5D6A7',
    }}>
      <Icon
        name={isError ? 'alert-circle-outline' : 'check-circle-outline'}
        size={16}
        color={isError ? (theme.colors.error?.[500] ?? '#F44336') : '#2E7D32'}
      />
      <Text style={{ flex: 1, fontSize: 13, color: isError ? (theme.colors.error?.[600] ?? '#C62828') : '#2E7D32' }}>
        {text}
      </Text>
    </View>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();

  const isEmailUser = auth.currentUser?.providerData?.some(p => p.providerId === 'password') ?? false;

  // Photo
  const [photoURL, setPhotoURL]           = useState(user?.photoURL ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Display name
  const [displayName, setDisplayName]   = useState(user?.name ?? '');
  const [savingName, setSavingName]     = useState(false);
  const [generatingName, setGenerating] = useState(false);
  const [nameError, setNameError]       = useState('');
  const [nameSuccess, setNameSuccess]   = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword]   = useState(false);
  const [passwordError, setPasswordError]     = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ─── Photo handlers ───────────────────────────────────────────────────────
  const handlePhotoPress = () => {
    Alert.alert('Update Profile Photo', 'Choose an option', [
      { text: 'Take Photo',           onPress: pickFromCamera  },
      { text: 'Choose from Gallery',  onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Camera permission is needed.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) await uploadPhoto(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Gallery permission is needed.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) await uploadPhoto(result.assets[0].uri);
  };

  const uploadPhoto = async (uri) => {
    setPhotoUploading(true);
    const result = await updateProfilePhoto(user.uid ?? user.id, uri);
    setPhotoUploading(false);
    if (result.success) {
      setPhotoURL(result.photoURL);
      updateUser({ photoURL: result.photoURL });
    } else {
      Alert.alert('Error', result.error || 'Failed to update photo.');
    }
  };

  // ─── Display name handlers ────────────────────────────────────────────────
  const handleSaveName = async () => {
    setNameError(''); setNameSuccess(false);
    if (!displayName.trim()) { setNameError('Please enter a display name.'); return; }
    setSavingName(true);
    const result = await updateDisplayName(user.uid ?? user.id, displayName.trim());
    setSavingName(false);
    if (result.success) {
      updateUser({ name: displayName.trim() });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } else {
      setNameError(result.error);
    }
  };

  const handleRandomize = async () => {
    setGenerating(true); setNameError(''); setNameSuccess(false);
    const name = await generateUniqueDisplayName();
    setDisplayName(name);
    setGenerating(false);
  };

  // ─── Password handlers ────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess(false);
    if (!currentPassword) { setPasswordError('Please enter your current password.'); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (newPassword === currentPassword) { setPasswordError('New password must be different from the current one.'); return; }

    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (result.success) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(result.error);
    }
  };

  const s = makeStyles(theme);

  return (
    <ScreenContainer scrollable>
      <View style={s.container}>

        {/* ── Avatar ── */}
        <TouchableOpacity onPress={handlePhotoPress} activeOpacity={0.8} style={s.avatarWrap}>
          {photoUploading ? (
            <View style={[s.avatar, { backgroundColor: theme.colors.primary[100] }]}>
              <ActivityIndicator color={theme.colors.primary[500]} />
            </View>
          ) : photoURL ? (
            <Image source={{ uri: photoURL }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, { backgroundColor: theme.colors.primary[100] }]}>
              <Icon name="account" size={48} color={theme.colors.primary[500]} />
            </View>
          )}
          <View style={[s.cameraOverlay, { backgroundColor: theme.colors.primary[500] }]}>
            <Icon name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={[s.avatarHint, { color: theme.colors.text.secondary }]}>Tap to change photo</Text>

        {/* ── Display Name ── */}
        <View style={[s.section, { borderColor: theme.colors.border.default, backgroundColor: theme.colors.neutral[0] }]}>
          <Text style={[s.sectionTitle, { color: theme.colors.text.primary }]}>Username</Text>
          <Text style={[s.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            Your username appears on reports and the leaderboard.
          </Text>

          <View style={s.inputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Display Name"
                placeholder="e.g. FierceEagle4829"
                value={displayName}
                onChangeText={val => { setDisplayName(val); setNameError(''); setNameSuccess(false); }}
                leftIcon="account"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                editable={!savingName && !generatingName}
              />
            </View>
            <TouchableOpacity
              style={[s.diceButton, { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[200] }]}
              onPress={handleRandomize}
              disabled={generatingName || savingName}
              activeOpacity={0.7}
            >
              <Icon name={generatingName ? 'loading' : 'dice-5'} size={22} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {!!nameError   && <Banner type="error"   text={nameError}                       theme={theme} />}
          {nameSuccess   && <Banner type="success" text="Username updated successfully!"  theme={theme} />}

          <PrimaryButton
            title="Save Username"
            onPress={handleSaveName}
            loading={savingName}
            disabled={savingName || generatingName}
            style={{ marginTop: theme.spacing[3] }}
          />
        </View>

        {/* ── Change Password (email/password accounts only) ── */}
        {isEmailUser && (
          <View style={[s.section, { borderColor: theme.colors.border.default, backgroundColor: theme.colors.neutral[0] }]}>
            <Text style={[s.sectionTitle, { color: theme.colors.text.primary }]}>Change Password</Text>
            <Text style={[s.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              You'll need to enter your current password to confirm the change.
            </Text>

            <TextInput
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={val => { setCurrentPassword(val); setPasswordError(''); setPasswordSuccess(false); }}
              leftIcon="lock-outline"
              secureTextEntry
              autoCapitalize="none"
              editable={!savingPassword}
              style={{ marginBottom: theme.spacing[2] }}
            />
            <TextInput
              label="New Password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChangeText={val => { setNewPassword(val); setPasswordError(''); setPasswordSuccess(false); }}
              leftIcon="lock"
              secureTextEntry
              autoCapitalize="none"
              editable={!savingPassword}
              style={{ marginBottom: theme.spacing[2] }}
            />
            <TextInput
              label="Confirm New Password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChangeText={val => { setConfirmPassword(val); setPasswordError(''); setPasswordSuccess(false); }}
              leftIcon="lock-check"
              secureTextEntry
              autoCapitalize="none"
              editable={!savingPassword}
            />

            {!!passwordError  && <Banner type="error"   text={passwordError}                      theme={theme} />}
            {passwordSuccess  && <Banner type="success" text="Password updated successfully!"     theme={theme} />}

            <PrimaryButton
              title="Update Password"
              onPress={handleChangePassword}
              loading={savingPassword}
              disabled={savingPassword}
              style={{ marginTop: theme.spacing[3] }}
            />
          </View>
        )}

        <SecondaryButton
          title="Back to Profile"
          onPress={() => navigation.goBack()}
          style={{ marginTop: theme.spacing[2], marginBottom: theme.spacing[6] }}
        />

      </View>
    </ScreenContainer>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[6],
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: theme.spacing[1],
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 26, height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarHint: {
    fontSize: 12,
    marginBottom: theme.spacing[5],
  },
  section: {
    width: '100%',
    borderWidth: 1,
    borderRadius: theme.borderRadius?.md ?? 12,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing[3],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  diceButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});

export default EditProfileScreen;
