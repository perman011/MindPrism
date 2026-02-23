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
      const e = await storage.getExercisesByBookSorted(req.params.id);
      res.json(e);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/books/:id/chapter-summaries", async (req, res) => {
    try {
      const cs = await storage.getChapterSummariesByBook(req.params.id);
      res.json(cs);
    } catch (error) {
      console.error("Error fetching chapter summaries:", error);
      res.status(500).json({ message: "Failed to fetch chapter summaries" });
    }
  });

  app.get("/api/books/:id/mental-models", async (req, res) => {
    try {
      const mm = await storage.getMentalModelsByBook(req.params.id);
      res.json(mm);
    } catch (error) {
      console.error("Error fetching mental models:", error);
      res.status(500).json({ message: "Failed to fetch mental models" });
    }
  });

  app.get("/api/books/:id/common-mistakes", async (req, res) => {
    try {
      const cm = await storage.getCommonMistakesByBook(req.params.id);
      res.json(cm);
    } catch (error) {
      console.error("Error fetching common mistakes:", error);
      res.status(500).json({ message: "Failed to fetch common mistakes" });
    }
  });

  app.get("/api/books/:id/infographics", async (req, res) => {
    try {
      const inf = await storage.getInfographicsByBook(req.params.id);
      res.json(inf);
    } catch (error) {
      console.error("Error fetching infographics:", error);
      res.status(500).json({ message: "Failed to fetch infographics" });
    }
  });

  app.get("/api/books/:id/action-items", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const ai = await storage.getActionItemsByBook(req.params.id, type);
      res.json(ai);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  app.get("/api/books/:id/cards/:section", async (req, res) => {
    try {
      const { id, section } = req.params;
      let cards: any[] = [];

      switch (section) {
        case "chapter-summaries": {
          const chapters = await storage.getChapterSummariesByBook(id);
          chapters.forEach((ch) => {
            const chCards = (ch.cards as any[]) || [];
            chCards.forEach((card, i) => {
              cards.push({ type: "chapter-summary", data: { ...card, chapterNumber: ch.chapterNumber, chapterTitle: ch.chapterTitle, cardIndex: i, totalInChapter: chCards.length, chapterId: ch.id } });
            });
            if (chapters.indexOf(ch) < chapters.length - 1) {
              const next = chapters[chapters.indexOf(ch) + 1];
              cards.push({ type: "chapter-transition", data: { nextChapterNumber: next.chapterNumber, nextChapterTitle: next.chapterTitle } });
            }
          });
          break;
        }
        case "mental-models": {
          const models = await storage.getMentalModelsByBook(id);
          models.forEach((model) => {
            cards.push({ type: "mental-model-intro", data: { id: model.id, title: model.title, description: model.description, totalSteps: (model.steps as any[]).length } });
            (model.steps as any[]).forEach((step, i) => {
              cards.push({ type: "mental-model-step", data: { ...step, modelTitle: model.title, stepIndex: i, totalSteps: (model.steps as any[]).length, modelId: model.id } });
            });
          });
          break;
        }
        case "principles": {
          const bookPrinciples = await storage.getPrinciplesByBook(id);
          for (const p of bookPrinciples) {
            cards.push({ type: "principle", data: p });
            const pStories = await storage.getStoriesByPrinciple(p.id);
            pStories.forEach((s) => {
              cards.push({ type: "story", data: s });
            });
          }
          break;
        }
        case "common-mistakes": {
          const mistakes = await storage.getCommonMistakesByBook(id);
          mistakes.forEach((m) => {
            cards.push({ type: "common-mistake", data: m });
          });
          break;
        }
        case "exercises": {
          const exs = await storage.getExercisesByBookSorted(id);
          exs.forEach((e) => {
            cards.push({ type: "exercise", data: e });
          });
          break;
        }
        case "action-items": {
          const items = await storage.getActionItemsByBook(id);
          cards.push({ type: "action-items-list", data: { items } });
          break;
        }
        case "infographics": {
          const infs = await storage.getInfographicsByBook(id);
          infs.forEach((inf) => {
            cards.push({ type: "infographic-intro", data: { id: inf.id, title: inf.title, description: inf.description, imageUrl: inf.imageUrl, totalSteps: (inf.steps as any[]).length } });
            (inf.steps as any[]).forEach((step, i) => {
              cards.push({ type: "infographic-step", data: { ...step, infographicTitle: inf.title, stepIndex: i, totalSteps: (inf.steps as any[]).length, infographicId: inf.id } });
            });
          });
          break;
        }
        default: {
          const [bookPrinciples2, bookStories, bookExercises] = await Promise.all([
            storage.getPrinciplesByBook(id),
            storage.getStoriesByBook(id),
            storage.getExercisesByBook(id),
          ]);
          bookPrinciples2.forEach((p) => cards.push({ type: "principle", data: p }));
          bookStories.forEach((s) => cards.push({ type: "story", data: s }));
          bookExercises.forEach((e) => cards.push({ type: "exercise", data: e }));
        }
      }

      res.json(cards);
    } catch (error) {
      console.error("Error fetching section cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
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
      bookPrinciples.forEach((p) => cards.push({ type: "principle", data: p }));
      bookStories.forEach((s) => cards.push({ type: "story", data: s }));
      bookExercises.forEach((e) => cards.push({ type: "exercise", data: e }));

      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.get("/api/books/:id/content-counts", async (req, res) => {
    try {
      const id = req.params.id;
      const [chapters, models, principles, mistakes, exercises, items, infs] = await Promise.all([
        storage.getChapterSummariesByBook(id),
        storage.getMentalModelsByBook(id),
        storage.getPrinciplesByBook(id),
        storage.getCommonMistakesByBook(id),
        storage.getExercisesByBook(id),
        storage.getActionItemsByBook(id),
        storage.getInfographicsByBook(id),
      ]);
      res.json({
        chapterSummaries: chapters.length,
        mentalModels: models.length,
        principles: principles.length,
        commonMistakes: mistakes.length,
        exercises: exercises.length,
        actionItems: items.length,
        infographics: infs.length,
      });
    } catch (error) {
      console.error("Error fetching content counts:", error);
      res.status(500).json({ message: "Failed to fetch content counts" });
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
      const schema = z.object({ cardIndex: z.number(), totalCards: z.number(), section: z.string().optional() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const result = await storage.updateCardProgress(userId, req.params.bookId, parsed.data.cardIndex, parsed.data.totalCards, parsed.data.section);
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
        exerciseId: z.string().optional(),
        content: z.string().min(1),
      });
      const parsed = journalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "content is required" });
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
