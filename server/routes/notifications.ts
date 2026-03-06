import { Router, type Request, type Response } from "express";
import webpush from "web-push";
import { db } from "../db";
import { notificationPreferences, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "../replit_integrations/auth";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://mindprism.io";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn("[notifications] VAPID keys not set — push notifications disabled");
}

const router = Router();

router.get("/preferences", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims.sub;
    let [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));

    if (!prefs) {
      [prefs] = await db.insert(notificationPreferences).values({ userId }).returning();
    }

    res.json(prefs);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.put("/preferences", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims.sub;
    const { dailyReminder, streakAlerts, newContent, weeklySummary, reminderTime } = req.body;

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (typeof dailyReminder === "boolean") updates.dailyReminder = dailyReminder;
    if (typeof streakAlerts === "boolean") updates.streakAlerts = streakAlerts;
    if (typeof newContent === "boolean") updates.newContent = newContent;
    if (typeof weeklySummary === "boolean") updates.weeklySummary = weeklySummary;
    if (typeof reminderTime === "string" && /^\d{2}:\d{2}$/.test(reminderTime)) {
      updates.reminderTime = reminderTime;
    }

    const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    let prefs;
    if (existing.length === 0) {
      [prefs] = await db.insert(notificationPreferences).values({ userId, ...updates }).returning();
    } else {
      [prefs] = await db.update(notificationPreferences).set(updates).where(eq(notificationPreferences.userId, userId)).returning();
    }

    res.json(prefs);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

router.post("/subscribe", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims.sub;
    const { subscription, permissionStatus } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid push subscription" });
    }

    const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    if (existing.length === 0) {
      await db.insert(notificationPreferences).values({
        userId,
        pushSubscription: subscription,
        permissionStatus: permissionStatus || "granted",
      });
    } else {
      await db.update(notificationPreferences).set({
        pushSubscription: subscription,
        permissionStatus: permissionStatus || "granted",
        updatedAt: new Date(),
      }).where(eq(notificationPreferences.userId, userId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.post("/dismiss-prompt", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims.sub;

    const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    if (existing.length === 0) {
      await db.insert(notificationPreferences).values({
        userId,
        permissionStatus: "dismissed",
        lastPromptDismissed: new Date(),
      });
    } else {
      await db.update(notificationPreferences).set({
        permissionStatus: "dismissed",
        lastPromptDismissed: new Date(),
        updatedAt: new Date(),
      }).where(eq(notificationPreferences.userId, userId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error dismissing prompt:", error);
    res.status(500).json({ error: "Failed to dismiss prompt" });
  }
});

router.post("/test", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims.sub;
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));

    if (!prefs?.pushSubscription) {
      return res.status(400).json({ error: "No push subscription found. Please enable notifications first." });
    }

    const payload = JSON.stringify({
      title: "MindPrism",
      body: "Your notifications are working! You'll receive daily wisdom, streak reminders, and new book alerts.",
      tag: "test-notification",
      url: "/vault",
    });

    await webpush.sendNotification(prefs.pushSubscription as webpush.PushSubscription, payload);
    res.json({ success: true });
  } catch (error: any) {
    if (error.statusCode === 410) {
      const userId = (req.user as any).claims.sub;
      await db.update(notificationPreferences).set({
        pushSubscription: null,
        permissionStatus: "expired",
        updatedAt: new Date(),
      }).where(eq(notificationPreferences.userId, userId));
      return res.status(410).json({ error: "Push subscription expired. Please re-enable notifications." });
    }
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send test notification" });
  }
});

router.get("/vapid-key", (_req: Request, res: Response) => {
  res.json({ publicKey: vapidPublicKey });
});

export async function sendPushToUser(userId: string, payload: { title: string; body: string; tag?: string; url?: string }) {
  try {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    if (!prefs?.pushSubscription) return false;

    await webpush.sendNotification(
      prefs.pushSubscription as webpush.PushSubscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (error: any) {
    if (error.statusCode === 410) {
      await db.update(notificationPreferences).set({
        pushSubscription: null,
        permissionStatus: "expired",
        updatedAt: new Date(),
      }).where(eq(notificationPreferences.userId, userId));
    }
    return false;
  }
}

export default router;
