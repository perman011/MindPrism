import cron, { type ScheduledTask } from "node-cron";
import { createBackup, rotateBackups } from "./backup";

let scheduledTask: ScheduledTask | null = null;

export function startBackupScheduler(): void {
  if (scheduledTask) {
    console.log("[backup-scheduler] Scheduler already running");
    return;
  }

  scheduledTask = cron.schedule("0 3 * * *", async () => {
    console.log("[backup-scheduler] Starting scheduled daily backup...");
    const startTime = Date.now();

    try {
      const metadata = await createBackup();
      console.log(
        `[backup-scheduler] Daily backup completed: ${metadata.filename} (${(metadata.size / 1024).toFixed(1)} KB) in ${metadata.duration}ms`,
      );

      const deleted = await rotateBackups(7);
      if (deleted > 0) {
        console.log(
          `[backup-scheduler] Rotation: removed ${deleted} old backup(s)`,
        );
      }
    } catch (error: any) {
      console.error(
        `[backup-scheduler] Daily backup failed after ${Date.now() - startTime}ms: ${error.message}`,
      );
    }
  });

  console.log("[backup-scheduler] Scheduled daily backups at 3:00 AM UTC");
}

export function stopBackupScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("[backup-scheduler] Scheduler stopped");
  }
}
