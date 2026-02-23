import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/categories", async (_req, res) => {
    try {
      const cats = await storage.getCategories();
      res.json(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/books", async (_req, res) => {
    try {
      const allBooks = await storage.getBooks();
      res.json(allBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.get("/api/books/:id/principles", async (req, res) => {
    try {
      const p = await storage.getPrinciplesByBook(req.params.id);
      res.json(p);
    } catch (error) {
      console.error("Error fetching principles:", error);
      res.status(500).json({ message: "Failed to fetch principles" });
    }
  });

  app.get("/api/books/:id/stories", async (req, res) => {
    try {
      const s = await storage.getStoriesByBook(req.params.id);
      res.json(s);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/books/:id/exercises", async (req, res) => {
    try {
      const e = await storage.getExercisesByBook(req.params.id);
      res.json(e);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/books/:id/cards", async (req, res) => {
    try {
      const [bookPrinciples, bookStories, bookExercises] = await Promise.all([
        storage.getPrinciplesByBook(req.params.id),
        storage.getStoriesByBook(req.params.id),
        storage.getExercisesByBook(req.params.id),
      ]);

      const cards: any[] = [];
      const sorted = [...bookPrinciples].sort((a, b) => a.orderIndex - b.orderIndex);
      const sortedStories = [...bookStories].sort((a, b) => a.orderIndex - b.orderIndex);
      const sortedExercises = [...bookExercises].sort((a, b) => a.orderIndex - b.orderIndex);

      sorted.forEach((p) => {
        cards.push({ type: "principle", data: p });
      });
      sortedStories.forEach((s) => {
        cards.push({ type: "story", data: s });
      });
      sortedExercises.forEach((e) => {
        cards.push({ type: "exercise", data: e });
      });

      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.get("/api/progress/:bookId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId, req.params.bookId);
      res.json(progress ?? null);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allProgress = await storage.getAllUserProgress(userId);
      res.json(allProgress);
    } catch (error) {
      console.error("Error fetching all progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress/:bookId/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.toggleBookmark(userId, req.params.bookId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.post("/api/progress/:bookId/principle/:principleId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.togglePrincipleComplete(userId, req.params.bookId, req.params.principleId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling principle:", error);
      res.status(500).json({ message: "Failed to toggle principle" });
    }
  });

  app.post("/api/progress/:bookId/card", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({ cardIndex: z.number(), totalCards: z.number() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const result = await storage.updateCardProgress(userId, req.params.bookId, parsed.data.cardIndex, parsed.data.totalCards);
      await storage.updateUserStreak(userId);
      res.json(result);
    } catch (error) {
      console.error("Error updating card progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post("/api/journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const journalSchema = z.object({
        exerciseId: z.string().min(1),
        content: z.string().min(1),
      });
      const parsed = journalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "exerciseId and content are required" });
      }
      const { exerciseId, content } = parsed.data;
      const entry = await storage.createJournalEntry({ userId, exerciseId, content });
      await storage.incrementExercisesCompleted(userId);
      await storage.updateUserStreak(userId);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get("/api/journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/interests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interests = await storage.getUserInterests(userId);
      res.json(interests ?? null);
    } catch (error) {
      console.error("Error fetching interests:", error);
      res.status(500).json({ message: "Failed to fetch interests" });
    }
  });

  app.post("/api/interests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({ interests: z.array(z.string()).min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "interests array required" });
      const result = await storage.saveUserInterests({ userId, interests: parsed.data.interests, onboardingCompleted: true });
      res.json(result);
    } catch (error) {
      console.error("Error saving interests:", error);
      res.status(500).json({ message: "Failed to save interests" });
    }
  });

  app.get("/api/daily-spark", async (_req, res) => {
    try {
      const spark = await storage.getDailySpark();
      res.json(spark ?? null);
    } catch (error) {
      console.error("Error fetching daily spark:", error);
      res.status(500).json({ message: "Failed to fetch daily spark" });
    }
  });

  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streak = await storage.getUserStreak(userId);
      res.json(streak ?? { currentStreak: 0, longestStreak: 0, totalMinutesListened: 0, totalExercisesCompleted: 0, totalBooksStarted: 0 });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  app.post("/api/streak/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.updateUserStreak(userId);
      res.json(result);
    } catch (error) {
      console.error("Error updating streak:", error);
      res.status(500).json({ message: "Failed to update streak" });
    }
  });

  app.post("/api/streak/listening", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({ minutes: z.number().min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "minutes required" });
      const result = await storage.addListeningTime(userId, parsed.data.minutes);
      res.json(result);
    } catch (error) {
      console.error("Error updating listening time:", error);
      res.status(500).json({ message: "Failed to update listening time" });
    }
  });

  app.get("/api/highlights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const highlights = await storage.getSavedHighlights(userId);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  app.post("/api/highlights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        bookId: z.string().min(1),
        principleId: z.string().optional(),
        content: z.string().min(1),
        type: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid highlight data" });
      const result = await storage.createSavedHighlight({ userId, ...parsed.data });
      res.json(result);
    } catch (error) {
      console.error("Error saving highlight:", error);
      res.status(500).json({ message: "Failed to save highlight" });
    }
  });

  app.delete("/api/highlights/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteSavedHighlight(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight" });
    }
  });

  return httpServer;
}
