#!/usr/bin/env python3
"""Generate a mobile readiness audit report for MindPrism."""
from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path


CAPACITOR_PLUGINS = [
    "@capacitor/app",
    "@capacitor/haptics",
    "@capacitor/status-bar",
    "@capacitor/splash-screen",
    "@capacitor/push-notifications",
    "@capacitor/network",
    "@capacitor/filesystem",
    "@capacitor/preferences",
    "@capacitor/keyboard",
]

IAP_PRODUCTS = [
    "mindprism.premium.monthly",
    "mindprism.premium.annual",
]

DEEP_LINK_ROUTES = [
    "/books/{id}",
    "/mental-models/{id}",
    "/streak",
    "/journal",
    "/premium",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MindPrism mobile readiness audit.")
    parser.add_argument(
        "--platform",
        choices=["ios", "android", "both"],
        default="both",
        help="Target platform(s) to audit",
    )
    parser.add_argument(
        "--app-version",
        default="1.0.0",
        help="App version being audited",
    )
    parser.add_argument("--out", default="output/mobile/mobile-audit.md")
    args = parser.parse_args()

    platforms = (
        ["iOS", "Android"] if args.platform == "both"
        else ["iOS"] if args.platform == "ios"
        else ["Android"]
    )
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = [
        "# MindPrism Mobile Readiness Audit",
        f"Generated: {date.today()}",
        f"App Version: {args.app_version}",
        f"Platform(s): {', '.join(platforms)}",
        "",
        "---",
        "",
        "## 1. Capacitor Configuration Audit",
        "",
        "### capacitor.config.ts",
        "",
        "| Field | Expected | Actual | Status |",
        "|-------|----------|--------|--------|",
        "| appId | com.mindprism.app | TODO | TODO |",
        "| appName | MindPrism | TODO | TODO |",
        "| webDir | dist/ | TODO | TODO |",
        "| server.url | Not set (production) | TODO | TODO |",
        "",
        "### Plugin Installation Status",
        "",
        "| Plugin | In package.json | In capacitor.config.ts | Synced |",
        "|--------|----------------|----------------------|--------|",
    ]

    for plugin in CAPACITOR_PLUGINS:
        lines.append(f"| `{plugin}` | TODO | TODO | TODO |")

    lines += [
        "",
        "### Native Permissions",
        "",
        "#### iOS (Info.plist)",
        "",
        "| Permission Key | Description String | Present |",
        "|----------------|-------------------|---------|",
        "| NSUserNotificationsUsageDescription | Push notifications for streak reminders | TODO |",
        "| NSCameraUsageDescription | Journal photo attachments | TODO |",
        "| NSMicrophoneUsageDescription | Voice journal (if applicable) | TODO |",
        "",
        "#### Android (AndroidManifest.xml)",
        "",
        "| Permission | Purpose | Present |",
        "|-----------|---------|---------|",
        "| INTERNET | Network requests | TODO |",
        "| RECEIVE_BOOT_COMPLETED | Push re-registration after reboot | TODO |",
        "| VIBRATE | Haptic feedback | TODO |",
        "| POST_NOTIFICATIONS | Android 13+ push permission | TODO |",
        "",
        "---",
        "",
        "## 2. Native Gesture and Haptics Audit",
        "",
        "| Feature | Implemented | Location | Notes |",
        "|---------|------------|---------|-------|",
        "| `useHaptics()` hook (platform guard) | TODO | client/src/hooks/ | TODO |",
        "| Chapter completion haptic (Medium) | TODO | TODO | TODO |",
        "| Streak milestone haptic (Heavy) | TODO | TODO | TODO |",
        "| Button tap haptic (Light) | TODO | TODO | TODO |",
        "| Error feedback haptic (Notification.Error) | TODO | TODO | TODO |",
        "| iOS swipe-to-go-back gesture | TODO | AppDelegate.swift | TODO |",
        "| Scroll containers: `-webkit-overflow-scrolling: touch` | TODO | TODO | TODO |",
        "",
        "---",
        "",
        "## 3. Offline-First Data Sync Audit",
        "",
        "| Feature | Status | Notes |",
        "|---------|--------|-------|",
        "| `@capacitor/network` listener installed | TODO | TODO |",
        "| Offline chapter storage (Filesystem) | TODO | TODO |",
        "| Sync queue for journal entries | TODO | TODO |",
        "| Sync queue for analytics events | TODO | TODO |",
        "| Network reconnect → queue flush | TODO | TODO |",
        "| Offline UI indicator (banner + lock icons) | TODO | TODO |",
        "| Download manager for book chapters | TODO | TODO |",
        "",
        "---",
        "",
        "## 4. Push Notification Audit",
        "",
    ]

    if "iOS" in platforms:
        lines += [
            "### iOS (APNs)",
            "",
            "| Item | Status |",
            "|------|--------|",
            "| Push Notifications capability in Xcode | TODO |",
            "| APNs Auth Key (.p8) uploaded to Firebase | TODO |",
            "| `requestPermissions()` called post-onboarding | TODO |",
            "| Token sent to `/api/users/push-token` | TODO |",
            "",
        ]

    if "Android" in platforms:
        lines += [
            "### Android (FCM)",
            "",
            "| Item | Status |",
            "|------|--------|",
            "| `google-services.json` in android/app/ | TODO |",
            "| `FirebaseMessagingService` registered in AndroidManifest | TODO |",
            "| `requestPermissions()` called post-onboarding | TODO |",
            "| Token sent to `/api/users/push-token` | TODO |",
            "",
        ]

    lines += [
        "### Notification Handlers",
        "",
        "| Handler | Implemented | Behavior |",
        "|---------|------------|---------|",
        "| `pushNotificationReceived` (foreground) | TODO | Show in-app toast |",
        "| `pushNotificationActionPerformed` (tap) | TODO | Navigate to deep link |",
        "| `registration` (token received) | TODO | POST to /api/users/push-token |",
        "| `registrationError` | TODO | Log error, retry logic |",
        "| Quiet hours (10pm–7am) enforced server-side | TODO | TODO |",
        "",
        "---",
        "",
        "## 5. Deep Linking Audit",
        "",
        "### Supported Deep Link Routes",
        "",
        "| Route | iOS Universal Link | Android App Link | Cold-start handled |",
        "|-------|------------------|-----------------|-------------------|",
    ]

    for route in DEEP_LINK_ROUTES:
        lines.append(f"| `{route}` | TODO | TODO | TODO |")

    lines += [
        "",
        "### Domain Verification Files",
        "",
        "| File | Location | Status |",
        "|------|---------|--------|",
        "| `apple-app-site-association` | `/.well-known/apple-app-site-association` | TODO |",
        "| `assetlinks.json` | `/.well-known/assetlinks.json` | TODO |",
        "",
        "### `appUrlOpen` listener",
        "",
        "| Item | Status |",
        "|------|--------|",
        "| Listener added in App.tsx | TODO |",
        "| Cold-start URL parsed and routed | TODO |",
        "| All deep link routes handled in React Router | TODO |",
        "",
        "---",
        "",
        "## 6. Mobile Performance Audit",
        "",
        "| Metric | Target | Measured | Device | Status |",
        "|--------|--------|---------|--------|--------|",
        "| Time to interactive (cold start) | <2s | TODO | TODO | TODO |",
        "| Time to interactive (warm start) | <1s | TODO | TODO | TODO |",
        "| Scroll jank (chapter reader) | 0 dropped frames | TODO | TODO | TODO |",
        "| Scroll jank (book list) | 0 dropped frames | TODO | TODO | TODO |",
        "| Memory usage (steady state) | <150MB | TODO | TODO | TODO |",
        "| Splash screen display duration | 2s | TODO | TODO | TODO |",
        "| JS bundle size (initial) | <500KB gzipped | TODO | — | TODO |",
        "",
        "### Blocking JS Issues",
        "",
        "| Issue | File | Fix | Status |",
        "|-------|------|-----|--------|",
        "| Synchronous top-level await | TODO | Move post-first-paint | TODO |",
        "| Stripe.js blocking render | TODO | Lazy load | TODO |",
        "| Analytics initialization blocking | TODO | Move to background | TODO |",
        "",
        "---",
        "",
        "## 7. In-App Purchase Audit",
        "",
        "### Products",
        "",
        "| Product ID | Type | Store Status | Server Verification | Status |",
        "|------------|------|-------------|--------------------|-|",
    ]

    for product in IAP_PRODUCTS:
        lines.append(f"| `{product}` | Auto-Renewable Subscription | TODO | TODO | TODO |")

    lines += [
        "",
        "### IAP Flow",
        "",
        "| Step | Implemented | Notes |",
        "|------|------------|-------|",
        "| Present native payment sheet | TODO | TODO |",
        "| Receipt received | TODO | TODO |",
        "| Server-side receipt verification (`/api/iap/verify`) | TODO | TODO |",
        "| `iap_receipts` table migrated | TODO | TODO |",
        "| user.isPremium flag activated on verify | TODO | TODO |",
        "| Restore purchases button (Settings screen) | TODO | TODO |",
        "| Subscription lapse detection on app resume | TODO | TODO |",
        "",
        "---",
        "",
        "## 8. Store Submission Readiness",
        "",
        "See `references/store-submission-checklist.md` for full checklist.",
        "",
        "| Section | Complete | Blocker |",
        "|---------|---------|---------|",
        "| App Store Connect metadata | TODO | TODO |",
        "| App Store screenshots (all sizes) | TODO | TODO |",
        "| iOS technical requirements | TODO | TODO |",
        "| Play Console metadata | TODO | TODO |",
        "| Play Store screenshots | TODO | TODO |",
        "| Android technical requirements | TODO | TODO |",
        "| IAP products in review-ready state | TODO | TODO |",
        "| Demo account for review team | TODO | TODO |",
        "",
        "---",
        "",
        "## 9. Priority Actions",
        "",
        "Ranked by blocking impact on release:",
        "",
        "1. TODO — Blocks: TODO",
        "2. TODO — Blocks: TODO",
        "3. TODO — Blocks: TODO",
        "4. TODO — Blocks: TODO",
        "5. TODO — Blocks: TODO",
        "",
        "---",
        "",
        "_Fill in all TODO placeholders by running tests on physical devices and reviewing native project files._",
        "_Test devices minimum: iPhone 14 (iOS 17), Pixel 6 (Android 13), Samsung Galaxy A53 (Android 13)._",
    ]

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
