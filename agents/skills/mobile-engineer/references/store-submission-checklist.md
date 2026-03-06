# App Store and Play Store Submission Checklist

A complete gate-by-gate checklist for submitting MindPrism to the Apple App Store and Google Play Store.

---

## Apple App Store Submission

### App Store Connect Setup
- [ ] App ID created in Apple Developer portal: `com.mindprism.app`
- [ ] Bundle identifier in `ios/App/App.xcodeproj` matches App Store Connect
- [ ] App Store Connect listing created with correct Bundle ID
- [ ] Signing certificates and provisioning profiles configured (Xcode → Signing & Capabilities)
- [ ] Push notification capability added to the App ID
- [ ] Associated Domains capability added (`applinks:mindprism.app`)

### App Metadata
- [ ] **App Name:** MindPrism (≤30 characters)
- [ ] **Subtitle:** ≤30 characters (e.g., "Psychology Books & Mental Models")
- [ ] **Description:** 4,000 characters max — lead with the value prop
- [ ] **Keywords:** 100 characters max — comma-separated, no spaces after commas
- [ ] **Support URL:** https://mindprism.app/support
- [ ] **Privacy Policy URL:** https://mindprism.app/privacy
- [ ] **Marketing URL:** https://mindprism.app
- [ ] **Category:** Primary — Education. Secondary — Books.
- [ ] **Age Rating:** Completed (target: 4+, no mature themes)

### Screenshots (Required sizes)
- [ ] iPhone 6.9" (1320×2868 or 1290×2796): 3–10 screenshots
- [ ] iPhone 6.5" (1284×2778): 3–10 screenshots
- [ ] iPad Pro 12.9" (2048×2732): 3–10 screenshots (required if iPad supported)
- [ ] Screenshots show real app UI with captions enabled
- [ ] No device frames that are not Apple-approved
- [ ] App Preview video (optional, 15–30s, autoplay in App Store)

### Technical Requirements
- [ ] Minimum iOS version set to iOS 14.0 or higher (matches Capacitor requirement)
- [ ] `Info.plist` usage descriptions present for all requested permissions
- [ ] App does not crash on launch on a clean install (tested on physical device)
- [ ] App works without network on previously loaded content (offline mode)
- [ ] No references to other mobile platforms (Android, Google Play) in app UI
- [ ] In-app purchase products registered and in "Ready to Submit" state in App Store Connect
- [ ] App does not use private APIs (run `nm -u YourApp.app/YourApp | grep UIKit` audit)

### IAP Configuration
- [ ] `mindprism.premium.monthly` product created as Auto-Renewable Subscription
- [ ] `mindprism.premium.annual` product created as Auto-Renewable Subscription
- [ ] Both products in "Approved" or "Ready to Submit" state
- [ ] Subscription group created: "MindPrism Premium"
- [ ] Free trial configured (7 days) on monthly product
- [ ] Promotional offer configured on annual product

### Review Notes (for App Review team)
- [ ] Demo account credentials prepared (email + password for a seeded test account)
- [ ] Notes explaining any special flows (subscription, offline mode)
- [ ] Review notes describe how to test push notification (if applicable)

---

## Google Play Store Submission

### Google Play Console Setup
- [ ] App created in Play Console with package name `com.mindprism.app`
- [ ] Signing key generated and stored securely (NOT committed to git)
- [ ] Play App Signing enrolled (recommended — Google manages the key)
- [ ] `google-services.json` placed in `android/app/` (not committed to public repo)

### Store Listing Metadata
- [ ] **App Name:** MindPrism (≤50 characters)
- [ ] **Short Description:** ≤80 characters
- [ ] **Full Description:** ≤4,000 characters
- [ ] **Category:** Education
- [ ] **Content Rating:** Completed (target: Everyone / PEGI 3)
- [ ] **Privacy Policy URL:** https://mindprism.app/privacy
- [ ] **App Icon:** 512×512 PNG, no alpha channel

### Screenshots and Graphics
- [ ] Feature Graphic: 1024×500 JPG or PNG
- [ ] Phone screenshots: min 2, max 8 (16:9 or 9:16, ≥320px on shorter side)
- [ ] Tablet 7" screenshots (if tablet layout supported)
- [ ] Tablet 10" screenshots (if tablet layout supported)

### Technical Requirements
- [ ] Target SDK: Android 14 (API 34) or latest stable
- [ ] Minimum SDK: Android 8.0 (API 26) minimum (Capacitor requirement)
- [ ] 64-bit APK/AAB only (ARM64-v8a)
- [ ] Release build signed with correct keystore
- [ ] `android:exported` declared for all Activities/Services/Receivers in AndroidManifest.xml
- [ ] `POST_NOTIFICATIONS` permission requested at runtime (Android 13+)
- [ ] Deep link intent filters configured for `https://mindprism.app`

### Play Billing (IAP)
- [ ] Products created in Play Console: `mindprism.premium.monthly`, `mindprism.premium.annual`
- [ ] Billing library integrated (via Capacitor IAP plugin)
- [ ] `BILLING` permission declared in AndroidManifest.xml

### Pre-Launch Report
- [ ] Upload AAB to Internal Testing track
- [ ] Review and resolve Pre-Launch Report issues (crashes, ANRs, UI warnings)
- [ ] Test on at least 3 distinct device profiles from Firebase Test Lab

---

## Both Platforms: Final Pre-Submission Checks

- [ ] App version number incremented (follow semver: major.minor.patch)
- [ ] Build number incremented
- [ ] All debug logging removed from production build
- [ ] Analytics events firing correctly in production environment
- [ ] Stripe live keys active (not test keys) in production build
- [ ] `capacitor.config.ts` server.url removed or pointing to production URL
- [ ] Crash reporting (Sentry or equivalent) active in production build
- [ ] Legal: Terms of Service linked in app and on store listing
