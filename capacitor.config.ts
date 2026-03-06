import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindprism.app',
  appName: 'MindPrism',
  webDir: 'dist/public',
  server: {
    // In production builds, the app runs from bundled assets (no remote URL needed)
    // For dev, override with: npx cap run --livereload-url=http://localhost:5000
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0a0118',  // Deep purple matching app theme
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0118',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
    Haptics: {},
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'MindPrism',
  },
  android: {
    backgroundColor: '#0a0118',
    allowMixedContent: false,
  },
};

export default config;
