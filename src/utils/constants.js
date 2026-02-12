/**
 * Issue Categories - TheBetterLondon
 * Based on US-201
 */

export const ISSUE_CATEGORIES = [
  {
    id: 'pothole',
    label: 'Pothole',
    icon: 'road-variant',
    color: '#795548',
  },
  {
    id: 'garbage',
    label: 'Garbage Pile-up',
    icon: 'trash-can',
    color: '#4CAF50',
  },
  {
    id: 'sidewalk',
    label: 'Broken Sidewalk',
    icon: 'walk',
    color: '#607D8B',
  },
  {
    id: 'parks',
    label: 'Overgrown Tree',
    icon: 'tree',
    color: '#8BC34A',
  },
  {
    id: 'streetlight',
    label: 'Streetlight Outage',
    icon: 'lightbulb',
    color: '#FFC107',
  },
  {
    id: 'graffiti',
    label: 'Graffiti / Vandalism',
    icon: 'spray',
    color: '#9C27B0',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'help-circle',
    color: '#9E9E9E',
  },
];

export const ISSUE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

export const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: 'Open',
  [ISSUE_STATUS.UNDER_REVIEW]: 'Under Review',
  [ISSUE_STATUS.IN_PROGRESS]: 'In Progress',
  [ISSUE_STATUS.RESOLVED]: 'Resolved',
};

export const ISSUE_STATUS_COLORS = {
  [ISSUE_STATUS.OPEN]: '#FF9800',
  [ISSUE_STATUS.UNDER_REVIEW]: '#2196F3',
  [ISSUE_STATUS.IN_PROGRESS]: '#FF9800',
  [ISSUE_STATUS.RESOLVED]: '#4CAF50',
};

export default {
  ISSUE_CATEGORIES,
  ISSUE_STATUS,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_COLORS,
};
