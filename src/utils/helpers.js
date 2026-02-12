/**
 * Utility Functions - TheBetterLondon
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format date to readable format (e.g., "Feb 2, 2026")
 */
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  return format(new Date(date), formatString);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default {
  formatTimeAgo,
  formatDate,
  isValidEmail,
  isValidPassword,
  generateId,
  truncateText,
};
