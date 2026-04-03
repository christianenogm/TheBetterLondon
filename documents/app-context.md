# TheBetterLondon — Full App Context Document

> **Purpose:** This document is a complete technical handoff reference for any new project or AI context window that needs to understand the TheBetterLondon React Native mobile app — its architecture, data models, features, and conventions — so it can build against it (e.g. the admin dashboard).

---

## 1. Project Overview

**TheBetterLondon** is a community civic reporting and transit tracking mobile app for London, Ontario, Canada.

Citizens can:
- Report local issues (potholes, graffiti, broken sidewalks, etc.) with photos and GPS location
- Track their reports and earn points / badges (gamification)
- Browse a live bus transit map with stop arrivals and turn-by-turn navigation
- Look up their garbage collection schedule
- Compete on a community leaderboard

**Platform:** React Native (Expo SDK ~54), iOS & Android  
**Backend:** Firebase (Firestore, Auth, Storage) — no custom server  
**Project Folder:** `TheBetterLondon/`  
**iOS Bundle ID:** `ca.thebetterlondon`  
**App Entry Point:** `index.js` → `App.js` → `src/navigation/RootNavigator.js`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 via Expo ~54 |
| Language | JavaScript (no TypeScript) |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| State | React Context (`AuthContext`, `ThemeContext`) + local `useState` |
| Backend | Firebase JS SDK v12 |
| Database | Cloud Firestore |
| Auth | Firebase Auth (Email/Password + Google OAuth) |
| File Storage | Firebase Storage |
| Maps | `react-native-maps` + Google Maps API |
| Location | `expo-location` |
| Image Picker | `expo-image-picker` |
| Calendar | `expo-calendar` |
| Notifications | `expo-notifications` |
| Linear Gradient | `expo-linear-gradient` |
| Icons | `@expo/vector-icons` → `MaterialCommunityIcons` |
| Safe Area | `react-native-safe-area-context` |
| Display Names | `unique-names-generator` (AdjectiveAnimal#### format) |
| Env Vars | `app.config.js` reads from `.env` via `Constants.expoConfig.extra` |

**Key dependencies in `package.json`:**
```
firebase ^12.9.0
react-native-maps ^1.20.1
expo-linear-gradient ^55.0.9
expo-image-picker ^17.0.10
expo-location ^19.0.8
expo-notifications ^0.32.16
expo-calendar ~15.0.8
react-native-calendars ^1.1314.0
react-native-safe-area-context ^5.6.2
unique-names-generator ^4.7.1
date-fns ^4.1.0
axios ^1.13.5
```

---

## 3. Environment Variables

The app reads env vars from a root `.env` file, surfaced through `app.config.js` → `Constants.expoConfig.extra`.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps rendering |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Places autocomplete (destination search) |
| `EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY` | Turn-by-turn navigation directions |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

**For the admin dashboard (React + Vite):** use the same Firebase project, but put them in a `.env` file with `VITE_` prefix. The `firebaseConfig` values are identical.

---

## 4. Firebase Configuration

**File:** `src/config/firebase.js`

Exports: `app`, `db` (Firestore), `auth`, `storage`

```js
// Auth uses React Native AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

The admin dashboard should use standard `getAuth(app)` with browser persistence instead.

---

## 5. Firestore Data Model

### 5.1 `users` collection

Document ID = Firebase Auth `uid`

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Unique display name, format `AdjectiveAnimal####` (e.g. `FierceEagle4829`) |
| `email` | `string` | User's email address |
| `points` | `number` | Total accumulated gamification points |
| `reportsCount` | `number` | Total reports ever submitted |
| `resolvedCount` | `number` | Reports that reached `resolved` status |
| `totalUpvotesReceived` | `number` | Sum of all upvotes across all user's reports |
| `badges` | `string[]` | Array of earned badge IDs (see Section 9) |
| `photoURL` | `string \| null` | Firebase Storage download URL |
| `createdAt` | `Timestamp` | Account creation time |
| `updatedAt` | `Timestamp` | Last stat update time |

> **No `role` field currently exists.** This must be added before the admin dashboard can enforce access control (see Section 12).

#### Sub-collection: `users/{userId}/pointsHistory`

| Field | Type | Description |
|---|---|---|
| `points` | `number` | Points awarded in this transaction |
| `reason` | `string` | Human-readable reason (e.g. "Report submitted", "Report resolved") |
| `createdAt` | `Timestamp` | Transaction timestamp |

---

### 5.2 `reports` collection

Document ID = Firestore auto-generated

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Short issue title |
| `description` | `string` | Detailed description |
| `category` | `string` | Category ID (see Section 7) |
| `location` | `{ latitude: number, longitude: number }` | GPS coordinates |
| `address` | `string` | Human-readable reverse-geocoded address |
| `userId` | `string` | Author's Firebase Auth UID |
| `userName` | `string` | Denormalized display name (batch-updated when user renames) |
| `userPhotoURL` | `string \| null` | Denormalized avatar URL |
| `photos` | `string[]` | Firebase Storage download URLs |
| `status` | `string` | One of: `pending`, `open`, `under_review`, `in_progress`, `resolved`, `closed` |
| `upvotes` | `number` | Total upvote count |
| `upvotedBy` | `string[]` | Array of UIDs who have upvoted |
| `createdAt` | `Timestamp` | Submission timestamp |
| `updatedAt` | `Timestamp` | Last modification timestamp |
| `resolvedAt` | `Timestamp \| null` | Set when status changes to `resolved` |

#### Sub-collection (planned for admin): `reports/{reportId}/adminNotes`
Not yet created in the mobile app — add in admin dashboard.

---

### 5.3 `vehicles` collection (real-time transit)

Populated by an external backend worker polling LTC GTFS-RT feeds.

| Field | Description |
|---|---|
| `routeId` | Bus route ID (matches `routes.json`) |
| `latitude`, `longitude` | Current vehicle position |
| `color` | Route color (optional, from route data) |

---

### 5.4 `stopArrivals` collection (real-time transit)

| Field | Description |
|---|---|
| `stopId` | Matches GTFS `stops.json` stop ID |
| `arrivals` | Array of `{ routeId, tripId, arrivalTime, ... }` objects |

---

### 5.5 `garbageZones/{zoneId}/pickups` sub-collection

Zone document IDs: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `D1`, `D2`, `E1`, `E2`, `CORE-EAST`, `CORE-WEST`

| Field | Type | Description |
|---|---|---|
| `date` | `string` | `YYYY-MM-DD` format |
| `types` | `{ typeCode: string, typeName: string }[]` | Collection types for that day |

**Type codes:**
| Code | Label |
|---|---|
| `10` | Garbage |
| `20` | Green Bin & Recycling |
| `30` | Yard Waste |
| `STAT` | Statutory Holiday (no pickup) |

---

### 5.6 `metadata` collection

Single document `system` — contains backend worker last-sync timestamps and status flags.

---

## 6. Firebase Storage Paths

| Path | Contents |
|---|---|
| `reports/{reportId}/{filename}.jpg` | Photos uploaded during report submission |
| `avatars/{userId}/profile.jpg` | User profile photos |

---

## 7. Report Categories

| ID | Display Label |
|---|---|
| `pothole` | Pothole |
| `garbage` | Garbage Pile-up |
| `sidewalk` | Broken Sidewalk |
| `parks` | Overgrown Tree |
| `streetlight` | Streetlight Outage |
| `graffiti` | Graffiti / Vandalism |
| `other` | Other |

---

## 8. Report Status Workflow

```
pending → open → under_review → in_progress → resolved → closed
```

- `pending` — just submitted, awaiting triage
- `open` — acknowledged, not yet being worked on
- `under_review` — being assessed by staff
- `in_progress` — actively being fixed
- `resolved` — fix complete; triggers `+5 points` and `resolvedCount++` for the author
- `closed` — archived/dismissed

Currently the mobile app only lets users submit; status transitions happen via `reportsService.resolveReport()` which is **not role-protected** — anyone can call it. The admin dashboard must add protection (see Section 12).

---

## 9. Gamification System

### Points Rules

| Event | Points |
|---|---|
| Submit a report | +10 |
| Another user upvotes your report | +1 per upvote |
| Your report is marked resolved | +5 |
| Milestone bonuses | Variable (based on report count milestones) |

### Ranks

| Rank | Min Points |
|---|---|
| Newcomer | 0 |
| Contributor | 50 |
| Community Helper | 150 |
| Community Hero | 300 |
| City Champion | 500 |
| London Legend | 1,000 |

### Badges (21 total)

**Reporter Journey** (tracked by `reportsCount`):
- First Steps (1), City Watcher (5), Community Helper (10), Civic Champion (25), Urban Guardian (50), London Legend (100)

**Civic Impact** (tracked by `resolvedCount`):
- Impact Maker (1), Problem Solver (5), Change Maker (10), City Fixer (25)

**Community Recognition** (tracked by `totalUpvotesReceived`):
- On the Map (1), Crowd Favourite (10), Trusted Voice (50), Community Star (100), People's Choice (200)

**Points Milestones** (tracked by `points`):
- Point Seeker (50), Point Collector (200), Point Master (500), Point Legend (1,000)

Badge unlocks trigger a local push notification via `expo-notifications`.

---

## 10. Auth Providers

- **Email/Password** — `EmailAuthProvider` (password changes require reauthentication)
- **Google** — `GoogleAuthProvider` via `expo-auth-session` + `signInWithCredential`

On first sign-up:
1. Firebase Auth account is created
2. A unique `AdjectiveAnimal####` display name is generated and checked against Firestore for uniqueness
3. A `users/{uid}` Firestore document is created with `points: 0`, `reportsCount: 0`, etc.

Password changes use `reauthenticateWithCredential` + `updatePassword`. Google-auth users cannot change password (detected via `auth.currentUser.providerData[0].providerId`).

---

## 11. App Screens & Navigation

### Navigation Structure

```
RootNavigator
├── OnboardingScreen  (shown once on first launch, AsyncStorage key: @onboarding_complete)
├── AuthNavigator (stack)
│   ├── SignInScreen
│   ├── SignUpScreen
│   └── ForgotPasswordScreen
└── MainNavigator (bottom tabs)
    ├── Home Tab → HomeScreen
    ├── Map Tab → IssuesMapScreen
    ├── Report Tab → ReportStack
    │   ├── SelectCategoryScreen
    │   ├── TakePhotosScreen
    │   ├── AddLocationScreen
    │   ├── AddDetailsScreen
    │   └── ReviewSubmitScreen
    ├── Transit Tab → TransitScreen
    └── Profile Tab → ProfileScreen
        ├── EditProfileScreen
        ├── MyReportsScreen
        ├── ReportDetailsScreen
        ├── LeaderboardScreen
        ├── AllBadgesScreen
        ├── PointsHistoryScreen
        ├── HelpScreen
        └── GarbageScreen
            ├── GarbageSetupView
            └── GarbageHomeView
```

### Screen Summaries

| Screen | Key Features |
|---|---|
| `SignInScreen` | Email/password + Google Sign-In; gradient hero with `city` icon |
| `SignUpScreen` | Registration; auto-generates display name; gradient hero with `city` icon |
| `ForgotPasswordScreen` | `sendPasswordResetEmail`; success state with email-check icon |
| `OnboardingScreen` | 4-slide swipeable tutorial; only shown on first launch |
| `HomeScreen` | Community reports FlatList; category filter (persisted); sort by recent/upvotes/nearest; optimistic upvote; mini user avatar on cards |
| `IssuesMapScreen` | Google Maps (aubergine style); colored report markers; category + proximity filters |
| `ReportDetailsScreen` | Photo carousel; map; upvote; native share; shows `report.address` (top-level field) |
| `MyReportsScreen` | User's own reports; filter All/Open/Resolved; shows `item.address` |
| `TransitScreen` | Live bus map; 1200+ stops (viewport-culled); real-time vehicles (30s poll); stop arrival sheet; destination search + turn-by-turn navigation; `DestinationSearch` overlay uses `useSafeAreaInsets` |
| `ProfileScreen` | Avatar, stats, rank badge, menu |
| `EditProfileScreen` | Photo upload (camera/gallery → Storage); display name change (batch-updates all reports); password change with reauthentication |
| `LeaderboardScreen` | Top 50 users by points; **has a TODO: remove placeholder data** |
| `AllBadgesScreen` | 2-col grid of all 21 badges, earned vs locked |
| `PointsHistoryScreen` | Chronological gamification transaction log |
| `HelpScreen` | Searchable FAQ; replay onboarding tutorial; Terms/Privacy links |
| `GarbageSetupView` | Places search or GPS → zone lookup → save to AsyncStorage |
| `GarbageHomeView` | Next collection card; color-coded calendar; evening/morning notifications; export to phone calendar |

---

## 12. Services Layer (`src/services/`)

| File | Exports / Purpose |
|---|---|
| `authService.js` | `signIn`, `signUp`, `signOut`, `signInWithGoogle`, `sendPasswordReset`, `changePassword` (reauthenticates first) |
| `userService.js` | `getUserProfile`, `initUserProfile`, `updateUserStats`, `awardPoints`, `checkAndAwardBadges`, `getLeaderboard`, `getPointsHistory`, `updateProfilePhoto`, `updateDisplayName` |
| `reportsService.js` | `createReport` (uploads photos → Storage, awards points), `getReports`, `getUserReports`, `getReportById`, `upvoteReport`, `resolveReport` |
| `gamificationService.js` | Badge definitions, `getNewlyUnlockedBadges`, `getBadgeById`, `getMilestoneBonusForReportCount`, rank logic |
| `firestoreService.js` | `subscribeToVehicles`, `subscribeToStopArrivals` (real-time listeners) |
| `transitService.js` | Fetches + parses GTFS-RT feeds (LTC), manages `stopArrivals` and `vehicles` Firestore writes |
| `gtfsStaticService.js` | Parses local `src/gtfs/*.json` files (stops, routes, shapes) |
| `googlePlacesService.js` | Places autocomplete, place details, recent searches (AsyncStorage), distance calculation |
| `googleDirectionsService.js` | Routes API for turn-by-turn navigation steps |

---

## 13. Important Implementation Details

### Address Field
Reports store address at **top-level** `report.address` (string). Earlier code mistakenly used `report.location.address` — that path does not exist. Always use `report.address`.

### Display Name Uniqueness
When a user changes their display name, `updateDisplayName` in `userService.js`:
1. Checks Firestore for name availability
2. Updates `auth.currentUser.displayName`
3. Updates `users/{uid}.name` in Firestore
4. **Batch-updates** `reports` collection — all documents where `userId == uid` get `userName` updated

### Photo Upload Pattern
```
fetch(localUri) → blob → uploadBytes(storageRef, blob) → getDownloadURL()
```
Photos are stored at `reports/{reportId}/{reportId}_{index}_{timestamp}.jpg`

### User Avatar on Reports
`userPhotoURL` is saved as a denormalized field on each report document at creation time. It is NOT updated when the user changes their avatar later (acceptable tradeoff).

### Safe Area Handling
- Most screens use `<ScreenContainer edges={[]}>` — this means ScreenContainer's SafeAreaView does NOT consume any edges, so components must handle their own insets.
- `ModernSearchBar` uses `useSafeAreaInsets()` and applies `paddingTop: insets.top + spacing.sm`.
- `DestinationSearch` (the full-screen search overlay on TransitScreen) uses `useSafeAreaInsets()` with `paddingTop: insets.top` on its container.
- Auth screens (SignIn, SignUp, ForgotPassword) use `useSafeAreaInsets()` directly.

### Leaderboard Known Issue
`LeaderboardScreen` has hardcoded `PLACEHOLDER_DATA` mixed in with live Firestore data — there is a TODO comment to remove it.

---

## 14. Theme & Design System

**File:** `src/utils/designSystem.js` (primary) and `src/theme/` (re-exports)

Key exports: `colors`, `typography`, `spacing`, `borderRadius`, `elevation`, `shadows`

**Brand Colors:**
- Primary: `#2E7D32` (dark green)
- Auth screen gradient: `['#1B5E20', '#2E7D32', '#43A047']`
- Map style: Aubergine (`src/theme/googlamaps/mapStyle-aubergine.json`)

**Shared component library** in `src/components/`:
- `ScreenContainer` — wraps screens with `SafeAreaView` + `KeyboardAvoidingView`
- `ModernSearchBar` — transit screen search bar with inset handling
- `ModernStopDetailsBottomSheet` — stop info overlay
- `NavigationBottomSheet` — turn-by-turn nav overlay
- `FloatingActionButton`, `QuickActionsSheet` — transit FAB + quick filter sheet
- `StopMarker`, `VehicleMarker`, `ClusterMarker`, `RoutePolyline` — map overlays
- `Alert`, `Badge`, `Button/`, `Card`, `EmptyState`, `FilterSheet`, `Input`, `Loading`, `SortSheet` — UI primitives

---

## 15. Security Gaps (Must Fix Before Admin Dashboard)

1. **No `role` field** on `users` documents — all users are equal in Firestore.
2. **`resolveReport` is unprotected** — any authenticated user can call it client-side.
3. **No Firestore Security Rules** guarding admin operations (status changes, user management, garbage data writes).

### Required changes before admin dashboard goes live:
1. Add `role: "user"` to all existing `users` documents (migration script).
2. Add `role` field to `initUserProfile()` in `userService.js`.
3. Update Firestore Security Rules:
   - Reports: only `admin`/`moderator` can update status or delete
   - Users: only `super_admin` can change another user's `role`
   - GarbageZones: only `admin`/`super_admin` can write
4. Set Firebase Auth Custom Claims for server-side rule checks.

---

## 16. Static Transit Data

Located in `src/gtfs/`:

| File | Contents |
|---|---|
| `stops.json` | ~1200+ stops: `{ id, code, name, latitude, longitude, routes[], wheelchairBoarding }` |
| `routes.json` | LTC bus routes: `{ id, name, color }` |
| `shapes.json` | Route polyline shapes: `{ shapeId, coordinates[] }` |
| `stops.txt`, `routes.txt`, `trips.txt` | Raw GTFS source files |
| `tripUpdates.json`, `vehicleUpdates.json` | Cached GTFS-RT snapshots |

---

## 17. Garbage Collection Zone Data

12 zones covering London, ON. Zone GeoJSON polygons are used in `GarbageSetupView` to match a user's GPS/address to their pickup zone. Zone data was imported to Firestore using a local script (`scripts/reset-reports.js`).

---

## 18. Related Documents in `documents/`

| File | Contents |
|---|---|
| `admin-dashboard-roadmap.md` | Full 9-epic roadmap for the React.js admin dashboard, tech stack, build order, security rules |
| `backlogs.md` | Mobile app feature backlog and sprint history |
| `build-guide.md` | Build and deployment instructions |
| `completion-report.md` | Project completion status |
| `design-guidelines.md` | UI/UX style guide |
| `app-context.md` | **This file** — full technical context for handoff |
