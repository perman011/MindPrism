import type { Express } from "express";
import { db } from "./db";
import {
  recallCards,
  userRecallSchedule,
  actionCards,
  userActionProgress,
  insertRecallCardSchema,
  insertActionCardSchema,
} from "@shared/schema";
import { eq, and, lte, asc, desc, sql } from "drizzle-orm";
import { isAuthenticated } from "./replit_integrations/auth";
import { computeSM2 } from "./recall/sm2";
import { z } from "zod";

/** Middleware to require admin role */
function requireAdminRole(req: any, res: any, next: any) {
  const role = (req as any).dbUser?.role;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function registerRecallRoutes(app: Express) {
  // ────────────────────────────────────────────────────────────
  // Admin CRUD: Recall Cards
  // ────────────────────────────────────────────────────────────

  app.get("/api/admin/recall-cards", isAuthenticated, requireAdminRole, async (_req, res) => {
    try {
      const cards = await db.select().from(recallCards).orderBy(asc(recallCards.bookId), asc(recallCards.orderIndex));
      res.json(cards);
    } catch (error) {
      console.error("Error fetching recall cards:", error);
      res.status(500).json({ message: "Failed to fetch recall cards" });
    }
  });

  app.post("/api/admin/recall-cards", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const parsed = insertRecallCardSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.issues.map(i => i.message) });
      }
      const [result] = await db.insert(recallCards).values(parsed.data).returning();
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating recall card:", error);
      res.status(500).json({ message: "Failed to create recall card" });
    }
  });

  app.put("/api/admin/recall-cards/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const parsed = insertRecallCardSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.issues.map(i => i.message) });
      }
      const [result] = await db.update(recallCards)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(recallCards.id, req.params.id))
        .returning();
      if (!result) return res.status(404).json({ message: "Card not found" });
      res.json(result);
    } catch (error) {
      console.error("Error updating recall card:", error);
      res.status(500).json({ message: "Failed to update recall card" });
    }
  });

  app.delete("/api/admin/recall-cards/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      await db.delete(userRecallSchedule).where(eq(userRecallSchedule.cardId, req.params.id));
      const [deleted] = await db.delete(recallCards).where(eq(recallCards.id, req.params.id)).returning();
      if (!deleted) return res.status(404).json({ message: "Card not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting recall card:", error);
      res.status(500).json({ message: "Failed to delete recall card" });
    }
  });

  // ────────────────────────────────────────────────────────────
  // User: Spaced Repetition Review
  // ────────────────────────────────────────────────────────────

  /** Get cards due for review (up to 20) */
  app.get("/api/recall/due", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const now = new Date();
      const dueSchedules = await db
        .select({
          schedule: userRecallSchedule,
          card: recallCards,
        })
        .from(userRecallSchedule)
        .innerJoin(recallCards, eq(userRecallSchedule.cardId, recallCards.id))
        .where(and(
          eq(userRecallSchedule.userId, userId),
          lte(userRecallSchedule.nextReviewAt, now),
        ))
        .orderBy(asc(userRecallSchedule.nextReviewAt))
        .limit(20);

      res.json(dueSchedules.map(row => ({
        scheduleId: row.schedule.id,
        ...row.card,
        easeFactor: row.schedule.easeFactor,
        intervalDays: row.schedule.intervalDays,
        repetitions: row.schedule.repetitions,
        nextReviewAt: row.schedule.nextReviewAt,
      })));
    } catch (error) {
      console.error("Error fetching due cards:", error);
      res.status(500).json({ message: "Failed to fetch due cards" });
    }
  });

  /** Get recall cards for a specific book (new cards user hasn't started) */
  app.get("/api/recall/books/:bookId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const bookCards = await db.select().from(recallCards)
        .where(eq(recallCards.bookId, req.params.bookId))
        .orderBy(asc(recallCards.orderIndex));

      // Get user's existing schedules for this book's cards
      const cardIds = bookCards.map(c => c.id);
      if (cardIds.length === 0) return res.json([]);

      const schedules = await db.select().from(userRecallSchedule)
        .where(and(
          eq(userRecallSchedule.userId, userId),
        ));

      const scheduledCardIds = new Set(schedules.map(s => s.cardId));

      res.json(bookCards.map(card => ({
        ...card,
        isScheduled: scheduledCardIds.has(card.id),
      })));
    } catch (error) {
      console.error("Error fetching book recall cards:", error);
      res.status(500).json({ message: "Failed to fetch recall cards" });
    }
  });

  /** Start a recall card (add to user's review schedule) */
  app.post("/api/recall/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { cardId } = z.object({ cardId: z.string() }).parse(req.body);

      const [existing] = await db.select().from(userRecallSchedule)
        .where(and(
          eq(userRecallSchedule.userId, userId),
          eq(userRecallSchedule.cardId, cardId),
        ));

      if (existing) return res.json(existing);

      const [schedule] = await db.insert(userRecallSchedule).values({
        userId,
        cardId,
        easeFactor: 250,
        intervalDays: 1,
        repetitions: 0,
        nextReviewAt: new Date(), // Due immediately
      }).returning();

      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error starting recall card:", error);
      res.status(500).json({ message: "Failed to start recall card" });
    }
  });

  const reviewBodySchema = z.object({
    scheduleId: z.string(),
    quality: z.number().int().min(0).max(5),
  });

  /** Submit a review result */
  app.post("/api/recall/review", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { scheduleId, quality } = reviewBodySchema.parse(req.body);

      const [schedule] = await db.select().from(userRecallSchedule)
        .where(and(
          eq(userRecallSchedule.id, scheduleId),
          eq(userRecallSchedule.userId, userId),
        ));

      if (!schedule) return res.status(404).json({ message: "Schedule not found" });

      const sm2Result = computeSM2({
        easeFactor: schedule.easeFactor,
        intervalDays: schedule.intervalDays,
        repetitions: schedule.repetitions,
        quality,
      });

      const [updated] = await db.update(userRecallSchedule)
        .set({
          easeFactor: sm2Result.easeFactor,
          intervalDays: sm2Result.intervalDays,
          repetitions: sm2Result.repetitions,
          nextReviewAt: new Date(sm2Result.nextReviewAt),
          lastReviewedAt: new Date(),
          lastQuality: quality,
        })
        .where(eq(userRecallSchedule.id, scheduleId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // ────────────────────────────────────────────────────────────
  // Admin CRUD: Action Cards
  // ────────────────────────────────────────────────────────────

  app.get("/api/admin/action-cards", isAuthenticated, requireAdminRole, async (_req, res) => {
    try {
      const cards = await db.select().from(actionCards).orderBy(asc(actionCards.bookId), asc(actionCards.orderIndex));
      res.json(cards);
    } catch (error) {
      console.error("Error fetching action cards:", error);
      res.status(500).json({ message: "Failed to fetch action cards" });
    }
  });

  app.post("/api/admin/action-cards", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const parsed = insertActionCardSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.issues.map(i => i.message) });
      }
      const [result] = await db.insert(actionCards).values(parsed.data).returning();
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating action card:", error);
      res.status(500).json({ message: "Failed to create action card" });
    }
  });

  app.put("/api/admin/action-cards/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const parsed = insertActionCardSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.issues.map(i => i.message) });
      }
      const [result] = await db.update(actionCards)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(actionCards.id, req.params.id))
        .returning();
      if (!result) return res.status(404).json({ message: "Card not found" });
      res.json(result);
    } catch (error) {
      console.error("Error updating action card:", error);
      res.status(500).json({ message: "Failed to update action card" });
    }
  });

  app.delete("/api/admin/action-cards/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      await db.delete(userActionProgress).where(eq(userActionProgress.cardId, req.params.id));
      const [deleted] = await db.delete(actionCards).where(eq(actionCards.id, req.params.id)).returning();
      if (!deleted) return res.status(404).json({ message: "Card not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting action card:", error);
      res.status(500).json({ message: "Failed to delete action card" });
    }
  });

  // ────────────────────────────────────────────────────────────
  // User: Action Cards
  // ────────────────────────────────────────────────────────────

  /** Get action cards for a specific book with user's progress */
  app.get("/api/action-cards/books/:bookId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const cards = await db.select().from(actionCards)
        .where(eq(actionCards.bookId, req.params.bookId))
        .orderBy(asc(actionCards.dayNumber), asc(actionCards.orderIndex));

      const progress = await db.select().from(userActionProgress)
        .where(eq(userActionProgress.userId, userId));

      const progressMap = new Map(progress.map(p => [p.cardId, p]));

      res.json(cards.map(card => ({
        ...card,
        progress: progressMap.get(card.id) ?? null,
      })));
    } catch (error) {
      console.error("Error fetching action cards:", error);
      res.status(500).json({ message: "Failed to fetch action cards" });
    }
  });

  /** Get all active (in-progress) action cards for the current user */
  app.get("/api/action-cards/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const active = await db
        .select({
          progress: userActionProgress,
          card: actionCards,
        })
        .from(userActionProgress)
        .innerJoin(actionCards, eq(userActionProgress.cardId, actionCards.id))
        .where(and(
          eq(userActionProgress.userId, userId),
          eq(userActionProgress.status, "in_progress"),
        ))
        .orderBy(asc(actionCards.dayNumber));

      res.json(active.map(row => ({
        ...row.card,
        progress: row.progress,
      })));
    } catch (error) {
      console.error("Error fetching active action cards:", error);
      res.status(500).json({ message: "Failed to fetch active action cards" });
    }
  });

  const actionProgressSchema = z.object({
    cardId: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "skipped"]),
    reflection: z.string().optional(),
  });

  /** Update action card progress */
  app.post("/api/action-cards/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { cardId, status, reflection } = actionProgressSchema.parse(req.body);

      const values: any = {
        userId,
        cardId,
        status,
        reflection: reflection ?? null,
        completedAt: status === "completed" ? new Date() : null,
      };

      const [result] = await db.insert(userActionProgress)
        .values(values)
        .onConflictDoUpdate({
          target: [userActionProgress.userId, userActionProgress.cardId],
          set: {
            status: sql`excluded.status`,
            reflection: sql`excluded.reflection`,
            completedAt: sql`excluded.completed_at`,
          },
        })
        .returning();

      res.json(result);
    } catch (error) {
      console.error("Error updating action progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });
}
