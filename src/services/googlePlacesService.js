/**
 * Google Places Service - TheBetterLondon
 * Integrates with Google Places API for destination search
 * 
 * Features:
 * - Autocomplete search within London, ON bounds
 * - Place details retrieval
 * - Recent searches caching
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// London, Ontario boundaries
const LONDON_ON_BOUNDS = {
  north: 43.0710,
  south: 42.8234,
  east: -81.0313,
  west: -81.4323,
};

const LONDON_CENTER = {
  lat: 42.9849,
  lng: -81.2453,
};

const RECENT_SEARCHES_KEY = '@recent_destination_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Search for places using Google Places Autocomplete API
 * Filters results to London, ON area only
 * 
 * @param {string} query - Search query from user
 * @returns {Promise<Array>} Array of place predictions
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: query.trim(),
          location: `${LONDON_CENTER.lat},${LONDON_CENTER.lng}`,
          radius: 30000, // 30km radius
          strictbounds: false, // Allow some flexibility
          components: 'country:ca', // Restrict to Canada
          key: ENV.GOOGLE_PLACES_API_KEY,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    if (response.data.status === 'OK') {
      // Filter results to ensure they're in London area
      const filtered = response.data.predictions.filter(place => {
        const description = place.description.toLowerCase();
        return (
          description.includes('london') &&
          description.includes('on') &&
          !description.includes('london, uk') &&
          !description.includes('east london')
        );
      });

      // Map to our format
      return filtered.map(place => ({
        placeId: place.place_id,
        name: place.structured_formatting.main_text,
        address: place.structured_formatting.secondary_text || place.description,
        description: place.description,
        types: place.types,
      }));
    } else if (response.data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.error('Places API error:', response.data.status, response.data.error_message);
      throw new Error(`Places API: ${response.data.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Search request timed out. Please check your connection.');
    }
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific place
 * 
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details including coordinates
 */
export async function getPlaceDetails(placeId) {
  if (!placeId) {
    throw new Error('Place ID is required');
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,types,place_id,address_components',
          key: ENV.GOOGLE_PLACES_API_KEY,
        },
        timeout: 5000,
      }
    );

    if (response.data.status === 'OK') {
      const result = response.data.result;
      
      // Verify location is within London bounds
      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;
      
      if (
        lat < LONDON_ON_BOUNDS.south ||
        lat > LONDON_ON_BOUNDS.north ||
        lng < LONDON_ON_BOUNDS.west ||
        lng > LONDON_ON_BOUNDS.east
      ) {
        throw new Error('Selected location is outside London, ON area');
      }

      return {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        types: result.types,
      };
    } else {
      console.error('Place details error:', response.data.status);
      throw new Error(`Failed to get place details: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}

/**
 * Save a search to recent searches
 * 
 * @param {Object} place - Place object to save
 */
export async function saveRecentSearch(place) {
  try {
    const recent = await getRecentSearches();
    
    // Remove duplicates (same place ID)
    const filtered = recent.filter(p => p.placeId !== place.placeId);
    
    // Add to beginning
    const updated = [
      {
        ...place,
        searchedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES); // Keep only last 10

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Get recent searches from storage
 * 
 * @returns {Promise<Array>} Array of recent place searches
 */
export async function getRecentSearches() {
  try {
    const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recent searches:', error);
    return [];
  }
}

/**
 * Clear all recent searches
 */
export async function clearRecentSearches() {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}

/**
 * Calculate distance from user to place (Haversine formula)
 * 
 * @param {Object} from - { lat, lng }
 * @param {Object} to - { lat, lng }
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(from, to) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if Google Places API is configured
 * 
 * @returns {boolean}
 */
export function isPlacesApiConfigured() {
  return !!ENV.GOOGLE_PLACES_API_KEY;
}
