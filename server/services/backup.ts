import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);
const BACKUP_DIR = path.resolve(process.cwd(), "backups");

export interface BackupMetadata {
  filename: string;
  size: number;
  timestamp: string;
  duration: number;
}

async function ensureBackupDir(): Promise<void> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export async function createBackup(): Promise<BackupMetadata> {
  await ensureBackupDir();

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `backup_${timestamp}.sql.gz`;
  const filepath = path.join(BACKUP_DIR, filename);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const startTime = Date.now();

  try {
    await execAsync(`pg_dump "${databaseUrl}" | gzip > "${filepath}"`, {
      timeout: 120000,
    });

    const stats = fs.statSync(filepath);
    const duration = Date.now() - startTime;

    const metadata: BackupMetadata = {
      filename,
      size: stats.size,
      timestamp: now.toISOString(),
      duration,
    };

    console.log(
      `[backup] Created ${filename} (${(stats.size / 1024).toFixed(1)} KB) in ${duration}ms`,
    );
    return metadata;
  } catch (error: any) {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    console.error(`[backup] Failed to create backup: ${error.message}`);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

export async function listBackups(): Promise<BackupMetadata[]> {
  await ensureBackupDir();

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("backup_") && f.endsWith(".sql.gz"))
    .sort()
    .reverse();

  return files.map((filename) => {
    const stats = fs.statSync(path.join(BACKUP_DIR, filename));
    const match = filename.match(
      /backup_(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/,
    );
    const timestamp = match
      ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`
      : stats.mtime.toISOString();

    return {
      filename,
      size: stats.size,
      timestamp,
      duration: 0,
    };
  });
}

export async function deleteBackup(filename: string): Promise<boolean> {
  if (!filename.startsWith("backup_") || !filename.endsWith(".sql.gz")) {
    throw new Error("Invalid backup filename");
  }

  if (filename.includes("..") || filename.includes("/")) {
    throw new Error("Invalid backup filename");
  }

  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return false;
  }

  fs.unlinkSync(filepath);
  console.log(`[backup] Deleted ${filename}`);
  return true;
}

export async function getBackupPath(filename: string): Promise<string | null> {
  if (!filename.startsWith("backup_") || !filename.endsWith(".sql.gz")) {
    throw new Error("Invalid backup filename");
  }

  if (filename.includes("..") || filename.includes("/")) {
    throw new Error("Invalid backup filename");
  }

  const filepath = path.join(BACKUP_DIR, filename);
  return fs.existsSync(filepath) ? filepath : null;
}

export async function rotateBackups(keepCount: number = 7): Promise<number> {
  const backups = await listBackups();

  if (backups.length <= keepCount) {
    return 0;
  }

  const toDelete = backups.slice(keepCount);
  let deleted = 0;

  for (const backup of toDelete) {
    try {
      await deleteBackup(backup.filename);
      deleted++;
    } catch (err: any) {
      console.error(
        `[backup] Failed to delete old backup ${backup.filename}: ${err.message}`,
      );
    }
  }

  console.log(
    `[backup] Rotated backups: deleted ${deleted}, kept ${keepCount}`,
  );
  return deleted;
}
