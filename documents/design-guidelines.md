# Design Guidelines - TheBetterLondon

A comprehensive design system for The Better London mobile application, inspired by London, Ontario's civic identity and modern mobile design principles.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Brand Identity](#brand-identity)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Icons & Imagery](#icons--imagery)
7. [Components](#components)
8. [Navigation Patterns](#navigation-patterns)
9. [Forms & Inputs](#forms--inputs)
10. [Feedback & States](#feedback--states)
11. [Accessibility](#accessibility)
12. [Dark Mode](#dark-mode)
13. [Animation & Motion](#animation--motion)
14. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principles

**1. Civic Trust**
- Professional, authoritative design that inspires confidence
- Clear, honest communication about issue statuses
- Transparent processes and updates

**2. Community First**
- Inclusive design that serves all Londoners
- Prioritize clarity over complexity
- Design for diverse technical abilities

**3. Action-Oriented**
- Make reporting issues effortless
- Clear calls-to-action
- Minimize steps to complete tasks

**4. Local Identity**
- Reflect London's community spirit
- Incorporate regional context
- Celebrate civic engagement

---

## Brand Identity

### App Name & Tagline

**Primary:** TheBetterLondon  
**Tagline:** *Your Voice. Your Community.*

### Voice & Tone

- **Professional yet approachable** - Speak as a trusted community partner
- **Empowering** - "You're making a difference"
- **Clear and direct** - No bureaucratic jargon
- **Optimistic** - Focus on improvement and solutions

### Messaging Guidelines

**Do:**
- "Report an issue in seconds"
- "Your report has been submitted"
- "The community thanks you"

**Don't:**
- "File a complaint form"
- "Your submission is pending review"
- "Processing request"

---

## Color System

### Primary Colors

Inspired by London's civic identity and natural landscape:

```javascript
// Primary - Forest Green (represents Thames Valley, community growth)
primary: {
  50:  '#E8F5E9',
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#66BB6A',
  500: '#4CAF50',  // Main brand color
  600: '#43A047',
  700: '#388E3C',
  800: '#2E7D32',
  900: '#1B5E20',
}

// Secondary - River Blue (Thames River)
secondary: {
  50:  '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',  // Main secondary color
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
}
```

### Semantic Colors

```javascript
// Status Colors
success: '#4CAF50',    // Issue resolved, positive actions
warning: '#FF9800',    // In progress, needs attention
error: '#F44336',      // Critical issues, errors
info: '#2196F3',       // Information, tips

// Issue Categories (assign distinct colors)
categories: {
  pothole: '#795548',        // Brown - road issues
  streetlight: '#FFC107',    // Amber - lighting
  graffiti: '#9C27B0',       // Purple - vandalism
  garbage: '#4CAF50',        // Green - waste
  sidewalk: '#607D8B',       // Blue Grey - infrastructure
  parks: '#8BC34A',          // Light Green - parks
  traffic: '#FF5722',        // Deep Orange - traffic
  other: '#9E9E9E',          // Grey - miscellaneous
}
```

### Neutral Colors

```javascript
// Grays - for text, backgrounds, borders
neutral: {
  0:   '#FFFFFF',  // Pure white
  50:  '#FAFAFA',  // Backgrounds
  100: '#F5F5F5',  // Subtle backgrounds
  200: '#EEEEEE',  // Borders
  300: '#E0E0E0',  // Dividers
  400: '#BDBDBD',  // Disabled
  500: '#9E9E9E',  // Secondary text
  600: '#757575',  // Text
  700: '#616161',  // Dark text
  800: '#424242',  // Primary text
  900: '#212121',  // Headings
  1000: '#000000', // Pure black
}
```

### Color Usage

**Primary Green (`#4CAF50`)**
- Primary buttons
- Active states
- Success messages
- Issue markers (general)

**Secondary Blue (`#2196F3`)**
- Links and hyperlinks
- Info banners
- Secondary actions
- Map water features (Thames River)

**Text Hierarchy**
- Headings: `neutral.900`
- Body text: `neutral.700`
- Secondary text: `neutral.600`
- Disabled text: `neutral.400`

---

## Typography

### Font Family

**Primary:** System fonts for optimal performance and native feel

```javascript
fontFamily: {
  ios: 'SF Pro Display',
  android: 'Roboto',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}
```

### Font Scale

Based on 8pt grid system:

```javascript
fontSize: {
  xs: 12,    // Captions, labels
  sm: 14,    // Small text, helper text
  base: 16,  // Body text (default)
  lg: 18,    // Large body, subheadings
  xl: 20,    // Card titles
  '2xl': 24, // Section headings
  '3xl': 30, // Page titles
  '4xl': 36, // Hero text
  '5xl': 48, // Display text
}

fontWeight: {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}

lineHeight: {
  tight: 1.2,   // Headings
  normal: 1.5,  // Body text
  relaxed: 1.7, // Long-form content
}
```

### Typography Styles

```javascript
// Headings
h1: {
  fontSize: 30,
  fontWeight: '700',
  lineHeight: 1.2,
  color: neutral[900],
  letterSpacing: -0.5,
}

h2: {
  fontSize: 24,
  fontWeight: '600',
  lineHeight: 1.3,
  color: neutral[900],
  letterSpacing: -0.3,
}

h3: {
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 1.4,
  color: neutral[800],
}

// Body
body1: {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 1.5,
  color: neutral[700],
}

body2: {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 1.5,
  color: neutral[600],
}

// Utility
caption: {
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 1.4,
  color: neutral[500],
}

button: {
  fontSize: 16,
  fontWeight: '600',
  letterSpacing: 0.5,
  textTransform: 'none', // Sentence case preferred
}
```

---

## Spacing & Layout

### Base Unit: 8pt Grid System

All spacing follows multiples of 8pt for consistency:

```javascript
spacing: {
  0: 0,
  1: 4,     // 0.5x - Tight spacing
  2: 8,     // 1x - Base unit
  3: 12,    // 1.5x
  4: 16,    // 2x - Standard padding
  5: 20,    // 2.5x
  6: 24,    // 3x - Section spacing
  8: 32,    // 4x - Large spacing
  10: 40,   // 5x
  12: 48,   // 6x - Extra large spacing
  16: 64,   // 8x
  20: 80,   // 10x
  24: 96,   // 12x
}
```

### Container Widths

```javascript
container: {
  mobile: '100%',      // Full width on mobile
  tablet: 768,         // Max width for tablets
  desktop: 1200,       // Max width for web
}

// Content padding
contentPadding: {
  horizontal: 16,      // Standard horizontal padding
  vertical: 24,        // Standard vertical padding
  section: 32,         // Between major sections
}
```

### Screen Margins

```javascript
// Safe area padding
safeArea: {
  top: StatusBar.currentHeight || 0,
  bottom: 0,
  horizontal: 16,
}

// Card spacing
card: {
  padding: 16,
  margin: 8,
  gap: 12,              // Between elements inside card
}
```

---

## Icons & Imagery

### Icon Library

**Primary:** React Native Vector Icons - Material Community Icons

```bash
npm install react-native-vector-icons
```

### Icon Sizes

```javascript
iconSize: {
  xs: 16,     // Small indicators
  sm: 20,     // List items, inputs
  base: 24,   // Standard icons (default)
  lg: 32,     // Feature icons
  xl: 48,     // Hero icons
  '2xl': 64,  // Large illustrations
}
```

### Icon Set

Core icons for the app:

```javascript
icons: {
  // Navigation
  home: 'home',
  map: 'map',
  add: 'plus-circle',
  profile: 'account',
  settings: 'cog',
  
  // Actions
  camera: 'camera',
  gallery: 'image',
  location: 'map-marker',
  send: 'send',
  edit: 'pencil',
  delete: 'delete',
  share: 'share-variant',
  filter: 'filter-variant',
  search: 'magnify',
  
  // Issue Categories
  pothole: 'road-variant',
  streetlight: 'lightbulb',
  graffiti: 'spray',
  garbage: 'trash-can',
  sidewalk: 'walk',
  parks: 'tree',
  traffic: 'traffic-light',
  
  // Status
  open: 'alert-circle',
  inProgress: 'progress-clock',
  resolved: 'check-circle',
  verified: 'check-decagram',
  
  // Social
  upvote: 'thumb-up',
  comment: 'comment',
  notification: 'bell',
  
  // Auth
  email: 'email',
  password: 'lock',
  google: 'google',
  logout: 'logout',
  
  // Info
  info: 'information',
  warning: 'alert',
  error: 'alert-circle',
  success: 'check-circle',
  help: 'help-circle',
  
  // Navigation arrows
  back: 'arrow-left',
  forward: 'arrow-right',
  down: 'chevron-down',
  up: 'chevron-up',
  close: 'close',
}
```

### Image Guidelines

**Issue Photos:**
- Aspect ratio: 4:3 or 16:9
- Resolution: Min 800x600px
- Format: JPEG (optimized for mobile)
- Max file size: 5MB
- Compression: 80% quality

**Profile Photos:**
- Aspect ratio: 1:1 (square)
- Resolution: 400x400px
- Format: JPEG
- Max file size: 2MB

**Illustrations:**
- Use simple, friendly illustrations for empty states
- Maintain consistent line weight
- Use brand color palette
- SVG format preferred

---

## Components

### Buttons

#### Primary Button

```javascript
primaryButton: {
  backgroundColor: primary[500],
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  minHeight: 48,
  justifyContent: 'center',
  alignItems: 'center',
  
  // Pressed state
  pressed: {
    backgroundColor: primary[600],
  },
  
  // Disabled state
  disabled: {
    backgroundColor: neutral[300],
    opacity: 0.6,
  }
}
```

#### Secondary Button

```javascript
secondaryButton: {
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: primary[500],
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  minHeight: 48,
  
  // Text color
  textColor: primary[500],
  
  // Pressed state
  pressed: {
    backgroundColor: primary[50],
    borderColor: primary[600],
  }
}
```

#### Text Button

```javascript
textButton: {
  backgroundColor: 'transparent',
  paddingVertical: 8,
  paddingHorizontal: 16,
  
  // Text color
  textColor: primary[500],
  
  // Pressed state
  pressed: {
    opacity: 0.7,
  }
}
```

#### Icon Button

```javascript
iconButton: {
  width: 48,
  height: 48,
  borderRadius: 24,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  
  // Pressed state
  pressed: {
    backgroundColor: neutral[100],
  }
}
```

### Cards

#### Issue Card

```javascript
issueCard: {
  backgroundColor: neutral[0],
  borderRadius: 12,
  padding: 16,
  marginVertical: 8,
  marginHorizontal: 16,
  
  // Shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  
  // Components
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  }
}
```

#### Info Card

```javascript
infoCard: {
  backgroundColor: neutral[50],
  borderRadius: 8,
  padding: 16,
  marginVertical: 8,
  borderLeftWidth: 4,
  borderLeftColor: info, // Changes based on type
}
```

### Badges & Chips

```javascript
badge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  
  // Status variants
  open: {
    backgroundColor: warning + '20', // 20% opacity
    color: warning,
  },
  
  inProgress: {
    backgroundColor: info + '20',
    color: info,
  },
  
  resolved: {
    backgroundColor: success + '20',
    color: success,
  }
}

chip: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: neutral[100],
  gap: 6,
}
```

### Lists

```javascript
listItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: neutral[0],
  borderBottomWidth: 1,
  borderBottomColor: neutral[200],
  minHeight: 64,
  
  // Leading icon/avatar
  leading: {
    marginRight: 16,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Trailing icon/action
  trailing: {
    marginLeft: 16,
  }
}
```

---

## Navigation Patterns

### Bottom Tab Navigation

```javascript
tabBar: {
  height: 64,
  backgroundColor: neutral[0],
  borderTopWidth: 1,
  borderTopColor: neutral[200],
  paddingBottom: 8,
  paddingTop: 8,
  
  // Tab items
  tab: {
    active: {
      tintColor: primary[500],
      labelColor: primary[500],
    },
    inactive: {
      tintColor: neutral[500],
      labelColor: neutral[600],
    }
  },
  
  // Badge (for notifications)
  badge: {
    position: 'absolute',
    top: 4,
    right: 20,
    backgroundColor: error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  }
}
```

**Tab Structure:**
- Home (Feed)
- Map
- Report (center, emphasized)
- Activity
- Profile

### Header

```javascript
header: {
  height: 56,
  backgroundColor: neutral[0],
  borderBottomWidth: 1,
  borderBottomColor: neutral[200],
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  
  // Title
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: neutral[900],
  },
  
  // Back button
  backButton: {
    width: 40,
    height: 40,
  }
}
```

---

## Forms & Inputs

### Text Input

```javascript
textInput: {
  height: 48,
  borderWidth: 1,
  borderColor: neutral[300],
  borderRadius: 8,
  paddingHorizontal: 16,
  fontSize: 16,
  backgroundColor: neutral[0],
  color: neutral[900],
  
  // Focus state
  focused: {
    borderColor: primary[500],
    borderWidth: 2,
  },
  
  // Error state
  error: {
    borderColor: error,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: neutral[100],
    color: neutral[500],
  }
}

// Multi-line input (textarea)
textArea: {
  minHeight: 120,
  paddingVertical: 12,
  textAlignVertical: 'top',
}

// Label
inputLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: neutral[700],
  marginBottom: 8,
}

// Helper text
helperText: {
  fontSize: 12,
  color: neutral[600],
  marginTop: 4,
}

// Error text
errorText: {
  fontSize: 12,
  color: error,
  marginTop: 4,
}
```

### Dropdown / Picker

```javascript
picker: {
  height: 48,
  borderWidth: 1,
  borderColor: neutral[300],
  borderRadius: 8,
  paddingHorizontal: 16,
  backgroundColor: neutral[0],
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
```

### Checkbox & Radio

```javascript
checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: neutral[400],
  borderRadius: 4,
  
  // Checked state
  checked: {
    backgroundColor: primary[500],
    borderColor: primary[500],
  }
}

radio: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: neutral[400],
  borderRadius: 12,
  
  // Selected state
  selected: {
    borderColor: primary[500],
    // Inner circle
    innerCircle: {
      width: 12,
      height: 12,
      backgroundColor: primary[500],
      borderRadius: 6,
    }
  }
}
```

### Switch / Toggle

```javascript
switch: {
  width: 48,
  height: 28,
  borderRadius: 14,
  padding: 2,
  
  // Off state
  off: {
    backgroundColor: neutral[300],
  },
  
  // On state
  on: {
    backgroundColor: primary[500],
  },
  
  // Thumb
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: neutral[0],
  }
}
```

---

## Feedback & States

### Loading States

```javascript
// Spinner
spinner: {
  small: 20,
  medium: 36,
  large: 48,
  color: primary[500],
}

// Skeleton loader
skeleton: {
  backgroundColor: neutral[200],
  borderRadius: 4,
  
  // Animation
  shimmer: {
    from: neutral[200],
    to: neutral[100],
  }
}
```

### Empty States

```javascript
emptyState: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 32,
  
  // Icon
  icon: {
    size: 64,
    color: neutral[400],
    marginBottom: 16,
  },
  
  // Title
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: neutral[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  
  // Description
  description: {
    fontSize: 16,
    color: neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  }
}
```

### Alerts & Toasts

```javascript
alert: {
  borderRadius: 8,
  padding: 16,
  marginHorizontal: 16,
  marginVertical: 8,
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  
  // Variants
  success: {
    backgroundColor: success + '10',
    borderLeftWidth: 4,
    borderLeftColor: success,
  },
  
  error: {
    backgroundColor: error + '10',
    borderLeftWidth: 4,
    borderLeftColor: error,
  },
  
  warning: {
    backgroundColor: warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: warning,
  },
  
  info: {
    backgroundColor: info + '10',
    borderLeftWidth: 4,
    borderLeftColor: info,
  }
}

toast: {
  position: 'absolute',
  bottom: 100,
  left: 16,
  right: 16,
  backgroundColor: neutral[900],
  borderRadius: 8,
  padding: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  
  // Shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
}
```

### Modals

```javascript
modal: {
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Bottom sheet style
  },
  
  // Content
  content: {
    backgroundColor: neutral[0],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  
  // Handle (drag indicator)
  handle: {
    width: 40,
    height: 4,
    backgroundColor: neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  }
}
```

---

## Accessibility

### Minimum Requirements

**Touch Targets:**
- Minimum size: 44x44pt (iOS), 48x48dp (Android)
- Spacing between targets: minimum 8pt

**Color Contrast:**
- Text: Minimum 4.5:1 ratio for normal text
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

**Text Scaling:**
- Support Dynamic Type (iOS) and font scale (Android)
- Test at 200% scale
- Maintain layout at larger text sizes

### Accessibility Props

```javascript
// Button example
accessibilityLabel="Report a pothole"
accessibilityHint="Opens the issue reporting form"
accessibilityRole="button"
accessible={true}

// Image example
accessibilityLabel="Photo of pothole on Main Street"
accessibilityRole="image"

// Input example
accessibilityLabel="Issue description"
accessibilityHint="Describe the issue you're reporting"
```

### Screen Reader Support

- All interactive elements must have labels
- Use semantic HTML/components
- Provide alternative text for images
- Announce dynamic content changes
- Support keyboard navigation (web)

---

## Dark Mode

### Dark Mode Color Palette

```javascript
darkMode: {
  background: {
    primary: '#121212',     // Main background
    secondary: '#1E1E1E',   // Card background
    elevated: '#2C2C2C',    // Modal, elevated surfaces
  },
  
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#666666',
  },
  
  border: {
    default: '#2C2C2C',
    subtle: '#1E1E1E',
  },
  
  // Primary and semantic colors remain similar
  // but may need slight adjustments for contrast
  primary: '#66BB6A',      // Slightly lighter
  secondary: '#42A5F5',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',
}
```

### Implementation Strategy

```javascript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

// Dynamic colors
const colors = {
  background: isDark ? darkMode.background.primary : neutral[0],
  text: isDark ? darkMode.text.primary : neutral[900],
  // ... etc
}
```

---

## Animation & Motion

### Animation Principles

**Duration:**
- Micro: 100-150ms (small feedback)
- Short: 200-300ms (most transitions)
- Medium: 300-500ms (page transitions)
- Long: 500ms+ (complex animations)

**Easing:**
```javascript
easing: {
  // Standard curve for most animations
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  
  // Deceleration for entering elements
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  
  // Acceleration for exiting elements
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  
  // Sharp for brief transitions
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
}
```

### Common Animations

**Fade In/Out:**
```javascript
fadeIn: {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 200,
}
```

**Slide In:**
```javascript
slideInUp: {
  from: { translateY: 100, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration: 300,
  easing: easing.decelerate,
}
```

**Button Press:**
```javascript
buttonPress: {
  scale: 0.95,
  duration: 100,
}
```

**Card Appear:**
```javascript
cardAppear: {
  from: { scale: 0.9, opacity: 0 },
  to: { scale: 1, opacity: 1 },
  duration: 300,
  easing: easing.standard,
}
```

### Page Transitions

- **Stack navigation:** Slide from right (iOS), Fade (Android)
- **Modal:** Slide from bottom
- **Tab switch:** Fade
- Keep transitions snappy and purposeful

---

## Implementation Guide

### Install Required Packages

```bash
# Design system foundation
npm install react-native-vector-icons

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Forms
npm install react-hook-form

# Animations
npm install react-native-reanimated

# UI Components (optional)
npm install react-native-paper
# OR
npm install react-native-elements
```

### Project Structure

```
src/
├── theme/
│   ├── index.js              # Main theme export
│   ├── colors.js             # Color definitions
│   ├── typography.js         # Typography styles
│   ├── spacing.js            # Spacing constants
│   └── components.js         # Component styles
├── components/
│   ├── Button/
│   │   ├── PrimaryButton.js
│   │   ├── SecondaryButton.js
│   │   └── IconButton.js
│   ├── Card/
│   │   ├── IssueCard.js
│   │   └── InfoCard.js
│   ├── Input/
│   │   ├── TextInput.js
│   │   └── TextArea.js
│   └── ...
└── ...
```

### Theme Configuration Example

Create `src/theme/index.js`:

```javascript
import colors from './colors';
import typography from './typography';
import spacing from './spacing';
import components from './components';

const theme = {
  colors,
  typography,
  spacing,
  components,
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    base: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export default theme;
```

### Using the Theme

```javascript
import { useTheme } from './context/ThemeContext';
import { StyleSheet } from 'react-native';

function MyComponent() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.base,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
}
```

---

## Design Checklist

Use this checklist when implementing new features:

**Layout & Spacing**
- [ ] Follows 8pt grid system
- [ ] Consistent padding and margins
- [ ] Appropriate spacing between elements
- [ ] Responsive on different screen sizes

**Typography**
- [ ] Correct font sizes from scale
- [ ] Appropriate font weights
- [ ] Good line height for readability
- [ ] Proper text hierarchy

**Colors**
- [ ] Uses colors from design system
- [ ] Sufficient contrast for readability
- [ ] Semantic colors for status/actions
- [ ] Dark mode support (if applicable)

**Accessibility**
- [ ] Touch targets at least 44x44pt
- [ ] Accessibility labels on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Supports text scaling

**Interactions**
- [ ] Clear visual feedback for interactions
- [ ] Loading states for async operations
- [ ] Error states handled gracefully
- [ ] Smooth animations (not overdone)

**Icons & Images**
- [ ] Icons from approved icon set
- [ ] Consistent icon sizes
- [ ] Images optimized for mobile
- [ ] Alt text for images

---

## Resources & Tools

**Design Tools:**
- [Figma](https://figma.com) - For mockups and prototypes
- [Coolors](https://coolors.co) - Color palette generator
- [Type Scale](https://type-scale.com) - Typography scale calculator

**Accessibility:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [a11y Project](https://www.a11y-project.com/)

**Icons:**
- [Material Community Icons](https://materialdesignicons.com/)
- [React Native Vector Icons Directory](https://oblador.github.io/react-native-vector-icons/)

**React Native:**
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Native Elements](https://reactnativeelements.com/)

---

## Version History

**Version 1.0** - February 2, 2026
- Initial design guidelines
- Core component specifications
- Color system based on London civic identity
- Typography and spacing standards
- Accessibility guidelines
- Dark mode specifications

---

*These guidelines are living documents. As the app evolves, the design system should be updated to reflect new patterns and components.*
