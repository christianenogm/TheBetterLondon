/**
 * LeaderboardScreen.js
 * US-1305: See Leaderboard of Top Contributors
 *
 * Displays a ranked list of community contributors by points.
 * Placeholder data is shown until a live Firestore query is wired up.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getRankForPoints, getTopBadge } from '../services/gamificationService';
import { getLeaderboard } from '../services/userService';

// ─── Placeholder leaderboard data ─────────────────────────────────────────────

const PLACEHOLDER_DATA = [
  { id: '1',  name: 'Sarah M.',    points: 2840, badges: ['london-legend', 'peoples-choice', 'point-legend', 'city-fixer'] },
  { id: '2',  name: 'James T.',    points: 2510, badges: ['london-legend', 'community-star', 'point-legend', 'change-maker'] },
  { id: '3',  name: 'Priya K.',    points: 1980, badges: ['london-legend', 'trusted-voice',  'point-master', 'change-maker'] },
  { id: '4',  name: 'Daniel R.',   points: 1750, badges: ['urban-guardian','community-star', 'point-master', 'change-maker'] },
  { id: '5',  name: 'Emma W.',     points: 1420, badges: ['urban-guardian','trusted-voice',  'point-master', 'problem-solver'] },
  { id: '6',  name: 'Michael B.',  points: 1190, badges: ['urban-guardian','crowd-favourite','point-master', 'problem-solver'] },
  { id: '7',  name: 'Aisha N.',    points: 980,  badges: ['civic-champion','crowd-favourite','point-collector','impact-maker'] },
  { id: '8',  name: 'Tom H.',      points: 860,  badges: ['civic-champion','trusted-voice',  'point-collector','impact-maker'] },
  { id: '9',  name: 'Fatima A.',   points: 740,  badges: ['civic-champion','on-the-map',     'point-collector','point-seeker'] },
  { id: '10', name: 'Connor L.',   points: 680,  badges: ['civic-champion','crowd-favourite','point-collector','problem-solver'] },
  { id: '11', name: 'Mei-Ling C.', points: 560,  badges: ['community-helper','on-the-map',  'point-collector','first-steps'] },
  { id: '12', name: 'Kwame A.',    points: 490,  badges: ['community-helper','on-the-map',  'point-seeker',   'first-steps'] },
  { id: '13', name: 'Isabelle D.', points: 430,  badges: ['community-helper','on-the-map',  'point-seeker',   'first-steps'] },
  { id: '14', name: 'Ravi S.',     points: 380,  badges: ['community-helper','on-the-map',  'point-seeker',   'first-steps'] },
  { id: '15', name: 'Olivia N.',   points: 310,  badges: ['city-watcher',   'on-the-map',  'point-seeker',   'first-steps'] },
  { id: '16', name: 'Lucas P.',    points: 270,  badges: ['city-watcher',   'first-steps'] },
  { id: '17', name: 'Nadia F.',    points: 230,  badges: ['city-watcher',   'first-steps'] },
  { id: '18', name: 'Ethan B.',    points: 200,  badges: ['city-watcher',   'first-steps'] },
  { id: '19', name: 'Zara H.',     points: 170,  badges: ['city-watcher',   'first-steps'] },
  { id: '20', name: 'Marcus T.',   points: 140,  badges: ['first-steps'] },
];

const FILTER_TABS = ['All Time', 'This Month', 'This Week'];

// ─── Medal colours for top 3 ──────────────────────────────────────────────────

const MEDAL = {
  1: { color: '#FFD700', icon: 'trophy',        label: '1st' },
  2: { color: '#C0C0C0', icon: 'trophy-outline', label: '2nd' },
  3: { color: '#CD7F32', icon: 'trophy-outline', label: '3rd' },
};

// ─── Row component ────────────────────────────────────────────────────────────

const LeaderboardRow = ({ item, rank, isYou, theme }) => {
  const medal = MEDAL[rank];
  const topBadge = getTopBadge(item.badges);
  const rankInfo = getRankForPoints(item.points);

  return (
    <View style={[
      rowStyles.row,
      {
        backgroundColor: isYou
          ? theme.colors.primary[50]
          : theme.colors.neutral[0],
        borderColor: isYou
          ? theme.colors.primary[300]
          : theme.colors.border.default,
        borderWidth: isYou ? 1.5 : 1,
      },
    ]}>
      {/* Rank */}
      <View style={rowStyles.rankWrap}>
        {medal
          ? <Icon name={medal.icon} size={20} color={medal.color} />
          : <Text style={[rowStyles.rankNum, { color: theme.colors.text.secondary }]}>
              {rank}
            </Text>
        }
      </View>

      {/* Avatar placeholder */}
      <View style={[rowStyles.avatar, { backgroundColor: isYou ? theme.colors.primary[400] : rankInfo.color + '33' }]}>
        <Text style={[rowStyles.avatarText, { color: isYou ? '#fff' : rankInfo.color }]}>
          {isYou ? 'You' : item.name.charAt(0)}
        </Text>
      </View>

      {/* Name + badge */}
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.name, { color: theme.colors.text.primary }, isYou && { fontWeight: '700' }]}>
          {isYou ? `${item.name} (You)` : item.name}
        </Text>
        {topBadge && (
          <Text style={[rowStyles.badge, { color: theme.colors.text.secondary }]}>
            {topBadge.emoji} {topBadge.title}
          </Text>
        )}
      </View>

      {/* Points */}
      <View style={rowStyles.pointsWrap}>
        <Text style={[rowStyles.points, { color: isYou ? theme.colors.primary[600] : theme.colors.text.primary }]}>
          {item.points.toLocaleString()}
        </Text>
        <Text style={[rowStyles.ptLabel, { color: theme.colors.text.secondary }]}>pts</Text>
      </View>
    </View>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  rankWrap: { width: 28, alignItems: 'center' },
  rankNum: { fontSize: 14, fontWeight: '700' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '600' },
  badge: { fontSize: 11, marginTop: 1 },
  pointsWrap: { alignItems: 'flex-end' },
  points: { fontSize: 15, fontWeight: '700' },
  ptLabel: { fontSize: 10 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const LeaderboardScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('All Time');
  const [liveEntries, setLiveEntries]   = useState(null); // null = loading
  const [loadingData, setLoadingData]   = useState(true);

  useEffect(() => {
    getLeaderboard(50)
      .then(data => {
        setLiveEntries(data.length > 0 ? data : null);
      })
      .finally(() => setLoadingData(false));
  }, []);

  // Build the ranked list
  const fullData = useMemo(() => {
    if (liveEntries) {
      // Live data: sort by points, mark the current user
      return liveEntries
        .slice()
        .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
        .map(entry => ({
          ...entry,
          isYou: entry.id === user?.uid,
          name:  entry.id === user?.uid
            ? (entry.name ?? 'You')
            : (entry.name ?? 'Anonymous'),
        }));
    }

    // Placeholder fallback while loading or if Firestore is empty
    const userEntry = {
      id:     'current-user',
      name:   user?.name   ?? 'You',
      points: user?.points ?? 0,
      badges: user?.badges ?? [],
      isYou:  true,
    };
    const sorted = [...PLACEHOLDER_DATA].sort((a, b) => b.points - a.points);
    let insertAt = sorted.findIndex(e => userEntry.points >= e.points);
    if (insertAt === -1) insertAt = sorted.length;
    sorted.splice(insertAt, 0, userEntry);
    return sorted;
  }, [liveEntries, user]);

  const userRank = useMemo(
    () => fullData.findIndex(e => e.isYou) + 1,
    [fullData]
  );

  const s = makeStyles(theme, insets);

  return (
    <View style={s.container}>
      {/* Filter tabs */}
      <View style={s.tabRow}>
        {FILTER_TABS.map(tab => {
          const active = tab === activeFilter;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, active && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, { color: active ? '#fff' : theme.colors.text.secondary }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Your rank summary card */}
      <View style={[s.yourRankCard, { backgroundColor: theme.colors.primary[500] }]}>
        <View>
          <Text style={s.yourRankLabel}>Your Rank</Text>
          <Text style={s.yourRankValue}>#{userRank}</Text>
        </View>
        <View style={s.yourRankDivider} />
        <View>
          <Text style={s.yourRankLabel}>Your Points</Text>
          <Text style={s.yourRankValue}>{(user?.points ?? 0).toLocaleString()}</Text>
        </View>
        <View style={s.yourRankDivider} />
        <View>
          <Text style={s.yourRankLabel}>Rank Title</Text>
          <Text style={s.yourRankValue}>{getRankForPoints(user?.points ?? 0).label}</Text>
        </View>
      </View>

      {/* Note: This Month / This Week show placeholder data */}
      {(activeFilter !== 'All Time' || (!liveEntries && !loadingData)) && (
        <View style={[s.noteBanner, { backgroundColor: theme.colors.neutral[100] }]}>
          <Icon name="information-outline" size={14} color={theme.colors.text.secondary} />
          <Text style={[s.noteText, { color: theme.colors.text.secondary }]}>
            {activeFilter !== 'All Time'
              ? 'Showing sample data — live filtering coming soon'
              : 'Showing sample data — leaderboard unavailable'}
          </Text>
        </View>
      )}

      {loadingData ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ flex: 1, marginTop: 40 }} />
      ) : (
        <FlatList
          data={fullData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              item={item}
              rank={index + 1}
              isYou={item.isYou === true}
              theme={theme}
            />
          )}
        />
      )}
    </View>
  );
};

const makeStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  yourRankCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  yourRankLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  yourRankValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  yourRankDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
  },
});

export default LeaderboardScreen;
