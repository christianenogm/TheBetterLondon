/**
 * DestinationSearch Component - TheBetterLondon
 * Search input with Google Places autocomplete for navigation
 * 
 * Features:
 * - Real-time search suggestions
 * - Recent searches display
 * - Distance calculation from user location
 * - Integration with navigation flow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import {
  searchPlaces,
  getPlaceDetails,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  calculateDistance,
  isPlacesApiConfigured,
} from '../services/googlePlacesService';

const DestinationSearch = ({ 
  userLocation, 
  onDestinationSelect, 
  onClose,
  placeholder = 'Where to?',
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecent, setShowRecent] = useState(true);
  const searchTimeoutRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // Debounced search
  const handleSearch = useCallback((text) => {
    setQuery(text);
    setError(null);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 2) {
      setResults([]);
      setShowRecent(true);
      return;
    }

    setShowRecent(false);
    setLoading(true);

    // Debounce by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        if (!isPlacesApiConfigured()) {
          setError('Navigation feature requires Google Places API key');
          setLoading(false);
          return;
        }

        const places = await searchPlaces(text);
        setResults(places);
      } catch (error) {
        console.error('Search error:', error);
        setError(error.message || 'Failed to search. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Handle place selection
  const handleSelectPlace = async (place) => {
    try {
      setLoading(true);
      setError(null);

      // Check if place already has full details (from recent searches)
      let details;
      if (place.location && place.location.lat && place.location.lng) {
        // Place already has coordinates (recent search or full details)
        details = place;
      } else {
        // Need to fetch full details (search result without coordinates)
        details = await getPlaceDetails(place.placeId);
      }

      // Save to recent searches (only if it's a new search)
      if (!place.searchedAt) {
        await saveRecentSearch(details);
        // Update recent searches list
        await loadRecentSearches();
      }

      // Close keyboard
      Keyboard.dismiss();

      // Notify parent component
      if (onDestinationSelect) {
        onDestinationSelect(details);
      }
    } catch (error) {
      console.error('Error selecting place:', error);
      setError(error.message || 'Failed to select location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowRecent(true);
    setError(null);
  };

  // Clear all recent searches
  const handleClearRecent = async () => {
    try {
      await clearRecentSearches();
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  // Render search result item
  const renderResultItem = ({ item }) => {
    const distance = userLocation
      ? calculateDistance(
          { lat: userLocation.latitude, lng: userLocation.longitude },
          item.location || { lat: 0, lng: 0 }
        )
      : null;

    const icon = item.types?.includes('school')
      ? 'school'
      : item.types?.includes('restaurant')
      ? 'silverware-fork-knife'
      : item.types?.includes('store') || item.types?.includes('shopping_mall')
      ? 'store'
      : item.types?.includes('park')
      ? 'pine-tree'
      : item.types?.includes('hospital')
      ? 'hospital-box'
      : 'map-marker';

    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
        onPress={() => handleSelectPlace(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        </View>
        
        <View style={styles.resultContent}>
          <Text style={[styles.resultName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.resultAddress, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {distance !== null && item.location && (
          <Text style={[styles.resultDistance, { color: theme.colors.textSecondary }]}>
            {distance} km
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render recent search item
  const renderRecentItem = ({ item }) => {
    const distance = userLocation
      ? calculateDistance(
          { lat: userLocation.latitude, lng: userLocation.longitude },
          item.location
        )
      : null;

    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
        onPress={() => handleSelectPlace(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.textSecondary} />
        </View>
        
        <View style={styles.resultContent}>
          <Text style={[styles.resultName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.resultAddress, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {distance !== null && (
          <Text style={[styles.resultDistance, { color: theme.colors.textSecondary }]}>
            {distance} km
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const displayData = showRecent ? recentSearches : results;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Search Input */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color={theme.colors.textSecondary} 
          style={styles.searchIcon}
        />
        
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
          autoCapitalize="words"
          autoCorrect={false}
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Searching...
          </Text>
        </View>
      )}

      {/* Results List */}
      {!loading && (
        <>
          {showRecent && recentSearches.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Recent Searches
              </Text>
              <TouchableOpacity onPress={handleClearRecent}>
                <Text style={[styles.clearRecentText, { color: theme.colors.primary }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!showRecent && results.length === 0 && query.length >= 2 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="map-marker-off" 
                size={48} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No locations found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Try searching for a different location in London, ON
              </Text>
            </View>
          )}

          {displayData.length > 0 && (
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.placeId}
              renderItem={showRecent ? renderRecentItem : renderResultItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}

          {showRecent && recentSearches.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="map-search" 
                size={48} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Search for a destination
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Find places in London, Ontario to get directions
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButton: {
    marginLeft: 12,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  clearRecentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 14,
  },
  resultDistance: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DestinationSearch;
