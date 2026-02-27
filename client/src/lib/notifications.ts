const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subscription: existing.toJSON(),
          permissionStatus: "granted",
        }),
      });
      return existing;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn("VAPID public key not configured");
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        permissionStatus: "granted",
      }),
    });

    return subscription;
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await subscribeToPush();
  }
  return permission;
}

export function shouldShowPrompt(lastDismissed: string | null): boolean {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "default") return false;
  if (!lastDismissed) return true;

  const dismissed = new Date(lastDismissed);
  const sevenDaysLater = new Date(dismissed.getTime() + 7 * 24 * 60 * 60 * 1000);
  return new Date() > sevenDaysLater;
}

export async function sendTestNotification(): Promise<boolean> {
  try {
    const res = await fetch("/api/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}
