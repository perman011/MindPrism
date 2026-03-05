import cron, { type ScheduledTask } from "node-cron";
import { db } from "../db";
import { notificationPreferences, users, userStreaks, books, userProgress } from "@shared/schema";
import { eq, and, isNotNull, sql, count } from "drizzle-orm";
import { sendPushToUser } from "../routes/notifications";

let dailyReminderJob: ScheduledTask | null = null;
let streakRiskJob: ScheduledTask | null = null;
let weeklySummaryJob: ScheduledTask | null = null;

export function startNotificationScheduler() {
  dailyReminderJob = cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const currentHour = now.getUTCHours().toString().padStart(2, "0");
      const currentMinute = "00";
      const targetTime = `${currentHour}:${currentMinute}`;

      const prefs = await db.select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.dailyReminder, true),
            eq(notificationPreferences.reminderTime, targetTime),
            isNotNull(notificationPreferences.pushSubscription)
          )
        );

      for (const pref of prefs) {
        await sendPushToUser(pref.userId, {
          title: "MindPrism",
          body: "Time for your daily mind session",
          tag: "daily-reminder",
          url: "/",
        });
      }

      if (prefs.length > 0) {
        console.log(`[NotificationScheduler] Sent ${prefs.length} daily reminders at ${targetTime} UTC`);
      }
    } catch (error) {
      console.error("[NotificationScheduler] Error in daily reminder job:", error);
    }
  });

  streakRiskJob = cron.schedule("0 20 * * *", async () => {
    try {
      const prefs = await db.select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.streakAlerts, true),
            isNotNull(notificationPreferences.pushSubscription)
          )
        );

      for (const pref of prefs) {
        const [streak] = await db.select()
          .from(userStreaks)
          .where(eq(userStreaks.userId, pref.userId));

        const currentStreak = streak?.currentStreak ?? 0;
        if (streak && currentStreak > 0) {
          const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);

          if (lastActive && lastActive < today) {
            await sendPushToUser(pref.userId, {
              title: "MindPrism",
              body: `Your ${currentStreak}-day streak is at risk! Open MindPrism to keep it going`,
              tag: "streak-risk",
              url: "/",
            });
          }
        }
      }

      console.log("[NotificationScheduler] Completed streak risk check");
    } catch (error) {
      console.error("[NotificationScheduler] Error in streak risk job:", error);
    }
  });

  weeklySummaryJob = cron.schedule("0 10 * * 0", async () => {
    try {
      const prefs = await db.select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.weeklySummary, true),
            isNotNull(notificationPreferences.pushSubscription)
          )
        );

      for (const pref of prefs) {
        await sendPushToUser(pref.userId, {
          title: "MindPrism — Weekly Recap",
          body: "Check your Growth Vault to see your weekly progress and insights!",
          tag: "weekly-summary",
          url: "/vault",
        });
      }

      if (prefs.length > 0) {
        console.log(`[NotificationScheduler] Sent ${prefs.length} weekly summaries`);
      }
    } catch (error) {
      console.error("[NotificationScheduler] Error in weekly summary job:", error);
    }
  });

  console.log("[NotificationScheduler] Started: daily reminders (hourly check), streak risk (8PM UTC), weekly summary (Sun 10AM UTC)");
}

export function stopNotificationScheduler() {
  dailyReminderJob?.stop();
  streakRiskJob?.stop();
  weeklySummaryJob?.stop();
  console.log("[NotificationScheduler] Stopped all notification jobs");
}

export async function sendNewBookNotification(bookTitle: string, bookAuthor: string, bookId: string) {
  try {
    const prefs = await db.select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.newContent, true),
          isNotNull(notificationPreferences.pushSubscription)
        )
      );

    let sent = 0;
    for (const pref of prefs) {
      const success = await sendPushToUser(pref.userId, {
        title: "New Book Alert!",
        body: `${bookTitle} by ${bookAuthor} is now available on MindPrism`,
        tag: "new-book",
        url: `/book/${bookId}`,
      });
      if (success) sent++;
    }

    console.log(`[NotificationScheduler] Sent new book notifications to ${sent}/${prefs.length} users`);
    return sent;
  } catch (error) {
    console.error("[NotificationScheduler] Error sending new book notifications:", error);
    return 0;
  }
}
