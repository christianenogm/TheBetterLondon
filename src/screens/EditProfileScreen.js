/**
 * EditProfileScreen.js
 * US-1401: Edit My Profile Information
 *
 * Allows users to change their display name (username).
 * The change is reflected on all previously submitted reports.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { updateDisplayName } from '../services/userService';
import { generateUniqueDisplayName } from '../utils/displayNameUtils';
import {
  ScreenContainer,
  TextInput,
  PrimaryButton,
  SecondaryButton,
} from '../components';

const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [saving, setSaving]           = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }

    setSaving(true);
    const result = await updateDisplayName(user.uid ?? user.id, displayName.trim());
    setSaving(false);

    if (result.success) {
      updateUser({ name: displayName.trim() });
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1200);
    } else {
      setError(result.error);
    }
  };

  const handleRandomize = async () => {
    setGenerating(true);
    setError('');
    setSuccess(false);
    const name = await generateUniqueDisplayName();
    setDisplayName(name);
    setGenerating(false);
  };

  const s = makeStyles(theme);

  return (
    <ScreenContainer scrollable>
      <View style={s.container}>

        {/* Avatar placeholder */}
        <View style={[s.avatar, { backgroundColor: theme.colors.primary[100] }]}>
          <Icon name="account-edit" size={48} color={theme.colors.primary[500]} />
        </View>

        <Text style={[s.label, { color: theme.colors.text.secondary }]}>
          Your username is how you appear on reports and the leaderboard.
        </Text>

        {/* Display name input */}
        <View style={s.inputRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Display Name"
              placeholder="e.g. FierceEagle4829"
              value={displayName}
              onChangeText={val => { setDisplayName(val); setError(''); setSuccess(false); }}
              leftIcon="account"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={30}
              editable={!saving && !generating}
            />
          </View>
          <TouchableOpacity
            style={[s.diceButton, { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[200] }]}
            onPress={handleRandomize}
            disabled={generating || saving}
            activeOpacity={0.7}
          >
            <Icon
              name={generating ? 'loading' : 'dice-5'}
              size={22}
              color={theme.colors.primary[500]}
            />
          </TouchableOpacity>
        </View>

        <Text style={[s.hint, { color: theme.colors.text.secondary }]}>
          Tap the dice to generate a new random username. Max 30 characters.
        </Text>

        {!!error && (
          <View style={[s.banner, s.errorBanner, { backgroundColor: theme.colors.error[50], borderColor: theme.colors.error[200] }]}>
            <Icon name="alert-circle-outline" size={16} color={theme.colors.error[500]} />
            <Text style={[s.bannerText, { color: theme.colors.error[600] }]}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={[s.banner, s.successBanner, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
            <Icon name="check-circle-outline" size={16} color="#2E7D32" />
            <Text style={[s.bannerText, { color: '#2E7D32' }]}>Username updated successfully!</Text>
          </View>
        )}

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          disabled={saving || generating}
          style={{ marginTop: theme.spacing[4] }}
        />

        <SecondaryButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          disabled={saving}
          style={{ marginTop: theme.spacing[2] }}
        />

        {/* Info note */}
        <View style={[s.infoCard, { backgroundColor: theme.colors.neutral[100], borderColor: theme.colors.border.default }]}>
          <Icon name="information-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={[s.infoText, { color: theme.colors.text.secondary }]}>
            Changing your username will update it across all your previously submitted reports.
          </Text>
        </View>

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
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    width: '100%',
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
  hint: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: theme.spacing[3],
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: theme.spacing[2],
  },
  bannerText: { fontSize: 13, flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: theme.spacing[5],
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
});

export default EditProfileScreen;
