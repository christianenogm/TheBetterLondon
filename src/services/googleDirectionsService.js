/**
 * Google Directions Service - TheBetterLondon
 * Integrates with Google Directions API for transit routing
 * 
 * Features:
 * - Transit directions (walking + bus)
 * - Multiple route alternatives
 * - Route parsing and formatting
 * - Transit step details
 */

import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Get transit directions from origin to destination
 * Returns multiple route alternatives
 * 
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @param {string} departureTime - 'now' or Unix timestamp in seconds
 * @returns {Promise<Array>} Array of route objects
 */
export async function getTransitDirections(origin, destination, departureTime = 'now') {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    throw new Error('Origin and destination coordinates are required');
  }

  try {
    const timestamp = departureTime === 'now' 
      ? Math.floor(Date.now() / 1000) 
      : departureTime;

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: 'transit',
          transit_mode: 'bus',
          alternatives: true, // Get up to 3 alternatives
          departure_time: timestamp,
          key: ENV.GOOGLE_DIRECTIONS_API_KEY,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log('Directions API response:', response.data.status);

    if (response.data.status === 'OK') {
      const routes = parseDirectionsResponse(response.data, origin, destination);
      console.log(`Parsed ${routes.length} route(s)`);
      return routes;
    } else if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('No transit routes found. Try a different destination or time.');
    } else if (response.data.status === 'NOT_FOUND') {
      throw new Error('Location not found. Please verify your destination.');
    } else if (response.data.status === 'REQUEST_DENIED') {
      throw new Error('Directions API access denied. Check your API key configuration.');
    } else {
      console.error('Directions API error:', response.data.status, response.data.error_message);
      throw new Error(`Directions API error: ${response.data.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection.');
    }
    if (error.response?.status === 403) {
      throw new Error('API key not authorized. Please check your Google API configuration.');
    }
    console.error('Error getting directions:', error);
    throw error;
  }
}

/**
 * Parse Google Directions API response into our route format
 * 
 * @param {Object} data - Directions API response
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @returns {Array} Array of parsed route objects
 */
function parseDirectionsResponse(data, origin, destination) {
  return data.routes.map((route, index) => {
    const leg = route.legs[0]; // Single origin-destination trip

    return {
      id: `route_${index}_${Date.now()}`,
      summary: route.summary,
      bounds: route.bounds,
      copyrights: route.copyrights,
      origin: {
        lat: origin.lat,
        lng: origin.lng,
        address: leg.start_address,
      },
      destination: {
        lat: destination.lat,
        lng: destination.lng,
        address: leg.end_address,
      },
      overview: {
        totalDuration: leg.duration.value, // seconds
        totalDistance: leg.distance.value, // meters
        walkingDistance: calculateWalkingDistance(leg.steps),
        numberOfTransfers: countTransfers(leg.steps),
        departureTime: leg.departure_time?.value ? new Date(leg.departure_time.value * 1000).toISOString() : null,
        arrivalTime: leg.arrival_time?.value ? new Date(leg.arrival_time.value * 1000).toISOString() : null,
        fare: leg.fare ? {
          value: leg.fare.value,
          currency: leg.fare.currency,
          text: leg.fare.text,
        } : null,
      },
      steps: leg.steps.map((step, stepIndex) => parseStep(step, stepIndex)),
      polyline: route.overview_polyline.points,
    };
  });
}

/**
 * Parse individual step from directions
 * 
 * @param {Object} step - Step from Directions API
 * @param {number} index - Step index
 * @returns {Object} Parsed step object
 */
function parseStep(step, index) {
  const baseStep = {
    id: `step_${index}_${Date.now()}`,
    distance: step.distance.value, // meters
    duration: step.duration.value, // seconds
    startLocation: {
      lat: step.start_location.lat,
      lng: step.start_location.lng,
    },
    endLocation: {
      lat: step.end_location.lat,
      lng: step.end_location.lng,
    },
    polyline: decodePolyline(step.polyline.points), // Decode polyline string to coordinates
    htmlInstructions: step.html_instructions,
    instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML tags
  };

  // Walking step
  if (step.travel_mode === 'WALKING') {
    return {
      ...baseStep,
      type: 'walk',
      maneuver: step.maneuver || 'continue',
    };
  }

  // Transit step (bus)
  if (step.travel_mode === 'TRANSIT' && step.transit_details) {
    const transit = step.transit_details;
    
    return {
      ...baseStep,
      type: 'transit',
      transitMode: transit.line.vehicle.type, // BUS, RAIL, etc.
      line: {
        name: transit.line.name,
        shortName: transit.line.short_name,
        color: transit.line.color ? `#${transit.line.color}` : '#000000',
        textColor: transit.line.text_color ? `#${transit.line.text_color}` : '#FFFFFF',
        agency: transit.line.agencies?.[0]?.name || 'Transit',
        vehicleType: transit.line.vehicle.name,
        vehicleIcon: transit.line.vehicle.icon,
      },
      departureStop: {
        id: transit.departure_stop.place_id || null, // May not match GTFS IDs
        name: transit.departure_stop.name,
        location: {
          lat: transit.departure_stop.location.lat,
          lng: transit.departure_stop.location.lng,
        },
      },
      arrivalStop: {
        id: transit.arrival_stop.place_id || null, // May not match GTFS IDs
        name: transit.arrival_stop.name,
        location: {
          lat: transit.arrival_stop.location.lat,
          lng: transit.arrival_stop.location.lng,
        },
      },
      headsign: transit.headsign,
      numberOfStops: transit.num_stops,
      departureTime: transit.departure_time?.value 
        ? new Date(transit.departure_time.value * 1000).toISOString()
        : null,
      arrivalTime: transit.arrival_time?.value 
        ? new Date(transit.arrival_time.value * 1000).toISOString()
        : null,
    };
  }

  // Fallback for other modes
  return {
    ...baseStep,
    type: step.travel_mode.toLowerCase(),
  };
}

/**
 * Calculate total walking distance in a route
 * 
 * @param {Array} steps - Array of steps
 * @returns {number} Total walking distance in meters
 */
function calculateWalkingDistance(steps) {
  return steps
    .filter(step => step.travel_mode === 'WALKING')
    .reduce((sum, step) => sum + step.distance.value, 0);
}

/**
 * Count number of transfers (transit changes)
 * 
 * @param {Array} steps - Array of steps
 * @returns {number} Number of transfers
 */
function countTransfers(steps) {
  const transitSteps = steps.filter(step => step.travel_mode === 'TRANSIT');
  return Math.max(0, transitSteps.length - 1);
}

/**
 * Decode polyline string to array of coordinates
 * Uses Google's polyline encoding algorithm
 * 
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of {lat, lng} objects
 */
export function decodePolyline(encoded) {
  if (!encoded) return [];

  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
}

/**
 * Sort routes by different criteria
 * 
 * @param {Array} routes - Array of route objects
 * @param {string} sortBy - 'fastest' | 'least_walking' | 'fewest_transfers'
 * @returns {Array} Sorted routes
 */
export function sortRoutes(routes, sortBy = 'fastest') {
  const sorted = [...routes];

  switch (sortBy) {
    case 'fastest':
      return sorted.sort((a, b) => 
        a.overview.totalDuration - b.overview.totalDuration
      );
    
    case 'least_walking':
      return sorted.sort((a, b) => 
        a.overview.walkingDistance - b.overview.walkingDistance
      );
    
    case 'fewest_transfers':
      return sorted.sort((a, b) => 
        a.overview.numberOfTransfers - b.overview.numberOfTransfers
      );
    
    default:
      return sorted;
  }
}

/**
 * Format duration from seconds to human-readable string
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "32 min", "1h 15min")
 */
export function formatDuration(seconds) {
  if (!seconds) return '0 min';
  
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format distance from meters to human-readable string
 * 
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., "0.8 km", "350 m")
 */
export function formatDistance(meters) {
  if (!meters) return '0 m';
  
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Format time from ISO string to human-readable
 * 
 * @param {string} isoString - ISO 8601 time string
 * @returns {string} Formatted time (e.g., "3:45 PM")
 */
export function formatTime(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if Google Directions API is configured
 * 
 * @returns {boolean}
 */
export function isDirectionsApiConfigured() {
  return !!ENV.GOOGLE_DIRECTIONS_API_KEY;
}
