/**
 * Design System - Modern UI/UX Constants
 * Material Design 3 inspired design tokens
 */

export const colors = {
  // Primary - Blue for transit/navigation
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrast: '#FFFFFF',
  },
  
  // Secondary - Green for success/active states
  secondary: {
    main: '#4CAF50',
    light: '#66BB6A',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },
  
  // Accent - Purple for favorites
  accent: {
    main: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrast: '#FFFFFF',
  },
  
  // Warning - Orange for alerts
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrast: '#000000',
  },
  
  // Error - Red for errors/danger
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
    contrast: '#FFFFFF',
  },
  
  // Surface colors
  surface: {
    default: '#FFFFFF',
    elevated: '#F5F5F5',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Background
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
  },
  
  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  
  // Borders
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },
  
  // Transit specific
  transit: {
    bus: '#FF6B6B',
    walking: '#4ECDC4',
    nearbyRadius: '#2196F3',
  },
};

export const typography = {
  // Display - Large headlines
  display: {
    large: {
      fontSize: 57,
      lineHeight: 64,
      fontWeight: '400',
      letterSpacing: -0.25,
    },
    medium: {
      fontSize: 45,
      lineHeight: 52,
      fontWeight: '400',
      letterSpacing: 0,
    },
    small: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '400',
      letterSpacing: 0,
    },
  },
  
  // Headline - Important text
  headline: {
    large: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '600',
      letterSpacing: 0,
    },
    medium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600',
      letterSpacing: 0,
    },
    small: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
      letterSpacing: 0,
    },
  },
  
  // Title - Secondary headlines
  title: {
    large: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      letterSpacing: 0,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0.15,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
  },
  
  // Body - Main content
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0.5,
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0.25,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0.4,
    },
  },
  
  // Label - Buttons, tabs
  label: {
    large: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const elevation = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  highest: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

// Component sizing
export const sizing = {
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    minWidth: {
      sm: 64,
      md: 88,
      lg: 120,
    },
  },
  touchTarget: {
    min: 44, // Accessibility guideline
  },
  fab: {
    sm: 40,
    md: 56,
    lg: 72,
  },
};

export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  sizing,
  animation,
};
