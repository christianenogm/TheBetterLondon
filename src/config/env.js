/**
 * Environment Configuration - TheBetterLondon
 * Access environment variables safely
 */

// In Expo SDK 49+, use process.env with EXPO_PUBLIC_ prefix
export const ENV = {
  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  
  // Google Navigation APIs (for transit directions feature)
  GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  GOOGLE_DIRECTIONS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  
  // API Endpoints
  BACKEND_API_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3000',
  TRANSIT_TRIP_UPDATES_URL: 'http://gtfs.ltconline.ca/TripUpdate/TripUpdates.json',
  TRANSIT_VEHICLE_POSITIONS_URL: 'http://gtfs.ltconline.ca/Vehicle/VehiclePositions.json',
  TRANSIT_STATIC_GTFS_URL: 'https://www.londontransit.ca/gtfsfeed/google_transit.zip',
  ZONE_FINDER_API_URL: process.env.EXPO_PUBLIC_ZONE_FINDER_API_URL || 'https://apps.london.ca/ZoneFinder/Map/GetSearch',
  
  // Google APIs
  GOOGLE_ROUTES_API_URL: 'https://routes.googleapis.com/directions/v2:computeRoutes',
  GOOGLE_PLACES_API_URL: 'https://places.googleapis.com/v1',
  
  // Firebase (when ready)
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validation helper
export const validateEnv = () => {
  const required = ['GOOGLE_MAPS_API_KEY'];
  const missing = required.filter(key => !ENV[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env file');
  }
  
  // Warn if navigation APIs are not configured
  if (!ENV.GOOGLE_PLACES_API_KEY || !ENV.GOOGLE_DIRECTIONS_API_KEY) {
    console.warn('Navigation feature requires GOOGLE_PLACES_API_KEY and GOOGLE_DIRECTIONS_API_KEY');
    console.warn('Currently falling back to GOOGLE_MAPS_API_KEY');
  }
};

export default ENV;
