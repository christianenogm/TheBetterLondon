/**
 * Transit Service - TheBetterLondon
 * Real-time London Transit data from Backend API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStopDetails, getRouteDetails } from './gtfsStaticService';
import { ENV } from '../config/env';

const TRANSIT_STORAGE_KEY = '@TheBetterLondon:transit';

// Cache for data
let stopsCache = new Map();
let routesCache = new Map();
let vehiclesCache = [];
let lastVehicleUpdate = 0;



/**
 * Extract routes from vehicle positions
 */
const extractRoutes = (vehicles) => {
  const routesMap = new Map();
  
  vehicles.forEach(vehicle => {
    const routeId = vehicle.routeId;
    if (routeId && !routesMap.has(routeId)) {
      routesMap.set(routeId, {
        id: routeId,
        name: `Route ${routeId}`,
        color: vehicle.color || getRouteColor(routeId),
      });
    }
  });
  
  return Array.from(routesMap.values());
};

/**
 * Get color for route - use official color from GTFS or fallback to hash-based
 */
const getRouteColor = (routeId) => {
  const routeDetails = getRouteDetails(routeId);
  if (routeDetails?.color) {
    return routeDetails.color;
  }
  
  // Fallback to hash-based coloring
  const colors = [
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', 
    '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
    '#C0392B', '#16A085', '#27AE60', '#2980B9',
  ];
  const hash = routeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Get all bus stops from static GTFS data
 * Note: Real-time vehicle positions come from separate Firestore subscription
 */
export const getAllBusStops = async () => {
  try {
    // Return cached if available
    if (stopsCache.size > 0) {
      return Array.from(stopsCache.values());
    }
    
    // Load all static GTFS stops
    const { loadStopsData } = require('./gtfsStaticService');
    const allStaticStops = loadStopsData();
    
    const newStopsMap = new Map();
    
    // Add all static stops
    allStaticStops.forEach(staticStop => {
      newStopsMap.set(staticStop.id, {
        id: staticStop.id,
        code: staticStop.code,
        name: staticStop.name,
        latitude: staticStop.latitude,
        longitude: staticStop.longitude,
        routes: staticStop.routes || [],
        wheelchairAccessible: staticStop.wheelchairBoarding === '1',
      });
    });
    
    // Update cache
    stopsCache = newStopsMap;
    
    return Array.from(newStopsMap.values()).filter(stop => stop.latitude && stop.longitude);
  } catch (error) {
    console.error('Error loading bus stops:', error);
    // Return cached data if available
    if (stopsCache.size > 0) {
      return Array.from(stopsCache.values());
    }
    return [];
  }
};

/**
 * Get nearby bus stops
 */
export const getNearbyBusStops = async (userLat, userLng, radiusKm = 2) => {
  try {
    const stops = await getAllBusStops();
    
    // Calculate distance and filter
    const stopsWithDistance = stops.map(stop => {
      const distance = calculateDistance(userLat, userLng, stop.latitude, stop.longitude);
      return { ...stop, distance };
    });
    
    return stopsWithDistance
      .filter(stop => stop.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    return [];
  }
};

/**
 * Search bus stops and routes
 */
export const searchTransit = async (query) => {
  try {
    const [stops, routes] = await Promise.all([
      getAllBusStops(),
      getAllBusRoutes(),
    ]);
    
    const lowerQuery = query.toLowerCase();
    
    const matchingStops = stops.filter(stop =>
      stop.name.toLowerCase().includes(lowerQuery) ||
      stop.code.toLowerCase().includes(lowerQuery) ||
      stop.id.toLowerCase().includes(lowerQuery) ||
      stop.routes.some(route => route.toLowerCase().includes(lowerQuery))
    );
    
    const matchingRoutes = routes.filter(route =>
      route.id.toLowerCase().includes(lowerQuery) ||
      route.name.toLowerCase().includes(lowerQuery)
    );
    
    return { stops: matchingStops, routes: matchingRoutes };
  } catch (error) {
    console.error('Error searching transit:', error);
    return { stops: [], routes: [] };
  }
};

/**
 * Get bus stop by ID
 */
export const getBusStopById = async (stopId) => {
  try {
    const stops = await getAllBusStops();
    return stops.find(stop => stop.id === stopId) || null;
  } catch (error) {
    console.error('Error fetching bus stop:', error);
    return null;
  }
};

/**
 * Get all bus routes from cached vehicle data or static GTFS
 */
export const getAllBusRoutes = async () => {
  try {
    // Return cached routes if available
    if (routesCache.size > 0) {
      return Array.from(routesCache.values());
    }
    
    // Load from static GTFS data
    const { loadRoutesData } = require('./gtfsStaticService');
    const routes = loadRoutesData();
    routesCache = new Map(routes.map(r => [r.id, r]));
    
    return routes;
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
};

/**
 * Fetch vehicle positions from backend API
 * @param {Array} routeIds - Optional array of route IDs to filter
 * @returns {Promise<Array>} Array of vehicles
 */
export const fetchVehiclePositions = async (routeIds = null) => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/api/vehicles`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    const vehicles = data.vehicles || [];
    
    // Filter by routeIds if provided
    const filteredVehicles = routeIds && routeIds.length > 0
      ? vehicles.filter(v => routeIds.includes(v.routeId))
      : vehicles;
    
    // Update cache
    vehiclesCache = filteredVehicles;
    lastVehicleUpdate = Date.now();
    
    // Update routes cache
    const routes = extractRoutes(filteredVehicles);
    routesCache = new Map(routes.map(r => [r.id, r]));
    
    return filteredVehicles;
  } catch (error) {
    console.error('Error fetching vehicles from backend:', error);
    // Return cached data if available
    return vehiclesCache;
  }
};

/**
 * Get cached vehicle positions (for backward compatibility)
 */
export const getVehiclePositions = async (routeId = null) => {
  // Fetch fresh data
  const vehicles = await fetchVehiclePositions();
  
  if (routeId) {
    return vehicles.filter(v => v.routeId === routeId);
  }
  return vehicles;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Fetch upcoming arrivals for a specific stop from backend API
 * @param {string} stopId - Stop ID
 * @returns {Promise<Array>} Array of arrivals
 */
export const fetchStopArrivals = async (stopId) => {
  try {
    console.log(`Fetching arrivals for stop: ${stopId}`);
    const response = await fetch(`${ENV.BACKEND_API_URL}/api/arrivals/${stopId}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    const arrivals = data.arrivals || [];
    
    console.log(`Received ${arrivals.length} arrivals for stop ${stopId}`);
    return arrivals;
  } catch (error) {
    console.error('Error fetching stop arrivals from backend:', error);
    return [];
  }
};

/**
 * Get stop arrivals (alias for fetchStopArrivals)
 */
export const getStopArrivals = async (stopId) => {
  return fetchStopArrivals(stopId);
};

/**
 * Trigger manual refresh of vehicle positions from backend
 */
export const refreshVehicles = async () => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/update/vehicles`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Backend refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Vehicle refresh triggered:', data);
    return data;
  } catch (error) {
    console.error('Error triggering vehicle refresh:', error);
    throw error;
  }
};

/**
 * Trigger manual refresh of stop arrivals from backend
 */
export const refreshArrivals = async () => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/update/arrivals`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Backend refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Arrivals refresh triggered:', data);
    return data;
  } catch (error) {
    console.error('Error triggering arrivals refresh:', error);
    throw error;
  }
};

/**
 * Trigger manual refresh of all transit data
 */
export const refreshAllTransitData = async () => {
  try {
    await Promise.all([
      refreshVehicles(),
      refreshArrivals(),
    ]);
    console.log('All transit data refresh triggered');
  } catch (error) {
    console.error('Error refreshing transit data:', error);
    throw error;
  }
};

/**
 * Cleanup all subscriptions
 */
export const cleanupSubscriptions = () => {
  if (vehicleUnsubscribe) {
    vehicleUnsubscribe();
    vehicleUnsubscribe = null;
  }
  
  stopArrivalUnsubscribes.forEach(unsubscribe => unsubscribe());
  stopArrivalUnsubscribes.clear();
};

export default {
  getAllBusStops,
  getNearbyBusStops,
  searchTransit,
  getBusStopById,
  getAllBusRoutes,
  getVehiclePositions,
  fetchVehiclePositions,
  getStopArrivals,
  fetchStopArrivals,
  refreshVehicles,
  refreshArrivals,
  refreshAllTransitData,
};
