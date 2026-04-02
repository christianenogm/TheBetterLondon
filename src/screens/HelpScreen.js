/**
 * HelpScreen.js
 * US-1404: Get Help and Support
 *
 * Sections:
 *   - FAQ (searchable, organised by topic)
 *   - Contact Support (coming soon)
 *   - Terms of Service
 *   - Privacy Policy
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ = [
  // Getting Started
  {
    id: 'gs1',
    category: 'Getting Started',
    q: 'What is The Better London?',
    a: 'The Better London is a community-driven app that lets London, Ontario residents report local issues (potholes, broken lights, graffiti, etc.), track London Transit buses in real time, manage their garbage collection schedule, and earn points for being an active community contributor.',
  },
  {
    id: 'gs2',
    category: 'Getting Started',
    q: 'Do I need an account to use the app?',
    a: 'You need an account to submit reports, earn points, and unlock badges. However, you can browse the community map and view existing reports without signing in.',
  },
  {
    id: 'gs3',
    category: 'Getting Started',
    q: 'How do I create an account?',
    a: 'Tap "Create Account" on the welcome screen. Enter your email and choose a password. A unique username will be generated for you automatically — you can change it any time in Edit Profile.',
  },
  {
    id: 'gs4',
    category: 'Getting Started',
    q: 'Can I sign in with Google?',
    a: 'Yes! Tap the "Sign in with Google" button on the sign-in screen to use your Google account. A unique username will be assigned on your first login.',
  },

  // Reports
  {
    id: 'rp1',
    category: 'Reports',
    q: 'How do I submit a report?',
    a: 'Tap the "Report" tab at the bottom of the screen. Follow the four steps: select a category, pin the location on the map, add a title and description, then optionally attach photos and submit.',
  },
  {
    id: 'rp2',
    category: 'Reports',
    q: 'What categories can I report?',
    a: 'You can report: Road & Pavement issues, Graffiti & Vandalism, Lighting, Parks & Green Spaces, Waste & Recycling, Water & Drainage, Noise, and Other.',
  },
  {
    id: 'rp3',
    category: 'Reports',
    q: 'How do I upvote a report?',
    a: 'Open any community report and tap the thumbs-up button. Upvoting signals to the community and city that an issue is widespread. You cannot upvote your own reports.',
  },
  {
    id: 'rp4',
    category: 'Reports',
    q: 'What does "Resolved" mean?',
    a: 'A report is marked "Resolved" when the issue has been addressed. The report author receives 5 bonus points when this happens.',
  },
  {
    id: 'rp5',
    category: 'Reports',
    q: 'Can I edit or delete my report after submitting?',
    a: 'You can view your reports in "My Reports". Editing and deletion are planned for a future update.',
  },

  // Points & Badges
  {
    id: 'pb1',
    category: 'Points & Badges',
    q: 'How do I earn points?',
    a: 'You earn points by being an active community member:\n• +10 pts — submitting a report\n• +1 pt — per upvote your report receives\n• +5 pts — when your report is marked resolved\n• Milestone bonuses: +10 pts at 5 reports, +20 at 10, +50 at 25, +100 at 50',
  },
  {
    id: 'pb2',
    category: 'Points & Badges',
    q: 'How do I earn badges?',
    a: 'Badges are awarded automatically when you reach milestones. There are 21 badges across four categories: Reporter Journey, Civic Impact, Community Recognition, and Points Milestones. Tap "All Badges" in your profile to see every badge and your progress.',
  },
  {
    id: 'pb3',
    category: 'Points & Badges',
    q: 'Where can I see my points history?',
    a: 'Tap your Points total on the Profile screen to open the Points History screen, which shows every transaction with the date and reason.',
  },
  {
    id: 'pb4',
    category: 'Points & Badges',
    q: 'What are the rank titles?',
    a: 'There are 6 ranks based on total points:\n• Newcomer (0 pts)\n• Contributor (50 pts)\n• Community Helper (150 pts)\n• Community Hero (300 pts)\n• City Champion (500 pts)\n• London Legend (1,000 pts)',
  },

  // Transit
  {
    id: 'tr1',
    category: 'Transit',
    q: 'How does the real-time transit tracking work?',
    a: 'The Transit screen shows live London Transit bus positions using GTFS real-time feeds. Vehicle icons update automatically as buses move along their routes.',
  },
  {
    id: 'tr2',
    category: 'Transit',
    q: 'Can I search for a specific bus route?',
    a: 'Yes — use the search bar on the Transit screen to filter by route number or destination.',
  },
  {
    id: 'tr3',
    category: 'Transit',
    q: 'The transit map seems outdated. What should I do?',
    a: 'Pull-to-refresh on the Transit screen to force a data reload. If data still seems stale, London Transit may have a temporary data outage.',
  },

  // Garbage Collection
  {
    id: 'gc1',
    category: 'Garbage Collection',
    q: 'How does the garbage collection schedule work?',
    a: 'Enter your home address in the Garbage tab. The app detects your collection zone and displays your upcoming pickup dates for garbage, recycling, and organics on a calendar.',
  },
  {
    id: 'gc2',
    category: 'Garbage Collection',
    q: 'Can I get reminders before pickup day?',
    a: 'Yes! Enable notifications in the Garbage tab. You can choose to be reminded the evening before or the morning of each pickup.',
  },
  {
    id: 'gc3',
    category: 'Garbage Collection',
    q: 'Can I export the schedule to my calendar?',
    a: 'Yes — tap "Add to Calendar" in the Garbage tab. This creates a dedicated "Garbage Collection" calendar (iOS) or adds events to your primary calendar (Android) with all upcoming dates for the year.',
  },

  // Account
  {
    id: 'ac1',
    category: 'Account',
    q: 'How do I change my username?',
    a: 'Go to Profile → Edit Profile. Enter a new display name or tap the dice icon to generate a random one. Usernames must be unique. Your new name will appear on all your existing reports.',
  },
  {
    id: 'ac2',
    category: 'Account',
    q: 'I forgot my password. How do I reset it?',
    a: 'On the sign-in screen, tap "Forgot Password?" and enter your email. A reset link will be sent to you.',
  },
  {
    id: 'ac3',
    category: 'Account',
    q: 'How do I log out?',
    a: 'Scroll to the bottom of the Profile screen and tap "Log Out".',
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

const FAQItem = ({ item, theme }) => {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[
        faqS.item,
        {
          backgroundColor: theme.colors.neutral[0],
          borderColor: theme.colors.border.default,
          borderBottomColor: open ? theme.colors.primary[200] : theme.colors.border.default,
        },
      ]}
      onPress={() => setOpen(v => !v)}
      activeOpacity={0.8}
    >
      <View style={faqS.row}>
        <Icon
          name="help-circle-outline"
          size={18}
          color={theme.colors.primary[400]}
          style={{ marginTop: 1 }}
        />
        <Text style={[faqS.question, { color: theme.colors.text.primary }]}>
          {item.q}
        </Text>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.text.secondary}
        />
      </View>
      {open && (
        <Text style={[faqS.answer, { color: theme.colors.text.secondary }]}>
          {item.a}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const faqS = StyleSheet.create({
  item:     { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 8 },
  row:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  question: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  answer:   { fontSize: 13, lineHeight: 20, marginTop: 10 },
});

// ─── Legal Modal ──────────────────────────────────────────────────────────────

const LegalModal = ({ visible, title, content, onClose, theme }) => {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
        <View style={[legalS.header, { borderBottomColor: theme.colors.border.default }]}>
          <Text style={[legalS.title, { color: theme.colors.text.primary }]}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[legalS.body, { paddingBottom: insets.bottom + 20 }]}
        >
          <Text style={[legalS.text, { color: theme.colors.text.secondary }]}>{content}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const legalS = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700' },
  body:  { paddingHorizontal: 20, paddingTop: 16 },
  text:  { fontSize: 14, lineHeight: 22 },
});

// ─── Legal Content ────────────────────────────────────────────────────────────

const TERMS = `Last updated: April 2026

1. ACCEPTANCE OF TERMS
By downloading or using The Better London ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.

2. USE OF THE APP
The App is intended for London, Ontario residents and visitors who want to participate in community improvement. You agree to use the App only for lawful purposes.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account.

4. USER CONTENT
By submitting a report or any content through the App, you grant The Better London a non-exclusive licence to use, display, and store that content for the purpose of operating the service.

You must not submit content that:
• Is false, misleading, or fraudulent
• Is abusive, harassing, or offensive
• Violates any applicable law or regulation
• Infringes the intellectual property rights of others

5. GAMIFICATION
Points, badges, and leaderboard rankings are for community engagement purposes only and have no monetary value. The Better London reserves the right to adjust the gamification system at any time.

6. DISCLAIMER OF WARRANTIES
The App is provided on an "as is" basis. The Better London does not guarantee the accuracy of community reports, transit data, or garbage collection schedules. Always verify critical information with official city sources.

7. LIMITATION OF LIABILITY
To the maximum extent permitted by law, The Better London shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.

8. CHANGES TO TERMS
We may update these terms from time to time. Continued use of the App after changes constitutes acceptance of the updated terms.

9. CONTACT
For questions about these Terms, please use the in-app support section.`;

const PRIVACY = `Last updated: April 2026

The Better London ("we", "our", "the App") is committed to protecting your privacy. This policy explains what data we collect and how we use it.

1. DATA WE COLLECT

Account Data
• Email address and display name (used to identify you within the app)

Location Data
• When you submit a report, you provide a map location for that report
• When you set up your garbage collection schedule, you provide a home address
• We do not continuously track your location in the background

User Content
• Report titles, descriptions, categories, and photos you upload
• Upvotes you cast on community reports

Usage & Analytics
• We currently do not collect analytics beyond what is stored in your Firestore profile (points, report count, badges)

2. HOW WE USE YOUR DATA
• To operate the core features of the App (reports, transit, garbage reminders)
• To calculate points, badges, and leaderboard rankings
• To send local push notifications for garbage collection reminders (only if you opt in)

3. DATA SHARING
We do not sell your personal data. Your display name and report content are visible to other users of the App. Your email address is never displayed publicly.

4. DATA STORAGE
Your data is stored securely using Google Firebase (Firestore and Firebase Auth), operated in accordance with Google's data protection standards.

5. CHILDREN'S PRIVACY
The App is not directed at children under the age of 13. We do not knowingly collect data from children.

6. YOUR RIGHTS
You may request deletion of your account and associated data by contacting us through the in-app support section.

7. CHANGES TO THIS POLICY
We may update this policy from time to time. We will notify users of significant changes within the App.

8. CONTACT
For privacy-related questions, please use the in-app support section.`;

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CATEGORIES = [...new Set(FAQ.map(f => f.category))];

const HelpScreen = () => {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();

  const [search,       setSearch]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [legalModal,   setLegalModal]   = useState(null); // 'terms' | 'privacy' | null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ.filter(item => {
      const catMatch = activeCategory === 'All' || item.category === activeCategory;
      const textMatch = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [search, activeCategory]);

  const s = makeStyles(theme, insets);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={[s.searchWrap, { backgroundColor: theme.colors.neutral[100], borderColor: theme.colors.border.default }]}>
          <Icon name="magnify" size={18} color={theme.colors.text.secondary} />
          <TextInput
            style={[s.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search FAQs…"
            placeholderTextColor={theme.colors.text.hint}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catStrip}
        >
          {['All', ...CATEGORIES].map(cat => {
            const active = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  s.catChip,
                  {
                    backgroundColor: active ? theme.colors.primary[500] : theme.colors.neutral[100],
                    borderColor:     active ? theme.colors.primary[500] : theme.colors.border.default,
                  },
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[s.catChipText, { color: active ? '#fff' : theme.colors.text.secondary }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FAQ section */}
        <Text style={[s.sectionTitle, { color: theme.colors.text.primary }]}>
          Frequently Asked Questions
        </Text>

        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Icon name="help-circle-outline" size={40} color={theme.colors.neutral[300]} />
            <Text style={[s.emptyText, { color: theme.colors.text.secondary }]}>
              No results for "{search}"
            </Text>
          </View>
        ) : (
          <View style={s.faqList}>
            {filtered.map(item => (
              <FAQItem key={item.id} item={item} theme={theme} />
            ))}
          </View>
        )}

        {/* Contact Support */}
        <Text style={[s.sectionTitle, { color: theme.colors.text.primary }]}>
          Contact Support
        </Text>
        <View style={[s.card, { backgroundColor: theme.colors.neutral[0], borderColor: theme.colors.border.default }]}>
          <Icon name="headset" size={32} color={theme.colors.neutral[300]} />
          <Text style={[s.comingSoonTitle, { color: theme.colors.text.primary }]}>
            Coming Soon
          </Text>
          <Text style={[s.comingSoonSub, { color: theme.colors.text.secondary }]}>
            In-app support chat and email contact are on the way. Check back in a future update!
          </Text>
        </View>

        {/* Legal */}
        <Text style={[s.sectionTitle, { color: theme.colors.text.primary }]}>
          Legal
        </Text>
        <View style={[s.legalRow, { backgroundColor: theme.colors.neutral[0], borderColor: theme.colors.border.default }]}>
          <TouchableOpacity
            style={s.legalItem}
            onPress={() => setLegalModal('terms')}
            activeOpacity={0.7}
          >
            <Icon name="file-document-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={[s.legalLabel, { color: theme.colors.text.primary }]}>Terms of Service</Text>
            <Icon name="chevron-right" size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <View style={[s.divider, { backgroundColor: theme.colors.border.default }]} />
          <TouchableOpacity
            style={s.legalItem}
            onPress={() => setLegalModal('privacy')}
            activeOpacity={0.7}
          >
            <Icon name="shield-lock-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={[s.legalLabel, { color: theme.colors.text.primary }]}>Privacy Policy</Text>
            <Icon name="chevron-right" size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={[s.version, { color: theme.colors.text.hint }]}>
          The Better London v{appVersion}
        </Text>
      </ScrollView>

      {/* Legal modals */}
      <LegalModal
        visible={legalModal === 'terms'}
        title="Terms of Service"
        content={TERMS}
        onClose={() => setLegalModal(null)}
        theme={theme}
      />
      <LegalModal
        visible={legalModal === 'privacy'}
        title="Privacy Policy"
        content={PRIVACY}
        onClose={() => setLegalModal(null)}
        theme={theme}
      />
    </View>
  );
};

const makeStyles = (theme, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  catStrip:    { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  catChip:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  catChipText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  faqList:      { paddingHorizontal: 16 },
  empty:        { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText:    { fontSize: 14 },
  card: {
    marginHorizontal: 16, borderRadius: 14, borderWidth: 1,
    padding: 24, alignItems: 'center', gap: 8,
  },
  comingSoonTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  comingSoonSub:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  legalRow: {
    marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  legalLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  divider:    { height: 1, marginHorizontal: 16 },
  version:    { textAlign: 'center', fontSize: 12, marginTop: 24 },
});

export default HelpScreen;
