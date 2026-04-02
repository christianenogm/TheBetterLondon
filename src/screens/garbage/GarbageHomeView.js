/**
 * GarbageHomeView.js
 * US-1102: View My Collection Calendar
 * US-1103: See Next Collection Prominently
 *
 * Shown when the user has a saved address.
 * Displays:
 *  - Next Collection card (prominent, updates daily)
 *  - Monthly calendar with color-coded dots per collection type
 *  - Tap a date → bottom detail panel shows what's being collected
 *  - "Change address" link
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { fetchZoneSchedule } from '../../services/garbageZoneService';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  scheduleZoneReminders,
  rescheduleIfEnabled,
  sendTestNotification,
  requestPermission,
} from '../../services/garbageNotificationService';
import {
  exportScheduleToCalendar,
  removeScheduleFromCalendar,
  isCalendarExported,
} from '../../services/calendarExportService';

// ─── Collection type config ────────────────────────────────────────────────────
const COLLECTION_TYPES = {
  '10':   { label: 'Garbage',              color: '#424242', icon: 'trash-can'     },
  '11':   { label: 'Garbage (3-Container)',color: '#424242', icon: 'trash-can-outline' },
  '20':   { label: 'Green Bin & Recycling',color: '#2E7D32', icon: 'recycle'       },
  '30':   { label: 'Yard Waste',           color: '#795548', icon: 'leaf'          },
  'STAT': { label: 'Holiday',              color: '#C62828', icon: 'calendar-star' },
};

function getTypeConfig(typeCode) {
  return COLLECTION_TYPES[typeCode] ?? { label: typeCode, color: '#9E9E9E', icon: 'circle' };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function relativeDay(dateStr) {
  const today = todayStr();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  const diff = Math.round(
    (new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24)
  );
  if (diff > 0 && diff <= 7) return `In ${diff} day${diff > 1 ? 's' : ''}`;

  // Fallback: format the date
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Build the `markedDates` object required by react-native-calendars multi-dot mode.
 * Also returns a lookup map (date → types[]) for the tap handler.
 */
function buildMarkedDates(schedule, selectedDate) {
  const markedDates = {};
  const dateTypeMap = {};

  for (const pickup of schedule) {
    const { date, types } = pickup;
    dateTypeMap[date] = types;

    const dots = types
      .filter(t => t.typeCode !== 'STAT') // holidays shown differently
      .map(t => ({ key: t.typeCode, color: getTypeConfig(t.typeCode).color }));

    markedDates[date] = {
      dots,
      // Mark holiday dates with a red background
      ...(types.some(t => t.typeCode === 'STAT')
        ? { marked: true, dotColor: '#C62828' }
        : {}),
      ...(date === selectedDate
        ? { selected: true, selectedColor: '#1565C0' }
        : {}),
    };
  }

  // Ensure selected date always has the selection style even if no pickups
  if (selectedDate && !markedDates[selectedDate]) {
    markedDates[selectedDate] = { selected: true, selectedColor: '#1565C0' };
  } else if (selectedDate && markedDates[selectedDate]) {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#1565C0' };
  }

  return { markedDates, dateTypeMap };
}

// ─── Next Collection Card ─────────────────────────────────────────────────────

const NextCollectionCard = ({ schedule, theme }) => {
  const today = todayStr();

  // Find the next non-holiday, non-STAT pickup from today
  const next = useMemo(() => {
    for (const pickup of schedule) {
      if (pickup.date < today) continue;
      const mainTypes = pickup.types.filter(t => t.typeCode !== 'STAT');
      if (mainTypes.length > 0) return { date: pickup.date, types: mainTypes };
    }
    return null;
  }, [schedule, today]);

  if (!next) return null;

  const dayLabel = relativeDay(next.date);
  const isUrgent = dayLabel === 'Today' || dayLabel === 'Tomorrow';
  const primaryType = getTypeConfig(next.types[0].typeCode);

  return (
    <View style={[
      cardStyles.card,
      { backgroundColor: isUrgent ? primaryType.color : theme.colors.neutral[0] },
    ]}>
      <View style={cardStyles.cardLeft}>
        <Icon
          name={primaryType.icon}
          size={32}
          color={isUrgent ? '#fff' : primaryType.color}
        />
      </View>
      <View style={cardStyles.cardBody}>
        <Text style={[cardStyles.cardLabel, { color: isUrgent ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }]}>
          Next Collection
        </Text>
        <Text style={[cardStyles.cardDay, { color: isUrgent ? '#fff' : theme.colors.text.primary }]}>
          {dayLabel}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {next.types.map(t => {
            const cfg = getTypeConfig(t.typeCode);
            return (
              <View
                key={t.typeCode}
                style={[
                  cardStyles.typePill,
                  {
                    backgroundColor: isUrgent
                      ? 'rgba(255,255,255,0.2)'
                      : cfg.color + '22',
                  },
                ]}
              >
                <Icon name={cfg.icon} size={12} color={isUrgent ? '#fff' : cfg.color} />
                <Text style={[cardStyles.typePillText, { color: isUrgent ? '#fff' : cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
    alignItems: 'center',
  },
  cardLeft: { justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDay: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  typePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  typePillText: { fontSize: 11, fontWeight: '600' },
});

// ─── Selected date detail panel ────────────────────────────────────────────────

const DateDetailPanel = ({ date, types, theme }) => {
  if (!date || !types || types.length === 0) return null;

  const d = new Date(date + 'T00:00:00');
  const label = d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <View style={[detailStyles.panel, { backgroundColor: theme.colors.neutral[0], borderTopColor: theme.colors.border.default }]}>
      <Text style={[detailStyles.dateLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
      {types.map(t => {
        const cfg = getTypeConfig(t.typeCode);
        return (
          <View key={t.typeCode} style={detailStyles.typeRow}>
            <View style={[detailStyles.dot, { backgroundColor: cfg.color }]} />
            <Icon name={cfg.icon} size={18} color={cfg.color} />
            <View style={{ flex: 1 }}>
              <Text style={[detailStyles.typeName, { color: theme.colors.text.primary }]}>
                {t.isHoliday ? `${t.holidayName ?? 'Holiday'} — No Regular Collection` : cfg.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const detailStyles = StyleSheet.create({
  panel: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = ({ theme }) => (
  <View style={[legendStyles.row, { borderBottomColor: theme.colors.border.default }]}>
    {Object.entries(COLLECTION_TYPES)
      .filter(([code]) => code !== '11') // skip the 3-container variant in legend
      .map(([code, cfg]) => (
        <View key={code} style={legendStyles.item}>
          <View style={[legendStyles.dot, { backgroundColor: cfg.color }]} />
          <Text style={[legendStyles.label, { color: theme.colors.text.secondary }]}>{cfg.label}</Text>
        </View>
      ))}
  </View>
);

const legendStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:  { width: 10, height: 10, borderRadius: 5 },
  label:{ fontSize: 11, fontWeight: '500' },
});

// ─── Notification Section ─────────────────────────────────────────────────────

const TIMING_OPTIONS = [
  { value: 'evening_before', label: 'Evening Before', sub: '8:00 PM the night before' },
  { value: 'morning_of',     label: 'Morning Of',     sub: '7:00 AM on collection day' },
];

const NotificationSection = ({ schedule, notifPrefs, onPrefsChange, theme }) => {
  const [testing, setTesting] = useState(false);

  const handleToggle = useCallback(async (value) => {
    if (value) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications for TheBetterLondon in your device Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    const next = { ...notifPrefs, enabled: value };
    onPrefsChange(next);
    await scheduleZoneReminders(schedule, next);
  }, [notifPrefs, schedule, onPrefsChange]);

  const handleTiming = useCallback(async (timing) => {
    const next = { ...notifPrefs, timing };
    onPrefsChange(next);
    await scheduleZoneReminders(schedule, next);
  }, [notifPrefs, schedule, onPrefsChange]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    try {
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert('Test Sent', 'A test notification will arrive in ~5 seconds.');
      } else {
        Alert.alert('Permission Required', 'Notifications are not permitted on this device.');
      }
    } catch (err) {
      Alert.alert('Error', err.message ?? 'Could not send test notification.');
    } finally {
      setTesting(false);
    }
  }, []);

  return (
    <View style={[notifStyles.section, { backgroundColor: theme.colors.neutral[0], borderColor: theme.colors.border.default }]}>
      {/* Toggle row */}
      <View style={notifStyles.row}>
        <Icon name="bell-outline" size={20} color={theme.colors.primary[500]} />
        <View style={{ flex: 1 }}>
          <Text style={[notifStyles.rowLabel, { color: theme.colors.text.primary }]}>
            Collection Reminders
          </Text>
          <Text style={[notifStyles.rowSub, { color: theme.colors.text.secondary }]}>
            Get notified before each pickup
          </Text>
        </View>
        <Switch
          value={notifPrefs.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#ccc', true: theme.colors.primary[400] }}
          thumbColor={notifPrefs.enabled ? theme.colors.primary[600] : '#f4f3f4'}
        />
      </View>

      {/* Timing selector — only visible when enabled */}
      {notifPrefs.enabled && (
        <>
          <View style={[notifStyles.divider, { backgroundColor: theme.colors.border.default }]} />
          <Text style={[notifStyles.timingHeading, { color: theme.colors.text.secondary }]}>
            REMIND ME
          </Text>
          <View style={notifStyles.timingRow}>
            {TIMING_OPTIONS.map(opt => {
              const active = notifPrefs.timing === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    notifStyles.timingChip,
                    {
                      borderColor: active ? theme.colors.primary[500] : theme.colors.border.default,
                      backgroundColor: active ? theme.colors.primary[50] : theme.colors.neutral[0],
                    },
                  ]}
                  onPress={() => handleTiming(opt.value)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={opt.value === 'evening_before' ? 'weather-night' : 'weather-sunny'}
                    size={16}
                    color={active ? theme.colors.primary[600] : theme.colors.text.secondary}
                  />
                  <View>
                    <Text style={[notifStyles.chipLabel, { color: active ? theme.colors.primary[700] : theme.colors.text.primary }]}>
                      {opt.label}
                    </Text>
                    <Text style={[notifStyles.chipSub, { color: theme.colors.text.secondary }]}>
                      {opt.sub}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Test notification button */}
          <TouchableOpacity
            style={[notifStyles.testBtn, { borderColor: theme.colors.primary[300] }, { display: 'none' }]}
            onPress={handleTest}
            disabled={testing}
            activeOpacity={0.7}
          >
            {testing
              ? <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              : <Icon name="bell-ring-outline" size={15} color={theme.colors.primary[600]} />
            }
            <Text style={[notifStyles.testBtnText, { color: theme.colors.primary[600] }]}>
              {testing ? 'Sending…' : 'Send test notification'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const notifStyles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  timingHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  timingChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipSub: {
    fontSize: 10,
    marginTop: 1,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

// ─── Main View ────────────────────────────────────────────────────────────────

const GarbageHomeView = ({ savedAddress, onChangeAddress }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({ enabled: false, timing: 'evening_before' });

  const today = todayStr();
  const currentMonth = today.slice(0, 7); // "YYYY-MM"

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, prefs] = await Promise.all([
          fetchZoneSchedule(savedAddress.zoneDocId),
          loadNotificationPrefs(),
        ]);
        if (cancelled) return;
        setSchedule(data);
        setNotifPrefs(prefs);
        // Refresh scheduled notifications on every app open
        if (prefs.enabled) rescheduleIfEnabled(data).catch(() => {});
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [savedAddress.zoneDocId]);

  const handlePrefsChange = useCallback(async (next) => {
    setNotifPrefs(next);
    await saveNotificationPrefs(next);
  }, []);

  const [calExported, setCalExported] = useState(false);
  const [calBusy, setCalBusy] = useState(false);

  // Load persisted export state alongside schedule
  useEffect(() => {
    isCalendarExported().then(setCalExported).catch(() => {});
  }, [savedAddress.zoneDocId]);

  const handleAddToCalendar = useCallback(async () => {
    setCalBusy(true);
    try {
      const { created } = await exportScheduleToCalendar(schedule);
      setCalExported(true);
      Alert.alert(
        'Added to Calendar',
        `${created} collection day${created !== 1 ? 's' : ''} added to your "Garbage Collection" calendar for the next 3 months.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Could Not Add', err.message ?? 'Calendar access was denied.');
    } finally {
      setCalBusy(false);
    }
  }, [schedule]);

  const handleRemoveFromCalendar = useCallback(async () => {
    Alert.alert(
      'Remove from Calendar',
      'This will delete all garbage collection events from your calendar. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setCalBusy(true);
            try {
              await removeScheduleFromCalendar();
              setCalExported(false);
              Alert.alert('Removed', 'Garbage collection events have been removed from your calendar.');
            } catch (err) {
              Alert.alert('Could Not Remove', err.message ?? 'Something went wrong.');
            } finally {
              setCalBusy(false);
            }
          },
        },
      ]
    );
  }, []);

  const { markedDates, dateTypeMap } = useMemo(
    () => buildMarkedDates(schedule, selectedDate),
    [schedule, selectedDate]
  );

  const handleDayPress = useCallback((day) => {
    setSelectedDate(prev => (prev === day.dateString ? null : day.dateString));
  }, []);

  const s = makeStyles(theme, insets);

  return (
    <View style={s.container}>
      {/* Address header */}
      <View style={s.addressBar}>
        <Icon name="map-marker" size={16} color={theme.colors.primary[500]} />
        <Text style={s.addressText} numberOfLines={1}>{savedAddress.address}</Text>
        <View style={[s.zoneBadge, { backgroundColor: theme.colors.primary[100] }]}>
          <Text style={[s.zoneBadgeText, { color: theme.colors.primary[700] }]}>
            {savedAddress.zone}
          </Text>
        </View>
        <TouchableOpacity onPress={onChangeAddress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[s.changeLink, { color: theme.colors.primary[500] }]}>Change</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[s.loadingText, { color: theme.colors.text.secondary }]}>
            Loading your schedule…
          </Text>
        </View>
      ) : error ? (
        <View style={s.errorWrap}>
          <Icon name="alert-circle-outline" size={32} color={theme.colors.error} />
          <Text style={[s.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => { setError(null); setLoading(true); Promise.all([fetchZoneSchedule(savedAddress.zoneDocId), loadNotificationPrefs()]).then(([data, prefs]) => { setSchedule(data); setNotifPrefs(prefs); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }}>
            <Text style={{ color: theme.colors.primary[500], fontWeight: '600', marginTop: 8 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Next Collection widget */}
          <View style={{ paddingTop: 12 }}>
            <NextCollectionCard schedule={schedule} theme={theme} />
          </View>

          {/* Legend */}
          <Legend theme={theme} />

          {/* Notification reminders (US-1201, US-1202) */}
          <NotificationSection
            schedule={schedule}
            notifPrefs={notifPrefs}
            onPrefsChange={handlePrefsChange}
            theme={theme}
          />

          {/* Calendar */}
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            minDate={today}
            maxDate={schedule.length > 0 ? schedule[schedule.length - 1].date : undefined}
            initialDate={currentMonth + '-01'}
            theme={{
              backgroundColor: theme.colors.neutral[0],
              calendarBackground: theme.colors.neutral[0],
              textSectionTitleColor: theme.colors.text.secondary,
              selectedDayBackgroundColor: '#1565C0',
              selectedDayTextColor: '#fff',
              todayTextColor: '#fff',
              todayBackgroundColor: '#2E7D32',
              dayTextColor: theme.colors.text.primary,
              textDisabledColor: theme.colors.neutral[400],
              dotColor: theme.colors.primary[500],
              selectedDotColor: '#fff',
              dotStyle: {
                width: 8,
                height: 8,
                borderRadius: 4,
                marginTop: 1,
              },
              arrowColor: theme.colors.primary[500],
              monthTextColor: theme.colors.text.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />

          {/* Selected date detail */}
          {selectedDate && (
            <DateDetailPanel
              date={selectedDate}
              types={dateTypeMap[selectedDate] || []}
              theme={theme}
            />
          )}

          {/* Add / Remove Calendar (US-1204) */}
          <TouchableOpacity
            style={[
              calExportStyles.btn,
              calExported
                ? { borderColor: '#C62828', backgroundColor: theme.colors.neutral[0] }
                : { borderColor: theme.colors.primary[300], backgroundColor: theme.colors.neutral[0] },
            ]}
            onPress={calExported ? handleRemoveFromCalendar : handleAddToCalendar}
            disabled={calBusy}
            activeOpacity={0.7}
          >
            {calBusy
              ? <ActivityIndicator size="small" color={calExported ? '#C62828' : theme.colors.primary[500]} />
              : <Icon
                  name={calExported ? 'calendar-remove' : 'calendar-plus'}
                  size={18}
                  color={calExported ? '#C62828' : theme.colors.primary[600]}
                />
            }
            <Text style={[calExportStyles.btnText, { color: calExported ? '#C62828' : theme.colors.primary[700] }]}>
              {calBusy
                ? (calExported ? 'Removing…' : 'Adding to Calendar…')
                : (calExported ? 'Remove from My Calendar' : 'Add to My Calendar')
              }
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const makeStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
    },
    addressBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.neutral[0],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    addressText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    zoneBadge: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    zoneBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    changeLink: {
      fontSize: 13,
      fontWeight: '600',
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
    },
    errorWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 32,
    },
    errorText: {
      fontSize: 14,
      textAlign: 'center',
    },
  });

const calExportStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GarbageHomeView;
