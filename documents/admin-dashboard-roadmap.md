# TheBetterLondon — Admin Dashboard Roadmap

## Overview

A web-based admin dashboard built with **React.js**, connecting directly to the same **Firebase** project (Firestore, Auth, Storage) used by the mobile app. The dashboard is intended for city staff and super-admins to moderate reports, manage users, update garbage schedules, and monitor app health — all without touching the mobile codebase.

**Tech Stack**
- React 18 + Vite (or Create React App)
- Firebase JS SDK v10 (same project, `firebaseConfig` shared)
- React Router v6 (page routing)
- TanStack Query (Firestore data fetching / caching)
- Tailwind CSS (utility-first styling)
- Recharts or Chart.js (analytics charts)
- Google Maps JS API (report map view)

---

## Role Model (prerequisite — implement before any dashboard feature)

A `role` field must be added to every `users` Firestore document and enforced via **Firebase Security Rules**.

| Role | Description |
|---|---|
| `user` | Default mobile app user (no dashboard access) |
| `moderator` | Can view and update report statuses, flag/remove content |
| `admin` | Full access: users, reports, garbage data, system settings |
| `super_admin` | Can promote/demote other admins; access to security audit log |

**Implementation steps:**
1. Add `role: "user"` default to all existing `users` documents (migration script).
2. Update Firestore Security Rules to gate `resolveReport`, `deleteReport`, and user management writes behind `role == "admin" || role == "moderator"`.
3. Add a Firebase Auth Custom Claim (`role`) for server-side rule enforcement on callable functions.
4. Dashboard login uses Firebase Auth — on sign-in, check Firestore `users/{uid}.role`; redirect to `/unauthorized` if `role == "user"`.

---

## Epics & User Stories

---

### Epic 1 — Authentication & Access Control

**Goal:** Secure the dashboard so only authorized staff can log in.

| # | User Story | Priority |
|---|---|---|
| 1.1 | As an admin, I can sign in with my Google or email account via Firebase Auth. | Must |
| 1.2 | As an admin, I am redirected to an "Access Denied" page if my account does not have an admin role. | Must |
| 1.3 | As a super_admin, I can promote a user to `moderator` or `admin` from within the dashboard. | Must |
| 1.4 | As a super_admin, I can revoke admin access and demote an account back to `user`. | Must |
| 1.5 | As an admin, my session auto-expires after 60 minutes of inactivity with a re-auth prompt. | Should |
| 1.6 | As a super_admin, I can view an audit log of all admin actions (who changed what, when). | Should |

---

### Epic 2 — Dashboard Home (Analytics Overview)

**Goal:** Give admins a real-time at-a-glance view of app activity.

| # | User Story | Priority |
|---|---|---|
| 2.1 | As an admin, I can see a summary card showing total open reports, reports submitted today, reports resolved this week, and total registered users. | Must |
| 2.2 | As an admin, I can see a bar chart of reports submitted per day over the last 30 days. | Must |
| 2.3 | As an admin, I can see a pie/donut chart showing the distribution of reports by category (pothole, graffiti, etc.). | Must |
| 2.4 | As an admin, I can see a status funnel chart showing how many reports are in each status (`pending → open → under_review → in_progress → resolved → closed`). | Should |
| 2.5 | As an admin, I can see a map (Google Maps embed) with a heatmap or clustered pins of all open reports. | Should |
| 2.6 | As an admin, I can filter analytics by date range (last 7 days / 30 days / custom). | Could |

---

### Epic 3 — Reports Management

**Goal:** Let admins view, moderate, and progress community-submitted reports.

| # | User Story | Priority |
|---|---|---|
| 3.1 | As an admin, I can view a paginated table of all reports with columns: ID, title, category, status, submitted by, date, upvotes. | Must |
| 3.2 | As an admin, I can filter reports by status, category, and date range. | Must |
| 3.3 | As an admin, I can search reports by title, address, or username. | Must |
| 3.4 | As an admin, I can click a report row to open a detail panel showing all fields, photos, location map, and full address. | Must |
| 3.5 | As an admin, I can change a report's status (e.g. `pending → under_review → in_progress → resolved`). | Must |
| 3.6 | As an admin, I can delete a report and all its associated Storage photos. | Must |
| 3.7 | As an admin, I can add an internal note/comment to a report (stored in a `reports/{id}/adminNotes` sub-collection, never visible in mobile app). | Should |
| 3.8 | As an admin, I can bulk-select reports and batch-update their status or bulk-delete them. | Should |
| 3.9 | As an admin, I can export a filtered report list to CSV (title, category, status, address, date, upvotes, username). | Should |
| 3.10 | As an admin, resolving a report through the dashboard triggers the same `+5 points` and `resolvedCount++` gamification logic as the mobile app does. | Must |

---

### Epic 4 — User Management

**Goal:** Give admins tools to manage the user base, enforce community standards, and correct data.

| # | User Story | Priority |
|---|---|---|
| 4.1 | As an admin, I can view a paginated table of all users with columns: avatar, display name, email, role, reports count, points, join date. | Must |
| 4.2 | As an admin, I can search users by display name or email. | Must |
| 4.3 | As an admin, I can open a user detail panel showing their full profile, points history, badges earned, and their submitted reports. | Must |
| 4.4 | As an admin, I can manually adjust a user's points balance and provide a reason (creates a `pointsHistory` entry visible to the user in the app). | Should |
| 4.5 | As an admin, I can revoke a specific badge from a user (removes from `badges` array). | Should |
| 4.6 | As an admin, I can grant a badge manually to a user (adds to `badges` array). | Could |
| 4.7 | As an admin, I can disable/suspend a user account (sets `suspended: true` on their Firestore doc; mobile app checks this field and prevents login). | Should |
| 4.8 | As an admin, I can reinstate a suspended user. | Should |
| 4.9 | As a super_admin, I can permanently delete a user account and anonymize their reports (replaces `userName` with "Deleted User", `userPhotoURL` with null). | Should |
| 4.10 | As an admin, I can change a user's `role` (promote to moderator, demote to user). | Must (super_admin only) |

---

### Epic 5 — Garbage Collection Schedule Management

**Goal:** Allow staff to maintain the garbage pickup calendar without running import scripts.

| # | User Story | Priority |
|---|---|---|
| 5.1 | As an admin, I can view a monthly calendar for any garbage zone showing all scheduled pickups and their types. | Must |
| 5.2 | As an admin, I can select any zone from a dropdown (A1–E2, CORE-EAST, CORE-WEST) and browse its schedule. | Must |
| 5.3 | As an admin, I can add a new pickup entry for a zone on a specific date with one or more collection types (Garbage / Green Bin & Recycling / Yard Waste / Holiday). | Must |
| 5.4 | As an admin, I can edit an existing pickup entry to change its date or types. | Must |
| 5.5 | As an admin, I can delete a pickup entry from a zone. | Must |
| 5.6 | As an admin, I can bulk-import a schedule for a zone by uploading a CSV file (columns: `date`, `types`). | Should |
| 5.7 | As an admin, I can copy an entire zone's schedule from one month to another (for recurring schedules). | Could |
| 5.8 | As an admin, I can add a statutory holiday override that disables a pickup on a specific date across all zones. | Should |

---

### Epic 6 — Leaderboard & Gamification Management

**Goal:** Ensure the leaderboard is accurate and give admins control over the gamification system.

| # | User Story | Priority |
|---|---|---|
| 6.1 | As an admin, I can view the full leaderboard (all users ranked by points, not just top 50). | Must |
| 6.2 | As an admin, I can see and confirm that no placeholder/dummy data is mixed into the live leaderboard. | Must |
| 6.3 | As an admin, I can configure points values for each event type (submit report, upvote, resolve) without a code deploy. | Could |
| 6.4 | As an admin, I can configure rank thresholds (e.g. change "London Legend" from 1,000 to 2,000 points) without a code deploy. | Could |
| 6.5 | As an admin, I can view a list of all 21 badges with how many users have earned each badge. | Should |
| 6.6 | As an admin, I can send a points history entry to multiple users at once (e.g. bonus points event). | Could |

---

### Epic 7 — Transit Data Management

**Goal:** Provide visibility and basic control over transit data quality.

| # | User Story | Priority |
|---|---|---|
| 7.1 | As an admin, I can view the current live vehicle positions on a map in the dashboard. | Could |
| 7.2 | As an admin, I can view the `metadata/system` document to check when the backend worker last synced vehicle and arrival data. | Should |
| 7.3 | As an admin, I can manually trigger a GTFS-RT data refresh (calls a Firebase Callable Function or Cloud Run endpoint). | Could |
| 7.4 | As an admin, I can view a table of all 1200+ stops with their ID, name, routes, and wheelchair boarding status. | Could |
| 7.5 | As an admin, I can flag a stop as "out of service" which the mobile app will display differently. | Could |

---

### Epic 8 — Push Notifications & Announcements

**Goal:** Allow admins to send targeted or broadcast push notifications to mobile app users.

| # | User Story | Priority |
|---|---|---|
| 8.1 | As an admin, I can compose and send a broadcast push notification to all app users via Firebase Cloud Messaging. | Should |
| 8.2 | As an admin, I can send a targeted push notification to a specific user (e.g. "Your report has been resolved"). | Should |
| 8.3 | As an admin, I can send a push notification to users in a specific geographic area (users whose last known location is within a radius). | Could |
| 8.4 | As an admin, I can view a history of sent notifications with their send time and type. | Should |

---

### Epic 9 — App Settings & Configuration

**Goal:** Let admins manage global app settings stored in Firestore without a code deploy.

| # | User Story | Priority |
|---|---|---|
| 9.1 | As an admin, I can toggle a "maintenance mode" flag in Firestore that the mobile app checks on startup to show a maintenance screen. | Should |
| 9.2 | As an admin, I can edit the FAQ content (questions and answers) that appears in the Help screen of the mobile app. | Could |
| 9.3 | As an admin, I can manage report categories (add/rename/disable) which sync to the mobile app via Firestore. | Could |
| 9.4 | As an admin, I can set a featured/pinned announcement that appears as a banner on the mobile app's Home screen. | Could |

---

## Suggested Build Order

```
Phase 1 — Foundation (Weeks 1–2)
  ├── Project setup: React + Vite + Tailwind + React Router + Firebase SDK
  ├── Epic 1: Auth & role guards (login page, PrivateRoute, role check)
  └── Basic layout: sidebar nav, top bar, breadcrumbs

Phase 2 — Core Moderation (Weeks 3–5)
  ├── Epic 3: Reports management (table, filters, status updates, delete)
  └── Epic 4: User management (table, filters, user detail, suspend)

Phase 3 — Analytics (Week 6)
  └── Epic 2: Dashboard home (summary cards, charts, report map)

Phase 4 — Content Management (Weeks 7–8)
  ├── Epic 5: Garbage schedule management
  └── Epic 6: Leaderboard & gamification visibility

Phase 5 — Advanced Features (Weeks 9–10)
  ├── Epic 7: Transit data visibility
  ├── Epic 8: Push notifications
  └── Epic 9: App settings & configuration
```

---

## Firestore Security Rules — Required Changes

The following rules must be added before the dashboard goes live:

```javascript
// Only admins/moderators can update report status
match /reports/{reportId} {
  allow update: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role 
       in ["admin", "moderator"];
  allow delete: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
}

// Only super_admin can change roles
match /users/{userId} {
  allow update: if request.auth != null 
    && (
      // Users can update their own non-role fields
      (request.auth.uid == userId && !("role" in request.resource.data.diff(resource.data).affectedKeys()))
      ||
      // super_admin can update anything
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "super_admin"
    );
}

// Only admins can write garbage schedule
match /garbageZones/{zoneId}/pickups/{pickupId} {
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role 
       in ["admin", "super_admin"];
}
```

---

## Shared Firebase Config

The admin dashboard uses the **same** `firebaseConfig` as the mobile app. Store it in a `.env` file in the admin project root:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Out of Scope

The following are intentionally excluded from the admin dashboard:
- The mobile app's onboarding, transit, or garbage UI (mobile only)
- Real-time bus tracking unless explicitly scoped in Epic 7
- Any native device features (camera, GPS, notifications) — those remain in the mobile app
