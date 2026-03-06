# Capacitor Patterns

Common patterns, platform guards, plugin initialization flows, and known gotchas for Capacitor in the MindPrism codebase.

---

## 1. Platform Guard Pattern

Always guard native-only code with `Capacitor.isNativePlatform()`. This prevents runtime errors when running in the browser (development, PWA).

```typescript
import { Capacitor } from '@capacitor/core';

// ✅ Safe pattern
if (Capacitor.isNativePlatform()) {
  await PushNotifications.requestPermissions();
}

// ✅ Platform-specific behavior
const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
if (platform === 'ios') {
  // iOS-specific behavior
}
```

---

## 2. Plugin Initialization in App.tsx

Initialize all Capacitor plugins on app mount, not at module load time. Use a `useEffect` on the root `App` component.

```typescript
// client/src/App.tsx
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

function App() {
  useEffect(() => {
    async function initNative() {
      if (!Capacitor.isNativePlatform()) return;

      // Hide splash screen after first render
      await SplashScreen.hide({ fadeOutDuration: 300 });

      // Match status bar to dark purple theme
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1a0533' });
    }

    initNative();
  }, []);

  return <RouterProvider router={router} />;
}
```

---

## 3. Push Notification Setup

```typescript
// client/src/hooks/usePushNotifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export async function registerPushNotifications(userId: number) {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async ({ value: token }) => {
    // Send token to server
    await fetch('/api/users/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
    });
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration failed:', err);
  });

  // Foreground notification handler — show in-app toast instead of system notification
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Dispatch to toast system (Sonner or custom)
    window.dispatchEvent(new CustomEvent('inAppNotification', { detail: notification }));
  });

  // Notification tap handler — navigate to deep link
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const url = action.notification.data?.url;
    if (url) window.location.href = url;
  });
}
```

---

## 4. Haptics Hook

```typescript
// client/src/hooks/useHaptics.ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export function useHaptics() {
  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style });
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.notification({ type });
  };

  const vibrate = async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.vibrate();
  };

  return { impact, notification, vibrate };
}

// Usage:
// const { impact } = useHaptics();
// <button onClick={() => { impact(ImpactStyle.Light); handlePress(); }}>Tap</button>
```

---

## 5. Offline Filesystem Pattern

```typescript
// client/src/lib/offlineStorage.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export async function saveChapterOffline(bookId: number, chapterId: number, content: string) {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback: use localStorage or IndexedDB
    localStorage.setItem(`chapter_${bookId}_${chapterId}`, content);
    return;
  }

  const path = `books/${bookId}/chapters/${chapterId}.json`;
  await Filesystem.writeFile({
    path,
    data: content,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

export async function loadChapterOffline(bookId: number, chapterId: number): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    return localStorage.getItem(`chapter_${bookId}_${chapterId}`);
  }

  try {
    const result = await Filesystem.readFile({
      path: `books/${bookId}/chapters/${chapterId}.json`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return result.data as string;
  } catch {
    return null;
  }
}
```

---

## 6. Network State Listener

```typescript
// client/src/hooks/useNetworkState.ts
import { Network } from '@capacitor/network';
import { useEffect, useState } from 'react';

export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    Network.getStatus().then(({ connected }) => setIsOnline(connected));

    const listener = Network.addListener('networkStatusChange', ({ connected }) => {
      setIsOnline(connected);
      if (connected) {
        // Trigger sync queue flush
        window.dispatchEvent(new Event('network:reconnected'));
      }
    });

    return () => { listener.then(l => l.remove()); };
  }, []);

  return { isOnline };
}
```

---

## 7. Deep Link Handling (App Open from URL)

```typescript
// client/src/App.tsx — add inside App component
import { App as CapacitorApp } from '@capacitor/app';

useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;

  const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
    // Parse URL and navigate: e.g. https://mindprism.app/books/42
    const path = new URL(url).pathname;
    router.navigate(path);
  });

  return () => { listener.then(l => l.remove()); };
}, []);
```

---

## 8. Known Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `window.location.href` navigation breaks native history | React Router and Capacitor nav stack conflict | Use `router.navigate()` from react-router-dom, never `window.location.href` for in-app navigation |
| Keyboard pushes content up on iOS | Default Capacitor behavior | Set `KeyboardResizesContent: false` in `capacitor.config.ts` or handle with `@capacitor/keyboard` `ionKeyboardDidShow` listener |
| Status bar overlaps content on Android | Edge-to-edge display mode | Add padding-top equal to status bar height via `StatusBar.getInfo()` on mount |
| Local dev server unreachable from Capacitor | `server.url` leftover in config | Remove `server.url` in `capacitor.config.ts` before any non-dev build |
| Push token not refreshed after app update | Token rotation | Add `PushNotifications.addListener('registration')` on every app launch, not just first launch |
| Filesystem paths differ iOS vs Android | OS path conventions | Always use `Directory.Data` enum from Capacitor — never hardcode filesystem paths |
| `npx cap sync` fails after npm install | Capacitor plugins not synced | Always run `npx cap sync` after adding or updating any Capacitor plugin |
