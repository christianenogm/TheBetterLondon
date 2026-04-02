/**
 * calendarExportService.js
 * US-1204: Add Collection Days to My Phone Calendar
 *
 * Creates native calendar events for the next 3 months of garbage
 * collection pickups. Works with iOS Calendar and Android Google Calendar.
 */

import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CALENDAR_TITLE = 'Garbage Collection';
const MONTHS_AHEAD = 3;
const EXPORTED_KEY = '@garbage_calendar_exported';
const EVENT_TITLE_PREFIX = '🗑️ ';

// ─── Export state persistence ─────────────────────────────────────────────────

export async function isCalendarExported() {
  try {
    return (await AsyncStorage.getItem(EXPORTED_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function setCalendarExported(value) {
  await AsyncStorage.setItem(EXPORTED_KEY, value ? 'true' : 'false');
}

// Emoji labels to match notification service
const TYPE_LABELS = {
  '10': 'Garbage 🗑️',
  '11': 'Garbage 🗑️',
  '20': 'Green Bin & Recycling ♻️',
  '30': 'Yard Waste 🍂',
  'STAT': null, // skip holidays
};

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestCalendarPermission() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

// ─── Calendar lookup / creation ───────────────────────────────────────────────

async function getOrCreateCalendar() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'android') {
    // On Android, creating a new calendar requires a sync account which Google
    // doesn't allow for third-party apps. Use the user's primary writable calendar.
    const primary = calendars.find(c => c.isPrimary && c.allowsModifications)
      ?? calendars.find(c => c.allowsModifications);
    if (!primary) throw new Error('No writable calendar found on this device.');
    return primary.id;
  }

  // iOS: re-use an existing "Garbage Collection" calendar we created before
  const existing = calendars.find(
    c => c.title === CALENDAR_TITLE && c.allowsModifications
  );
  if (existing) return existing.id;

  // iOS: derive the source from the device's default calendar
  const defaultCal = await Calendar.getDefaultCalendarAsync();
  const sourceId = defaultCal?.source?.id ?? defaultCal?.sourceId;

  const newCalendarId = await Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: '#2E7D32',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId,
  });

  return newCalendarId;
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Exports the next 3 months of pickups to the native phone calendar.
 * Returns { created: number } on success.
 *
 * @param {Array} schedule - [{ date: 'YYYY-MM-DD', types: [{typeCode, ...}] }]
 */
export async function exportScheduleToCalendar(schedule) {
  const granted = await requestCalendarPermission();
  if (!granted) throw new Error('Calendar permission not granted.');

  const calendarId = await getOrCreateCalendar();

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + MONTHS_AHEAD);

  let created = 0;

  for (const pickup of schedule) {
    const pickupDate = new Date(pickup.date + 'T00:00:00');
    if (pickupDate > cutoff) break;

    const mainTypes = pickup.types.filter(
      t => t.typeCode !== 'STAT' && TYPE_LABELS[t.typeCode]
    );
    if (mainTypes.length === 0) continue;

    const typeText = mainTypes
      .map(t => TYPE_LABELS[t.typeCode])
      .join(' + ');

    const title = `🗑️ ${typeText}`;

    // All-day event: start = midnight, end = midnight next day
    const startDate = new Date(pickup.date + 'T00:00:00');
    const endDate   = new Date(pickup.date + 'T23:59:59');

    await Calendar.createEventAsync(calendarId, {
      title,
      startDate,
      endDate,
      allDay: true,
      alarms: [
        { relativeOffset: -60 * 12 }, // 12 hours before (evening before ~8 PM if event is midnight)
      ],
      notes: mainTypes.map(t => TYPE_LABELS[t.typeCode]).join('\n'),
      timeZone: 'America/Toronto',
    });

    created++;
  }

  await setCalendarExported(true);
  return { created };
}

// ─── Remove ───────────────────────────────────────────────────────────────────

/**
 * Removes all garbage collection events previously added by this app.
 * iOS: deletes the entire "Garbage Collection" calendar.
 * Android: queries the primary calendar for matching events and deletes them.
 */
export async function removeScheduleFromCalendar() {
  const granted = await requestCalendarPermission();
  if (!granted) throw new Error('Calendar permission not granted.');

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'ios') {
    const ours = calendars.find(
      c => c.title === CALENDAR_TITLE && c.allowsModifications
    );
    if (ours) {
      await Calendar.deleteCalendarAsync(ours.id);
    }
  } else {
    // Android: find events in the primary calendar that match our title prefix
    const primary = calendars.find(c => c.isPrimary && c.allowsModifications)
      ?? calendars.find(c => c.allowsModifications);
    if (!primary) throw new Error('No writable calendar found on this device.');

    const now = new Date();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() + MONTHS_AHEAD);

    const events = await Calendar.getEventsAsync([primary.id], now, cutoff);
    const ours = events.filter(e => e.title?.startsWith(EVENT_TITLE_PREFIX));
    await Promise.all(ours.map(e => Calendar.deleteEventAsync(e.id)));
  }

  await setCalendarExported(false);
}
