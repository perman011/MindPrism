import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerAdminRoutes } from "./admin-routes";
import { registerStripeRoutes } from "./stripe-routes";
import { z } from "zod";
import { encrypt, decrypt } from "./crypto";
import { db } from "./db";
import { userActivityLog, userProgress, books, categories, journalEntries } from "@shared/schema";
import { eq, and, sql as dsql, desc, gte, count } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerAdminRoutes(app);
  registerStripeRoutes(app);

  app.get("/api/categories", async (_req, res) => {
    try {
      const cats = await storage.getCategories();
      res.json(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/books", async (req, res) => {
    try {
      const allBooks = await storage.getBooks();
      const result = allBooks.filter(b => b.status === "published" || b.status === "published_with_changes" || !b.status);
      res.json(result);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  const INTEREST_TO_CATEGORY_SLUGS: Record<string, string[]> = {
    "anxiety": ["mindfulness", "emotions"],
    "productivity": ["habits", "mindset"],
    "body-language": ["emotions", "mindset"],
    "leadership": ["mindset", "meaning"],
    "mindfulness": ["mindfulness"],
    "habits": ["habits"],
    "relationships": ["emotions", "mindfulness"],
    "decision-making": ["mindset", "habits"],
    "confidence": ["mindset", "meaning"],
    "stoicism": ["mindfulness", "meaning"],
    "creativity": ["mindset", "meaning"],
    "emotional-iq": ["emotions", "mindfulness"],
  };

  app.get("/api/books/recommended", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userInterestData = await storage.getUserInterests(userId);

      if (!userInterestData?.interests?.length || !userInterestData.onboardingCompleted) {
        return res.json([]);
      }

      const allCategories = await storage.getCategories();
      const matchedSlugs = new Set<string>();
      for (const interest of userInterestData.interests) {
        const slugs = INTEREST_TO_CATEGORY_SLUGS[interest];
        if (slugs) {
          slugs.forEach(s => matchedSlugs.add(s));
        }
      }

      const matchedCategoryIds = allCategories
        .filter(c => matchedSlugs.has(c.slug))
        .map(c => c.id);

      const allBooks = await storage.getBooks();
      const publishedBooks = allBooks.filter(b => b.status === "published" || b.status === "published_with_changes" || !b.status);

      const allUserProgress = await storage.getAllUserProgress(userId);
      const startedBookIds = new Set(
        allUserProgress
          .filter(p => p.currentCardIndex && p.currentCardIndex > 0)
          .map(p => p.bookId)
      );

      let recommended = publishedBooks.filter(
        b => b.categoryId && matchedCategoryIds.includes(b.categoryId) && !startedBookIds.has(b.id)
      );

      if (recommended.length < 3) {
        const recIds = new Set(recommended.map(b => b.id));
        const featured = publishedBooks.filter(
          b => b.featured && !startedBookIds.has(b.id) && !recIds.has(b.id)
        );
        recommended = [...recommended, ...featured];
      }

      if (recommended.length < 3) {
        const recIds = new Set(recommended.map(b => b.id));
        const remaining = publishedBooks.filter(
          b => !startedBookIds.has(b.id) && !recIds.has(b.id)
        );
        recommended = [...recommended, ...remaining];
      }

      res.json(recommended.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recommended books:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      if (book.status === "draft") return res.status(404).json({ message: "Book not found" });
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
      const encryptedContent = encrypt(content);
      const entry = await storage.createJournalEntry({ userId, exerciseId, content: encryptedContent });
      await storage.incrementExercisesCompleted(userId);
      await storage.updateUserStreak(userId);
      res.json({ ...entry, content });
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get("/api/journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      const decryptedEntries = entries.map(entry => {
        try {
          return { ...entry, content: decrypt(entry.content) };
        } catch {
          return entry;
        }
      });
      res.json(decryptedEntries);
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

  app.get("/api/chakra-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getChakraProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching chakra progress:", error);
      res.status(500).json({ message: "Failed to fetch chakra progress" });
    }
  });

  app.post("/api/chakra-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        chakra: z.string().min(1),
        points: z.number().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid chakra data" });
      const result = await storage.updateChakraProgress(userId, parsed.data.chakra, parsed.data.points);
      res.json(result);
    } catch (error) {
      console.error("Error updating chakra progress:", error);
      res.status(500).json({ message: "Failed to update chakra progress" });
    }
  });

  app.get("/api/books/chakra/:chakra", async (req, res) => {
    try {
      const chakra = req.params.chakra;
      const allBooks = await storage.getBooks();
      const filtered = allBooks.filter(
        b => (b.status === "published" || b.status === "published_with_changes" || !b.status) &&
          (b.primaryChakra === chakra || b.secondaryChakra === chakra)
      );
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching books by chakra:", error);
      res.status(500).json({ message: "Failed to fetch books by chakra" });
    }
  });

  app.post("/api/user/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        eventType: z.enum([
          "book_opened", "chapter_completed", "section_viewed",
          "audio_played", "exercise_completed", "journal_entry_created",
          "book_completed", "session_start", "session_end"
        ]),
        eventData: z.record(z.any()).optional(),
        bookId: z.string().optional(),
        sessionDuration: z.number().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid activity data" });

      const [entry] = await db.insert(userActivityLog).values({
        userId,
        eventType: parsed.data.eventType,
        eventData: parsed.data.eventData ?? {},
        bookId: parsed.data.bookId ?? null,
        sessionDuration: parsed.data.sessionDuration ?? null,
      }).returning();
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error logging activity:", error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const allProgress = await storage.getAllUserProgress(userId);
      const streak = await storage.getUserStreak(userId);
      const allBooks = await storage.getBooks();
      const publishedBooks = allBooks.filter(b => b.status === "published" || b.status === "published_with_changes" || !b.status);

      const booksStarted = allProgress.filter(p => (p.currentCardIndex ?? 0) > 0).length;
      const booksCompleted = allProgress.filter(p => {
        const total = p.totalCards ?? 1;
        return total > 0 && (p.currentCardIndex ?? 0) >= total;
      }).length;

      const principlesMastered = allProgress.reduce((sum, p) => sum + (p.completedPrinciples?.length ?? 0), 0);
      const exercisesDone = allProgress.reduce((sum, p) => sum + (p.completedExercises?.length ?? 0), 0);

      const startedBookIds = new Set(allProgress.filter(p => (p.currentCardIndex ?? 0) > 0).map(p => p.bookId));
      const categoriesExplored = new Set(
        publishedBooks.filter(b => startedBookIds.has(b.id) && b.categoryId).map(b => b.categoryId)
      ).size;

      const totalReadTime = publishedBooks
        .filter(b => startedBookIds.has(b.id))
        .reduce((sum, b) => sum + (b.readTime ?? 0), 0);
      const totalListenTime = streak?.totalMinutesListened ?? 0;
      const totalTimeInvested = totalReadTime + totalListenTime;

      const avgTimePerBook = booksStarted > 0 ? Math.round(totalTimeInvested / booksStarted) : 0;

      const [journalCount] = await db
        .select({ count: count() })
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId));

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyActivity = await db
        .select({
          date: dsql<string>`DATE(${userActivityLog.createdAt})`,
          count: count(),
        })
        .from(userActivityLog)
        .where(and(
          eq(userActivityLog.userId, userId),
          gte(userActivityLog.createdAt, sevenDaysAgo)
        ))
        .groupBy(dsql`DATE(${userActivityLog.createdAt})`)
        .orderBy(dsql`DATE(${userActivityLog.createdAt})`);

      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const found = weeklyActivity.find(w => w.date === dateStr);
        weekDays.push({ day: dayName, date: dateStr, activities: found ? Number(found.count) : 0 });
      }

      res.json({
        booksStarted,
        booksCompleted,
        principlesMastered,
        exercisesDone,
        categoriesExplored,
        totalTimeInvested,
        avgTimePerBook,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        totalMinutesListened: totalListenTime,
        totalExercisesCompleted: streak?.totalExercisesCompleted ?? 0,
        journalEntries: journalCount?.count ? Number(journalCount.count) : 0,
        weeklyActivity: weekDays,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
