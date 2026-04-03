# Push Notifications Integration Guide for Mobile App

## Document Purpose

This document provides complete implementation details for integrating push notifications in the TheBetterLondon React Native mobile app. The admin dashboard has been updated to send two types of push notifications:

1. **Report Resolved Notifications** — Sent when an admin resolves a user's report
2. **Transit Alerts** — Sent by admins to notify users about transit service updates

---

## Admin Dashboard Implementation Summary

### What Has Been Implemented

#### 1. Push Notifications Service (`src/services/pushNotificationsService.js`)

This service provides functions to call Firebase Cloud Functions:

```javascript
// Resolve a report and send push notification
resolveReportWithNotification(reportId)
  → Returns: { success: boolean, message: string, notificationSent: boolean }

// Send transit alert to all opted-in users
sendTransitAlert({ title, body, affectedRoutes, severity })
  → Returns: { success: boolean, sent: number, failed: number }

// Get transit alert history
getTransitAlertHistory()
  → Returns: Array of alert records
```

#### 2. Reports Management (`src/pages/ReportsManagementPage.jsx`)

- When an admin resolves a report, a confirmation dialog appears
- Calls `resolveReportWithNotification()` Cloud Function
- Shows success message indicating if notification was sent

#### 3. Transit Alerts Page (`src/pages/TransitAlertsPage.jsx`)

- Form to compose and send transit alerts
- Fields: Title, Message, Affected Routes (multi-select), Severity (info/warning/critical)
- Displays alert history table
- Located at `/transit-alerts` in the dashboard

---

## Firebase Cloud Functions Required

The mobile app integration depends on two Firebase Cloud Functions that **must be implemented** in your Firebase project.

### Function 1: `sendReportResolvedNotification`

**Type:** Callable Function  
**Triggered by:** Admin dashboard when resolving a report

**Input Schema:**
```typescript
{
  reportId: string  // The ID of the report being resolved
}
```

**Implementation Logic:**

1. Verify caller has `admin` or `moderator` role
2. Fetch the `reports/{reportId}` document
3. Get the report author's `userId`
4. Fetch `users/{userId}` to get their `pushToken`
5. If `pushToken` is null, skip notification (user hasn't enabled notifications)
6. Send push notification via Expo Push API
7. Update report: `status: 'resolved'`, `resolvedAt: serverTimestamp()`
8. Award user gamification points (+5 points, increment `resolvedCount`)

**Expo Push API Request:**
```javascript
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json

{
  "to": "ExponentPushToken[xxxxxxxxxxxx]",
  "title": "Your report has been resolved ✅",
  "body": "Great news! Your report 'Pothole on Main St' has been resolved.",
  "data": {
    "type": "report_resolved",
    "reportId": "abc123"
  },
  "sound": "default",
  "priority": "high"
}
```

**Expected Response:**
```typescript
{
  success: true,
  message: "Report resolved successfully",
  notificationSent: true,  // false if user has no push token
  reportId: string,
  userId: string
}
```

**Error Handling:**

- Return `notificationSent: false` if user has no push token (don't throw error)
- Throw error if report doesn't exist or caller lacks permissions

---

### Function 2: `sendTransitAlert`

**Type:** Callable Function  
**Triggered by:** Admin dashboard Transit Alerts page

**Input Schema:**
```typescript
{
  title: string,          // Alert title (max 100 chars)
  body: string,           // Alert message (max 500 chars)
  affectedRoutes: string[], // Route IDs like ["01", "02", "10"] or []
  severity: "info" | "warning" | "critical"
}
```

**Implementation Logic:**

1. Verify caller has `admin` role (not moderator — stricter permissions)
2. Query Firestore: all `users` where `transitAlertsEnabled === true` AND `pushToken != null`
3. Extract push tokens into an array
4. Chunk tokens into batches of 100 (Expo API limit)
5. For each batch, POST to Expo Push API
6. Track success/failure counts
7. Write to `transitAlertHistory` collection for audit log

**Expo Push API Request (batch):**
```javascript
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json

[
  {
    "to": "ExponentPushToken[token1]",
    "title": "Service Delay — Route 2",
    "body": "Route 2 is experiencing delays due to road closure on Dundas St.",
    "data": {
      "type": "transit_alert",
      "severity": "warning",
      "affectedRoutes": ["02"]
    },
    "sound": "default",
    "priority": "high"
  },
  {
    "to": "ExponentPushToken[token2]",
    // ... same payload
  }
  // Up to 100 notifications per request
]
```

**Expected Response:**
```typescript
{
  success: true,
  sent: 142,      // Number of notifications sent
  failed: 3,      // Number that failed to send
  alertId: string // Firestore document ID in transitAlertHistory
}
```

**Firestore Write (Alert History):**
```javascript
// Create document in transitAlertHistory collection
{
  title: string,
  body: string,
  affectedRoutes: string[],
  severity: string,
  sentAt: Timestamp,
  sentBy: string,          // Admin UID
  recipientCount: number,  // Number of tokens targeted
  failedCount: number      // Number of failed deliveries
}
```

---

## Firestore Schema Changes

### 1. Users Collection (`users/{userId}`)

**New Fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pushToken` | `string \| null` | `null` | Expo push token (e.g., `ExponentPushToken[xxxxxxxxx]`) |
| `transitAlertsEnabled` | `boolean` | `false` | Whether user opted in to transit alerts |

**Example Document:**
```javascript
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  role: "user",
  points: 50,
  badges: [],
  
  // NEW FIELDS
  pushToken: "ExponentPushToken[xxxxxxxxxxxxxx]",
  transitAlertsEnabled: true,
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. New Collection: `transitAlertHistory`

**Purpose:** Audit log of all transit alerts sent by admins

**Document Schema:**
```typescript
{
  id: string,              // Auto-generated
  title: string,           // Alert title
  body: string,            // Alert message
  affectedRoutes: string[], // Route IDs
  severity: "info" | "warning" | "critical",
  sentAt: Timestamp,       // When alert was sent
  sentBy: string,          // Admin UID who sent it
  recipientCount: number,  // How many users received it
  failedCount: number      // How many failed to deliver
}
```

**Example Document:**
```javascript
{
  id: "alert_001",
  title: "Service Delay — Route 2",
  body: "Route 2 experiencing delays due to road work on Dundas St.",
  affectedRoutes: ["02"],
  severity: "warning",
  sentAt: Timestamp(2026, 4, 3, 10, 30),
  sentBy: "admin_uid_123",
  recipientCount: 142,
  failedCount: 3
}
```

---

## Mobile App Implementation Guide

### Step 1: Register for Push Notifications

**File:** `src/services/pushNotificationService.js` (NEW)

```javascript
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Request notification permissions and get Expo push token
 * @returns {Promise<string|null>} Expo push token or null if denied
 */
export const registerForPushNotifications = async () => {
  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Push notification permissions denied');
    return null;
  }
  
  // Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('EAS project ID not found in app.config.js');
    return null;
  }
  
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data; // Returns "ExponentPushToken[xxxxxx]"
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};
```

**Important:** Expo push tokens only work on **physical devices**. iOS Simulator and Android Emulator cannot receive push notifications.

---

### Step 2: Save Push Token to Firestore

**File:** `src/services/userService.js` (MODIFY)

Add these functions:

```javascript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Save user's push token to Firestore
 * @param {string} userId - User UID
 * @param {string} token - Expo push token
 */
export const savePushToken = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: token,
      updatedAt: serverTimestamp()
    });
    console.log('Push token saved successfully');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

/**
 * Remove user's push token from Firestore (on sign-out)
 * @param {string} userId - User UID
 */
export const removePushToken = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushToken: null,
      updatedAt: serverTimestamp()
    });
    console.log('Push token removed');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};
```

Also update `initUserProfile()` to include the new fields:

```javascript
export const initUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || null,
      role: 'user',
      points: 0,
      badges: [],
      totalReports: 0,
      resolvedCount: 0,
      
      // NEW FIELDS
      pushToken: null,
      transitAlertsEnabled: false,
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};
```

---

### Step 3: Wire Token Registration on Login

**File:** `src/context/AuthContext.js` (MODIFY)

```javascript
import { registerForPushNotifications } from '../services/pushNotificationService';
import { savePushToken, removePushToken } from '../services/userService';

// Inside AuthContext component, modify the auth state listener:

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      
      // Initialize user profile
      await initUserProfile(firebaseUser);
      
      // Load user role and data
      const userData = await getUserData(firebaseUser.uid);
      setUserData(userData);
      setRole(userData?.role || 'user');
      
      // Register for push notifications
      try {
        const token = await registerForPushNotifications();
        if (token) {
          await savePushToken(firebaseUser.uid, token);
        }
      } catch (error) {
        console.error('Error registering push notifications:', error);
      }
      
      setLoading(false);
    } else {
      setUser(null);
      setUserData(null);
      setRole(null);
      setLoading(false);
    }
  });
  
  return () => unsubscribe();
}, []);

// Modify sign out function:
const signOut = async () => {
  try {
    if (user) {
      await removePushToken(user.uid);
    }
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
```

---

### Step 4: Handle Incoming Notifications

**File:** `App.js` or `src/navigation/RootNavigator.js` (MODIFY)

```javascript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  const navigationRef = useRef();
  const notificationListener = useRef();
  const responseListener = useRef();
  
  useEffect(() => {
    // Listener for when notification is received (app in foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Notification will be displayed automatically based on handler above
    });
    
    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Handle report resolved notification
      if (data?.type === 'report_resolved' && data?.reportId) {
        navigationRef.current?.navigate('ReportDetails', {
          reportId: data.reportId
        });
      }
      
      // Handle transit alert notification
      if (data?.type === 'transit_alert') {
        navigationRef.current?.navigate('Transit');
      }
    });
    
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  return (
    <NavigationContainer ref={navigationRef}>
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

**Navigation Requirements:**

Your navigation must have these screens available:
- `ReportDetails` screen that accepts `reportId` parameter
- `Transit` screen for transit information

---

### Step 5: Transit Alerts Opt-In Toggle

**File:** `src/screens/ProfileScreen.js` or `src/screens/SettingsScreen.js` (MODIFY)

Add a toggle switch to let users opt in/out of transit alerts:

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

function SettingsScreen() {
  const { user, userData } = useAuth();
  const [transitAlertsEnabled, setTransitAlertsEnabled] = useState(
    userData?.transitAlertsEnabled || false
  );
  
  const handleToggleTransitAlerts = async (value) => {
    setTransitAlertsEnabled(value);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        transitAlertsEnabled: value
      });
    } catch (error) {
      console.error('Error updating transit alerts preference:', error);
      setTransitAlertsEnabled(!value); // Revert on error
    }
  };
  
  return (
    <View>
      <Text>Notification Preferences</Text>
      
      <View>
        <Switch
          value={transitAlertsEnabled}
          onValueChange={handleToggleTransitAlerts}
        />
        <Text>Transit Service Alerts</Text>
        <Text style={{ color: 'gray', fontSize: 12 }}>
          Get notified about delays, detours, and service updates
        </Text>
      </View>
    </View>
  );
}
```

---

## Push Notification Payload Reference

### Report Resolved Notification

```javascript
{
  title: "Your report has been resolved ✅",
  body: "Great news! Your report 'Pothole on Main St' has been resolved.",
  data: {
    type: "report_resolved",
    reportId: "abc123"
  },
  sound: "default",
  priority: "high"
}
```

**Mobile App Action:** Navigate to `ReportDetailsScreen` with `reportId: "abc123"`

---

### Transit Alert Notification

```javascript
{
  title: "Service Delay — Route 2",
  body: "Route 2 is experiencing delays due to road closure on Dundas St.",
  data: {
    type: "transit_alert",
    severity: "warning",
    affectedRoutes: ["02"]
  },
  sound: "default",
  priority: "high"
}
```

**Mobile App Action:** Navigate to `TransitScreen`

---

## Firestore Security Rules Updates

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can update their own pushToken and transitAlertsEnabled
    match /users/{userId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null && request.auth.uid == userId;
      
      allow update: if request.auth.uid == userId
        && request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['pushToken', 'transitAlertsEnabled', 'updatedAt']);
      
      // Admins can update any user (for points, badges, etc.)
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    // Transit alert history: readable by admins, only writable by Cloud Functions
    match /transitAlertHistory/{alertId} {
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
      
      // Only Cloud Functions can write (using Admin SDK, which bypasses these rules)
      allow write: if false;
    }
  }
}
```

---

## Testing Guide

### Testing Report Resolved Notifications

1. **Setup:** Create a test user in the mobile app with a real device
2. **Create a report:** Submit a test report from the mobile app
3. **Verify token:** Check Firestore `users/{userId}` document has `pushToken` field populated
4. **Sign in to admin dashboard** as admin/moderator
5. **Navigate to Reports Management**
6. **Change report status to "Resolved"**
7. **Verify:** Mobile device should receive notification within seconds
8. **Tap notification:** Should navigate to the report details screen

**Expected Console Logs (Cloud Function):**
```
Resolving report: abc123
Found reporter userId: user123
Found push token: ExponentPushToken[xxxxxx]
Notification sent successfully
Report updated: status=resolved
Points awarded: +5
```

---

### Testing Transit Alerts

1. **Setup:** Have multiple test users with `transitAlertsEnabled: true` in Firestore
2. **All test devices must be physical devices** (not simulators)
3. **Sign in to admin dashboard**
4. **Navigate to Transit Alerts page** (`/transit-alerts`)
5. **Fill out the form:**
   - Title: "Test Alert — Route 2"
   - Message: "This is a test transit alert"
   - Routes: Select Route 02
   - Severity: Warning
6. **Click "Send to All Opted-In Users"**
7. **Confirm the dialog**
8. **Verify:** All opted-in devices should receive the notification
9. **Check success message:** Should show "Alert sent to N users"
10. **Tap notification:** Should navigate to Transit screen

**Expected Console Logs (Cloud Function):**
```
Querying users with transitAlertsEnabled=true
Found 5 users with push tokens
Batching 5 tokens (1 batch)
Sending batch 1 of 1
Batch sent successfully: 5 sent, 0 failed
Writing to transitAlertHistory collection
```

---

### Testing Opt-In/Opt-Out

1. **Sign in to mobile app**
2. **Navigate to Settings/Profile screen**
3. **Locate "Transit Service Alerts" toggle**
4. **Turn toggle ON**
5. **Verify Firestore:** `users/{userId}.transitAlertsEnabled` should be `true`
6. **Send a test alert from admin dashboard**
7. **Verify:** Should receive notification
8. **Turn toggle OFF**
9. **Verify Firestore:** `users/{userId}.transitAlertsEnabled` should be `false`
10. **Send another test alert**
11. **Verify:** Should NOT receive notification

---

## Common Issues & Troubleshooting

### Issue 1: "No push token found"

**Cause:** Push token registration failed or permissions denied

**Solution:**
- Check device permissions: Settings → TheBetterLondon → Notifications → Allow
- Verify `app.config.js` contains `extra.eas.projectId`
- Test on physical device (tokens don't work in simulator)
- Check console logs for errors in `registerForPushNotifications()`

---

### Issue 2: Notifications not received

**Possible Causes:**
1. User's `pushToken` is null in Firestore
2. User has `transitAlertsEnabled: false` (for transit alerts)
3. Cloud Function failed to send
4. Expo Push API rate limit exceeded

**Solution:**
- Verify Firestore has valid push token
- Check Cloud Function logs for errors
- Ensure device has internet connection
- Test with Expo's push notification tool: https://expo.dev/notifications

---

### Issue 3: Notification received but tap doesn't navigate

**Cause:** Navigation reference not properly set or screen names don't match

**Solution:**
- Verify `navigationRef` is passed to `<NavigationContainer ref={navigationRef}>`
- Check screen names match exactly (`ReportDetails`, `Transit`)
- Ensure navigation stack includes these screens
- Add console.log in notification response listener to debug

---

### Issue 4: Cloud Function permission denied

**Cause:** User doesn't have required role

**Solution:**
- Verify admin user has `role: 'admin'` or `role: 'moderator'` in Firestore
- Check Cloud Function role verification logic
- Review Firestore security rules

---

## Deployment Checklist

### Firebase Cloud Functions
- [ ] Run `firebase init functions` in project root
- [ ] Install dependencies: `npm install axios` in `functions/` folder
- [ ] Implement `sendReportResolvedNotification` callable function
- [ ] Implement `sendTransitAlert` callable function
- [ ] Test locally with Firebase Emulator Suite
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Verify functions appear in Firebase Console

### Mobile App
- [ ] Add `pushToken` and `transitAlertsEnabled` fields to user initialization
- [ ] Create `pushNotificationService.js` with token registration
- [ ] Update `AuthContext.js` to register token on login
- [ ] Add notification listeners in `App.js`
- [ ] Implement transit alerts toggle in Settings/Profile screen
- [ ] Test on physical device (iOS and Android)
- [ ] Update app permissions in `app.json` (already configured per roadmap)

### Firestore
- [ ] Update security rules with new fields access
- [ ] Add `transitAlertHistory` collection rules
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

### Admin Dashboard
- [ ] Already implemented ✅
- [ ] Test resolve report flow
- [ ] Test transit alerts sending
- [ ] Verify alert history displays correctly

---

## Additional Resources

- **Expo Push Notifications Docs:** https://docs.expo.dev/push-notifications/overview/
- **Expo Push API Reference:** https://docs.expo.dev/push-notifications/sending-notifications/
- **Firebase Callable Functions:** https://firebase.google.com/docs/functions/callable
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

## Summary

The admin dashboard is now fully configured to send push notifications. The mobile app needs to:

1. Register for push notifications and save token to Firestore
2. Handle incoming notifications and navigate appropriately
3. Provide opt-in toggle for transit alerts
4. Implement Firebase Cloud Functions to process notification requests

All notification payloads, schemas, and examples are documented above. Use this guide to implement the mobile app side of the push notification system.
