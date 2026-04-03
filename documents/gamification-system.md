# TheBetterLondon — Gamification System

**Epic 13: Earn Points and Badges**  
Version 1.0 · April 2026

---

## Overview

The gamification system rewards residents for actively contributing to the TheBetterLondon community. Points are earned for meaningful civic actions; badges are unlocked at milestones and represent a user's identity and reputation within the platform.

---

## 1. Points System

### Point-Earning Actions

| Action | Points | Notes |
|--------|-------:|-------|
| Submit a report | +10 | Awarded on every submission |
| Report receives an upvote | +1 | Per upvote, awarded to the report author |
| Report is resolved | +5 | Awarded to the report author when status → "resolved" |
| Milestone: 5 reports submitted | +10 | One-time bonus |
| Milestone: 10 reports submitted | +20 | One-time bonus |
| Milestone: 25 reports submitted | +50 | One-time bonus |
| Milestone: 50 reports submitted | +100 | One-time bonus |

> **Design note:** Upvote points were changed from the original +5 to +1 per upvote to prevent rapid point inflation. The resolved bonus (+5) rewards reports that produce real-world impact.

### Point Deductions
There are no point deductions in this version. Moderation actions (report spam/abuse) may be added in a future epic.

---

## 2. Rank Tiers

Ranks are computed in real-time from a user's total points. They are visible on the profile and leaderboard.

| Rank | Title | Min Points | Color |
|------|-------|-----------:|-------|
| 1 | Newcomer | 0 | Grey `#9E9E9E` |
| 2 | Contributor | 50 | Green `#66BB6A` |
| 3 | Community Helper | 150 | Blue `#42A5F5` |
| 4 | Community Hero | 300 | Purple `#AB47BC` |
| 5 | City Champion | 500 | Amber `#FFA726` |
| 6 | London Legend | 1 000 | Red `#EF5350` |

---

## 3. Badges

Badges are text + emoji based (no image assets required in v1). They are stored as an array of badge IDs on the user's Firestore document.

Badges are grouped by theme:

### Reporter Journey
| Badge ID | Title | Emoji | How to Earn |
|----------|-------|-------|-------------|
| `first-steps` | First Steps | 👣 | Submit your first report |
| `city-watcher` | City Watcher | 👁️ | Submit 5 reports |
| `community-helper` | Community Helper | 🤝 | Submit 10 reports |
| `civic-champion` | Civic Champion | 🏅 | Submit 25 reports |
| `urban-guardian` | Urban Guardian | 🛡️ | Submit 50 reports |
| `london-legend` | London Legend | 🏆 | Submit 100 reports |

### Civic Impact
| Badge ID | Title | Emoji | How to Earn |
|----------|-------|-------|-------------|
| `impact-maker` | Impact Maker | ⚡ | Get your first report resolved |
| `problem-solver` | Problem Solver | 🔧 | Get 5 reports resolved |
| `change-maker` | Change Maker | 🌟 | Get 10 reports resolved |
| `city-fixer` | City Fixer | 🏗️ | Get 25 reports resolved |

### Community Recognition
| Badge ID | Title | Emoji | How to Earn |
|----------|-------|-------|-------------|
| `on-the-map` | On the Map | 📍 | Receive your first upvote |
| `crowd-favourite` | Crowd Favourite | ❤️ | Receive 10 upvotes total |
| `trusted-voice` | Trusted Voice | 🎤 | Receive 50 upvotes total |
| `community-star` | Community Star | ⭐ | Receive 100 upvotes total |
| `peoples-choice` | People's Choice | 🗳️ | Receive 200 upvotes total |

### Points Milestones
| Badge ID | Title | Emoji | How to Earn |
|----------|-------|-------|-------------|
| `point-seeker` | Point Seeker | 🎯 | Earn 50 points |
| `point-collector` | Point Collector | 💎 | Earn 200 points |
| `point-master` | Point Master | 👑 | Earn 500 points |
| `point-legend` | Point Legend | 🌠 | Earn 1 000 points |

---

## 4. Firestore Data Model

### User Document (`users/{userId}`)

```
{
  name: string,
  email: string,
  points: number,              // total accumulated
  reportsCount: number,        // total reports submitted
  resolvedCount: number,       // reports that reached "resolved"
  totalUpvotesReceived: number,// total upvotes across all reports
  badges: string[],            // array of badge IDs earned
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Points History Sub-Collection (`users/{userId}/pointsHistory/{autoId}`)

```
{
  points: number,     // points awarded (positive)
  reason: string,     // human-readable description
  createdAt: Timestamp
}
```

---

## 5. Leaderboard

- Top 100 contributors, ranked by total points (All Time)
- Future filters: This Week, This Month (requires timestamp-based aggregation)
- Each entry shows: rank number, display name, points total, top badge title + emoji
- The current user's row is always highlighted regardless of their rank
- Privacy option (US-1305): users can choose to hide their name (show as "Anonymous")

---

## 6. Badge Award Flow

```
User Action (submit report / upvotes received / report resolved)
  → updateUserStats(userId, delta)
  → awardPoints(userId, { points, reason })       — logs history entry
  → checkAndAwardBadges(userId)                   — compares profile vs. all badge thresholds
      → getNewlyUnlockedBadges(profile)            — pure function (gamificationService)
      → arrayUnion(newBadgeIds) on user doc
      → return newly unlocked badges to caller
  → (optional) trigger in-app notification for each new badge
```

---

## 7. Future Scope

- **Streaks**: Daily reporting streaks (7-day → "Streak Master 🔥", 30-day → "Dedicated Citizen 🌆")
- **Category Explorer**: Report in 3+ different categories → "All-Rounder 🗂️"
- **Photo Pro**: Submit 10 reports with photos → "Photo Pro 📸"
- **Time-based**: Weekend Warrior, Night Owl (require timestamp analysis)
- **Server-side badge triggers**: Cloud Functions to evaluate badges on Firestore writes (removes client dependency)
- **Push notifications**: Badge unlock alerts via FCM (US-1303)
- **Leaderboard real-time**: Firestore composite index on `points` descending with `limit(100)` query
