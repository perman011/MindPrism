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
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  return httpServer;
}
