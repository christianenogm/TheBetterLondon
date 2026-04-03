/**
 * garbageNotificationService.js
 * Epic 12: Garbage Collection Reminders
 * US-1201: Local scheduled push notifications
 * US-1202: Customizable reminder timing
 *
 * Schedules on-device reminders for upcoming garbage collection pickups.
 * iOS allows max 64 pending notifications — we schedule the nearest 20 pickups.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@garbage_notification_prefs';
const NOTIF_ID_PREFIX = 'garbage_reminder_';
const MAX_SCHEDULED = 20;

export const DEFAULT_PREFS = {
  enabled: false,
  timing: 'evening_before', // 'evening_before' | 'morning_of'
};

// Human-readable labels for notification body text (with emoji)
const TYPE_EMOJIS = {
  '10': 'Garbage 🗑️',
  '11': 'Garbage 🗑️',
  '20': 'Green Bin & Recycling ♻️',
  '30': 'Yard Waste 🍂',
};

// ─── Prefs persistence ────────────────────────────────────────────────────────

export async function loadNotificationPrefs() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function saveNotificationPrefs(prefs) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the notification body string from a list of pickup type objects.
 * e.g. "Garbage 🗑️ + Green Bin & Recycling ♻️"
 */
function buildBody(types) {
  const labels = types
    .filter(t => t.typeCode !== 'STAT')
    .map(t => TYPE_EMOJIS[t.typeCode] ?? t.typeName)
    .filter(Boolean);
  return labels.join(' + ');
}

/**
 * Returns the Date at which the notification should fire.
 *
 * timing === 'evening_before' → 8:00 PM the evening before the collection date
 * timing === 'morning_of'     → 7:00 AM on the collection date
 */
function buildTriggerDate(dateStr, timing) {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (timing === 'evening_before') {
    return new Date(year, month - 1, day - 1, 20, 0, 0);
  }
  return new Date(year, month - 1, day, 7, 0, 0);
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancels all pending garbage reminders previously scheduled by this service.
 */
export async function cancelAllGarbageReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ours = scheduled.filter(n =>
    n.identifier && n.identifier.startsWith(NOTIF_ID_PREFIX)
  );
  await Promise.all(
    ours.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Cancels existing reminders and schedules up to MAX_SCHEDULED upcoming ones.
 *
 * @param {Array} schedule - array of { date: 'YYYY-MM-DD', types: [{typeCode, typeName, ...}] }
 * @param {{ enabled: boolean, timing: string }} prefs
 */
export async function scheduleZoneReminders(schedule, prefs) {
  await cancelAllGarbageReminders();

  if (!prefs.enabled) return;

  const granted = await requestPermission();
  if (!granted) return;

  const now = new Date();
  let count = 0;

  for (const pickup of schedule) {
    if (count >= MAX_SCHEDULED) break;

    // Skip dates that only contain a holiday marker
    const mainTypes = pickup.types.filter(t => t.typeCode !== 'STAT');
    if (mainTypes.length === 0) continue;

    const triggerDate = buildTriggerDate(pickup.date, prefs.timing);
    if (triggerDate <= now) continue; // trigger time already passed

    const dayLabel = prefs.timing === 'evening_before' ? 'Tomorrow' : 'Today';
    const body = buildBody(mainTypes);

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID_PREFIX + pickup.date,
      content: {
        title: '🗑️ Collection Reminder',
        body: `${dayLabel} — ${body}`,
        data: { date: pickup.date, types: mainTypes.map(t => t.typeCode) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    count++;
  }
}

/**
 * Convenience: loads prefs and re-schedules if notifications are enabled.
 * Call this on app open (after loading schedule) to refresh expired notifications.
 */
export async function rescheduleIfEnabled(schedule) {
  const prefs = await loadNotificationPrefs();
  if (prefs.enabled) {
    await scheduleZoneReminders(schedule, prefs);
  }
}

// ─── Test ─────────────────────────────────────────────────────────────────────

/**
 * Fires a test notification after 5 seconds with sample collection types.
 * Returns true if permission was granted, false otherwise.
 */
export async function sendTestNotification() {
  const granted = await requestPermission();
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_ID_PREFIX + 'test',
    content: {
      title: '🗑️ Collection Reminder',
      body: 'Tomorrow — Garbage 🗑️ + Green Bin & Recycling ♻️',
      data: { test: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
    },
  });

  return true;
}
