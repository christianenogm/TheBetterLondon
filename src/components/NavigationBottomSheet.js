/**
 * NavigationBottomSheet - Modern redesign
 * Active navigation UI with step-by-step instructions
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, elevation } from '../utils/designSystem';

const getTextColor = (bgColor) => {
  if (!bgColor || bgColor === 'transparent') return '#FFFFFF';
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const fmtDist = (meters) => {
  if (!meters) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const fmtTime = (seconds) => {
  if (!seconds) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
};

const stepIcon = (step) => {
  if (step.type === 'walk') return 'walk';
  if (step.type === 'transit') return 'bus';
  return 'map-marker-check';
};

const stepAccent = (step) => {
  if (step.type === 'walk') return '#607D8B';
  if (step.type === 'transit') return (step.line && step.line.color) || colors.primary.main;
  return colors.secondary.main;
};

const NavigationBottomSheet = ({
  route,
  currentStepIndex = 0,
  onEndNavigation,
  onNextStep,
  onMinimize,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (!route || !route.steps || route.steps.length === 0) return null;

  const currentStep = route.steps[currentStepIndex];
  const nextStep = currentStepIndex < route.steps.length - 1
    ? route.steps[currentStepIndex + 1] : null;
  const isLastStep = currentStepIndex === route.steps.length - 1;
  const progress = (currentStepIndex + 1) / route.steps.length;
  const accent = stepAccent(currentStep);

  const { remDist, remTime } = useMemo(() => {
    let d = 0; let t = 0;
    for (let i = currentStepIndex; i < route.steps.length; i++) {
      d += route.steps[i].distance || 0;
      t += route.steps[i].duration || 0;
    }
    return { remDist: d, remTime: t };
  }, [route.steps, currentStepIndex]);

  return (
    <View style={styles.container}>
      {/* Step progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: accent }]} />
      </View>

      {/* Hero gradient card — current step */}
      <LinearGradient colors={[accent, accent + 'BB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity onPress={onMinimize} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="chevron-down" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>Step {currentStepIndex + 1} / {route.steps.length}</Text>
          </View>
          <TouchableOpacity onPress={onEndNavigation} style={styles.endBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={16} color="#fff" />
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <Animated.View style={[styles.heroIconWrap, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialCommunityIcons name={stepIcon(currentStep)} size={34} color={accent} />
          </Animated.View>
          <View style={styles.heroText}>
            <Text style={styles.heroInstruction} numberOfLines={3}>{currentStep.instruction}</Text>
            {currentStep.type === 'transit' && currentStep.line && (
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <MaterialCommunityIcons name="bus" size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>{currentStep.line.shortName || currentStep.line.name}</Text>
                </View>
                {currentStep.headsign ? <Text style={styles.heroHeadsign}>to {currentStep.headsign}</Text> : null}
              </View>
            )}
            <View style={styles.heroMeta}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{fmtDist(currentStep.distance)}</Text>
              <View style={styles.metaDot} />
              <MaterialCommunityIcons name="clock-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{fmtTime(currentStep.duration)}</Text>
            </View>
          </View>
        </View>

        {/* ETA summary bar */}
        <View style={styles.etaBar}>
          <View style={styles.etaItem}>
            <MaterialCommunityIcons name="timer-outline" size={15} color="rgba(255,255,255,0.7)" />
            <Text style={styles.etaValue}>{fmtTime(remTime)}</Text>
            <Text style={styles.etaLabel}>remaining</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <MaterialCommunityIcons name="map-marker-path" size={15} color="rgba(255,255,255,0.7)" />
            <Text style={styles.etaValue}>{fmtDist(remDist)}</Text>
            <Text style={styles.etaLabel}>left</Text>
          </View>
          {!isLastStep && (
            <>
              <View style={styles.etaDivider} />
              <TouchableOpacity style={styles.nextStepBtn} onPress={onNextStep}>
                <Text style={styles.nextStepBtnText}>Next</Text>
                <MaterialCommunityIcons name="chevron-right" size={15} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>

      {/* Next step preview strip */}
      {nextStep && (
        <View style={styles.nextPreview}>
          <MaterialCommunityIcons name="arrow-right-thin" size={17} color={colors.text.hint} />
          <MaterialCommunityIcons name={stepIcon(nextStep)} size={15} color={stepAccent(nextStep)} />
          <Text style={styles.nextPreviewText} numberOfLines={1}>{nextStep.instruction}</Text>
        </View>
      )}

      {/* All steps timeline */}
      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepsListContent}>
        {route.steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const ac = stepAccent(step);
          return (
            <View key={`step-${index}`} style={styles.stepRow}>
              <View style={styles.timeline}>
                <View style={[
                  styles.timelineDot,
                  isCurrent && { backgroundColor: ac, width: 14, height: 14, borderRadius: 7 },
                  isCompleted && { backgroundColor: colors.secondary.main },
                  !isCurrent && !isCompleted && { backgroundColor: colors.border.light },
                ]}>
                  {isCompleted && <MaterialCommunityIcons name="check" size={8} color="#fff" />}
                </View>
                {index < route.steps.length - 1 && (
                  <View style={[styles.timelineLine, isCompleted && { backgroundColor: colors.secondary.main }]} />
                )}
              </View>
              <View style={[
                styles.stepContent,
                isCurrent ? { opacity: 1 } : isCompleted ? { opacity: 0.45 } : { opacity: 0.65 },
              ]}>
                <View style={styles.stepIconCircle}>
                  <MaterialCommunityIcons
                    name={isCompleted ? 'check' : stepIcon(step)}
                    size={13}
                    color={isCompleted ? colors.secondary.main : ac}
                  />
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepInstruction, isCurrent && styles.stepInstructionActive]} numberOfLines={2}>
                    {step.instruction}
                  </Text>
                  {step.type === 'transit' && step.line && (
                    <View style={[styles.miniRouteBadge, { backgroundColor: step.line.color || colors.primary.main }]}>
                      <Text style={[styles.miniRouteBadgeText, { color: getTextColor(step.line.color || colors.primary.main) }]}>
                        {step.line.shortName || step.line.name}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.stepMeta}>{fmtDist(step.distance)} · {fmtTime(step.duration)}</Text>
                </View>
              </View>
            </View>
          );
        })}
        {isLastStep && (
          <View style={styles.arrivedBanner}>
            <MaterialCommunityIcons name="map-marker-check" size={22} color={colors.secondary.main} />
            <Text style={styles.arrivedText}>Arriving at destination</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '58%',
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...elevation.high,
    overflow: 'hidden',
  },
  progressTrack: { height: 3, backgroundColor: colors.border.light, width: '100%' },
  progressFill: { height: 3, borderRadius: 2 },
  heroCard: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconBtn: { padding: spacing.xs },
  stepCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full,
  },
  stepCounterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  endBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: borderRadius.md, gap: 3,
  },
  endBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroContent: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  heroIconWrap: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...elevation.medium,
  },
  heroText: { flex: 1 },
  heroInstruction: { color: '#fff', fontSize: 17, fontWeight: '700', lineHeight: 23, marginBottom: spacing.xs },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs, flexWrap: 'wrap' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full, gap: 4,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroHeadsign: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontStyle: 'italic' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 2 },
  etaBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  etaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  etaValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
  etaLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  etaDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: spacing.sm },
  nextStepBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: borderRadius.md, gap: 2,
  },
  nextStepBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  nextPreview: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.background.default,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  nextPreviewText: { flex: 1, fontSize: 13, color: colors.text.secondary },
  stepsList: { flex: 1, paddingHorizontal: spacing.md },
  stepsListContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  stepRow: { flexDirection: 'row', gap: spacing.sm },
  timeline: { alignItems: 'center', width: 20, paddingTop: 5 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border.light, marginVertical: 3, minHeight: 24 },
  stepContent: { flex: 1, flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.md },
  stepIconCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepBody: { flex: 1 },
  stepInstruction: { fontSize: 13, color: colors.text.secondary, marginBottom: 2, lineHeight: 18 },
  stepInstructionActive: { fontSize: 14, color: colors.text.primary, fontWeight: '600' },
  miniRouteBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full, marginBottom: 3 },
  miniRouteBadgeText: { fontSize: 11, fontWeight: '700' },
  stepMeta: { fontSize: 11, color: colors.text.hint },
  arrivedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg, marginTop: spacing.md, marginBottom: spacing.md,
  },
  arrivedText: { fontSize: 15, color: colors.secondary.main, fontWeight: '600' },
});

export default NavigationBottomSheet;
