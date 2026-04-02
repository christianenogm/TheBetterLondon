/**
 * gamificationService.js
 * Epic 13: Earn Points and Badges
 *
 * Pure service — no direct Firestore calls.
 * All functions operate on plain JavaScript objects.
 * Firestore writes are handled by userService.js.
 */

// ─── Ranks ────────────────────────────────────────────────────────────────────

export const RANKS = [
  { id: 'newcomer',   label: 'Newcomer',         minPoints: 0,    color: '#9E9E9E' },
  { id: 'contributor',label: 'Contributor',       minPoints: 50,   color: '#66BB6A' },
  { id: 'helper',     label: 'Community Helper',  minPoints: 150,  color: '#42A5F5' },
  { id: 'hero',       label: 'Community Hero',    minPoints: 300,  color: '#AB47BC' },
  { id: 'champion',   label: 'City Champion',     minPoints: 500,  color: '#FFA726' },
  { id: 'legend',     label: 'London Legend',     minPoints: 1000, color: '#EF5350' },
];

/**
 * Returns the rank the user currently holds based on their total points.
 */
export function getRankForPoints(points = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.minPoints) rank = r;
  }
  return rank;
}

/**
 * Returns the next rank tier, or null if already at max.
 */
export function getNextRank(points = 0) {
  for (const r of RANKS) {
    if (points < r.minPoints) return r;
  }
  return null;
}

/**
 * Returns points needed to reach the next rank, or 0 if at max.
 */
export function pointsToNextRank(points = 0) {
  const next = getNextRank(points);
  return next ? next.minPoints - points : 0;
}

// ─── Badges ───────────────────────────────────────────────────────────────────
//
// req.type maps to a field on the user profile document:
//   'reportsCount'          → number of reports submitted
//   'resolvedCount'         → number of their reports that were resolved
//   'totalUpvotesReceived'  → total upvotes across all their reports
//   'points'                → total accumulated points

export const BADGES = [
  // ── Reporter Journey ──────────────────────────────────────────────────────
  {
    id: 'first-steps',
    title: 'First Steps',
    emoji: '👣',
    description: 'Submit your first report',
    req: { type: 'reportsCount', value: 1 },
  },
  {
    id: 'city-watcher',
    title: 'City Watcher',
    emoji: '👁️',
    description: 'Submit 5 reports',
    req: { type: 'reportsCount', value: 5 },
  },
  {
    id: 'community-helper',
    title: 'Community Helper',
    emoji: '🤝',
    description: 'Submit 10 reports',
    req: { type: 'reportsCount', value: 10 },
  },
  {
    id: 'civic-champion',
    title: 'Civic Champion',
    emoji: '🏅',
    description: 'Submit 25 reports',
    req: { type: 'reportsCount', value: 25 },
  },
  {
    id: 'urban-guardian',
    title: 'Urban Guardian',
    emoji: '🛡️',
    description: 'Submit 50 reports',
    req: { type: 'reportsCount', value: 50 },
  },
  {
    id: 'london-legend',
    title: 'London Legend',
    emoji: '🏆',
    description: 'Submit 100 reports',
    req: { type: 'reportsCount', value: 100 },
  },

  // ── Civic Impact ──────────────────────────────────────────────────────────
  {
    id: 'impact-maker',
    title: 'Impact Maker',
    emoji: '⚡',
    description: 'Get your first report resolved',
    req: { type: 'resolvedCount', value: 1 },
  },
  {
    id: 'problem-solver',
    title: 'Problem Solver',
    emoji: '🔧',
    description: 'Get 5 reports resolved',
    req: { type: 'resolvedCount', value: 5 },
  },
  {
    id: 'change-maker',
    title: 'Change Maker',
    emoji: '🌟',
    description: 'Get 10 reports resolved',
    req: { type: 'resolvedCount', value: 10 },
  },
  {
    id: 'city-fixer',
    title: 'City Fixer',
    emoji: '🏗️',
    description: 'Get 25 reports resolved',
    req: { type: 'resolvedCount', value: 25 },
  },

  // ── Community Recognition ─────────────────────────────────────────────────
  {
    id: 'on-the-map',
    title: 'On the Map',
    emoji: '📍',
    description: 'Receive your first upvote',
    req: { type: 'totalUpvotesReceived', value: 1 },
  },
  {
    id: 'crowd-favourite',
    title: 'Crowd Favourite',
    emoji: '❤️',
    description: 'Receive 10 upvotes total',
    req: { type: 'totalUpvotesReceived', value: 10 },
  },
  {
    id: 'trusted-voice',
    title: 'Trusted Voice',
    emoji: '🎤',
    description: 'Receive 50 upvotes total',
    req: { type: 'totalUpvotesReceived', value: 50 },
  },
  {
    id: 'community-star',
    title: 'Community Star',
    emoji: '⭐',
    description: 'Receive 100 upvotes total',
    req: { type: 'totalUpvotesReceived', value: 100 },
  },
  {
    id: 'peoples-choice',
    title: "People's Choice",
    emoji: '🗳️',
    description: 'Receive 200 upvotes total',
    req: { type: 'totalUpvotesReceived', value: 200 },
  },

  // ── Points Milestones ─────────────────────────────────────────────────────
  {
    id: 'point-seeker',
    title: 'Point Seeker',
    emoji: '🎯',
    description: 'Earn 50 points',
    req: { type: 'points', value: 50 },
  },
  {
    id: 'point-collector',
    title: 'Point Collector',
    emoji: '💎',
    description: 'Earn 200 points',
    req: { type: 'points', value: 200 },
  },
  {
    id: 'point-master',
    title: 'Point Master',
    emoji: '👑',
    description: 'Earn 500 points',
    req: { type: 'points', value: 500 },
  },
  {
    id: 'point-legend',
    title: 'Point Legend',
    emoji: '🌠',
    description: 'Earn 1,000 points',
    req: { type: 'points', value: 1000 },
  },
];

/**
 * Given a user profile object, returns the IDs of any badges that the user
 * qualifies for but has not yet been awarded.
 *
 * @param {object} profile - Firestore user document data
 * @returns {string[]} array of newly unlocked badge IDs
 */
export function getNewlyUnlockedBadges(profile) {
  const current = new Set(profile.badges ?? []);
  const unlocked = [];

  for (const badge of BADGES) {
    if (current.has(badge.id)) continue;
    const val = profile[badge.req.type] ?? 0;
    if (val >= badge.req.value) {
      unlocked.push(badge.id);
    }
  }

  return unlocked;
}

/**
 * Returns the badge definition for a given ID, or null if not found.
 */
export function getBadgeById(id) {
  return BADGES.find(b => b.id === id) ?? null;
}

/**
 * Returns the "top" badge from an array of badge IDs — the last one in BADGES
 * order (highest milestone) that the user has earned.
 */
export function getTopBadge(badgeIds = []) {
  if (badgeIds.length === 0) return null;
  const earned = new Set(badgeIds);
  let top = null;
  for (const badge of BADGES) {
    if (earned.has(badge.id)) top = badge;
  }
  return top;
}

// ─── Milestone point bonuses ──────────────────────────────────────────────────
// One-time bonus points awarded when a user hits a report count milestone.

const REPORT_MILESTONES = [
  { count: 5,  bonus: 10,  reason: 'Milestone: 5 reports submitted' },
  { count: 10, bonus: 20,  reason: 'Milestone: 10 reports submitted' },
  { count: 25, bonus: 50,  reason: 'Milestone: 25 reports submitted' },
  { count: 50, bonus: 100, reason: 'Milestone: 50 reports submitted' },
];

/**
 * Given the old and new report count, returns the milestone bonus to award (if any).
 * Returns null if no milestone was crossed.
 */
export function getMilestoneBonusForReportCount(oldCount, newCount) {
  for (const m of REPORT_MILESTONES) {
    if (oldCount < m.count && newCount >= m.count) {
      return { bonus: m.bonus, reason: m.reason };
    }
  }
  return null;
}
