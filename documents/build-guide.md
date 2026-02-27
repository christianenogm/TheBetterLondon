# TheBetterLondon — Build & Testing Distribution Guide

> **Sprint:** 01 · **App Version:** 1.0.0 · **SDK:** Expo ~54.0.33 · **React Native:** 0.81.5

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Running Locally (Development)](#3-running-locally-development)
4. [Expo Go — Instant Testing (No Build Required)](#4-expo-go--instant-testing-no-build-required)
5. [EAS Build — Internal Distribution](#5-eas-build--internal-distribution)
   - [5.1 iOS — TestFlight](#51-ios--testflight)
   - [5.2 Android — Internal Track / APK](#52-android--internal-track--apk)
6. [Environment Variables for Builds](#6-environment-variables-for-builds)
7. [Build Profiles Reference](#7-build-profiles-reference)
8. [Sharing Builds with Testers](#8-sharing-builds-with-testers)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 LTS | https://nodejs.org |
| npm | ≥ 9 | bundled with Node |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Expo account | — | https://expo.dev/signup |
| Xcode (iOS) | ≥ 15 | Mac App Store |
| Android Studio (Android) | latest | https://developer.android.com/studio |
| iOS device / simulator | — | For local testing |
| Android device / emulator | — | For local testing |

> **Apple Developer account** is required only for TestFlight distribution (§5.1).  
> **Google Play Console account** is required only for Play Store distribution (§5.2).

---

## 2. Environment Setup

### 2.1 Clone and Install

```bash
git clone <repo-url>
cd TheBetterLondon
npm install
```

### 2.2 Create `.env`

Copy the sample and fill in real values:

```bash
cp .env.sample .env
```

Required keys in `.env`:

```dotenv
# Google Maps (used on both platforms + transit screen)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=<your-key>
EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY=<your-key>

# Firebase
FIREBASE_apiKey=<your-key>
FIREBASE_authDomain=thebetterlondon.firebaseapp.com
FIREBASE_projectId=thebetterlondon
FIREBASE_storageBucket=thebetterlondon.firebasestorage.app
FIREBASE_messagingSenderId=<your-id>
FIREBASE_appId=<your-app-id>
FIREBASE_measurementId=<your-measurement-id>

# Mirror for Expo's EXPO_PUBLIC_ prefix (used by env.js)
EXPO_PUBLIC_FIREBASE_API_KEY=<same as FIREBASE_apiKey>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=thebetterlondon.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=thebetterlondon
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=thebetterlondon.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<your-app-id>
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

> ⚠️ `.env` is gitignored. Never commit real keys.

### 2.3 Log in to Expo / EAS

```bash
eas login
# verify
eas whoami
```

---

## 3. Running Locally (Development)

```bash
# Start Metro bundler (choose platform interactively)
npm start

# Or target a platform directly
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

Press `i` for iOS or `a` for Android inside the Metro terminal at any time.

---

## 4. Expo Go — Instant Testing (No Build Required)

The fastest way to share a preview with testers who don't need a native build.

### Steps

1. Install **Expo Go** on the tester's device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start a tunnel from your machine:

   ```bash
   npx expo start --tunnel
   ```

3. Share the QR code or the `exp://` URL that appears in the terminal.

4. Tester opens **Expo Go** → scans QR / pastes URL → app loads.

### Limitations of Expo Go

| Feature | Expo Go Support |
|---|---|
| Firebase Auth / Firestore | ✅ Works |
| Google Maps (`react-native-maps`) | ✅ Works |
| Expo Location | ✅ Works |
| Image Picker | ✅ Works |
| Custom native modules | ❌ Requires a dev build |
| Push notifications (production certs) | ❌ Requires a dev/preview build |

> For Sprint 01 features, Expo Go is sufficient for functional testing.

---

## 5. EAS Build — Internal Distribution

EAS (Expo Application Services) builds a proper `.ipa` / `.apk` / `.aab` in the cloud without needing a local Mac/Android setup on every machine.

### 5.0 Initialise EAS in the project (one-time)

```bash
eas build:configure
```

This creates `eas.json` at the project root. Use the profile structure in §7.

---

### 5.1 iOS — TestFlight

#### Requirements
- Apple Developer Program membership ($99/yr)
- App registered in [App Store Connect](https://appstoreconnect.apple.com)
- Bundle ID: set `expo.ios.bundleIdentifier` in `app.json`

#### Add bundle ID to app.json

```jsonc
// app.json → expo.ios
"ios": {
  "bundleIdentifier": "ca.fanshawe.thebetterlondon",
  "supportsTablet": true,
  "config": {
    "googleMapsApiKey": "$(GOOGLE_MAPS_API_KEY)"
  }
}
```

#### Build for TestFlight

```bash
# Builds a production .ipa and submits to App Store Connect
eas build --platform ios --profile preview

# Then submit to TestFlight
eas submit --platform ios
```

EAS will prompt for Apple credentials on first run and cache them securely.

#### Invite testers in App Store Connect
1. App Store Connect → your app → **TestFlight**
2. Under **Internal Testing**, add testers by Apple ID
3. Testers receive an email → install via **TestFlight app**

---

### 5.2 Android — Internal Track / APK

#### Option A: Shareable APK (easiest for team testers)

No Google Play account needed. Produces a `.apk` that testers sideload.

```bash
eas build --platform android --profile preview
```

EAS outputs a download link. Testers:
1. Enable **Install unknown apps** in Android Settings → Security
2. Download the `.apk` link on their device and install

#### Option B: Google Play Internal Testing Track

#### Requirements
- Google Play Console account ($25 one-time)
- App created in Play Console
- Package name set in `app.json`

```jsonc
// app.json → expo.android
"android": {
  "package": "ca.fanshawe.thebetterlondon",
  ...
}
```

```bash
# Build an Android App Bundle
eas build --platform android --profile production

# Submit to Play Console Internal Testing
eas submit --platform android
```

1. Play Console → your app → **Internal testing**
2. Create a release, upload the `.aab`
3. Add tester emails under **Testers** tab
4. Testers accept the invite link and install via Play Store

---

## 6. Environment Variables for Builds

EAS builds run in the cloud and don't have access to your local `.env`. Secrets must be uploaded to EAS:

```bash
# Upload each secret (run once per variable)
eas secret:create --scope project --name FIREBASE_apiKey --value "<value>"
eas secret:create --scope project --name FIREBASE_authDomain --value "thebetterlondon.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_projectId --value "thebetterlondon"
eas secret:create --scope project --name FIREBASE_storageBucket --value "thebetterlondon.firebasestorage.app"
eas secret:create --scope project --name FIREBASE_messagingSenderId --value "<value>"
eas secret:create --scope project --name FIREBASE_appId --value "<value>"
eas secret:create --scope project --name FIREBASE_measurementId --value "<value>"
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "<value>"
```

View stored secrets:
```bash
eas secret:list
```

These are referenced in `app.config.js` via `process.env.FIREBASE_*` — they are injected automatically by EAS at build time.

---

## 7. Build Profiles Reference

Recommended `eas.json`:

```jsonc
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

| Profile | Purpose | Output |
|---|---|---|
| `development` | Dev client with hot reload for native testing | `.ipa` (simulator) / `.apk` |
| `preview` | Internal distribution for testers | `.ipa` + `.apk` |
| `production` | App Store / Play Store release | `.ipa` + `.aab` |

---

## 8. Sharing Builds with Testers

### Via EAS Dashboard (recommended)

After any `eas build` completes:

1. Visit https://expo.dev → your project → **Builds**
2. Click the completed build → **Install** button
3. Share the generated QR code or install link directly with testers

Testers on **iOS** must have their UDID registered (for `preview` profile) or use TestFlight.  
Testers on **Android** can install the APK directly from the link.

### Quick Share Checklist

- [ ] Build completed on EAS dashboard without errors
- [ ] EAS secrets are all set (`eas secret:list`)
- [ ] iOS testers added to TestFlight or UDID registered
- [ ] Android testers have "Install unknown apps" enabled (for APK sideload)
- [ ] Tester has confirmed Firebase Auth works (sign-in / sign-up)
- [ ] Tester has confirmed location permission prompt appears
- [ ] Tester has confirmed Google Maps loads on Issues Map tab

---

## 9. Troubleshooting

### `eas build` fails with "missing credentials"
```bash
eas credentials
```
Follow the interactive prompts to generate or upload signing certificates.

---

### Google Maps shows blank/grey on device
- Confirm the `GOOGLE_MAPS_API_KEY` EAS secret is set
- Confirm the key has **Maps SDK for iOS** and **Maps SDK for Android** enabled in Google Cloud Console
- On Android, confirm the key's app restriction includes the correct package name

---

### Firebase Auth fails on build (but works in Expo Go)
- Confirm all `FIREBASE_*` EAS secrets are set (`eas secret:list`)
- In Firebase Console → Authentication → **Sign-in method** → ensure Email/Password is enabled
- In Firebase Console → Authentication → **Authorized domains** → add your app's domain if using web OAuth

---

### `expo-location` permission denied silently
- iOS: confirm `NSLocationWhenInUseUsageDescription` is set in `app.json` under `expo.ios.infoPlist`
- Android: confirm `ACCESS_FINE_LOCATION` is in `expo.android.permissions` in `app.json`

Add these to `app.json` if missing:

```jsonc
"ios": {
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "TheBetterLondon uses your location to show nearby issues and sort reports by distance."
  }
},
"android": {
  "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
}
```

---

### Metro bundler cache issues

```bash
npx expo start --clear
```

---

### Reset test data in Firestore/Storage

```bash
# Preview deletions first
npm run reset:reports -- --dry-run

# Apply
npm run reset:reports
```

See `scripts/reset-reports.js` for setup instructions (requires `scripts/service-account.json`).

---

*Last updated: Sprint 01 — February 2026*
