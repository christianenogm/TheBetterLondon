/**
 * AllBadgesScreen.js
 * US-1304: View All Available Badges
 *
 * Shows all 21 badges in a 2-column grid, grouped by category.
 * Earned badges are highlighted; locked badges are dimmed.
 * Tapping any badge shows its description and the user's progress.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BADGES } from '../services/gamificationService';

const { width } = Dimensions.get('window');
// 2 columns with 16 px side margins and 12 px column gap
const CARD_SIZE = (width - 16 * 2 - 12) / 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
  reportsCount:         'Reporter Journey',
  resolvedCount:        'Civic Impact',
  totalUpvotesReceived: 'Community Recognition',
  points:               'Points Milestones',
};

const formatRequirement = (badge) => {
  const { type, value } = badge.req;
  switch (type) {
    case 'reportsCount':          return `Submit ${value} report${value > 1 ? 's' : ''}`;
    case 'resolvedCount':         return `Get ${value} report${value > 1 ? 's' : ''} resolved`;
    case 'totalUpvotesReceived':  return `Receive ${value} upvote${value > 1 ? 's' : ''}`;
    case 'points':                return `Earn ${value} points`;
    default:                      return badge.description;
  }
};

// ─── Badge Card ───────────────────────────────────────────────────────────────

const BadgeCard = ({ badge, isEarned, profile, theme }) => {
  const handlePress = () => {
    const current = profile?.[badge.req.type] ?? 0;
    const progressLine = isEarned
      ? 'Earned! ✓'
      : `Progress: ${current} / ${badge.req.value}`;

    Alert.alert(
      `${badge.emoji}  ${badge.title}`,
      `${badge.description}\n\n${progressLine}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[
        cardS.card,
        {
          width: CARD_SIZE,
          backgroundColor: isEarned
            ? theme.colors.primary[50]
            : theme.colors.neutral[100],
          borderColor: isEarned
            ? theme.colors.primary[300]
            : theme.colors.neutral[300],
          opacity: isEarned ? 1 : 0.6,
        },
      ]}
    >
      <Text style={[cardS.emoji, { opacity: isEarned ? 1 : 0.45 }]}>
        {badge.emoji}
      </Text>
      <Text
        style={[
          cardS.title,
          {
            color: isEarned
              ? theme.colors.primary[700]
              : theme.colors.text.secondary,
          },
        ]}
        numberOfLines={1}
      >
        {badge.title}
      </Text>
      <Text
        style={[cardS.desc, { color: theme.colors.text.secondary }]}
        numberOfLines={2}
      >
        {formatRequirement(badge)}
      </Text>
      {isEarned && (
        <View style={[cardS.earnedTag, { backgroundColor: theme.colors.primary[500] }]}>
          <Text style={cardS.earnedText}>✓ Earned</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const cardS = StyleSheet.create({
  card: {
    borderWidth:    1.5,
    borderRadius:   14,
    padding:        14,
    alignItems:     'center',
    gap: 4,
  },
  emoji:     { fontSize: 32, marginBottom: 4 },
  title:     { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  desc:      { fontSize: 11, textAlign: 'center', lineHeight: 15 },
  earnedTag: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  earnedText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

// Group BADGES array into categories, preserving order
const buildCategories = () => {
  const map = {};
  for (const badge of BADGES) {
    const cat = badge.req.type;
    if (!map[cat]) map[cat] = [];
    map[cat].push(badge);
  }
  return Object.entries(map).map(([type, items]) => ({
    type,
    label: CATEGORY_LABELS[type],
    items,
  }));
};

const AllBadgesScreen = () => {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const earnedIds   = useMemo(() => new Set(user?.badges ?? []), [user?.badges]);
  const earnedCount = earnedIds.size;
  const totalCount  = BADGES.length;

  const categories = useMemo(() => buildCategories(), []);

  // Build a flat list that FlatList can render: header rows + paired badge rows
  const listData = useMemo(() => {
    const rows = [];
    for (const cat of categories) {
      const earnedInCat = cat.items.filter(b => earnedIds.has(b.id)).length;
      rows.push({
        type:  'header',
        key:   `h-${cat.type}`,
        label: cat.label,
        count: cat.items.length,
        earnedInCat,
      });
      for (let i = 0; i < cat.items.length; i += 2) {
        rows.push({
          type:  'row',
          key:   `r-${cat.type}-${i}`,
          left:  cat.items[i],
          right: cat.items[i + 1] ?? null,
        });
      }
    }
    return rows;
  }, [categories, earnedIds]);

  const s = makeStyles(theme, insets);

  return (
    <View style={s.container}>
      {/* Progress summary card */}
      <View style={[s.progressCard, { backgroundColor: theme.colors.primary[500] }]}>
        <Text style={s.progressLabel}>Badges Earned</Text>
        <Text style={s.progressValue}>{earnedCount} / {totalCount}</Text>
        <View style={s.progressBarBg}>
          <View
            style={[
              s.progressBarFill,
              { width: `${Math.round((earnedCount / totalCount) * 100)}%` },
            ]}
          />
        </View>
        <Text style={s.progressHint}>Tap any badge to see details and progress</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={s.catHeader}>
                <Text style={[s.catLabel, { color: theme.colors.text.primary }]}>
                  {item.label}
                </Text>
                <Text style={[s.catCount, { color: theme.colors.text.secondary }]}>
                  {item.earnedInCat} / {item.count}
                </Text>
              </View>
            );
          }

          return (
            <View style={s.pairRow}>
              <BadgeCard
                badge={item.left}
                isEarned={earnedIds.has(item.left.id)}
                profile={user}
                theme={theme}
              />
              {item.right ? (
                <BadgeCard
                  badge={item.right}
                  isEarned={earnedIds.has(item.right.id)}
                  profile={user}
                  theme={theme}
                />
              ) : (
                <View style={{ width: CARD_SIZE }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const makeStyles = (theme, insets) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.colors.neutral[50] },
  progressCard: { margin: 16, borderRadius: 16, padding: 20, alignItems: 'center', gap: 4 },
  progressLabel: {
    fontSize:      12,
    color:         'rgba(255,255,255,0.8)',
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue:   { fontSize: 32, fontWeight: '900', color: '#fff' },
  progressBarBg:   {
    width: '100%', height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius:  4,
    marginTop:     8,
    overflow:      'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  progressHint:    { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  catHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginTop:       20,
    marginBottom:    10,
  },
  catLabel: { fontSize: 15, fontWeight: '700' },
  catCount: { fontSize: 13 },
  pairRow:  { flexDirection: 'row', gap: 12, marginBottom: 12 },
});

export default AllBadgesScreen;
