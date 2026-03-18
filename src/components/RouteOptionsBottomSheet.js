/**
 * RouteOptionsBottomSheet - Modern redesign
 * Route selection UI for transit navigation
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, elevation } from '../utils/designSystem';
import {
  formatDuration,
  formatDistance,
  formatTime,
  sortRoutes,
} from '../services/googleDirectionsService';

const getTextColor = (hexColor) => {
  if (!hexColor) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const SORT_OPTIONS = [
  { key: 'fastest', label: 'Fastest', icon: 'lightning-bolt' },
  { key: 'least_walking', label: 'Less walking', icon: 'walk' },
  { key: 'fewest_transfers', label: 'Fewer transfers', icon: 'transfer' },
];

// ── Route Card ────────────────────────────────────────────────────────────────
const RouteCard = ({ route, isSelected, isRecommended, onPress, onStart }) => {
  const [expanded, setExpanded] = useState(false);
  const { overview, steps } = route;
  const transitSteps = steps ? steps.filter(s => s.type === 'transit') : [];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={[styles.routeCard, isSelected && styles.routeCardSelected]}>
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <MaterialCommunityIcons name="star" size={10} color="#fff" />
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}

      {/* Duration + meta */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.durationText}>{formatDuration(overview && overview.totalDuration)}</Text>
          <Text style={styles.durationSub}>Arrive {formatTime(overview && overview.arrivalTime)}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {overview && overview.fare && (
            <View style={styles.fareBadge}>
              <MaterialCommunityIcons name="ticket-outline" size={12} color={colors.primary.main} />
              <Text style={styles.fareText}>{overview.fare}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="walk" size={13} color={colors.text.secondary} />
              <Text style={styles.metaChipText}>{formatDistance(overview && overview.walkingDistance)}</Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="transfer" size={13} color={colors.text.secondary} />
              <Text style={styles.metaChipText}>{(overview && overview.numberOfTransfers) || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Transit badges timeline */}
      {transitSteps.length > 0 && (
        <View style={styles.transitBadgesRow}>
          <Text style={styles.timeLabelText}>{formatTime(overview && overview.departureTime)}</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.text.hint} style={{ marginHorizontal: 4 }} />
          {transitSteps.map((step, i) => {
            const bg = (step.line && step.line.color) || colors.primary.main;
            const cleanedBg = bg.replace('#', '');
            cleanedBg.startsWith('#') ? cleanedBg : `#${cleanedBg}`;

            // const tc = getTextColor(cleanedBg);
            const tc = cleanedBg

            // console.log('tc: ', tc)

            return (
              <React.Fragment key={i}>
                <View style={[styles.transitBadge, { backgroundColor: bg }]}>
                  <MaterialCommunityIcons name="bus" size={11} color={tc} />
                  <Text style={[styles.transitBadgeText, { color: tc }]}>
                    {(step.line && (step.line.shortName || step.line.name)) || '?'}
                  </Text>
                </View>
                {i < transitSteps.length - 1 && (
                  <MaterialCommunityIcons name="dots-horizontal" size={14} color={colors.text.hint} style={{ marginHorizontal: 2 }} />
                )}
              </React.Fragment>
            );
          })}
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.text.hint} style={{ marginHorizontal: 4 }} />
          <Text style={styles.timeLabelText}>{formatTime(overview && overview.arrivalTime)}</Text>
        </View>
      )}

      {/* Expand toggle */}
      <TouchableOpacity style={styles.expandRow} onPress={() => setExpanded(!expanded)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.expandLabel}>{expanded ? 'Hide details' : 'Show details'}</Text>
        <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary.main} />
      </TouchableOpacity>

      {/* Expanded step-by-step */}
      {expanded && steps && (
        <View style={styles.stepDetails}>
          {steps.map((step, i) => {
            const isTransit = step.type === 'transit';
            const bg = isTransit ? ((step.line && step.line.color) || colors.primary.main) : 'transparent';
            return (
              <View key={i} style={styles.detailRow}>
                <View style={[styles.detailDot, isTransit && { backgroundColor: bg, width: 10, height: 10, borderRadius: 5 }]}>
                  {!isTransit && <View style={styles.detailDotInner} />}
                </View>
                {i < steps.length - 1 && <View style={[styles.detailLine, isTransit && { backgroundColor: bg }]} />}
                <View style={styles.detailContent}>
                  {isTransit && step.line && (
                    <View style={[styles.detailBadge, { backgroundColor: bg }]}>
                      <Text style={[styles.detailBadgeText, { color: getTextColor(bg) }]}>
                        {step.line.shortName || step.line.name}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.detailInstruction}>{step.instruction}</Text>
                  {step.departureStop && step.departureStop.name && (
                    <Text style={styles.detailStop}>
                      {step.departureStop.name}{step.numberOfStops ? ` · ${step.numberOfStops} stops` : ''}
                    </Text>
                  )}
                  <Text style={styles.detailMeta}>{formatDistance(step.distance)} · {formatDuration(step.duration)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Start navigation button — shown when card is selected */}
      {isSelected && (
        <TouchableOpacity onPress={() => onStart(route.id)} activeOpacity={0.85} style={styles.startBtnWrap}>
          <LinearGradient colors={[colors.secondary.main, '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
            <MaterialCommunityIcons name="navigation" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Start Navigation</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ── Main Sheet ────────────────────────────────────────────────────────────────
const RouteOptionsBottomSheet = ({
  routes,
  destination,
  loading,
  error,
  onRouteSelect,
  onStartNavigation,
  onClose,
  selectedRouteId,
}) => {
  const [sortBy, setSortBy] = useState('fastest');

  const sortedRoutes = useMemo(() => {
    if (!routes || routes.length === 0) return [];
    return sortRoutes(routes, sortBy);
  }, [routes, sortBy]);

  return (
    <View style={styles.container}>
      <View style={styles.dragHandle} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.destinationIcon}>
            <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary.main} />
          </View>
          <View>
            <Text style={styles.headerLabel}>Routes to</Text>
            <Text style={styles.headerDestination} numberOfLines={1}>
              {(destination && (destination.name || destination.address)) || destination || 'Destination'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Sort chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortChipsContainer} style={styles.sortChipsScroll}>
        {SORT_OPTIONS.map(opt => {
          const active = sortBy === opt.key;
          return (
            <TouchableOpacity key={opt.key} style={[styles.sortChip, active && styles.sortChipActive]} onPress={() => setSortBy(opt.key)}>
              <MaterialCommunityIcons name={opt.icon} size={14} color={active ? '#fff' : colors.text.secondary} />
              <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{opt.label || 'None'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.stateText}>Finding routes…</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.error.main} />
            <Text style={[styles.stateText, { color: colors.error.main }]}>Could not load routes</Text>
            <Text style={styles.stateSubText}>{error}</Text>
          </View>
        ) : sortedRoutes.length === 0 ? (
          <View style={styles.centeredState}>
            <MaterialCommunityIcons name="bus-alert" size={36} color={colors.text.hint} />
            <Text style={styles.stateText}>No routes found</Text>
            <Text style={styles.stateSubText}>Try a different destination or time</Text>
          </View>
        ) : (
          <ScrollView style={styles.routesList} showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.routesListContent}>
            <Text style={styles.resultsCount}>
              {sortedRoutes.length} route{sortedRoutes.length !== 1 ? 's' : ''} found
            </Text>
            {sortedRoutes.map((route, index) => (
              <RouteCard
                key={route.id || index}
                route={route}
                index={index}
                isSelected={selectedRouteId === (route.id || index.toString())}
                isRecommended={index === 0}
                onPress={() => onRouteSelect(route.id || index.toString())}
                onStart={onStartNavigation}
              />
            ))}
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '75%',
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...elevation.high,
    flex: 1,
  },
  dragHandle: {
    width: 36, height: 4, backgroundColor: colors.border.light, borderRadius: 2,
    alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  destinationIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary.main + '18', alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: { fontSize: 11, color: colors.text.hint, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerDestination: { fontSize: 15, fontWeight: '700', color: colors.text.primary, maxWidth: 220 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface.elevated, alignItems: 'center', justifyContent: 'center',
  },
  sortChipsScroll: { flexGrow: 0, flexShrink: 0 },
  sortChipsContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.sm, paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1, borderColor: colors.border.light,
    marginRight: spacing.xs,
  },
  sortChipActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  sortChipText: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
  sortChipTextActive: { color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: spacing.xs },
  contentArea: { flex: 1, minHeight: 0 },
  resultsCount: { fontSize: 12, color: colors.text.hint, fontWeight: '500', marginBottom: spacing.sm },
  centeredState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 48, paddingHorizontal: spacing.xl, gap: spacing.sm,
  },
  stateText: { fontSize: 15, fontWeight: '600', color: colors.text.secondary, textAlign: 'center' },
  stateSubText: { fontSize: 13, color: colors.text.hint, textAlign: 'center' },
  routesList: { flex: 1 },
  routesListContent: {
    paddingTop: spacing.xs, paddingBottom: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  routeCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: 'transparent',
    ...elevation.low, marginBottom: spacing.sm, overflow: 'visible',
  },
  routeCardSelected: { borderColor: colors.primary.main, backgroundColor: colors.primary.main + '08' },
  recommendedBadge: {
    position: 'absolute', top: -1, right: 12,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: borderRadius.sm, borderBottomRightRadius: borderRadius.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  recommendedText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: spacing.sm, marginTop: spacing.xs,
  },
  durationText: { fontSize: 24, fontWeight: '800', color: colors.text.primary, lineHeight: 28 },
  durationSub: { fontSize: 12, color: colors.text.hint, marginTop: 1 },
  cardHeaderRight: { alignItems: 'flex-end', gap: spacing.xs },
  fareBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full,
  },
  fareText: { fontSize: 12, fontWeight: '600', color: colors.primary.main },
  metaRow: { flexDirection: 'row', gap: spacing.xs },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full,
  },
  metaChipText: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },
  transitBadgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: spacing.sm, gap: 4 },
  timeLabelText: { fontSize: 12, color: colors.text.hint, fontWeight: '500' },
  transitBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm,
  },
  transitBadgeText: { fontSize: 11, fontWeight: '700' },
  expandRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border.light, marginTop: spacing.xs,
  },
  expandLabel: { fontSize: 13, color: colors.primary.main, fontWeight: '500', flex: 1 },
  stepDetails: { marginTop: spacing.md, paddingLeft: 6 },
  detailRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.md },
  detailDot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  detailDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9E9E9E' },
  detailLine: {
    position: 'absolute', left: 7, top: 18, width: 2, bottom: 0,
    backgroundColor: colors.border.light, zIndex: -1,
  },
  detailContent: { flex: 1 },
  detailBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm, marginBottom: 3 },
  detailBadgeText: { fontSize: 11, fontWeight: '700' },
  detailInstruction: { fontSize: 13, color: colors.text.primary, fontWeight: '500', marginBottom: 2 },
  detailStop: { fontSize: 11, color: colors.text.hint, marginBottom: 2 },
  detailMeta: { fontSize: 11, color: colors.text.hint },
  startBtnWrap: { marginTop: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: spacing.sm },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});

export default RouteOptionsBottomSheet;
