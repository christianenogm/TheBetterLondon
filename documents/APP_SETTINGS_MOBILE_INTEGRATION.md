# TheBetterLondon - App Settings Mobile Integration Guide

**Last Updated:** April 3, 2026  
**Admin Dashboard Version:** 0.1.0  
**Target Platform:** React Native Mobile App

---

## Overview

This document provides complete implementation details for integrating the App Settings features from the admin dashboard into the TheBetterLondon React Native mobile app. The admin dashboard allows admins to control four key mobile app settings:

1. **Maintenance Mode** - Show maintenance screen to users
2. **Announcement Banner** - Display featured announcements on home screen
3. **FAQs** - Manage help content displayed in Help screen
4. **Report Categories** - Control available categories for report submission

---

## Table of Contents

- [Firestore Schema](#firestore-schema)
- [Feature 1: Maintenance Mode](#feature-1-maintenance-mode)
- [Feature 2: Announcement Banner](#feature-2-announcement-banner)
- [Feature 3: FAQs](#feature-3-faqs)
- [Feature 4: Report Categories](#feature-4-report-categories)
- [Implementation Checklist](#implementation-checklist)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)

---

## Firestore Schema

### Collection: `appSettings`

**Document ID:** `config`

```javascript
{
  maintenanceMode: {
    enabled: boolean,           // Whether maintenance mode is active
    message: string,            // Message to display during maintenance
    updatedAt: string (ISO),    // Last update timestamp
    updatedBy: string (userId)  // Admin who made the change
  },
  announcement: {
    enabled: boolean,           // Whether banner should be shown
    title: string,              // Banner title (max 50 chars)
    message: string,            // Banner message (max 200 chars)
    type: string,               // 'info' | 'warning' | 'success'
    updatedAt: string (ISO),    // Last update timestamp
    updatedBy: string (userId)  // Admin who made the change
  },
  updatedAt: string (ISO)       // Last settings update
}
```

**Example Document:**
```json
{
  "maintenanceMode": {
    "enabled": false,
    "message": "We are currently performing maintenance. Please check back soon.",
    "updatedAt": "2026-04-03T15:30:00.000Z",
    "updatedBy": "admin123"
  },
  "announcement": {
    "enabled": true,
    "title": "New Transit Tracking Feature!",
    "message": "Track your bus in real-time on the new Transit tab. Try it now!",
    "type": "success",
    "updatedAt": "2026-04-03T14:00:00.000Z",
    "updatedBy": "admin123"
  },
  "updatedAt": "2026-04-03T15:30:00.000Z"
}
```

### Collection: `faqs`

**Document ID:** Auto-generated

```javascript
{
  question: string,             // FAQ question
  answer: string,               // FAQ answer (supports line breaks)
  order: number,                // Display order (lower = first)
  createdAt: string (ISO),      // Creation timestamp
  createdBy: string (userId),   // Admin who created
  updatedAt: string (ISO),      // Last update timestamp
  updatedBy: string (userId)    // Admin who last updated
}
```

**Example Document:**
```json
{
  "question": "What is TheBetterLondon?",
  "answer": "TheBetterLondon is a community engagement platform that allows residents to report civic issues, track garbage schedules, and stay informed about transit updates.",
  "order": 0,
  "createdAt": "2026-04-01T10:00:00.000Z",
  "createdBy": "admin123",
  "updatedAt": "2026-04-02T11:30:00.000Z",
  "updatedBy": "admin456"
}
```

### Collection: `categories`

**Document ID:** Auto-generated

```javascript
{
  name: string,                 // Category display name
  icon: string,                 // Emoji icon (1-2 characters)
  enabled: boolean,             // Whether category is active
  order: number,                // Display order (lower = first)
  createdAt: string (ISO),      // Creation timestamp
  createdBy: string (userId),   // Admin who created
  updatedAt: string (ISO),      // Last update timestamp
  updatedBy: string (userId)    // Admin who last updated
}
```

**Example Document:**
```json
{
  "name": "Pothole",
  "icon": "🚧",
  "enabled": true,
  "order": 0,
  "createdAt": "2026-03-15T09:00:00.000Z",
  "createdBy": "admin123",
  "updatedAt": "2026-04-01T12:00:00.000Z",
  "updatedBy": "admin123"
}
```

---

## Feature 1: Maintenance Mode

### Overview

Maintenance mode allows admins to temporarily block access to the app and display a maintenance message to users. This is useful during:
- Database migrations
- Critical bug fixes
- Scheduled system maintenance
- Emergency downtime

### Implementation Steps

#### Step 1: Create Firestore Listener Service

Create a new file: `src/services/appSettingsService.js`

```javascript
import firestore from '@react-native-firebase/firestore';

/**
 * Real-time listener for app settings
 * Returns unsubscribe function
 */
export const subscribeToAppSettings = (callback) => {
  const unsubscribe = firestore()
    .collection('appSettings')
    .doc('config')
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback(doc.data());
        } else {
          // Return default settings if document doesn't exist
          callback({
            maintenanceMode: {
              enabled: false,
              message: 'We are currently performing maintenance. Please check back soon.'
            },
            announcement: {
              enabled: false,
              title: '',
              message: '',
              type: 'info'
            }
          });
        }
      },
      (error) => {
        console.error('Error fetching app settings:', error);
        // Fallback to defaults on error
        callback({
          maintenanceMode: { enabled: false, message: '' },
          announcement: { enabled: false, title: '', message: '', type: 'info' }
        });
      }
    );

  return unsubscribe;
};

/**
 * Fetch app settings once (no real-time updates)
 */
export const getAppSettings = async () => {
  try {
    const doc = await firestore()
      .collection('appSettings')
      .doc('config')
      .get();

    if (doc.exists) {
      return doc.data();
    }

    // Return defaults if document doesn't exist
    return {
      maintenanceMode: {
        enabled: false,
        message: 'We are currently performing maintenance. Please check back soon.'
      },
      announcement: {
        enabled: false,
        title: '',
        message: '',
        type: 'info'
      }
    };
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};
```

#### Step 2: Create App Settings Context

Create a new file: `src/context/AppSettingsContext.js`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAppSettings } from '../services/appSettingsService';

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToAppSettings((data) => {
      setSettings(data);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const isMaintenanceMode = settings?.maintenanceMode?.enabled || false;
  const announcement = settings?.announcement || null;

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        isMaintenanceMode,
        maintenanceMessage: settings?.maintenanceMode?.message || '',
        announcement
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};
```

#### Step 3: Wrap App with AppSettingsProvider

In your `App.js` or main entry point:

```javascript
import React from 'react';
import { AppSettingsProvider } from './src/context/AppSettingsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppSettingsProvider>
      <RootNavigator />
    </AppSettingsProvider>
  );
}
```

#### Step 4: Create Maintenance Screen Component

Create a new file: `src/screens/MaintenanceScreen.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function MaintenanceScreen() {
  const { maintenanceMessage } = useAppSettings();

  return (
    <View style={styles.container}>
      {/* Optional: Add your logo or illustration */}
      <Image
        source={require('../assets/maintenance-icon.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Under Maintenance</Text>
      
      <Text style={styles.message}>
        {maintenanceMessage || 'We are currently performing maintenance. Please check back soon.'}
      </Text>
      
      <Text style={styles.footer}>
        We'll be back shortly. Thank you for your patience!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  footer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

#### Step 5: Add Conditional Rendering in Root Navigator

In your `RootNavigator.js` or main navigation file:

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSettings } from '../context/AppSettingsContext';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isMaintenanceMode, loading } = useAppSettings();

  // Show loading screen while checking maintenance status
  if (loading) {
    return <LoadingScreen />;
  }

  // Show maintenance screen if enabled
  if (isMaintenanceMode) {
    return <MaintenanceScreen />;
  }

  // Show normal app
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        {/* Other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Testing Maintenance Mode

1. **Enable from Admin Dashboard:**
   - Navigate to App Settings → Maintenance Mode
   - Toggle "Enable Maintenance Mode" ON
   - Set custom message: "System upgrade in progress. Back at 5 PM EST."
   - Click "Save Changes"

2. **Verify in Mobile App:**
   - App should immediately show maintenance screen
   - Custom message should be displayed
   - No navigation should be accessible

3. **Disable from Admin Dashboard:**
   - Toggle "Enable Maintenance Mode" OFF
   - Click "Save Changes"

4. **Verify in Mobile App:**
   - App should immediately return to normal operation
   - All navigation should be accessible

---

## Feature 2: Announcement Banner

### Overview

The announcement banner displays important messages on the mobile app's home screen. Admins can control:
- Banner visibility (on/off)
- Title and message content
- Banner type (info, warning, success)

### Implementation Steps

#### Step 1: Create Banner Component

Create a new file: `src/components/AnnouncementBanner.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function AnnouncementBanner({ onDismiss }) {
  const { announcement } = useAppSettings();

  // Don't render if disabled or no content
  if (!announcement?.enabled || !announcement?.title || !announcement?.message) {
    return null;
  }

  const { title, message, type } = announcement;

  // Get colors based on type
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#DCFCE7',
          border: '#86EFAC',
          title: '#166534',
          text: '#15803D'
        };
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          title: '#92400E',
          text: '#B45309'
        };
      default: // info
        return {
          bg: '#DBEAFE',
          border: '#93C5FD',
          title: '#1E3A8A',
          text: '#1E40AF'
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
      
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.title }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Step 2: Add Banner to Home Screen

In your `HomeScreen.js`:

```javascript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AnnouncementBanner from '../components/AnnouncementBanner';

export default function HomeScreen() {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Announcement Banner */}
      {!bannerDismissed && (
        <AnnouncementBanner onDismiss={() => setBannerDismissed(true)} />
      )}
      
      {/* Rest of your home screen content */}
      {/* ... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
```

### Optional: Persistent Dismissal

To make banner dismissals persist across app sessions:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { announcement } = useAppSettings();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Check if current announcement was already dismissed
  useEffect(() => {
    checkDismissedStatus();
  }, [announcement]);

  const checkDismissedStatus = async () => {
    if (!announcement?.enabled) return;
    
    try {
      const dismissedId = await AsyncStorage.getItem('dismissedAnnouncementId');
      const currentId = `${announcement.title}-${announcement.updatedAt}`;
      setBannerDismissed(dismissedId === currentId);
    } catch (error) {
      console.error('Error checking dismissed status:', error);
    }
  };

  const handleDismiss = async () => {
    const currentId = `${announcement.title}-${announcement.updatedAt}`;
    try {
      await AsyncStorage.setItem('dismissedAnnouncementId', currentId);
      setBannerDismissed(true);
    } catch (error) {
      console.error('Error saving dismissed status:', error);
      setBannerDismissed(true); // Still dismiss in UI
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!bannerDismissed && <AnnouncementBanner onDismiss={handleDismiss} />}
      {/* Rest of content */}
    </ScrollView>
  );
}
```

### Testing Announcement Banner

1. **Create Announcement from Admin Dashboard:**
   - Navigate to App Settings → Announcement Banner
   - Toggle "Show Announcement Banner" ON
   - Set Banner Type: "Success"
   - Title: "New Feature Available!"
   - Message: "Check out the new Transit Tracking feature in the Transit tab."
   - Click "Save Changes"

2. **Verify in Mobile App:**
   - Open/refresh home screen
   - Green banner should appear with success styling
   - Tap X to dismiss (banner should hide)

3. **Update Announcement:**
   - Change type to "Warning"
   - Update message
   - Save changes

4. **Verify Update:**
   - Banner should reappear (new message)
   - Yellow warning styling should be applied

---

## Feature 3: FAQs

### Overview

Admins can manage FAQ content that appears in the mobile app's Help/Support screen.

### Implementation Steps

#### Step 1: Create FAQ Service

Add to your `src/services/appSettingsService.js`:

```javascript
/**
 * Fetch all FAQs ordered by display order
 */
export const getFAQs = async () => {
  try {
    const snapshot = await firestore()
      .collection('faqs')
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

/**
 * Real-time listener for FAQs
 */
export const subscribeToFAQs = (callback) => {
  const unsubscribe = firestore()
    .collection('faqs')
    .orderBy('order', 'asc')
    .onSnapshot(
      (snapshot) => {
        const faqs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(faqs);
      },
      (error) => {
        console.error('Error in FAQs listener:', error);
      }
    );

  return unsubscribe;
};
```

#### Step 2: Create FAQ Screen

Create a new file: `src/screens/FAQScreen.js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { getFAQs } from '../services/appSettingsService';

export default function FAQScreen() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await getFAQs();
      setFaqs(data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (faqs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No FAQs available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions about TheBetterLondon
        </Text>
      </View>

      {faqs.map((faq) => (
        <TouchableOpacity
          key={faq.id}
          style={styles.faqItem}
          onPress={() => toggleExpand(faq.id)}
          activeOpacity={0.7}
        >
          <View style={styles.questionRow}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.icon}>
              {expandedId === faq.id ? '−' : '+'}
            </Text>
          </View>
          
          {expandedId === faq.id && (
            <Text style={styles.answer}>{faq.answer}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Still have questions? Contact support at support@thebetterlondon.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    width: 24,
    textAlign: 'center',
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

### Testing FAQs

1. **Add FAQs from Admin Dashboard:**
   - Navigate to App Settings → FAQs
   - Click "Add FAQ"
   - Question: "What is TheBetterLondon?"
   - Answer: "TheBetterLondon is a community engagement platform..."
   - Display Order: 0
   - Click "Create"

2. **Verify in Mobile App:**
   - Navigate to Help/FAQ screen
   - FAQ should appear
   - Tap to expand/collapse
   - Should show in correct order

---

## Feature 4: Report Categories

### Overview

Admins can manage which report categories are available in the mobile app's report submission form.

### Implementation Steps

#### Step 1: Create Categories Service

Add to your `src/services/appSettingsService.js`:

```javascript
/**
 * Fetch active report categories ordered by display order
 */
export const getActiveCategories = async () => {
  try {
    const snapshot = await firestore()
      .collection('categories')
      .where('enabled', '==', true)
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Real-time listener for categories
 */
export const subscribeToCategories = (callback) => {
  const unsubscribe = firestore()
    .collection('categories')
    .where('enabled', '==', true)
    .orderBy('order', 'asc')
    .onSnapshot(
      (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(categories);
      },
      (error) => {
        console.error('Error in categories listener:', error);
      }
    );

  return unsubscribe;
};
```

#### Step 2: Update Report Submission Screen

In your `CreateReportScreen.js` or similar:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { getActiveCategories } from '../services/appSettingsService';

export default function CreateReportScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Show error to user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Select Category *</Text>
      
      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No categories available at this time.
          </Text>
        </View>
      ) : (
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory?.id === category.id && styles.categoryCardSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory?.id === category.id && styles.categoryNameSelected
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Rest of report form */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Brief description of the issue"
        maxLength={100}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Provide detailed information about the issue"
        multiline
        numberOfLines={5}
        maxLength={500}
      />

      {/* Submit button, etc. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
```

### Testing Report Categories

1. **Add Categories from Admin Dashboard:**
   - Navigate to App Settings → Report Categories
   - Click "Add Category"
   - Name: "Pothole"
   - Icon: 🚧 (select from picker)
   - Enabled: ON
   - Display Order: 0
   - Click "Create"

2. **Verify in Mobile App:**
   - Go to Create Report screen
   - Category should appear in picker
   - Icon and name should display correctly
   - Should be selectable

3. **Disable Category:**
   - In admin dashboard, toggle category OFF
   - Save changes

4. **Verify in Mobile App:**
   - Category should immediately disappear from picker
   - Previously selected category should still work in submitted reports

---

## Implementation Checklist

### Setup Phase
- [ ] Install `@react-native-firebase/firestore` if not already installed
- [ ] Create `src/services/appSettingsService.js`
- [ ] Create `src/context/AppSettingsContext.js`
- [ ] Wrap app with `AppSettingsProvider` in main entry point

### Maintenance Mode
- [ ] Create `src/screens/MaintenanceScreen.js`
- [ ] Add conditional rendering in `RootNavigator`
- [ ] Test enable/disable from admin dashboard
- [ ] Verify real-time updates

### Announcement Banner
- [ ] Create `src/components/AnnouncementBanner.js`
- [ ] Add banner to Home screen
- [ ] Implement dismissal logic (optional: persistent)
- [ ] Test all banner types (info, warning, success)
- [ ] Verify real-time updates

### FAQs
- [ ] Add FAQ service methods to `appSettingsService.js`
- [ ] Create `src/screens/FAQScreen.js`
- [ ] Add navigation to FAQ screen from Help/Settings
- [ ] Test adding/editing/deleting FAQs from dashboard
- [ ] Verify real-time updates

### Report Categories
- [ ] Add categories service methods to `appSettingsService.js`
- [ ] Update `CreateReportScreen` to fetch categories
- [ ] Replace hardcoded categories with dynamic fetch
- [ ] Test adding/disabling categories from dashboard
- [ ] Verify categories update in real-time

---

## Testing Guide

### Test Case 1: Maintenance Mode Enable/Disable
1. Start mobile app (should show normal screens)
2. Admin enables maintenance mode with custom message
3. Mobile app should immediately show maintenance screen
4. Verify custom message displays correctly
5. Admin disables maintenance mode
6. Mobile app should immediately return to normal

**Expected Result:** ✅ Real-time switching between maintenance and normal mode

### Test Case 2: Announcement Banner Lifecycle
1. Admin creates announcement (type: info)
2. Open mobile app home screen
3. Blue banner should appear at top
4. Tap X to dismiss
5. Banner should hide
6. Admin updates announcement (type: warning)
7. Banner should reappear with yellow styling
8. New message should be displayed

**Expected Result:** ✅ Banner appears, dismisses, and updates in real-time

### Test Case 3: FAQ Management
1. Admin adds 3 FAQs with different orders (0, 1, 2)
2. Open FAQ screen in mobile app
3. All 3 FAQs should appear in correct order
4. Tap first FAQ to expand
5. Answer should display
6. Admin edits second FAQ question
7. Mobile app should update without refresh
8. Admin deletes third FAQ
9. FAQ should disappear from mobile app

**Expected Result:** ✅ FAQs sync in real-time with correct ordering

### Test Case 4: Category Management
1. Admin creates category "Graffiti" (🎨, order: 0, enabled)
2. Open Create Report screen in mobile app
3. "Graffiti" should appear first in category grid
4. Admin disables "Graffiti" category
5. "Graffiti" should disappear from mobile app immediately
6. Admin re-enables category
7. "Graffiti" should reappear

**Expected Result:** ✅ Categories sync in real-time based on enabled status

---

## Troubleshooting

### Issue: Maintenance screen not appearing when enabled

**Possible Causes:**
1. Firestore listener not set up correctly
2. AppSettingsProvider not wrapping app
3. Firestore security rules blocking read

**Solutions:**
```javascript
// Verify listener is active
useEffect(() => {
  console.log('Setting up app settings listener...');
  const unsubscribe = subscribeToAppSettings((data) => {
    console.log('App settings updated:', data);
    setSettings(data);
  });
  return unsubscribe;
}, []);

// Check Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appSettings/{document} {
      allow read: if true; // Everyone can read settings
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Issue: Announcement banner not updating in real-time

**Solutions:**
1. Check that `AppSettingsProvider` is using real-time listener
2. Verify component is reading from context correctly
3. Clear app cache and restart

### Issue: Categories not loading

**Possible Causes:**
1. Firestore query missing composite index
2. All categories are disabled
3. Security rules blocking access

**Solutions:**
```javascript
// Create composite index if needed
// Go to Firebase Console > Firestore > Indexes
// Add index: collection=categories, fields=(enabled ASC, order ASC)

// Check if any categories exist
const checkCategories = async () => {
  const all = await firestore().collection('categories').get();
  console.log('Total categories:', all.size);
  
  const enabled = await firestore()
    .collection('categories')
    .where('enabled', '==', true)
    .get();
  console.log('Enabled categories:', enabled.size);
};
```

### Issue: FAQs not ordered correctly

**Solution:**
```javascript
// Ensure order field exists on all FAQ documents
const snapshot = await firestore().collection('faqs').get();
snapshot.docs.forEach(doc => {
  if (!doc.data().order) {
    doc.ref.update({ order: 0 });
  }
});
```

---

## Firestore Security Rules

Add these rules to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // App Settings - Read: all, Write: admins only
    match /appSettings/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // FAQs - Read: all, Write: admins only
    match /faqs/{faqId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories - Read: all, Write: admins only
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Summary

This guide provides complete implementation details for:

1. ✅ **Maintenance Mode** - Block app access with custom message
2. ✅ **Announcement Banner** - Featured messages on home screen
3. ✅ **FAQs** - Dynamic help content management
4. ✅ **Report Categories** - Configurable report types

All features use **real-time Firestore listeners** for instant updates without requiring app restart.

**Next Steps:**
1. Implement features following step-by-step guide above
2. Test each feature thoroughly using test cases
3. Add error handling and offline support as needed
4. Deploy security rules to Firebase

For questions or issues, refer to the Troubleshooting section or contact the admin dashboard development team.
