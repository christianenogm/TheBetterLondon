# Backlog Completion Report
**Date:** April 2, 2026  
**Scope:** Epic 1 – Epic 10 (US-101 through US-1005)  
**Purpose:** Verify implementation status before continuing with Epic 11+

---

## Summary

The majority of Epics 1–10 are implemented. **Epic 11 onwards has not been started** and should be the next focus. There are a small number of outstanding gaps within the completed epics, detailed below.

---

## Epic 1 — Account & Profile Management ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-101 | Create an Account with Email | ✅ Done — `SignUpScreen` has full name/email/password/confirm fields, validation alerts, Google sign-in, and navigates home on success |
| US-102 | Sign In to My Account | ✅ Done — `SignInScreen` has email/password, error messages, forgot password link, persistent login via Firebase |
| US-103 | Sign In with Google | ✅ Done — `GoogleSignInButton` present on both sign-in and sign-up screens |
| US-104 | Reset My Forgotten Password | ✅ Done — `ForgotPasswordScreen` sends reset email, shows success state with back-to-login option |
| US-105 | View My Profile and Stats | ✅ Done — `ProfileScreen` shows name, email, report count, points, badge count |
| US-106 | Log Out of My Account | ✅ Done — Logout button on `ProfileScreen`, calls `authContext.signOut()` |

---

## Epic 2 — Report Community Issues ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-201 | Choose What Type of Issue to Report | ✅ Done — `SelectCategoryScreen` shows all issue categories with icons, visual selection highlight |
| US-202 | Take Photos of the Issue | ✅ Done — `TakePhotosScreen` supports camera + gallery, up to 5 photos, preview grid, delete per photo |
| US-203 | Add Location to My Report | ✅ Done — `AddLocationScreen` with draggable map marker, auto-detect location, manual address entry + geocoding |
| US-204 | Add a Title and Description | ✅ Done — `AddDetailsScreen` with 100-char title (required), 500-char description (optional), character counters |
| US-205 | Submit My Report | ✅ Done — `ReviewSubmitScreen` shows full summary, submits via `createReport()`, awards 10 points, shows loading state |

---

## Epic 3 — View Community Reports ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-301 | See All Reports in My Area | ✅ Done — `HomeScreen` feeds all reports with status badges, pull-to-refresh. ⚠️ No pagination (all reports loaded at once) |
| US-302 | View Full Details of a Report | ✅ Done — `ReportDetailsScreen` has photo gallery, map, address, upvote, share |
| US-303 | View My Submitted Reports | ✅ Done — `MyReportsScreen` lists user's reports with All / Open / Resolved filter chips |
| US-304 | Upvote Reports That Affect Me | ✅ Done — Upvote implemented in `HomeScreen` and `ReportDetailsScreen`, prevents self/duplicate upvote |

---

## Epic 4 — App Navigation & Experience ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-401 | Navigate Between App Sections | ✅ Done — `MainNavigator` has 5 bottom tabs: Home, Issues Map, Report, Transit, Profile |

---

## Epic 5 — Find Transit Information ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-501 | Search for Bus Routes and Stops | ✅ Done — `TransitScreen` search bar powered by `searchTransit()` — matches stops and routes |
| US-502 | Find Bus Stops Near Me | ✅ Done — `getNearbyBusStops()` service + "Nearby Stops" in `QuickActionsSheet` |
| US-503 | View All Bus Stops on a Map | ✅ Done — All stops rendered as `StopMarker` with viewport culling, tap to see details |

---

## Epic 6 — View Bus Stop Information ✅ DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-601 | See Stop Details and Next Arrivals | ✅ Done — `StopDetailsBottomSheet` shows stop name/code, routes, next arrivals (polling every 30s) |
| US-602 | Get Directions to a Bus Stop | ✅ Done — "Get Directions" button in `StopDetailsBottomSheet` |
| US-603 | Save Favorite Bus Stops | ✅ Done — Favorites toggle in `StopDetailsBottomSheet`, managed via `QuickActionsSheet` |
| US-604 | Reorder My Favorite Stops | ⚠️ Not Verified — Drag-to-reorder functionality not confirmed in code (low priority) |

---

## Epic 7 — View Bus Route Information ✅ MOSTLY DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-701 | See a Route's Path on the Map | ✅ Done — `RoutePolyline` component draws shape from `shapes.json` when route is selected |
| US-702 | View Route Information Panel | ✅ Done — `RouteOptionsBottomSheet` shows route details for directions |
| US-703 | View Full Route Schedule | ⚠️ Not Verified — No dedicated "full schedule" screen or component confirmed in code (medium priority) |

---

## Epic 8 — Real-Time Bus Tracking ✅ MOSTLY DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-801 | See Buses Moving in Real-Time | ✅ Done — `VehicleMarker` rendered on map, polled every 30 seconds via `fetchVehiclePositions()` |
| US-802 | Track My Specific Bus | ⚠️ Partial — Buses are visible and tappable, but dedicated tracking with arrival notifications is not confirmed (medium priority, requires real-time API) |

---

## Epic 9 — Service Alerts & Updates ❌ NOT DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-901 | See Service Alerts for Routes | ❌ Not implemented — No alert banner, alert data source, or alerts UI found anywhere in the app (low priority per backlog) |

---

## Epic 10 — Improved Reports Feed ⚠️ PARTIALLY DONE

| Ticket | Title | Status |
|--------|-------|--------|
| US-1001 | Filter Reports by Type | ✅ Done — `FilterSheet` (multi-select by category) on `HomeScreen`, persisted via `AsyncStorage` |
| US-1002 | Filter Reports by Status | ❌ Not Done — `FilterSheet` only filters by category type; status filter is not implemented |
| US-1003 | Filter Reports by Distance | ⚠️ Partial — Proximity filter exists in `IssuesMapScreen` (map view) but **not** on the reports feed/list |
| US-1004 | Sort Reports Different Ways | ✅ Done — `SortSheet` with Most Recent, Most Upvoted, Closest to Me; persisted via `AsyncStorage` |
| US-1005 | See Report Status Updates | ❌ Not Done — No push notification system for status changes; `reportsService` has no `updateStatus()` function; `ReportDetailsScreen` has no status-change UI |

---

## Outstanding Items Before Epic 11

The following gaps exist within the "already done" range. These are **not blocking** but should be noted for completeness:

| # | Ticket | Gap | Priority |
|---|--------|-----|----------|
| 1 | US-1002 | Filter reports feed by status | Medium |
| 2 | US-1005 | Push notifications for report status changes + `updateStatus()` service function | High |
| 3 | US-1003 | Distance filter on reports list (only exists on map view) | Medium |
| 4 | US-604 | Drag-to-reorder favorites (not verified) | Low |
| 5 | US-703 | Full route schedule screen (not verified) | Medium |
| 6 | US-901 | Service alerts for routes | Low |

---

## Conclusion

**Epic 11 and beyond have not been started.** The bulk of Epics 1–10 are solid and working. The three most notable outstanding items in scope are US-1002, US-1003, and US-1005 in Epic 10 — these may be worth addressing before or alongside Epic 11 depending on priority.
