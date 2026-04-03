# Push Notifications — Implementation Roadmap

## Overview

This document covers the end-to-end implementation plan for two remote push notification features:

1. **Report Resolved Notification** — When an admin resolves a community report from the dashboard, the report author receives a push notification on their device.
2. **Transit Alerts** — Admins can compose and broadcast transit service alerts (delays, detours, closures) to opted-in commuters.

Both features span **three layers** that must all be implemented:

```
Mobile App (Expo / React Native)
    ↕  stores push tokens in Firestore
Firebase Cloud Functions (Node.js)
    ↕  Admin Dashboard calls these functions
Admin Dashboard (React.js)
```

---

## Architecture Decision: Expo Push Notifications API

Since the mobile app uses **Expo Managed Workflow**, we use **Expo's Push Notification Service** rather than raw FCM. This means:

- The mobile app requests an **Expo Push Token** (format: `ExponentPushToken[xxxx]`)
- Tokens are stored in Firestore alongside the user document
- A Firebase Cloud Function sends HTTP POST requests to `https://exp.host/--/api/v2/push/send`
- The admin dashboard triggers the Cloud Function via a **Firebase Callable Function** (never calls Expo API directly — that would require key exposure)

This avoids setting up a native FCM `google-services.json` / `GoogleService-Info.plist` configuration entirely.

---

## Current State (What Already Exists)

| Feature | Status | Location |
|---|---|---|
| `expo-notifications` installed & configured in `app.json` | ✅ Done | `app.json` lines 38–47 |
| Global foreground notification handler | ✅ Done | `App.js` lines 12–17 |
| Local scheduled notifications (garbage reminders) | ✅ Done | `garbageNotificationService.js` |
| Immediate local notifications (badge unlock) | ✅ Done | `userService.js` lines 135–147 |
| Permission request utility | ✅ Done | `garbageNotificationService.js` line 49 |
| **Expo Push Token registered** | ❌ Missing | — |
| **Push token saved to Firestore** | ❌ Missing | — |
| **`pushToken` field on `users` document** | ❌ Missing | — |
| **Notification listener (tapped → navigate)** | ❌ Missing | — |
| **Firebase Cloud Functions project** | ❌ Missing | — |
| **Transit alert opt-in preference** | ❌ Missing | — |

---

## Part 1 — Mobile App Changes

### 1.1 — Register for Remote Push Notifications

**File to create:** `src/services/pushNotificationService.js`

**What it does:**
- Requests notification permissions (if not already granted)
- Calls `getExpoPushTokenAsync({ projectId })` to get the Expo push token
- Returns the token string

```js
// Pseudocode — actual implementation below
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export const registerForPushNotifications = async () => {
  // 1. Check/request permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // 2. Get Expo push token (requires projectId from app.config.js extra.eas.projectId)
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data; // "ExponentPushToken[xxxxx]"
};
```

**Checklist:**
- [ ] Create `src/services/pushNotificationService.js`
- [ ] Export `registerForPushNotifications()`
- [ ] Export `savePushToken(userId, token)` (calls `userService` to write to Firestore)
- [ ] Export `removePushToken(userId)` (called on sign-out)

---

### 1.2 — Add `pushToken` Field to Firestore Users

**File to modify:** `src/services/userService.js`

**Changes:**
1. Add `pushToken: null` as a default field in `initUserProfile()`
2. Add new export `savePushToken(userId, token)`:
   ```js
   export const savePushToken = async (userId, token) => {
     const ref = doc(db, 'users', userId);
     await updateDoc(ref, { pushToken: token, updatedAt: serverTimestamp() });
   };
   ```
3. Add new export `removePushToken(userId)`:
   ```js
   export const removePushToken = async (userId) => {
     const ref = doc(db, 'users', userId);
     await updateDoc(ref, { pushToken: null });
   };
   ```

**Firestore schema update:**

Add to `users` document:
| Field | Type | Description |
|---|---|---|
| `pushToken` | `string \| null` | Expo push token; `null` if notifications not granted or user signed out |
| `transitAlertsEnabled` | `boolean` | Whether this user has opted into transit alerts (default `false`) |

---

### 1.3 — Wire Up Token Registration on Login

**File to modify:** `src/context/AuthContext.js`

After successful sign-in (both email and Google), call:
```js
const token = await registerForPushNotifications();
if (token) await savePushToken(user.uid, token);
```

On sign-out, call `removePushToken(user.uid)` before `signOut()`.

**Checklist:**
- [ ] Import `registerForPushNotifications` and `savePushToken` in `AuthContext.js`
- [ ] Call token registration in the `onAuthStateChanged` listener (after `initUserProfile`)
- [ ] Call `removePushToken` in sign-out handler

---

### 1.4 — Handle Incoming Remote Notifications

**File to modify:** `App.js`

Add two listeners after the existing `setNotificationHandler` call:

```js
// Listener A: notification received while app is in foreground (already handled by setNotificationHandler)

// Listener B: user taps a notification (app in background or killed)
const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;

  if (data?.type === 'report_resolved' && data?.reportId) {
    // Navigate to ReportDetailsScreen
    navigationRef.current?.navigate('ReportDetails', { reportId: data.reportId });
  }

  if (data?.type === 'transit_alert') {
    // Navigate to TransitScreen
    navigationRef.current?.navigate('Transit');
  }
});

return () => Notifications.removeNotificationSubscription(responseListener);
```

This requires a `navigationRef` (a `React.createRef()` passed to `NavigationContainer`).

**Checklist:**
- [ ] Create `src/navigation/navigationRef.js` with `export const navigationRef = createRef()`
- [ ] Pass `ref={navigationRef}` to `<NavigationContainer>` in `RootNavigator.js`
- [ ] Add `addNotificationResponseReceivedListener` in `App.js`
- [ ] Handle `report_resolved` data → navigate to `ReportDetailsScreen`
- [ ] Handle `transit_alert` data → navigate to `TransitScreen`

---

### 1.5 — Transit Alert Opt-In Toggle

**Feature:** Users can opt in/out of transit service alerts.

**File to modify:** `src/screens/TransitScreen.js` (or `ProfileScreen.js`)

Add a toggle in the Transit screen settings (or Profile → Settings):
- Reads `transitAlertsEnabled` from the user's Firestore document
- On toggle, calls `updateDoc` to flip the field
- Shows a brief explanation: "Get notified about delays, detours, and service alerts"

**Checklist:**
- [ ] Add `transitAlertsEnabled` to `users` document default in `initUserProfile()`
- [ ] Add toggle UI (suggested location: ProfileScreen settings section or a new "Notification Preferences" screen)
- [ ] Wire toggle to update `users/{uid}.transitAlertsEnabled` in Firestore

---

## Part 2 — Firebase Cloud Functions

### Setup

```bash
# In the TheBetterLondon project root (or a new /functions folder)
npm install -g firebase-tools
firebase login
firebase init functions   # Select existing project, JavaScript, no ESLint
cd functions
npm install axios         # To call Expo Push API
```

The `functions/` folder lives **inside the same Firebase project** as the mobile app. It does not need to be in the admin dashboard repo.

**`functions/package.json` key dependencies:**
```json
{
  "firebase-admin": "^13.x",
  "firebase-functions": "^6.x",
  "axios": "^1.x"
}
```

---

### Function 1: `sendReportResolvedNotification` (Callable)

**Trigger:** Called by the admin dashboard when a report is marked as resolved.

**Input:** `{ reportId: string }`

**Logic:**
1. Verify the caller has `admin` or `moderator` role (check `users/{callerId}.role`)
2. Fetch the `reports/{reportId}` document
3. Fetch the report author's `users/{userId}` document to get `pushToken`
4. If `pushToken` is null → skip (user has not granted notifications)
5. POST to `https://exp.host/--/api/v2/push/send`:
   ```json
   {
     "to": "ExponentPushToken[xxxxx]",
     "title": "Your report has been resolved ✅",
     "body": "Great news! Your report '{title}' has been resolved.",
     "data": { "type": "report_resolved", "reportId": "abc123" },
     "sound": "default"
   }
   ```
6. Update the report document: `status: 'resolved'`, `resolvedAt: serverTimestamp()`
7. Award the author `+5 points` and increment `resolvedCount` (call the same gamification logic)

```js
// functions/index.js
exports.sendReportResolvedNotification = onCall(async (request) => {
  const { reportId } = request.data;
  const callerId = request.auth?.uid;
  // ... role check, fetch report, fetch user, send push, update Firestore
});
```

**Checklist:**
- [ ] Create `functions/index.js`
- [ ] Implement `sendReportResolvedNotification` callable function
- [ ] Role check: reject if caller is not `admin` or `moderator`
- [ ] Fetch report + user push token
- [ ] Send push via Expo API using axios
- [ ] Update report status + `resolvedAt` in Firestore
- [ ] Award +5 points + increment `resolvedCount` using Admin SDK
- [ ] Deploy: `firebase deploy --only functions:sendReportResolvedNotification`

---

### Function 2: `sendTransitAlert` (Callable)

**Trigger:** Called by the admin dashboard's Transit Alerts form.

**Input:**
```json
{
  "title": "Service Delay — Route 2",
  "body": "Route 2 is experiencing delays due to road closure on Dundas St.",
  "affectedRoutes": ["2", "10"],
  "severity": "warning"
}
```

**Logic:**
1. Verify caller has `admin` role
2. Query Firestore: all `users` where `transitAlertsEnabled == true` AND `pushToken != null`
3. Chunk tokens into batches of 100 (Expo API limit per request)
4. POST each batch to `https://exp.host/--/api/v2/push/send`
5. Write a record to `metadata/transitAlerts` sub-collection (for admin audit log)

```js
exports.sendTransitAlert = onCall(async (request) => {
  const { title, body, affectedRoutes, severity } = request.data;
  // ... role check, query all opted-in users, batch send
});
```

**Checklist:**
- [ ] Implement `sendTransitAlert` callable function
- [ ] Role check: reject if caller is not `admin`
- [ ] Query all users with `transitAlertsEnabled: true` and `pushToken` set
- [ ] Batch into groups of 100, send via Expo Push API
- [ ] Write to Firestore `transitAlertHistory` collection for audit log
- [ ] Deploy: `firebase deploy --only functions:sendTransitAlert`

---

### Function 3: `onReportResolved` (Firestore Trigger — optional alternative)

As an alternative to the callable approach for report resolved, a Firestore trigger can fire automatically whenever a report's `status` changes to `resolved`:

```js
exports.onReportResolved = onDocumentUpdated('reports/{reportId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.status !== 'resolved' && after.status === 'resolved') {
    // send push to after.userId
  }
});
```

**Tradeoff:** Callable = admin explicitly triggers it and gets error feedback. Trigger = automatic but harder to debug. **Recommended: use callable for explicit control.**

---

## Part 3 — Admin Dashboard Changes

### 3.1 — Report Resolution Flow

**Location:** Reports Management page → Report Detail panel → "Resolve" button

**Current plan (from `admin-dashboard-roadmap.md` Epic 3, US-3.5):** Admin changes report status via a direct Firestore write.

**Updated plan with notifications:**

Replace the direct Firestore `updateDoc` call with a call to the `sendReportResolvedNotification` Cloud Function:

```js
// In admin dashboard: src/services/reportsService.js (admin version)
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app);
const resolveReport = httpsCallable(functions, 'sendReportResolvedNotification');

export const resolveReportWithNotification = async (reportId) => {
  const result = await resolveReport({ reportId });
  return result.data;
};
```

**UI flow:**
1. Admin clicks "Resolve" on a report
2. Confirmation modal: "Mark as resolved and notify the reporter?"
3. On confirm → calls `resolveReportWithNotification(reportId)`
4. Show success toast: "Report resolved. Reporter has been notified."
5. If user has no push token: show toast "Report resolved. Reporter has no push notifications enabled."

**Checklist:**
- [ ] Add `src/services/reportsService.js` to admin project with `resolveReportWithNotification()`
- [ ] Update Report Detail panel "Resolve" button to use the callable function
- [ ] Add confirmation modal before resolving
- [ ] Show success/error toast after resolution
- [ ] Handle the case where reporter has no push token (no error — just silent)

---

### 3.2 — Transit Alerts Section (New Admin Page)

**Location:** Admin sidebar → "Transit" section → "Send Alert" sub-page

**Page layout:**

```
Transit Alerts
├── [Send New Alert] form
│   ├── Title input (e.g. "Service Delay — Route 2")
│   ├── Message body textarea
│   ├── Affected routes multi-select (checkboxes from routes.json)
│   ├── Severity selector: Info / Warning / Critical
│   └── [Send to All Opted-In Users] button
│
└── Alert History table
    ├── Columns: Sent At, Title, Severity, Recipients, Sent By
    └── (read from Firestore `transitAlertHistory` collection)
```

**Implementation:**

```js
// In admin dashboard: src/services/transitAlertsService.js
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app);
const sendAlert = httpsCallable(functions, 'sendTransitAlert');

export const sendTransitAlert = async ({ title, body, affectedRoutes, severity }) => {
  const result = await sendAlert({ title, body, affectedRoutes, severity });
  return result.data; // { sent: 142, failed: 0 }
};

export const getAlertHistory = async () => {
  // getDocs from 'transitAlertHistory' collection, ordered by sentAt desc
};
```

**Checklist:**
- [ ] Create `src/pages/transit/TransitAlertsPage.jsx` in admin dashboard
- [ ] Build the Send Alert form with validation (title required, body required)
- [ ] Populate affected routes multi-select from Firebase or hardcoded route list
- [ ] Call `sendTransitAlert()` on submit
- [ ] Show recipient count in success message: "Alert sent to 142 users"
- [ ] Build Alert History table reading from `transitAlertHistory` Firestore collection
- [ ] Add "Transit Alerts" link to admin sidebar under Transit section

---

## Part 4 — Firestore Schema Updates

### New fields on `users` documents

| Field | Type | Default | Description |
|---|---|---|---|
| `pushToken` | `string \| null` | `null` | Expo push token; null if not granted |
| `transitAlertsEnabled` | `boolean` | `false` | Opt-in for transit service alerts |

### New collection: `transitAlertHistory`

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Alert title |
| `body` | `string` | Alert message |
| `affectedRoutes` | `string[]` | Route IDs affected |
| `severity` | `string` | `info` \| `warning` \| `critical` |
| `sentAt` | `Timestamp` | When the alert was sent |
| `sentBy` | `string` | Admin UID who triggered it |
| `recipientCount` | `number` | How many push tokens were targeted |
| `failedCount` | `number` | How many failed to deliver |

---

## Part 5 — Firestore Security Rules Updates

Add these rules to the Firebase project's `firestore.rules`:

```js
// Users can update their own pushToken and transitAlertsEnabled
match /users/{userId} {
  allow update: if request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['pushToken', 'transitAlertsEnabled', 'updatedAt']);
}

// Transit alert history: only Cloud Functions (admin SDK) can write
match /transitAlertHistory/{alertId} {
  allow read: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
       in ['admin', 'moderator'];
  allow write: if false; // only written by Cloud Functions via Admin SDK
}
```

---

## Build Order

```
Step 1 — Mobile App (1–2 days)
  ├── Create pushNotificationService.js
  ├── Add pushToken + transitAlertsEnabled fields to initUserProfile()
  ├── Wire token registration in AuthContext.js on login
  ├── Wire token removal on sign-out
  ├── Add notification response listener in App.js (tapped → navigate)
  └── Add transit alerts opt-in toggle in Profile or Transit screen

Step 2 — Firebase Cloud Functions (1 day)
  ├── firebase init functions in project root
  ├── Implement sendReportResolvedNotification callable function
  ├── Implement sendTransitAlert callable function
  ├── Test locally with firebase emulators:start
  └── Deploy to production

Step 3 — Admin Dashboard (1–2 days)
  ├── Add resolveReportWithNotification() to reports service
  ├── Update Report Detail "Resolve" button to use callable function
  ├── Add confirmation modal + success/error toasts
  ├── Create Transit Alerts page (form + history table)
  └── Wire transit alert form to sendTransitAlert callable function

Step 4 — Testing
  ├── Test on a real device (push tokens don't work in simulator)
  ├── Test report resolved: admin resolves → check physical device notification
  ├── Test transit alert: admin sends → check multiple opted-in devices
  ├── Test notification tap → correct screen navigation
  └── Test user with notifications disabled (graceful silent failure)
```

---

## Notes & Gotchas

1. **Expo Push Tokens only work on physical devices.** The iOS Simulator and Android Emulator cannot receive push notifications. Test with a real device via Expo Go or a development build.

2. **`getExpoPushTokenAsync` requires the EAS `projectId`.** This is available in `app.config.js` under `extra.eas.projectId` if you have run `eas build` before. If not, add it manually to `app.config.js`:
   ```js
   extra: {
     eas: { projectId: "your-project-uuid-here" },
     ...
   }
   ```
   Find it at [expo.dev](https://expo.dev) under your project.

3. **Expo Push API batching:** Maximum 100 tokens per `push/send` request. The `sendTransitAlert` function must chunk the token list.

4. **Token refresh:** Expo push tokens can change. The safest approach: re-register and save the token every time the user opens the app (not just on sign-in). The token is idempotent — if unchanged, the Firestore write is a no-op.

5. **The Cloud Functions must be deployed to the same Firebase project** as the mobile app and admin dashboard. They share the same Firestore.

6. **Admin SDK bypasses Firestore Security Rules.** Cloud Functions using `firebase-admin` can read/write anything regardless of rules — this is intentional so the function can update reports and award points server-side.
