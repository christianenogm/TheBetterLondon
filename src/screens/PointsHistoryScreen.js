/**
 * PointsHistoryScreen.js
 * US-1302: View My Points History
 *
 * Shows a chronological list of all point transactions for the current user,
 * with a total-points summary card at the top.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getPointsHistory } from '../services/userService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const reasonIcon = (reason = '') => {
  const r = reason.toLowerCase();
  if (r.includes('milestone'))  return { icon: 'star',         color: '#FF9800' };
  if (r.includes('resolved'))   return { icon: 'check-circle',  color: '#9C27B0' };
  if (r.includes('upvoted'))    return { icon: 'thumb-up',      color: '#2196F3' };
  if (r.includes('submitted'))  return { icon: 'file-plus',     color: '#4CAF50' };
  return                               { icon: 'star-circle',   color: '#9E9E9E' };
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    });
  } catch {
    return '';
  }
};

// ─── Row ──────────────────────────────────────────────────────────────────────

const HistoryRow = ({ item, theme }) => {
  const { icon, color } = reasonIcon(item.reason);

  return (
    <View style={[
      rowS.row,
      {
        backgroundColor: theme.colors.neutral[0],
        borderColor:     theme.colors.border.default,
      },
    ]}>
      <View style={[rowS.iconWrap, { backgroundColor: color + '18' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[rowS.reason, { color: theme.colors.text.primary }]}>
          {item.reason}
        </Text>
        <Text style={[rowS.date, { color: theme.colors.text.secondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text style={rowS.points}>+{item.points}</Text>
    </View>
  );
};

const rowS = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius:   12,
    borderWidth:    1,
    paddingHorizontal: 12,
    paddingVertical:   12,
  },
  iconWrap: {
    width:  40,
    height: 40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  reason:  { fontSize: 14, fontWeight: '500' },
  date:    { fontSize: 12, marginTop: 2 },
  points:  { fontSize: 18, fontWeight: '800', color: '#4CAF50' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const PointsHistoryScreen = () => {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getPointsHistory(user.uid);
    setHistory(data);
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => { load(); }, [load]);

  const totalPoints = user?.points ?? 0;
  const s = makeStyles(theme, insets);

  return (
    <View style={s.container}>
      {/* Total points card */}
      <View style={[s.totalCard, { backgroundColor: theme.colors.primary[500] }]}>
        <Text style={s.totalLabel}>Total Points Earned</Text>
        <Text style={s.totalValue}>{totalPoints.toLocaleString()}</Text>
        {!loading && (
          <Text style={s.totalSub}>{history.length} transaction{history.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[500]}
          style={{ marginTop: 40 }}
        />
      ) : history.length === 0 ? (
        <View style={s.empty}>
          <Icon name="star-outline" size={56} color={theme.colors.neutral[300]} />
          <Text style={[s.emptyTitle, { color: theme.colors.text.primary }]}>
            No Points Yet
          </Text>
          <Text style={[s.emptySub, { color: theme.colors.text.secondary }]}>
            Submit a report to start earning points!
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
          renderItem={({ item }) => <HistoryRow item={item} theme={theme} />}
        />
      )}
    </View>
  );
};

const makeStyles = (theme, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
  totalCard: {
    margin:       16,
    borderRadius: 16,
    padding:      20,
    alignItems:   'center',
    gap: 4,
  },
  totalLabel: {
    fontSize:       12,
    color:          'rgba(255,255,255,0.8)',
    fontWeight:     '600',
    textTransform:  'uppercase',
    letterSpacing:  0.5,
  },
  totalValue: {
    fontSize:   40,
    fontWeight: '900',
    color:      '#fff',
    marginVertical: 2,
  },
  totalSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub:   { fontSize: 14, textAlign: 'center' },
});

export default PointsHistoryScreen;
