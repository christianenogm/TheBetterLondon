/**
 * StopDetailsBottomSheet - TheBetterLondon
 * Bottom sheet component that displays bus stop details and handles its own data fetching
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fetchStopArrivals } from '../services/transitService';

const StopDetailsBottomSheet = ({ stop, onClose, onToggleFavorite, isFavorite, onGetDirections, lastUpdated }) => {
  const theme = useTheme();
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch arrivals when component mounts or stop changes
    const loadArrivals = async () => {
      try {
        console.log(`Fetching arrivals for stop: ${stop.id}`);
        const stopArrivals = await fetchStopArrivals(stop.id);
        console.log(`Received ${stopArrivals.length} arrivals`);
        setArrivals(stopArrivals);
        setLoading(false);
      } catch (error) {
        console.error('Error loading arrivals:', error);
        setLoading(false);
      }
    };

    loadArrivals();
    
    // Poll every 30 seconds
    const interval = setInterval(loadArrivals, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [stop.id]);



  return (
    <View style={[styles.bottomSheet, { backgroundColor: theme.colors.background.paper || '#FFFFFF' }]}>
      <TouchableOpacity style={styles.bottomSheetClose} onPress={onClose}>
        <MaterialCommunityIcons name="close" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      
      <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bottomSheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bottomSheetStopName, { color: theme.colors.text.primary }]}>
              {stop.name}
            </Text>
            <Text style={[styles.bottomSheetStopCode, { color: theme.colors.text.secondary }]}>
              Stop {stop.code}
            </Text>
            <View style={styles.bottomSheetStopFeatures}>
              <View style={styles.bottomSheetFeatureItem}>
                <MaterialCommunityIcons name="wheelchair-accessibility" size={16} color="#4CAF50" />
                <Text style={styles.bottomSheetFeatureText}>Wheelchair Accessible</Text>
              </View>
              <View style={styles.bottomSheetFeatureItem}>
                <MaterialCommunityIcons name="bike" size={16} color="#FF9800" />
                <Text style={styles.bottomSheetFeatureText}>Bikes Allowed</Text>
              </View>
            </View>
            {lastUpdated && (
              <View style={styles.bottomSheetTimestamp}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#757575" />
                <Text style={styles.bottomSheetTimestampText}>
                  Vehicle data Last Updated: {lastUpdated.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
          <MaterialCommunityIcons name="bus-stop" size={32} color="#2196F3" />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.bottomSheetActions}>
          <TouchableOpacity 
            style={[
              styles.bottomSheetActionButton, 
              { 
                backgroundColor: isFavorite ? '#FFB300' : '#E3F2FD',
                borderWidth: 1,
                borderColor: isFavorite ? '#FFB300' : '#2196F3'
              }
            ]}
            onPress={onToggleFavorite}
          >
            <MaterialCommunityIcons 
              name={isFavorite ? "star" : "star-outline"} 
              size={20} 
              color={isFavorite ? '#FFF' : '#2196F3'} 
            />
            <Text style={[
              styles.bottomSheetActionText,
              { color: isFavorite ? '#FFF' : '#2196F3' }
            ]}>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.bottomSheetActionButton, 
              { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' }
            ]}
            onPress={onGetDirections}
          >
            <MaterialCommunityIcons name="directions" size={20} color="#4CAF50" />
            <Text style={[styles.bottomSheetActionText, { color: '#4CAF50' }]}>Get Directions</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.bottomSheetLoading}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={[styles.bottomSheetLoadingText, { color: theme.colors.text.secondary }]}>
              Loading arrivals...
            </Text>
          </View>
        ) : arrivals.length > 0 ? (
          <View style={styles.bottomSheetArrivals}>
            <Text style={[styles.bottomSheetArrivalsTitle, { color: theme.colors.text.primary }]}>
              Next Arrivals
            </Text>
            {(() => {
              // Group arrivals by routeId
              const groupedArrivals = arrivals.reduce((acc, arrival) => {
                if (!acc[arrival.routeId]) {
                  acc[arrival.routeId] = [];
                }
                acc[arrival.routeId].push(arrival);
                return acc;
              }, {});

              // Render grouped arrivals with beautiful card design
              return Object.entries(groupedArrivals).map(([routeId, routeArrivals]) => {
                const firstArrival = routeArrivals[0];
                
                return (
                  <View key={routeId} style={[styles.arrivalCard, { backgroundColor: theme.colors.background.default || '#F5F5F5' }]}>
                    {/* Route Header */}
                    <View style={styles.arrivalCardHeader}>
                      <View style={[styles.routeBadgeLarge, { backgroundColor: firstArrival.color }]}>
                        <Text style={styles.routeBadgeTextLarge}>{routeId}</Text>
                      </View>
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeNameLarge, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {firstArrival.routeName}
                        </Text>
                        <View style={styles.routeMetadata}>
                          {firstArrival.wheelchairAccessible && (
                            <View style={styles.metadataBadge}>
                              <MaterialCommunityIcons name="wheelchair-accessibility" size={12} color="#4CAF50" />
                            </View>
                          )}
                          {firstArrival.bikesAllowed && (
                            <View style={styles.metadataBadge}>
                              <MaterialCommunityIcons name="bike" size={12} color="#FF9800" />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {/* Arrival Times */}
                    <View style={styles.arrivalTimesContainer}>
                      {routeArrivals.slice(0, 3).map((arrival, idx) => {
                        const now = Date.now();
                        const minutesUntil = Math.round((arrival.arrivalTime - now) / 60000);
                        const displayTime = minutesUntil < 1 ? 'Now' : 
                                           minutesUntil < 0 ? `${Math.abs(minutesUntil)}m ago` :
                                           `${minutesUntil}`;
                        const isNow = minutesUntil < 1;
                        const isPast = minutesUntil < 0;
                        
                        return (
                          <View 
                            key={`${routeId}-${arrival.arrivalTime}-${idx}`} 
                            style={[
                              styles.arrivalTimeChip,
                              isNow && styles.arrivalTimeChipNow,
                              isPast && styles.arrivalTimeChipPast,
                              { borderColor: firstArrival.color }
                            ]}
                          >
                            <Text style={[
                              styles.arrivalTimeNumber,
                              isNow && styles.arrivalTimeNumberNow,
                              isPast && styles.arrivalTimeNumberPast,
                              { color: isNow ? '#FFF' : firstArrival.color }
                            ]}>
                              {displayTime}
                            </Text>
                            {!isPast && !isNow && (
                              <Text style={[styles.arrivalTimeUnit, { color: firstArrival.color }]}>min</Text>
                            )}
                            {arrival.delay > 0 && (
                              <View style={styles.delayBadge}>
                                <Text style={styles.delayText}>+{Math.round(arrival.delay / 60)}</Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                      {routeArrivals.length > 3 && (
                        <View style={styles.moreArrivals}>
                          <Text style={[styles.moreArrivalsText, { color: theme.colors.text.secondary }]}>
                            +{routeArrivals.length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        ) : (
          <View style={styles.bottomSheetNoArrivals}>
            <MaterialCommunityIcons name="bus-clock" size={48} color="#BDBDBD" />
            <Text style={[styles.bottomSheetNoArrivalsText, { color: theme.colors.text.secondary }]}>
              No upcoming arrivals
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 40,
  },
  bottomSheetStopName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bottomSheetStopCode: {
    fontSize: 14,
    marginBottom: 8,
  },
  bottomSheetStopFeatures: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  bottomSheetFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomSheetFeatureText: {
    fontSize: 12,
    color: '#666',
  },
  bottomSheetTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomSheetTimestampText: {
    fontSize: 11,
    color: '#757575',
    fontStyle: 'italic',
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  bottomSheetActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSheetActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSheetLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  bottomSheetLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  bottomSheetArrivals: {
    marginTop: 0,
    gap: 12,
  },
  bottomSheetArrivalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // New beautiful card design
  arrivalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  arrivalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  routeBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 56,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  routeBadgeTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routeInfo: {
    flex: 1,
  },
  routeNameLarge: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  routeMetadata: {
    flexDirection: 'row',
    gap: 6,
  },
  metadataBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 4,
  },
  arrivalTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  arrivalTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  arrivalTimeChipNow: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  arrivalTimeChipPast: {
    opacity: 0.5,
  },
  arrivalTimeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrivalTimeNumberNow: {
    color: '#FFF',
  },
  arrivalTimeNumberPast: {
    opacity: 0.6,
  },
  arrivalTimeUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  delayBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  delayText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreArrivals: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moreArrivalsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Legacy styles (kept for compatibility)
  bottomSheetArrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  bottomSheetRouteBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSheetRouteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSheetRouteName: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomSheetTripIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomSheetIconBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    padding: 3,
  },
  bottomSheetEtaContainer: {
    alignItems: 'flex-end',
  },
  bottomSheetEta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: 70,
    textAlign: 'right',
  },
  bottomSheetDelay: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  bottomSheetNoArrivals: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  bottomSheetNoArrivalsText: {
    fontSize: 14,
  },
});

export default StopDetailsBottomSheet;
