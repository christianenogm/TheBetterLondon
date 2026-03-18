/**
 * ModernStopDetailsBottomSheet - Redesigned stop details with modern UI
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/designSystem';
import { getStopArrivals } from '../services/transitService';
import { getRouteDetails } from '../services/gtfsStaticService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

const ModernStopDetailsBottomSheet = ({
  stop,
  onClose,
  onToggleFavorite,
  isFavorite,
  lastUpdated,
}) => {
  const translateY = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoutes, setActiveRoutes] = useState([]);

  useEffect(() => {
    // Slide up animation
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 25,
      stiffness: 120,
    }).start();

    // Fetch schedule
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await getStopArrivals(stop.id);
      console.log(`📋 Arrivals for stop ${stop.id}:`, data.length, 'arrivals');
      
      // Extract unique route IDs from arrivals
      const uniqueRouteIds = [...new Set(data.map(arrival => arrival.routeId))];
      console.log(`🚏 Active routes for stop:`, uniqueRouteIds);
      setActiveRoutes(uniqueRouteIds);
      
      // Map and group arrivals by route + headsign
      const mappedArrivals = data.map((arrival) => {
        const arrivalTime = new Date(arrival.arrivalTime);
        const now = new Date();
        const minutesUntil = Math.max(0, Math.round((arrivalTime - now) / 60000));
        
        // Get route details for color
        const routeDetails = getRouteDetails(arrival.routeId);
        const routeColor = routeDetails?.color ? `${routeDetails.color}` : arrival.color || colors.primary.main;
        
        return {
          routeId: arrival.routeId,
          routeShortName: routeDetails?.shortName || arrival.routeId,
          tripHeadsign: arrival.headsign || arrival.routeName || routeDetails?.longName || 'Unknown',
          scheduledTime: arrivalTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          minutesUntil: minutesUntil,
          routeColor: routeColor,
          arrivalTime: arrival.arrivalTime,
          delay: arrival.delay || 0,
        };
      });
      
      // Group arrivals by route + headsign
      const groupedArrivals = mappedArrivals.reduce((acc, arrival) => {
        const key = `${arrival.routeId}-${arrival.tripHeadsign}`;
        if (!acc[key]) {
          acc[key] = {
            routeId: arrival.routeId,
            routeShortName: arrival.routeShortName,
            tripHeadsign: arrival.tripHeadsign,
            routeColor: arrival.routeColor,
            times: []
          };
        }
        acc[key].times.push({
          scheduledTime: arrival.scheduledTime,
          minutesUntil: arrival.minutesUntil,
          arrivalTime: arrival.arrivalTime,
          delay: arrival.delay,
        });
        return acc;
      }, {});
      
      // Convert to array and sort by earliest arrival
      const groupedArray = Object.values(groupedArrivals)
        .map(group => ({
          ...group,
          times: group.times.sort((a, b) => a.arrivalTime - b.arrivalTime).slice(0, 3) // Keep up to 3 times per route
        }))
        .sort((a, b) => a.times[0].minutesUntil - b.times[0].minutesUntil);
      
      setSchedule(groupedArray);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setSchedule([]);
      setActiveRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: SHEET_MAX_HEIGHT,
      useNativeDriver: true,
      damping: 25,
      stiffness: 120,
    }).start(() => onClose());
  };

  const getTextColor = (bgColor) => {
    if (!bgColor) return '#FFFFFF';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name="bus-stop"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.headerText}>
              <Text style={styles.stopName} numberOfLines={1}>
                {stop.name}
              </Text>
              <Text style={styles.stopCode}>Stop #{stop.code}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onToggleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={isFavorite ? 'star' : 'star-outline'}
                size={28}
                color={isFavorite ? colors.warning.main : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Route Badges */}
        {activeRoutes.length > 0 ? (
          <View style={styles.routesSection}>
            <Text style={styles.sectionLabel}>ROUTES</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.routesContainer}
            >
              {activeRoutes.map((route) => {
                // Get route details from GTFS to get the actual color
                const routeDetails = getRouteDetails(route);
                const routeColor = routeDetails?.color ? `${routeDetails.color}` : colors.primary.main;
                console.log('Routes: ', routeDetails.shortName, ' color: ', routeColor)
                return (
                  <View
                    key={route}
                    style={[styles.routeBadge, { backgroundColor: routeColor }]}
                  >
                    <Text 
                      style={[styles.routeBadgeText, { color: getTextColor(routeColor) }]}
                    >
                      {routeDetails?.shortName || route}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : loading ? null : (
          <View style={styles.routesSection}>
            <Text style={styles.sectionLabel}>ROUTES</Text>
            <Text style={[styles.emptyStateSubtext, { marginLeft: spacing.md }]}>
              No active routes at this stop
            </Text>
          </View>
        )}

        {/* Next Arrivals */}
        <View style={styles.arrivalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>NEXT ARRIVALS</Text>
            {lastUpdated && (
              <Text style={styles.updateTime}>
                {lastUpdated.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.loadingText}>Loading schedule...</Text>
            </View>
          ) : schedule.length > 0 ? (
            <ScrollView
              style={styles.arrivalsList}
              showsVerticalScrollIndicator={false}
            >
              {schedule.map((arrival, index) => {
                return (
                  <View key={index} style={styles.arrivalCard}>
                    <View
                      style={[
                        styles.arrivalRouteBadge,
                        { backgroundColor: arrival.routeColor || colors.primary.main },
                      ]}
                    >
                      <Text
                        style={[
                          styles.arrivalRouteText,
                          { color: getTextColor(arrival.routeColor || colors.primary.main) },
                        ]}
                      >
                        {arrival.routeShortName}
                      </Text>
                    </View>
                    <View style={styles.arrivalInfo}>
                      <View style={styles.arrivalDestinationRow}>
                        <MaterialCommunityIcons name="arrow-right-thin" size={14} color={colors.text.hint} />
                        <Text style={styles.arrivalDestination} numberOfLines={1}>
                          {arrival.tripHeadsign}
                        </Text>
                      </View>
                      <View style={styles.arrivalTimesContainer}>
                        {arrival.times.map((time, timeIndex) => {
                          const isDelayed = !!(time.delay && time.delay > 60); // delayed > 1 min
                          return (
                            <View key={timeIndex} style={[styles.arrivalTimeChip, isDelayed && styles.arrivalTimeChipDelayed]}>
                              <Text style={[styles.arrivalTimeChipText, isDelayed && styles.arrivalTimeChipTextDelayed]}>
                                {time.minutesUntil <= 10 
                                  ? `${time.minutesUntil} min` 
                                  : time.scheduledTime
                                }
                              </Text>
                              {isDelayed && (
                                <MaterialCommunityIcons name="clock-alert-outline" size={10} color="#E65100" style={{ marginLeft: 2 }} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={48}
                color={colors.text.disabled}
              />
              <Text style={styles.emptyStateText}>No upcoming buses</Text>
              <Text style={styles.emptyStateSubtext}>Check back later</Text>
            </View>
          )}
        </View>

      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlay,
    zIndex: 999,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_MAX_HEIGHT,
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    ...elevation.highest,
    zIndex: 1000,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.main,
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  stopName: {
    ...typography.title.large,
    color: colors.text.primary,
  },
  stopCode: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
  routesSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label.small,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  routesContainer: {
    flexDirection: 'row',
    paddingRight: spacing.sm,
  },
  routeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 50,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  routeBadgeText: {
    ...typography.label.large,
    fontWeight: 'bold',
  },
  arrivalsSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  updateTime: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  arrivalsList: {
    maxHeight: 250,
  },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.low,
    gap: spacing.sm,
  },
  arrivalRouteBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalRouteText: {
    ...typography.title.medium,
    fontWeight: 'bold',
  },
  arrivalInfo: {
    flex: 1,
  },
  arrivalDestinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.xs,
  },
  arrivalDestination: {
    ...typography.body.large,
    color: colors.text.primary,
    flex: 1,
  },
  arrivalTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  arrivalTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  arrivalTimeChipDelayed: {
    backgroundColor: '#FFF3E0',
  },
  arrivalTimeChipText: {
    ...typography.body.small,
    color: colors.primary.main,
    fontWeight: '600',
  },
  arrivalTimeChipTextDelayed: {
    color: '#E65100',
  },
  arrivalSchedule: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  arrivalTime: {
    alignItems: 'center',
  },
  arrivalMinutes: {
    ...typography.headline.small,
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  arrivalMinutesLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.title.medium,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptyStateSubtext: {
    ...typography.body.small,
    color: colors.text.hint,
    marginTop: spacing.xs,
  },
});

export default ModernStopDetailsBottomSheet;
