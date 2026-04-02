/**
 * TransitScreen - TheBetterLondon
 * Displays all bus stops on an interactive map (US-503)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer, DestinationSearch, RouteOptionsBottomSheet, RoutePolyline, NavigationBottomSheet, FloatingActionButton, QuickActionsSheet, ModernSearchBar, ModernStopDetailsBottomSheet, ModernListSheet, SearchResultCard, ModernRouteCard } from '../components';
import StopMarker from '../components/StopMarker';
import VehicleMarker from '../components/VehicleMarker';
import { getAllBusStops, getBusStopById, fetchVehiclePositions, refreshAllTransitData } from '../services/transitService';
import { getRouteDetails, loadRoutesData } from '../services/gtfsStaticService';
import { getTransitDirections } from '../services/googleDirectionsService';
import mapStyle from '../utils/mapStyle.json';
import shapesData from '../gtfs/shapes.json';

// Pre-compute once at module load — shapesData never changes at runtime
const SHAPES_MAP = new Map(shapesData.map(shape => [shape.shapeId, shape.coordinates]));

// Defined at module scope — recreating this object on every render would cause
// MapView to re-animate to the initial region each time the component updates
const LONDON_CENTER = {
  latitude: 42.9849,
  longitude: -81.2497,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Stops are hidden at city-overview zoom to avoid rendering 1200+ markers.
// Viewport culling kicks in once the user zooms past this threshold.
// Viewport culling keeps the rendered count manageable at all zoom levels —
// only stops within the visible bounds + 30% buffer are mounted.

const TransitScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [busStops, setBusStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showBuses, setShowBuses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [navigationSheetMinimized, setNavigationSheetMinimized] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null); // 'nearby', 'favorites', or 'routes'
  const [favoriteStops, setFavoriteStops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [allRoutes, setAllRoutes] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState(new Set());
  const [showRoutesList, setShowRoutesList] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickActionsSheet, setShowQuickActionsSheet] = useState(false);
  const [isMapReloading, setIsMapReloading] = useState(false);
  // Briefly true whenever filteredStops recomputes with items — drives the
  // top-left rendering indicator so users know markers are being painted.
  const [stopsRendering, setStopsRendering] = useState(false);
  // Tracks the current visible map region — used for viewport culling in filteredStops
  const [mapRegion, setMapRegion] = useState(LONDON_CENTER);

  useEffect(() => {
    loadTransitData();
    
    // Load all routes and show them all on initial launch
    const routes = loadRoutesData();
    setAllRoutes(routes);
    setVisibleRoutes(new Set(routes.map(r => r.id)));
  }, []);

  // Poll for vehicle positions
  useEffect(() => {
    if (!showBuses) {
      setVehicles([]);
      return;
    }

    // Load vehicles immediately
    const loadVehicles = async () => {
      try {
        console.log('Fetching vehicles from backend API...');
        const vehicles = await fetchVehiclePositions();
        console.log(`Received ${vehicles.length} vehicles from backend`);
        
        // Filter and validate vehicles
        const validVehicles = vehicles.filter(vehicle => 
          vehicle.latitude && 
          vehicle.longitude && 
          !isNaN(vehicle.latitude) && 
          !isNaN(vehicle.longitude) &&
          vehicle.latitude >= 42.8 && vehicle.latitude <= 43.1 &&
          vehicle.longitude >= -81.5 && vehicle.longitude <= -81.0
        );
        
        console.log(`Validated ${validVehicles.length} vehicles`);
        setVehicles(validVehicles);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };

    loadVehicles();

    // Poll every 30 seconds — reduced from 15s to halve re-render frequency.
    // Buses move slowly enough that 30s is still a good UX on Android.
    const interval = setInterval(loadVehicles, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [showBuses]);

  useEffect(() => {
    // Handle navigation from NearbyStopsScreen
    if (route?.params?.selectedStopId) {
      loadAndCenterOnStop(route.params.selectedStopId);
    }
  }, [route?.params?.selectedStopId]);

  const loadTransitData = async () => {
    try {
      setLoading(true);
      const stops = await getAllBusStops();
      
      console.log(`Loaded ${stops.length} stops`);
      setBusStops(stops);
    } catch (error) {
      console.error('Error loading transit data:', error);
      Alert.alert('Error', 'Failed to load transit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Note: Vehicle loading now handled by Firestore real-time subscription

  const loadAndCenterOnStop = async (stopId) => {
    try {
      const stop = await getBusStopById(stopId);
      if (stop && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: stop.latitude,
          longitude: stop.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedStop(stop);
      }
    } catch (error) {
      console.error('Error centering on stop:', error);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setRefreshing(true);
      console.log('Manually refreshing transit data...');
      await refreshAllTransitData();
      console.log('Refresh triggered successfully - Firestore will update automatically');
      // Data will update automatically via Firestore subscriptions
      // Show success feedback
      Alert.alert(
        'Refresh Triggered',
        'Transit data is being updated. Changes will appear automatically.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error refreshing transit data:', error);
      Alert.alert(
        'Refresh Failed',
        'Could not refresh transit data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Memoize marker press handler
  const handleMarkerPress = useCallback((stop) => {
    console.log('=== Marker Pressed ===');
    console.log('Stop ID:', stop.id);
    console.log('Stop Name:', stop.name);
    
    // Show bottom sheet immediately - it will handle its own data fetching
    setSelectedStop(stop);
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Search bus stops
    const stopResults = busStops.filter(stop => 
      stop.name.toLowerCase().includes(lowerQuery) ||
      stop.code.toLowerCase().includes(lowerQuery) ||
      stop.routes.some(route => route.toLowerCase().includes(lowerQuery))
    ).slice(0, 5).map(stop => ({
      ...stop,
      type: 'stop'
    }));

    // Search destinations using Google Places (simplified - showing London landmarks)
    const destinations = [
      { name: 'Western University', latitude: 43.0096, longitude: -81.2737, type: 'destination' },
      { name: 'Fanshawe College', latitude: 43.0126, longitude: -81.1996, type: 'destination' },
      { name: 'Masonville Place', latitude: 42.9983, longitude: -81.2768, type: 'destination' },
      { name: 'White Oaks Mall', latitude: 42.9395, longitude: -81.1874, type: 'destination' },
      { name: 'Victoria Hospital', latitude: 42.9794, longitude: -81.2466, type: 'destination' },
      { name: 'University Hospital', latitude: 43.0085, longitude: -81.2745, type: 'destination' },
      { name: 'Downtown London', latitude: 42.9849, longitude: -81.2453, type: 'destination' },
      { name: 'Budweiser Gardens', latitude: 42.9881, longitude: -81.2497, type: 'destination' },
      { name: 'Covent Garden Market', latitude: 42.9853, longitude: -81.2497, type: 'destination' },
    ];

    const destinationResults = destinations.filter(dest =>
      dest.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    setSearchResults([...stopResults, ...destinationResults]);
  };

  // Handle destination selection from DestinationSearch component
  const handleDestinationSelect = async (place) => {
    console.log('Destination selected:', place);
    
    // Close destination search
    setShowDestinationSearch(false);
    
    // Set destination marker
    setDestinationMarker({
      latitude: place.location.lat,
      longitude: place.location.lng,
      name: place.name,
      address: place.address,
    });
    
    // Center map on destination
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.location.lat,
        longitude: place.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    
    // Fetch route options
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services to get directions.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setLoadingRoutes(true);
      setRouteError(null);
      setShowRouteOptions(true);
      
      console.log('Fetching routes from', userLocation, 'to', place.location);
      
      const routes = await getTransitDirections(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        { lat: place.location.lat, lng: place.location.lng }
      );
      
      console.log(`Received ${routes.length} route(s)`);
      setRouteOptions(routes);
      
      // Auto-select first route
      if (routes.length > 0) {
        setSelectedRouteId(routes[0].id);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRouteError(error.message || 'Failed to find routes. Please try again.');
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Handle route selection (preview on map)
  const handleRouteSelect = (routeId) => {
    console.log('Route selected:', routeId);
    setSelectedRouteId(routeId);
    
    // Find the selected route
    const route = routeOptions.find(r => r.id === routeId);
    if (!route || !mapRef.current) return;
    
    // Zoom to route bounds
    const { northeast, southwest } = route.bounds;
    mapRef.current.fitToCoordinates(
      [
        { latitude: northeast.lat, longitude: northeast.lng },
        { latitude: southwest.lat, longitude: southwest.lng },
      ],
      {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      }
    );
  };

  // Handle start navigation
  const handleStartNavigation = (routeId) => {
    console.log('Starting navigation with route:', routeId);
    
    const route = routeOptions.find(r => r.id === routeId);
    if (!route) return;
    
    setNavigationRoute(route);
    setCurrentStepIndex(0);
    setNavigationActive(true);
    setShowRouteOptions(false);
    setSelectedStop(null); // Close any open stop details
    
    // Keep the route preview on map during navigation
    // selectedRouteId remains set
  };

  // Shared reset helper — called by both end-navigation and arrived flows
  const resetNavigation = () => {
    setNavigationActive(false);
    setNavigationRoute(null);
    setCurrentStepIndex(0);
    setSelectedRouteId(null);
    setDestinationMarker(null);
    setNavigationSheetMinimized(false);
  };

  // Handle end navigation
  const handleEndNavigation = () => {
    Alert.alert(
      'End Navigation',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            setIsMapReloading(true);
            setTimeout(() => {
              resetNavigation();
              if (mapRef.current && userLocation) {
                mapRef.current.animateToRegion({
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }, 500);
              }
            }, 50);
          },
        },
      ]
    );
  };

  // Handle next step (for testing/manual advance)
  const handleNextStep = () => {
    if (!navigationRoute) return;
    
    if (currentStepIndex < navigationRoute.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Reached destination
      Alert.alert(
        'Destination Reached',
        'You have arrived at your destination!',
        [
          {
            text: 'OK',
            onPress: resetNavigation,
          },
        ]
      );
    }
  };

  const handleSearchResultPress = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    setActiveQuickAction(null);
    
    // Clear any destination marker when selecting a stop
    if (result.type === 'stop') {
      setDestinationMarker(null);
    }
    
    // Center on location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    console.log('result type: ', result.type)
    if (result.type === 'stop') {
      // It's a bus stop - show details
      handleMarkerPress(result);
    } else {
      // It's a destination - show marker for navigation
      setDestinationMarker({
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name
      });
    }
  };

  // Get directions to destination
  const getDirectionsTo = (location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Could not open Google Maps');
    });
    
    // Enable navigation mode - hide other routes
    setNavigationActive(true);
  };

  // Favorites functionality
  const toggleFavorite = (stop) => {
    setFavoriteStops(prev => {
      const isFavorite = prev.some(fav => fav.id === stop.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== stop.id);
      } else {
        if (prev.length >= 10) {
          Alert.alert('Maximum Favorites', 'You can only save up to 10 favorite stops.');
          return prev;
        }
        return [...prev, stop];
      }
    });
  };

  const isFavorite = (stopId) => {
    return favoriteStops.some(fav => fav.id === stopId);
  };

  // Route filtering
  const toggleRoute = useCallback((routeId) => {
    setVisibleRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  }, []);

  // Get route IDs from selected route (for filtering)
  const getSelectedRouteIds = () => {
    if (!selectedRouteId) return [];
    const route = routeOptions.find(r => r.id === selectedRouteId);
    if (!route) return [];
    
    return route.steps
      .filter(step => step.type === 'transit')
      .map(step => step.line.shortName || step.line.name);
  };

  // Get stop IDs from selected route (for filtering)
  const getSelectedRouteStopIds = () => {
    if (!selectedRouteId) return [];
    const route = routeOptions.find(r => r.id === selectedRouteId);
    if (!route) return [];
    
    const stopIds = [];
    route.steps.forEach(step => {
      if (step.type === 'transit') {
        if (step.departureStop?.id) stopIds.push(step.departureStop.id);
        if (step.arrivalStop?.id) stopIds.push(step.arrivalStop.id);
      }
    });
    return stopIds;
  };

  // Filter stops based on selected route or visible routes
  const filteredStops = useMemo(() => {
    // If route preview is active, show only the stops for that specific route
    if (selectedRouteId) {
      const selectedStopIds = getSelectedRouteStopIds();
      return busStops.filter(stop => selectedStopIds.includes(stop.id));
    }

    // No routes toggled on yet
    if (visibleRoutes.size === 0) return [];

    // Viewport bounds with a 30% buffer so stops don't pop in abruptly at edges
    const latBuf = mapRegion.latitudeDelta * 0.3;
    const lngBuf = mapRegion.longitudeDelta * 0.3;
    const minLat = mapRegion.latitude - mapRegion.latitudeDelta / 2 - latBuf;
    const maxLat = mapRegion.latitude + mapRegion.latitudeDelta / 2 + latBuf;
    const minLng = mapRegion.longitude - mapRegion.longitudeDelta / 2 - lngBuf;
    const maxLng = mapRegion.longitude + mapRegion.longitudeDelta / 2 + lngBuf;

    return busStops.filter(stop => {
      // Cull stops outside the visible region first — cheap coordinate compare
      if (
        stop.latitude  < minLat || stop.latitude  > maxLat ||
        stop.longitude < minLng || stop.longitude > maxLng
      ) return false;

      if (stop.routes && stop.routes.length > 0) {
        return stop.routes.some(routeId => visibleRoutes.has(routeId));
      }
      return true;
    });
  }, [busStops, visibleRoutes, selectedRouteId, routeOptions, mapRegion]);

  // Auto-dismiss the rendering pill once filteredStops has settled.
  // The pill is turned ON in handleRegionChangeComplete (before mapRegion updates)
  // so it always leads the markers by at least one render cycle.
  useEffect(() => {
    if (filteredStops.length === 0) {
      setStopsRendering(false);
      return;
    }
    const t = setTimeout(() => setStopsRendering(false), 700);
    return () => clearTimeout(t);
  }, [filteredStops]);

  // Filter vehicles based on selected route or visible routes
  const filteredVehicles = useMemo(() => {
    // If route preview is active, show only buses for the selected route
    if (selectedRouteId) {
      const selectedRouteIds = getSelectedRouteIds();
      return vehicles.filter(vehicle => 
        vehicle.routeId && selectedRouteIds.includes(vehicle.routeId)
      );
    }
    
    // Otherwise, use normal visibility filtering
    if (visibleRoutes.size === 0) return [];
    
    return vehicles.filter(vehicle => {
      if (!vehicle.routeId) return false;
      return visibleRoutes.has(vehicle.routeId);
    });
  }, [vehicles, visibleRoutes, selectedRouteId, routeOptions]);

  // Filter and prepare polylines for visible routes
  const routePolylines = useMemo(() => {
    // Hide GTFS route polylines during navigation
    if (navigationActive) return [];
    
    if (visibleRoutes.size === 0) return [];
    
    // Create a map of shapeId to shape coordinates
    const shapesMap = SHAPES_MAP;
    
    const polylines = [];
    allRoutes.forEach(route => {
      // Only include routes that are visible
      if (visibleRoutes.has(route.id) && route.shapes) {
        const routeColor = route.color || '#2196F3';
        console.log(`Route ${route.id} color: ${routeColor}`); // Debug log
        
        route.shapes.forEach(shapeId => {
          const coordinates = shapesMap.get(shapeId);
          if (coordinates && coordinates.length > 0) {
            polylines.push({
              key: `${route.id}-${shapeId}`,
              coordinates: coordinates,
              color: routeColor,
              routeId: route.id
            });
          }
        });
      }
    });
    
    console.log(`Generated ${polylines.length} polylines`); // Debug log
    return polylines;
  }, [allRoutes, visibleRoutes, navigationActive]);

  // Clear map loading overlay once polylines have recomputed after a reset
  useEffect(() => {
    if (isMapReloading) {
      setIsMapReloading(false);
    }
  }, [routePolylines]);

  // Get directions
  const getDirections = (stop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
    Linking.openURL(url);
  };

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbyStops = useCallback(() => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to find nearby stops.');
      return [];
    }

    return busStops
      .map(stop => ({
        ...stop,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          stop.latitude,
          stop.longitude
        )
      }))
      .filter(stop => stop.distance <= 2) // Within 2km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }, [userLocation, busStops]);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    getUserLocation();
  }, []);

  if (loading) {
    return (
      <ScreenContainer edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading bus stops...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={[]}>
      <View style={styles.container}>
        {/* Modern Search Bar */}
        <ModernSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setShowDestinationSearch(true)}
          onClear={() => { setSearchQuery(''); setSearchResults([]); }}
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
          refreshing={refreshing}
          editable={!showDestinationSearch}
        />

        {/* Minimized Navigation Button */}
        {navigationActive && navigationRoute && navigationSheetMinimized && (
          <TouchableOpacity
            style={styles.quickActionsNavButton}
            onPress={() => setNavigationSheetMinimized(false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionsNavGradient}
            >
              <MaterialCommunityIcons name="navigation" size={24} color="#FFF" />
              <View style={styles.quickActionsNavContent}>
                <Text style={styles.quickActionsNavText} numberOfLines={1}>
                  {navigationRoute.steps[currentStepIndex].instruction}
                </Text>
                <Text style={styles.quickActionsNavSubtext}>
                  Step {currentStepIndex + 1} of {navigationRoute.steps.length}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-up" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Routes List - Modern */}
        <ModernListSheet
          visible={showRoutesList}
          onClose={() => {
            setShowRoutesList(false);
            setActiveQuickAction(null);
          }}
          title="All Routes"
          subtitle="Tap to show/hide routes on map"
        >
          <View style={styles.routesListHeader}>
            <TouchableOpacity 
              style={styles.toggleAllButton}
              onPress={() => {
                if (visibleRoutes.size === allRoutes.length) {
                  // Hide all
                  setVisibleRoutes(new Set());
                } else {
                  // Show all
                  setVisibleRoutes(new Set(allRoutes.map(r => r.id)));
                }
              }}
            >
              <Text style={[styles.routesToggleAll, { color: theme.colors.primary.main }]}>
                {visibleRoutes.size === allRoutes.length ? 'Hide All' : 'Show All'}
              </Text>
            </TouchableOpacity>
          </View>
          {allRoutes
            .sort((a, b) => {
              // Sort numerically by route ID
              const numA = parseInt(a.id) || 0;
              const numB = parseInt(b.id) || 0;
              return numA - numB;
            })
            .map((route) => {
              const isVisible = visibleRoutes.has(route.id);
              return (
                <ModernRouteCard
                  key={route.id}
                  route={route}
                  selected={isVisible}
                  onPress={() => toggleRoute(route.id)}
                  onToggle={() => toggleRoute(route.id)}
                />
              );
            })}
        </ModernListSheet>

        {/* Search Results - Modern */}
        <ModernListSheet
          visible={showSearch && searchResults.length > 0}
          onClose={() => {
            setShowSearch(false);
            setSearchResults([]);
            setActiveQuickAction(null);
          }}
          title={activeQuickAction === 'nearby' ? 'Nearby Stops' : activeQuickAction === 'favorites' ? 'Favorite Stops' : 'Search Results'}
          subtitle={searchResults.length === 1 ? '1 result' : `${searchResults.length} results`}
        >
          {searchResults.map((result, index) => (
            <SearchResultCard
              key={`${result.type}-${result.id || result.name}-${index}`}
              result={result}
              onPress={() => handleSearchResultPress(result)}
              isFavorite={result.type === 'stop' && isFavorite(result.id)}
              onGetDirections={result.type === 'destination' ? () => getDirectionsTo(result) : null}
            />
          ))}
        </ModernListSheet>
        
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={LONDON_CENTER}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={mapStyle}
          onRegionChangeComplete={(region) => {
            // Show pill before mapRegion state update so React schedules
            // the indicator in the same batch — one frame ahead of markers.
            setStopsRendering(true);
            setMapRegion(region);
          }}
        >
          {/* Route Polylines */}
          {routePolylines.map((polyline) => {
            return (
            <Polyline
              key={polyline.key}
              coordinates={polyline.coordinates}
              strokeColor={polyline.color}
              fillColor={polyline.color}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )})}

          {/* Bus Stops — viewport-culled, hidden above city-overview zoom */}
          {filteredStops.map((stop) => (
            <StopMarker
              key={`stop-${stop.id}`}
              stop={stop}
              onPress={() => handleMarkerPress(stop)}
            />
          ))}
          
          {/* Live Buses */}
          {showBuses && filteredVehicles.map((vehicle) => (
            <VehicleMarker
              key={`vehicle-${vehicle.id}`}
              vehicle={vehicle}
            />
          ))}
          
          {/* Route Polylines for Selected Route */}
          {selectedRouteId && routeOptions.length > 0 && (
            <RoutePolyline
              route={routeOptions.find(r => r.id === selectedRouteId)}
              visible={true}
            />
          )}
          
          {/* Destination Marker */}
          {destinationMarker && (
            <Marker
              coordinate={{
                latitude: destinationMarker.latitude,
                longitude: destinationMarker.longitude,
              }}
              title={destinationMarker.name}
              pinColor="#4CAF50"
            >
              <View style={styles.destinationMarker}>
                <MaterialCommunityIcons name="map-marker" size={40} color="#4CAF50" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Map reloading overlay */}
        {isMapReloading && (
          <View style={styles.mapLoadingOverlay} pointerEvents="none">
            <View style={styles.mapLoadingCard}>
              <ActivityIndicator size="large" color="#1976D2" />
            </View>
          </View>
        )}

        {/* Stop-rendering indicator — top-left pill, non-blocking */}
        {stopsRendering && (
          <View
            style={[styles.stopsRenderingPill, { top: insets.top + 72 }]}
            pointerEvents="none"
          >
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.stopsRenderingText}>Loading stops…</Text>
          </View>
        )}

        {/* Old Navigation Banner - Hidden when NavigationBottomSheet is active */}
        {navigationActive && !navigationRoute && destinationMarker && (
          <View style={[styles.navigationBanner, { backgroundColor: '#4CAF50' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.navigationTitle}>Navigating to:</Text>
              <Text style={styles.navigationDestination}>{destinationMarker.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.stopNavigationButton}
              onPress={() => {
                setNavigationActive(false);
                setDestinationMarker(null);
              }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Sheet for Stop Details */}
        {selectedStop && (
          <ModernStopDetailsBottomSheet
            stop={selectedStop}
            onClose={() => setSelectedStop(null)}
            onToggleFavorite={() => toggleFavorite(selectedStop)}
            isFavorite={isFavorite(selectedStop.id)}
            lastUpdated={lastUpdated}
          />
        )}

        {/* Destination Search Modal */}
        {showDestinationSearch && (
          <View style={styles.destinationSearchModal}>
            <DestinationSearch
              userLocation={userLocation}
              onDestinationSelect={handleDestinationSelect}
              onClose={() => {
                setShowDestinationSearch(false);
                setSearchQuery('');
              }}
            />
          </View>
        )}

        {/* Route Options Bottom Sheet */}
        {showRouteOptions && (
          <RouteOptionsBottomSheet
            routes={routeOptions}
            destination={destinationMarker}
            loading={loadingRoutes}
            error={routeError}
            selectedRouteId={selectedRouteId}
            onRouteSelect={handleRouteSelect}
            onStartNavigation={handleStartNavigation}
            onClose={() => {
              setShowRouteOptions(false);
              setIsMapReloading(true);
              setTimeout(() => {
                setRouteOptions([]);
                setRouteError(null);
                setSelectedRouteId(null);
                if (mapRef.current && userLocation) {
                  mapRef.current.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }, 500);
                }
                // routePolylines doesn't depend on selectedRouteId/routeOptions,
                // so it won't recompute — clear the spinner directly here.
                setIsMapReloading(false);
              }, 300);
            }}
          />
        )}

        {/* Navigation Bottom Sheet */}
        {navigationActive && navigationRoute && !navigationSheetMinimized && (
          <NavigationBottomSheet
            route={navigationRoute}
            currentStepIndex={currentStepIndex}
            onEndNavigation={handleEndNavigation}
            onNextStep={handleNextStep}
            onMinimize={() => setNavigationSheetMinimized(true)}
          />
        )}

        {/* Floating Action Button for Quick Actions */}
        {!navigationActive && !showDestinationSearch && !showRouteOptions && (
          <>
            {/* Locate Me Button - Top Right */}
            <TouchableOpacity
              style={[styles.locateMeButton, { top: insets.top + 72 }]}
              onPress={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 500);
                }
              }}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Menu FAB - Bottom Right */}
            <FloatingActionButton
              icon="menu"
              onPress={() => setShowQuickActionsSheet(true)}
              size="md"
              variant="primary"
              style={{
                position: 'absolute',
                bottom: 24,
                right: 24,
              }}
            />
          </>
        )}

        {/* Quick Actions Bottom Sheet */}
        <QuickActionsSheet
          visible={showQuickActionsSheet}
          onClose={() => setShowQuickActionsSheet(false)}
          onActionSelect={(actionId) => {
            if (actionId === 'nearby') {
              const nearby = getNearbyStops();
              if (nearby.length > 0) {
                const nearbyWithType = nearby.map(stop => ({
                  ...stop,
                  type: 'stop'
                }));
                setSearchResults(nearbyWithType);
                setShowSearch(true);
                setActiveQuickAction('nearby');
              } else {
                Alert.alert('No Nearby Stops', 'Could not find any stops within 2km.');
              }
            } else if (actionId === 'favorites') {
              if (favoriteStops.length > 0) {
                const favoritesWithType = favoriteStops.map(stop => ({
                  ...stop,
                  type: 'stop'
                }));
                setSearchResults(favoritesWithType);
                setShowSearch(true);
                setActiveQuickAction('favorites');
              }
            } else if (actionId === 'routes') {
              setShowRoutesList(true);
              setActiveQuickAction('routes');
            }
          }}
          userLocation={userLocation}
          favoriteStops={favoriteStops}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  mapLoadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  locateMeButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  stopsRenderingPill: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(25, 118, 210, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stopsRenderingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timestampBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 100,
  },
  timestampText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  nearbyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nearbyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  busMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCallout: {
    alignItems: 'center',
  },
  calloutBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  calloutStopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  calloutStopCode: {
    fontSize: 13,
    color: '#666',
  },
  calloutStopFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  calloutFeatureText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  calloutStopAccommodations: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  calloutArrivals: {
    marginTop: 4,
  },
  calloutArrivalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  calloutArrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  calloutRouteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  calloutRouteText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calloutRouteName: {
    fontSize: 13,
    color: '#333',
    lineHeight: 16,
  },
  calloutTripIcons: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  calloutIconBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 2,
  },
  calloutEtaContainer: {
    alignItems: 'flex-end',
  },
  calloutEta: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: 60,
    textAlign: 'right',
  },
  calloutDelay: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 2,
  },
  calloutLoading: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 12,
  },
  calloutLoadingText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  calloutIcons: {
    flexDirection: 'row',
    marginTop: 2,
  },
  calloutRoutes: {
    marginTop: 4,
  },
  calloutRoutesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  calloutRoutesList: {
    gap: 8,
  },
  calloutRouteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calloutRouteListName: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  // Search Styles
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchResults: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    maxHeight: 400,
    zIndex: 9,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultCode: {
    fontSize: 13,
    marginBottom: 2,
  },
  searchResultDistance: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  routesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  routesListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routesToggleAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  routeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  routeBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routeName: {
    fontSize: 15,
  },
  getDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  getDirectionsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationBanner: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  navigationTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  navigationDestination: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopNavigationButton: {
    padding: 8,
  },
  quickActionsNavButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  quickActionsNavGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  quickActionsNavContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  quickActionsNavText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionsNavSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  destinationSearchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  routeOptionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default TransitScreen;
