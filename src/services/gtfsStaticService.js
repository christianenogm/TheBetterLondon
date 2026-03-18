/**
 * GTFS Static Service - TheBetterLondon
 * Handles static GTFS data (stops, routes, schedules)
 * This complements the real-time data with detailed information
 */

// Import local GTFS JSON data
import stopsJSON from '../gtfs/stops.json';
import routesJSON from '../gtfs/routes.json';

// In-memory cache
let stopsData = new Map();
let routesData = new Map();
let isInitialized = false;

/**
 * Initialize GTFS static data
 */
const initializeGTFS = () => {
  if (isInitialized) return;
  
  try {
    // Load stops
    stopsJSON.forEach(stop => {
      stopsData.set(stop.id, stop);
    });
    
    // Load routes
    routesJSON.forEach(route => {
      routesData.set(route.id, route);
    });
    
    isInitialized = true;
    console.log(`GTFS Static loaded: ${stopsData.size} stops, ${routesData.size} routes`);
  } catch (error) {
    console.error('Error initializing GTFS static data:', error);
  }
};

/**
 * Load stops from static GTFS
 */
export const loadStopsData = () => {
  initializeGTFS();
  return Array.from(stopsData.values());
};

/**
 * Load routes from static GTFS
 */
export const loadRoutesData = () => {
  initializeGTFS();
  return Array.from(routesData.values());
};

/**
 * Get stop details by ID
 */
export const getStopDetails = (stopId) => {
  initializeGTFS();
  return stopsData.get(stopId) || null;
};

/**
 * Get route details by ID
 */
export const getRouteDetails = (routeId) => {
  initializeGTFS();
  return routesData.get(routeId) || null;
};

/**
 * Helper: Check wheelchair boarding accessibility
 * 0 or empty = no information
 * 1 = accessible
 * 2 = not accessible
 */
export const isWheelchairAccessible = (wheelchairBoarding) => {
  return wheelchairBoarding === '1';
};

export default {
  loadStopsData,
  loadRoutesData,
  getStopDetails,
  getRouteDetails,
  isWheelchairAccessible,
};
