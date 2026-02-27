/**
 * IssuesMapScreen - TheBetterLondon
 * US-303: View Issues on a Map
 *   - Google Maps with aubergine style
 *   - All Firestore reports as category-coloured markers
 *   - User location dot
 *   - Category filter sheet
 *   - Proximity (radius) filter with visible circle
 *   - Tap marker → ReportDetails, back → this screen
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getAllReports } from '../services/reportsService';
import { ISSUE_CATEGORIES } from '../utils/constants';
import { haversineDistance } from '../utils/helpers';
import mapStyle from '../theme/googlamaps/mapStyle-aubergine.json';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// London, ON initial region
const LONDON_REGION = {
  latitude: 42.9849,
  longitude: -81.2453,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Proximity options in kilometres
const PROXIMITY_OPTIONS = [
  { label: 'All', value: null },
  { label: '0.5 km', value: 0.5 },
  { label: '1 km', value: 1 },
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

const IssuesMapScreen = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState([]);

  const [proximityKm, setProximityKm] = useState(null); // null = show all
  const [proximitySheetVisible, setProximitySheetVisible] = useState(false);



  // ─── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllReports();
        setReports(data);
      } catch (e) {
        console.error('IssuesMapScreen: failed to load reports', e);
      } finally {
        setLoadingReports(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(loc.coords);
    })();
  }, []);

  // ─── Derived: filtered reports ─────────────────────────────────────────────
  const displayedReports = useMemo(() => {
    let list = reports;

    // Category filter
    if (selectedCategories.length > 0) {
      list = list.filter(r => selectedCategories.includes(r.category));
    }

    // Proximity filter (only when user location is known)
    if (proximityKm !== null && userLocation) {
      list = list.filter(r => {
        if (!r.location?.latitude || !r.location?.longitude) return false;
        const dist = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          r.location.latitude,
          r.location.longitude,
        );
        return dist <= proximityKm;
      });
    }

    return list;
  }, [reports, selectedCategories, proximityKm, userLocation]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getCategoryInfo = useCallback((categoryId) => {
    return (
      ISSUE_CATEGORIES.find(c => c.id === categoryId) || {
        label: 'Other',
        icon: 'help-circle',
        color: '#9E9E9E',
      }
    );
  }, []);

  const handleMarkerPress = useCallback((report) => {
    navigation.navigate('ReportDetails', { reportId: report.id });
  }, [navigation]);

  const handleLocateMe = useCallback(() => {
    if (!userLocation) {
      Alert.alert('Location unavailable', 'Please enable location services and try again.');
      return;
    }
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 600);
  }, [userLocation]);

  // ─── Filter sheet handlers ─────────────────────────────────────────────────
  const openFilterSheet = () => {
    setCategoryDraft(selectedCategories);
    setFilterSheetVisible(true);
  };

  const applyCategories = () => {
    setSelectedCategories(categoryDraft);
    setFilterSheetVisible(false);
  };

  // ─── Active filter label for proximity button ──────────────────────────────
  const proximityLabel =
    PROXIMITY_OPTIONS.find(o => o.value === proximityKm)?.label ?? 'All';

  // ─── Styles ────────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },

    // Floating toolbar (top)
    toolbar: {
      position: 'absolute',
      top: theme.spacing[3],
      left: theme.spacing[3],
      right: theme.spacing[3],
      flexDirection: 'row',
      gap: theme.spacing[2],
    },
    toolbarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral[0],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing[1],
      // shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 4,
    },
    toolbarButtonActive: {
      backgroundColor: theme.colors.primary[500],
    },
    toolbarButtonText: {
      ...theme.typography.body2,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    toolbarButtonTextActive: {
      color: theme.colors.neutral[0],
    },
    countPill: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing[1],
    },
    countPillText: {
      ...theme.typography.caption,
      color: theme.colors.neutral[0],
      fontWeight: theme.fontWeight.semibold,
    },

    // Locate-me FAB (bottom-right)
    fab: {
      position: 'absolute',
      bottom: theme.spacing[6],
      right: theme.spacing[4],
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.neutral[0],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },

    // Bottom sheet (shared)
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.neutral[0],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: insets.bottom + theme.spacing[4],
      maxHeight: SCREEN_HEIGHT * 0.75,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral[300],
      alignSelf: 'center',
      marginTop: theme.spacing[3],
      marginBottom: theme.spacing[2],
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    sheetTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    clearText: {
      ...theme.typography.body2,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
    },

    // Category rows (filter sheet)
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[100],
    },
    categoryIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[3],
    },
    categoryLabel: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.neutral[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    sheetFooter: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
    },
    applyButton: {
      backgroundColor: theme.colors.primary[500],
      paddingVertical: theme.spacing[4],
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
    },
    applyText: {
      ...theme.typography.body1,
      color: theme.colors.neutral[0],
      fontWeight: theme.fontWeight.bold,
    },

    // Proximity rows
    proximityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[100],
    },
    proximityLabel: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      flex: 1,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.neutral[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioActive: { borderColor: theme.colors.primary[500] },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary[500],
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={LONDON_REGION}
        showsUserLocation={!locationError}
        showsMyLocationButton={false}
      >
        {/* Proximity circle */}
        {proximityKm !== null && userLocation && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={proximityKm * 1000}
            strokeColor={theme.colors.primary[500]}
            strokeWidth={2}
            fillColor={`${theme.colors.primary[500]}22`}
          />
        )}

        {/* Report markers */}
        {displayedReports.map(report => {
          if (!report.location?.latitude || !report.location?.longitude) return null;
          const cat = getCategoryInfo(report.category);
          return (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.location.latitude,
                longitude: report.location.longitude,
              }}
              onPress={() => handleMarkerPress(report)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View
                pointerEvents="none"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: cat.color,
                  borderWidth: 2,
                  borderColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              >
                <Icon name={cat.icon} size={18} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Loading overlay */}
      {loadingReports && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      )}

      {/* ── Floating toolbar ── */}
      <View style={styles.toolbar}>
        {/* Category filter button */}
        <TouchableOpacity
          style={[styles.toolbarButton, selectedCategories.length > 0 && styles.toolbarButtonActive]}
          onPress={openFilterSheet}
          activeOpacity={0.8}
        >
          <Icon
            name="filter-variant"
            size={16}
            color={selectedCategories.length > 0 ? theme.colors.neutral[0] : theme.colors.text.primary}
          />
          <Text style={[styles.toolbarButtonText, selectedCategories.length > 0 && styles.toolbarButtonTextActive]}>
            {selectedCategories.length > 0 ? `Type (${selectedCategories.length})` : 'Filter'}
          </Text>
        </TouchableOpacity>

        {/* Proximity filter button */}
        <TouchableOpacity
          style={[styles.toolbarButton, proximityKm !== null && styles.toolbarButtonActive]}
          onPress={() => setProximitySheetVisible(true)}
          activeOpacity={0.8}
        >
          <Icon
            name="map-marker-radius"
            size={16}
            color={proximityKm !== null ? theme.colors.neutral[0] : theme.colors.text.primary}
          />
          <Text style={[styles.toolbarButtonText, proximityKm !== null && styles.toolbarButtonTextActive]}>
            {proximityKm !== null ? proximityLabel : 'Radius'}
          </Text>
        </TouchableOpacity>

        {/* Report count */}
        <View style={styles.countPill}>
          <Icon name="map-marker-multiple" size={12} color={theme.colors.neutral[0]} />
          <Text style={styles.countPillText}>{displayedReports.length}</Text>
        </View>
      </View>

      {/* ── Locate-me FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={handleLocateMe} activeOpacity={0.8}>
        <Icon name="crosshairs-gps" size={24} color={theme.colors.primary[500]} />
      </TouchableOpacity>



      {/* ── Category Filter Sheet ── */}
      <Modal
        visible={filterSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterSheetVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Filter by Type</Text>
                  <TouchableOpacity onPress={() => setCategoryDraft([])}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {ISSUE_CATEGORIES.map(cat => {
                    const isSelected = categoryDraft.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryRow}
                        onPress={() =>
                          setCategoryDraft(prev =>
                            prev.includes(cat.id)
                              ? prev.filter(c => c !== cat.id)
                              : [...prev, cat.id]
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '22' }]}>
                          <Icon name={cat.icon} size={20} color={cat.color} />
                        </View>
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Icon name="check" size={14} color={theme.colors.neutral[0]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.sheetFooter}>
                  <TouchableOpacity style={styles.applyButton} onPress={applyCategories}>
                    <Text style={styles.applyText}>
                      {categoryDraft.length === 0
                        ? 'Show All Types'
                        : `Show ${categoryDraft.length} Type${categoryDraft.length !== 1 ? 's' : ''}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Proximity Sheet ── */}
      <Modal
        visible={proximitySheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProximitySheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setProximitySheetVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Proximity Radius</Text>
                </View>

                {PROXIMITY_OPTIONS.map(opt => {
                  const isActive = proximityKm === opt.value;
                  return (
                    <TouchableOpacity
                      key={String(opt.value)}
                      style={styles.proximityRow}
                      onPress={() => {
                        setProximityKm(opt.value);
                        setProximitySheetVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.proximityLabel}>{opt.label}</Text>
                      <View style={[styles.radio, isActive && styles.radioActive]}>
                        {isActive && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default IssuesMapScreen;
