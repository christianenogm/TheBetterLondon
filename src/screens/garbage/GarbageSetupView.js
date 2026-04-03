/**
 * GarbageSetupView.js
 * US-1101: Find My Garbage Schedule
 *
 * Shown when the user has no saved address.
 * Lets them search an address or use current location to find their zone.
 * The map is hidden behind a button to avoid Google Maps API usage on every load.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  searchPlaces,
  resolveZoneFromPlace,
  resolveZoneFromCoords,
  saveAddress,
} from '../../services/garbageZoneService';

let searchTimeout = null;

const GarbageSetupView = ({ onAddressConfirmed }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(null);

  // ── Address search ──────────────────────────────────────────────────────────
  const handleQueryChange = useCallback((text) => {
    setQuery(text);
    setError(null);
    clearTimeout(searchTimeout);
    if (text.trim().length < 3) { setResults([]); return; }
    searchTimeout = setTimeout(async () => {
      setSearching(true);
      try {
        const places = await searchPlaces(text);
        setResults(places);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const handleSelectPlace = useCallback(async (place) => {
    setResults([]);
    setQuery(place.address || place.name);
    setResolving(true);
    setError(null);
    try {
      const resolved = await resolveZoneFromPlace(place);
      await saveAddress(resolved);
      onAddressConfirmed(resolved);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  }, [onAddressConfirmed]);

  // ── Use current location ────────────────────────────────────────────────────
  const handleUseLocation = useCallback(async () => {
    setError(null);
    setResolving(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied. Please enter your address manually.');
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      // Reverse-geocode for a display address
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const displayAddress = [
        geo?.streetNumber, geo?.street, geo?.city, geo?.region,
      ].filter(Boolean).join(' ');

      const { zone, zoneDocId } = resolveZoneFromCoords(latitude, longitude);
      const resolved = {
        zone,
        zoneDocId,
        address: displayAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        location: { lat: latitude, lng: longitude },
      };
      await saveAddress(resolved);
      onAddressConfirmed(resolved);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  }, [onAddressConfirmed]);

  const s = makeStyles(theme, insets);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={s.header}>
        <Icon name="trash-can-outline" size={40} color={theme.colors.primary[500]} />
        <Text style={s.title}>Find Your Garbage Schedule</Text>
        <Text style={s.subtitle}>
          Enter your London, ON address to see your collection calendar.
        </Text>
      </View>

      {/* Search Input */}
      <View style={s.searchRow}>
        <View style={s.inputWrap}>
          <Icon name="magnify" size={20} color={theme.colors.neutral[400]} style={s.searchIcon} />
          <TextInput
            style={s.input}
            placeholder="Search your address..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searching && (
            <ActivityIndicator size="small" color={theme.colors.primary[500]} style={{ marginRight: 8 }} />
          )}
          {query.length > 0 && !searching && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close-circle" size={18} color={theme.colors.neutral[400]} style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Autocomplete results */}
      {results.length > 0 && (
        <View style={s.resultsCard}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={s.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.resultRow} onPress={() => handleSelectPlace(item)}>
                <Icon name="map-marker-outline" size={18} color={theme.colors.neutral[500]} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.resultAddress} numberOfLines={1}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={s.errorBanner}>
          <Icon name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={[s.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Resolving overlay */}
      {resolving && (
        <View style={s.resolvingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
          <Text style={s.resolvingText}>Finding your zone…</Text>
        </View>
      )}

      {/* Divider */}
      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerLabel}>or</Text>
        <View style={s.dividerLine} />
      </View>

      {/* Use my location */}
      <TouchableOpacity style={s.locationBtn} onPress={handleUseLocation} disabled={resolving}>
        <Icon name="crosshairs-gps" size={20} color={theme.colors.primary[600]} />
        <Text style={[s.locationBtnText, { color: theme.colors.primary[600] }]}>
          Use My Current Location
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: insets.bottom + 16,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
      gap: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginTop: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    searchRow: {
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral[0],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      height: 48,
    },
    searchIcon: {
      marginLeft: 12,
      marginRight: 6,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text.primary,
      height: '100%',
    },
    resultsCard: {
      backgroundColor: theme.colors.neutral[0],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      marginBottom: 8,
      maxHeight: 240,
      overflow: 'hidden',
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    resultName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    resultAddress: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border.subtle,
      marginHorizontal: 14,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    errorText: {
      fontSize: 13,
      flex: 1,
    },
    resolvingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    resolvingText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border.default,
    },
    dividerLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    locationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.primary[400],
      backgroundColor: theme.colors.primary[50],
    },
    locationBtnText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default GarbageSetupView;
