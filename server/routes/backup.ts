import { Router, type Request, type Response, type NextFunction } from "express";
import { createBackup, listBackups, deleteBackup, getBackupPath } from "../services/backup";
import { isAuthenticated } from "../replit_integrations/auth";
import { authStorage } from "../replit_integrations/auth/storage";
import { hasMinRole } from "@shared/models/auth";

const router = Router();

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await authStorage.getUser(user.claims.sub);
  if (!dbUser || !hasMinRole(dbUser.role, "admin")) {
    return res.status(403).json({ message: "Forbidden: admin role required" });
  }
  next();
};

router.use(isAuthenticated, requireAdmin);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const backups = await listBackups();
    res.json({ backups });
  } catch (error: any) {
    res.status(500).json({ message: `Failed to list backups: ${error.message}` });
  }
});

router.post("/", async (_req: Request, res: Response) => {
  try {
    const metadata = await createBackup();
    res.json({ message: "Backup created successfully", backup: metadata });
  } catch (error: any) {
    res.status(500).json({ message: `Backup failed: ${error.message}` });
  }
});

router.delete("/:filename", async (req: Request, res: Response) => {
  try {
    const deleted = await deleteBackup(req.params.filename);
    if (!deleted) {
      return res.status(404).json({ message: "Backup not found" });
    }
    res.json({ message: "Backup deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:filename/download", async (req: Request, res: Response) => {
  try {
    const filepath = await getBackupPath(req.params.filename);
    if (!filepath) {
      return res.status(404).json({ message: "Backup not found" });
    }
    res.download(filepath, req.params.filename);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
