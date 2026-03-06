---
name: mobile-engineer
description: Configure, optimize, and ship MindPrism as a production-ready iOS and Android app via Capacitor. Use when a user asks for Capacitor configuration, App Store or Play Store submission, native gesture handling, haptic feedback, offline sync, push notifications (FCM/APNs), deep linking, mobile performance optimization, or in-app purchase implementation.
---

# Mobile Engineer

Package MindPrism's React frontend as a production-grade native mobile app with Capacitor.

## Workflow

1. Audit and harden Capacitor configuration.
- Review `capacitor.config.ts`: validate appId (com.mindprism.app), appName, webDir (dist/), and server.url (remove any hardcoded dev URL before release builds).
- Verify plugins declared in `capacitor.config.ts` match installed packages in `package.json`: PushNotifications, Haptics, StatusBar, SplashScreen, Filesystem, Network, InAppPurchase2.
- Configure `ios/App/App/Info.plist` for required permissions: NSUserNotificationsUsageDescription, NSCameraUsageDescription (if journal photo upload is added), NSMicrophoneUsageDescription.
- Configure `android/app/src/main/AndroidManifest.xml`: INTERNET, RECEIVE_BOOT_COMPLETED (for push re-registration), VIBRATE, POST_NOTIFICATIONS (Android 13+).
- Use `references/capacitor-patterns.md` for plugin initialization patterns.

2. Implement native gesture handling and haptic feedback.
- Integrate `@capacitor/haptics` for key interaction moments: streak achievement unlock (HapticsImpactStyle.Heavy), chapter completion (HapticsImpactStyle.Medium), button tap (HapticsImpactStyle.Light), error feedback (HapticsNotificationType.Error).
- Wrap haptic calls in a `useHaptics()` hook in `client/src/hooks/` that checks `Capacitor.isNativePlatform()` before firing — prevents errors in browser.
- Add swipe-to-go-back gesture via Capacitor's native navigation stack (iOS only): configure `ios/App/App/AppDelegate.swift` to enable gesture recognizer.
- Ensure scroll containers use `-webkit-overflow-scrolling: touch` and `overscroll-behavior: contain` via Tailwind utilities.

3. Build offline-first data sync.
- Identify content that must work offline: book chapters currently reading, downloaded mental models, journal entries pending sync.
- Implement a sync queue in IndexedDB (via `@capacitor/preferences` or a direct idb wrapper): pending_journal_entries, pending_analytics_events.
- Add a network state listener via `@capacitor/network`: on reconnect, flush the sync queue to the server via existing API endpoints.
- Store downloaded chapter content in `@capacitor/filesystem` under `Directory.Data` with path `books/{book-id}/chapters/{chapter-id}.json`.
- Add offline indicators in the UI: banner when offline, lock icon on undownloaded content, queue counter in nav.

4. Configure push notifications (FCM/APNs).
- iOS: add Push Notifications capability in Xcode, upload APNs Auth Key (.p8) to Firebase console.
- Android: place `google-services.json` in `android/app/`. Configure `FirebaseMessagingService` in AndroidManifest.xml.
- In the React layer: call `PushNotifications.requestPermissions()` on first app launch post-onboarding (not at signup). Store the FCM token via `POST /api/users/push-token`.
- Handle foreground notifications with `PushNotifications.addListener('pushNotificationReceived')` — show in-app toast instead of system notification when app is active.
- Handle notification tap with `PushNotifications.addListener('pushNotificationActionPerformed')` — navigate to the relevant deep link target.

5. Implement deep linking and universal links.
- iOS Universal Links: configure `apple-app-site-association` file at `/.well-known/apple-app-site-association` on the MindPrism domain. Register associated domain `applinks:mindprism.app` in Xcode.
- Android App Links: add intent filter in AndroidManifest.xml for `https://mindprism.app`. Verify domain ownership via `/.well-known/assetlinks.json`.
- Deep link routes to support: `/books/{id}` → book detail, `/mental-models/{id}` → mental model card, `/streak` → streak dashboard, `/journal` → journal screen, `/premium` → paywall.
- Handle cold-start deep links in `App.tsx` via `App.addListener('appUrlOpen')`.

6. Optimize mobile performance.
- Startup time target: <2s to interactive on mid-range Android (Pixel 4a class device).
- Eliminate blocking JS: audit Vite build for synchronous top-level awaits. Move heavy initialization (analytics, Stripe.js) to post-first-paint.
- Fix scroll jank: replace any `position: fixed` nav elements with Capacitor's native tab bar (iOS) or use `will-change: transform` on sticky elements.
- Splash screen: configure `@capacitor/splash-screen` with `launchShowDuration: 2000`, `backgroundColor: #1a0533` (brand purple), and the MindPrism logo PNG at 512×512.
- Memory: audit React component unmount cleanup (cancel async ops, clear intervals) to prevent accumulation across navigation.

7. Implement in-app purchases (IAP).
- Use `cordova-plugin-purchase` (compatible with Capacitor) or `@capacitor-community/in-app-purchases` for IAP.
- Register products: `mindprism.premium.monthly` (consumable subscription) and `mindprism.premium.annual`.
- IAP purchase flow: present native payment sheet → receive receipt → verify receipt server-side at `POST /api/iap/verify` → activate premium via same user.isPremium flag used by Stripe.
- Store `iap_receipts` table (user_id, platform, product_id, transaction_id, receipt_data, verified_at) via Drizzle migration.
- Handle IAP edge cases: restore purchases (Settings → Restore Purchases button), subscription lapse detection on app resume, and family sharing (iOS).

## Output Contract

Return:
- Capacitor config audit report
- Native gesture and haptics implementation plan
- Offline sync architecture spec
- Push notification integration checklist
- Deep link route map
- Mobile performance audit
- IAP integration plan with data model

## Resources

- `scripts/generate_mobile_audit.py` scaffolds a mobile readiness audit report.
- `references/store-submission-checklist.md` defines App Store and Play Store submission requirements.
- `references/capacitor-patterns.md` documents plugin initialization patterns, platform guards, and known Capacitor gotchas.
