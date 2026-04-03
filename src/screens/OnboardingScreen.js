/**
 * OnboardingScreen.js
 * US-1403: See App Tutorial on First Launch
 *
 * 4-slide swipeable onboarding shown only once (or on demand from Help).
 * Persists completion in AsyncStorage under @onboarding_complete.
 * Call onDone() when the user finishes or skips.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const ONBOARDING_KEY = '@onboarding_complete';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Slide definitions ────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    icon:        'city-variant-outline',
    iconColor:   '#4CAF50',
    bgColor:     '#E8F5E9',
    title:       'Welcome to\nThe Better London',
    body:        'Your community app for London, Ontario. Report local issues, track transit, manage garbage reminders, and earn rewards for making your neighbourhood better.',
  },
  {
    id: '2',
    icon:        'map-marker-alert-outline',
    iconColor:   '#2196F3',
    bgColor:     '#E3F2FD',
    title:       'Report Issues\nNear You',
    body:        'Spotted a pothole, broken light, or graffiti? Tap the Report tab, pin the location, add a photo and description — and submit in seconds. Your report goes live on the community map instantly.',
  },
  {
    id: '3',
    icon:        'bus-clock',
    iconColor:   '#FF9800',
    bgColor:     '#FFF3E0',
    title:       'Track London\nTransit Live',
    body:        'See real-time bus positions across the city. Search by route or destination and always know exactly when the next bus is coming.',
  },
  {
    id: '4',
    icon:        'trash-can-outline',
    iconColor:   '#9C27B0',
    bgColor:     '#F3E5F5',
    title:       'Never Miss\nPickup Day',
    body:        'Enter your address once and your garbage, recycling, and organics schedule appears on a colour-coded calendar. Opt in for morning or evening reminders — or export the whole schedule to your device calendar.',
  },
];

// ─── Dot indicator ────────────────────────────────────────────────────────────

const Dots = ({ count, activeIndex, activeColor }) => (
  <View style={dotS.row}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[
          dotS.dot,
          i === activeIndex
            ? { width: 20, backgroundColor: activeColor }
            : { width: 8,  backgroundColor: activeColor + '40' },
        ]}
      />
    ))}
  </View>
);

const dotS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
});

// ─── Single slide ─────────────────────────────────────────────────────────────

const Slide = ({ item }) => (
  <View style={[slideS.slide, { width: SCREEN_WIDTH, backgroundColor: item.bgColor }]}>
    <View style={[slideS.iconWrap, { backgroundColor: item.iconColor + '22' }]}>
      <Icon name={item.icon} size={80} color={item.iconColor} />
    </View>
    <Text style={[slideS.title, { color: '#1A1A1A' }]}>{item.title}</Text>
    <Text style={[slideS.body,  { color: '#555' }]}>{item.body}</Text>
  </View>
);

const slideS = StyleSheet.create({
  slide: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 24,
  },
  iconWrap: {
    width:  148,
    height: 148,
    borderRadius: 74,
    alignItems:   'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize:   28,
    fontWeight: '800',
    textAlign:  'center',
    lineHeight: 36,
  },
  body: {
    fontSize:  16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const markOnboardingComplete = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
};

export const isOnboardingComplete = async () => {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
};

const OnboardingScreen = ({ onDone }) => {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const isLast = currentIndex === SLIDES.length - 1;
  const activeSlide = SLIDES[currentIndex];

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      const next = currentIndex + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  };

  const handleSkip = () => finish();

  const finish = async () => {
    await markOnboardingComplete();
    onDone();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={[s.container, { backgroundColor: activeSlide.bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={activeSlide.bgColor} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          style={[s.skip, { top: insets.top + 16 }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => <Slide item={item} />}
        style={{ flex: 1 }}
      />

      {/* Bottom controls */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Dots
          count={SLIDES.length}
          activeIndex={currentIndex}
          activeColor={activeSlide.iconColor}
        />

        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: activeSlide.iconColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {isLast ? (
            <Text style={s.nextText}>Get Started</Text>
          ) : (
            <>
              <Text style={s.nextText}>Next</Text>
              <Icon name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  skip: {
    position:  'absolute',
    right:     20,
    zIndex:    10,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  skipText: {
    fontSize:   15,
    color:      '#555',
    fontWeight: '600',
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  nextBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    paddingHorizontal: 28,
    paddingVertical:   14,
    borderRadius:   30,
  },
  nextText: {
    color:      '#fff',
    fontSize:   16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
