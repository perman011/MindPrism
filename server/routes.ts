import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerAdminRoutes } from "./admin-routes";
import { registerStripeRoutes } from "./stripe-routes";
import { z } from "zod";
import { encrypt, decrypt } from "./crypto";
import { db } from "./db";
import { userActivityLog, userProgress, books, categories, journalEntries, quizResults, chapterSummaries, savedHighlights, shorts, shortViews, insertShortSchema } from "@shared/schema";
import { eq, and, sql as dsql, desc, gte, count, lte, asc } from "drizzle-orm";
import { ensureManagedMediaExists } from "./media/managed-media";
import {
  normalizeShortPayload,
  getPublishedMediaValidationError,
  getManagedMediaValidationTargets,
  type ShortPublishValidationInput,
} from "./shorts/publish-validation";
import { parseJournalInput, parseHighlightInput } from "./user-content/validation";

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

  app.get("/api/books/because-you-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const allUserProgress = await storage.getAllUserProgress(userId);

      const completedOrAdvanced = allUserProgress.filter(p => {
        if (!p.currentCardIndex || !p.totalCards) return false;
        return p.currentCardIndex >= p.totalCards * 0.5;
      });

      if (completedOrAdvanced.length === 0) {
        return res.json([]);
      }

      const allBooks = await storage.getBooks();
      const publishedBooks = allBooks.filter(b => b.status === "published" || b.status === "published_with_changes" || !b.status);
      const bookMap = new Map(publishedBooks.map(b => [b.id, b]));

      const startedBookIds = new Set(
        allUserProgress
          .filter(p => p.currentCardIndex && p.currentCardIndex > 0)
          .map(p => p.bookId)
      );

      const allOtherProgress = await db.select({
        userId: userProgress.userId,
        bookId: userProgress.bookId,
        currentCardIndex: userProgress.currentCardIndex,
        totalCards: userProgress.totalCards,
      }).from(userProgress)
        .where(dsql`${userProgress.userId} != ${userId} AND ${userProgress.currentCardIndex} > 0`);

      const userBooksMap = new Map<string, Set<string>>();
      for (const p of allOtherProgress) {
        if (!userBooksMap.has(p.userId)) {
          userBooksMap.set(p.userId, new Set());
        }
        userBooksMap.get(p.userId)!.add(p.bookId);
      }

      const myBookIds = new Set(completedOrAdvanced.map(p => p.bookId));

      const collaborativeScores = new Map<string, number>();
      const myBookIdArr = Array.from(myBookIds);
      userBooksMap.forEach((otherBooks, otherUserId) => {
        let overlap = 0;
        myBookIdArr.forEach(bookId => {
          if (otherBooks.has(bookId)) overlap++;
        });
        if (overlap === 0) return;

        const similarity = overlap / Math.sqrt(myBookIds.size * otherBooks.size);

        otherBooks.forEach(bookId => {
          if (!startedBookIds.has(bookId) && !myBookIds.has(bookId) && bookMap.has(bookId)) {
            collaborativeScores.set(bookId, (collaborativeScores.get(bookId) || 0) + similarity);
          }
        });
      });

      const completedCategories = new Set<string>();
      for (const p of completedOrAdvanced) {
        const book = bookMap.get(p.bookId);
        if (book?.categoryId) {
          completedCategories.add(book.categoryId);
        }
      }

      const contentBasedCandidates = publishedBooks.filter(b =>
        b.categoryId &&
        completedCategories.has(b.categoryId) &&
        !startedBookIds.has(b.id) &&
        !myBookIds.has(b.id)
      );

      for (const book of contentBasedCandidates) {
        if (!collaborativeScores.has(book.id)) {
          collaborativeScores.set(book.id, 0.1);
        } else {
          collaborativeScores.set(book.id, collaborativeScores.get(book.id)! + 0.2);
        }
      }

      const sortedByScore = Array.from(collaborativeScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const sourceBook = completedOrAdvanced.sort((a, b) => {
        const aDate = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const bDate = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return bDate - aDate;
      })[0];
      const sourceBookData = sourceBook ? bookMap.get(sourceBook.bookId) : null;

      const recommendations = sortedByScore
        .map(([bookId]) => bookMap.get(bookId))
        .filter(Boolean);

      res.json({
        sourceBook: sourceBookData ? { id: sourceBookData.id, title: sourceBookData.title } : null,
        books: recommendations,
      });
    } catch (error) {
      console.error("Error fetching because-you-read:", error);
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


  app.get("/api/books/:id/cards/:section", async (req, res) => {
    try {
      const { id, section } = req.params;
      let cards: any[] = [];

      const book = await storage.getBook(id);
      if (!book) return res.status(404).json({ message: "Book not found" });

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
        default:
          break;
      }

      res.json(cards);
    } catch (error) {
      console.error("Error fetching section cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });


  app.get("/api/books/:id/content-counts", async (req, res) => {
    try {
      const id = req.params.id;
      const [chapters, models] = await Promise.all([
        storage.getChapterSummariesByBook(id),
        storage.getMentalModelsByBook(id),
      ]);
      res.json({
        chapterSummaries: chapters.length,
        mentalModels: models.length,
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
      const parsed = parseJournalInput(req.body);
      if (!parsed) {
        return res.status(400).json({ message: "content is required" });
      }
      const { content } = parsed;
      const encryptedContent = encrypt(content);
      const entry = await storage.createJournalEntry({ userId, content: encryptedContent });
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

  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streak = await storage.getUserStreak(userId);
      res.json(streak ?? { currentStreak: 0, longestStreak: 0, totalMinutesListened: 0, totalBooksStarted: 0 });
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

  app.post("/api/streak/freeze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.freezeStreak(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error freezing streak:", error);
      if (error.message === "No streak record found" || error.message === "Streak freeze not available") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to freeze streak" });
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
      const highlights = await db
        .select({
          id: savedHighlights.id,
          userId: savedHighlights.userId,
          bookId: savedHighlights.bookId,
          bookTitle: books.title,
          bookAuthor: books.author,
          bookCoverImage: books.coverImage,
          chapterId: savedHighlights.chapterId,
          chapterNumber: chapterSummaries.chapterNumber,
          chapterTitle: chapterSummaries.chapterTitle,
          content: savedHighlights.content,
          type: savedHighlights.type,
          createdAt: savedHighlights.createdAt,
        })
        .from(savedHighlights)
        .innerJoin(books, eq(savedHighlights.bookId, books.id))
        .leftJoin(chapterSummaries, eq(savedHighlights.chapterId, chapterSummaries.id))
        .where(eq(savedHighlights.userId, userId))
        .orderBy(desc(savedHighlights.createdAt));
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  app.post("/api/highlights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = parseHighlightInput(req.body);
      if (!parsed) return res.status(400).json({ message: "Invalid highlight data" });

      const book = await storage.getBook(parsed.bookId);
      if (!book) {
        return res.status(400).json({ message: "Book not found for highlight" });
      }

      if (parsed.chapterId) {
        const [chapter] = await db
          .select({ id: chapterSummaries.id })
          .from(chapterSummaries)
          .where(
            and(
              eq(chapterSummaries.id, parsed.chapterId),
              eq(chapterSummaries.bookId, parsed.bookId),
            ),
          )
          .limit(1);
        if (!chapter) {
          return res.status(400).json({ message: "Chapter not found for highlight book" });
        }
      }

      const result = await storage.createSavedHighlight({ userId, ...parsed });
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
          "audio_played", "journal_entry_created",
          "book_completed", "session_start", "session_end", "affiliate_click"
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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyActivityRaw = await db
        .select({
          date: dsql<string>`DATE(${userActivityLog.createdAt})`,
          count: count(),
        })
        .from(userActivityLog)
        .where(and(
          eq(userActivityLog.userId, userId),
          gte(userActivityLog.createdAt, thirtyDaysAgo)
        ))
        .groupBy(dsql`DATE(${userActivityLog.createdAt})`)
        .orderBy(dsql`DATE(${userActivityLog.createdAt})`);

      const monthDays = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const found = monthlyActivityRaw.find(w => w.date === dateStr);
        monthDays.push({ date: dateStr, activities: found ? Number(found.count) : 0 });
      }

      res.json({
        booksStarted,
        booksCompleted,
        categoriesExplored,
        totalTimeInvested,
        avgTimePerBook,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        totalMinutesListened: totalListenTime,
        journalEntries: journalCount?.count ? Number(journalCount.count) : 0,
        weeklyActivity: weekDays,
        monthlyActivity: monthDays,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/share/generate-card", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        type: z.enum(["progress", "book-completion", "streak-milestone"]),
        bookId: z.string().optional(),
        milestone: z.number().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid share data" });

      const allProgress = await storage.getAllUserProgress(userId);
      const streak = await storage.getUserStreak(userId);
      const allBooks = await storage.getBooks();
      const publishedBooks = allBooks.filter(b => b.status === "published" || b.status === "published_with_changes" || !b.status);

      const booksStarted = allProgress.filter(p => (p.currentCardIndex ?? 0) > 0).length;
      const booksCompleted = allProgress.filter(p => {
        const total = p.totalCards ?? 1;
        return total > 0 && (p.currentCardIndex ?? 0) >= total;
      }).length;
      const startedBookIds = new Set(allProgress.filter(p => (p.currentCardIndex ?? 0) > 0).map(p => p.bookId));
      const totalReadTime = publishedBooks
        .filter(b => startedBookIds.has(b.id))
        .reduce((sum, b) => sum + (b.readTime ?? 0), 0);
      const totalTimeInvested = totalReadTime + (streak?.totalMinutesListened ?? 0);

      const result: any = {
        type: parsed.data.type,
        stats: {
          booksStarted,
          booksCompleted,
          totalTimeInvested,
          currentStreak: streak?.currentStreak ?? 0,
          longestStreak: streak?.longestStreak ?? 0,
        },
      };

      if (parsed.data.type === "book-completion" && parsed.data.bookId) {
        const book = await storage.getBook(parsed.data.bookId);
        if (book) {
          result.book = { title: book.title, author: book.author };
        }
      }

      if (parsed.data.type === "streak-milestone" && parsed.data.milestone) {
        result.milestone = parsed.data.milestone;
      }

      res.json(result);
    } catch (error) {
      console.error("Error generating share card:", error);
      res.status(500).json({ message: "Failed to generate share card" });
    }
  });


  // ===== QUIZ ROUTES =====

  app.get("/api/books/:bookId/quiz", isAuthenticated, async (req: any, res) => {
    try {
      const { bookId } = req.params;

      const chapters = await db.select().from(chapterSummaries)
        .where(eq(chapterSummaries.bookId, bookId))
        .orderBy(asc(chapterSummaries.chapterNumber));

      const getChapterSummary = (ch: any): string | null => {
        const cardsArr = Array.isArray(ch.cards) ? ch.cards : [];
        if (cardsArr.length === 0) return null;
        const firstCard = cardsArr[0];
        return firstCard?.body || firstCard?.content || firstCard?.text || (typeof firstCard === "string" ? firstCard : null);
      };

      const questions = chapters.flatMap(ch => {
        const chapterQuestions: any[] = [];
        const summary = getChapterSummary(ch);

        if (summary && ch.chapterTitle) {
          const distractors = chapters
            .filter(c => c.id !== ch.id && getChapterSummary(c))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(c => (getChapterSummary(c) || "").substring(0, 80) + "...");

          while (distractors.length < 3) {
            distractors.push("This concept is not discussed in the book.");
          }

          chapterQuestions.push({
            id: `ch-${ch.id}`,
            chapterId: ch.id,
            question: `What is the main idea of "${ch.chapterTitle}"?`,
            options: shuffleArray([
              { text: summary.substring(0, 80) + "...", correct: true },
              ...distractors.map(d => ({ text: d, correct: false })),
            ]),
            explanation: summary.substring(0, 150),
          });
        }

        return chapterQuestions;
      });

      res.json({
        bookId,
        questions: questions.sort(() => Math.random() - 0.5).slice(0, 10),
        totalAvailable: questions.length,
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.post("/api/books/:bookId/quiz/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId } = req.params;
      const schema = z.object({
        chapterId: z.string(),
        score: z.number().min(0),
        totalQuestions: z.number().min(1),
        answers: z.array(z.any()),
      });
      const data = schema.parse(req.body);

      const [result] = await db.insert(quizResults).values({
        userId,
        bookId,
        chapterId: data.chapterId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        answers: data.answers,
      }).returning();

      res.json({ result, percentage: Math.round((data.score / data.totalQuestions) * 100) });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get("/api/books/:bookId/quiz/results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId } = req.params;

      const results = await db.select().from(quizResults)
        .where(and(eq(quizResults.userId, userId), eq(quizResults.bookId, bookId)))
        .orderBy(desc(quizResults.completedAt));

      const bestScore = results.length > 0
        ? Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100)))
        : 0;

      res.json({ results, bestScore, attempts: results.length });
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ message: "Failed to fetch quiz results" });
    }
  });

  app.get("/api/shorts", async (req, res) => {
    try {
      const sort = req.query.sort as string | undefined;

      if (sort === "trending") {
        const trendingShorts = await db
          .select({
            short: shorts,
            viewCount: dsql<number>`COALESCE(count(${shortViews.id}), 0)::int`,
          })
          .from(shorts)
          .leftJoin(shortViews, eq(shorts.id, shortViews.shortId))
          .where(eq(shorts.status, "published"))
          .groupBy(shorts.id)
          .orderBy(dsql`COALESCE(count(${shortViews.id}), 0) DESC`);

        const allBooks = await storage.getBooks();
        const bookMap = new Map(allBooks.map(b => [b.id, b.title]));
        const enriched = trendingShorts.map(row => ({
          ...row.short,
          bookTitle: bookMap.get(row.short.bookId) ?? "",
          viewCount: row.viewCount,
        }));
        return res.json(enriched);
      }

      const published = await storage.getPublishedShorts();
      const allBooks = await storage.getBooks();
      const bookMap = new Map(allBooks.map(b => [b.id, b.title]));
      const enriched = published.map(s => ({
        ...s,
        bookTitle: bookMap.get(s.bookId) ?? "",
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching shorts:", error);
      res.status(500).json({ message: "Failed to fetch shorts" });
    }
  });

  app.get("/api/shorts/:id", async (req, res) => {
    try {
      const short = await storage.getShort(req.params.id);
      if (!short || short.status !== "published") {
        return res.status(404).json({ message: "Short not found" });
      }
      res.json(short);
    } catch (error) {
      console.error("Error fetching short:", error);
      res.status(500).json({ message: "Failed to fetch short" });
    }
  });

  app.get("/api/books/:bookId/shorts", async (req, res) => {
    try {
      const allShorts = await storage.getShortsByBook(req.params.bookId);
      const published = allShorts.filter(s => s.status === "published");
      res.json(published);
    } catch (error) {
      console.error("Error fetching book shorts:", error);
      res.status(500).json({ message: "Failed to fetch shorts" });
    }
  });

  app.post("/api/shorts/:id/view", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || null;
      await storage.recordShortView({ shortId: req.params.id, userId });
      res.status(204).end();
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  const requireAdminRole = async (req: any, res: any, next: any) => {
    const { authStorage } = await import("./replit_integrations/auth/storage");
    const { hasMinRole } = await import("@shared/models/auth");
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const dbUser = await authStorage.getUser(userId);
    if (!dbUser || !hasMinRole(dbUser.role, "writer")) {
      return res.status(403).json({ message: "Admin access required" });
    }
    (req as any).dbUser = dbUser;
    next();
  };

  const shortPayloadSchema = insertShortSchema.extend({
    mediaType: z.enum(["text", "image", "audio", "video"]),
    status: z.enum(["draft", "published"]).optional(),
  });

  const getMissingManagedMediaValidationError = async (
    data: ShortPublishValidationInput,
  ): Promise<string | null> => {
    const targets = getManagedMediaValidationTargets(data);

    if (targets.mediaUrl) {
      const mediaExists = await ensureManagedMediaExists(targets.mediaUrl);
      if (!mediaExists) {
        return "Published short media file is missing from object storage. Re-upload the media.";
      }
    }

    if (targets.thumbnailUrl) {
      const thumbnailExists = await ensureManagedMediaExists(targets.thumbnailUrl);
      if (!thumbnailExists) {
        return "Published short thumbnail is missing from object storage. Re-upload the thumbnail.";
      }
    }

    return null;
  };

  app.get("/api/admin/shorts", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const allShorts = await db.select().from(shorts).orderBy(desc(shorts.createdAt));
      res.json(allShorts);
    } catch (error) {
      console.error("Error fetching admin shorts:", error);
      res.status(500).json({ message: "Failed to fetch shorts" });
    }
  });

  app.post("/api/admin/shorts", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const normalized = normalizeShortPayload(req.body ?? {});
      const parsed = shortPayloadSchema.safeParse(normalized);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid short payload",
          errors: parsed.error.issues.map((i) => i.message),
        });
      }

      const mediaValidationError = getPublishedMediaValidationError(parsed.data);
      if (mediaValidationError) {
        return res.status(400).json({ message: mediaValidationError });
      }

      const missingMediaError = await getMissingManagedMediaValidationError(parsed.data);
      if (missingMediaError) {
        return res.status(400).json({ message: missingMediaError });
      }

      const result = await storage.createShort(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating short:", error);
      res.status(500).json({ message: "Failed to create short" });
    }
  });

  app.put("/api/admin/shorts/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      const existing = await storage.getShort(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Short not found" });
      }

      const normalized = normalizeShortPayload(req.body ?? {});
      const parsed = shortPayloadSchema.partial().safeParse(normalized);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid short payload",
          errors: parsed.error.issues.map((i) => i.message),
        });
      }

      const merged = { ...existing, ...parsed.data };
      const mediaValidationError = getPublishedMediaValidationError(merged);
      if (mediaValidationError) {
        return res.status(400).json({ message: mediaValidationError });
      }

      const missingMediaError = await getMissingManagedMediaValidationError(merged);
      if (missingMediaError) {
        return res.status(400).json({ message: missingMediaError });
      }

      const result = await storage.updateShort(req.params.id, parsed.data);
      res.json(result);
    } catch (error) {
      console.error("Error updating short:", error);
      res.status(500).json({ message: "Failed to update short" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const q = (req.query.q as string || "").trim();
      const type = (req.query.type as string) || "all";

      if (!q || q.length < 2) {
        return res.json({ books: [] });
      }

      const pattern = `%${q}%`;
      const bookResults: any[] = [];

      if (type === "books" || type === "all") {
        const matchedBooks = await db
          .select({
            id: books.id,
            title: books.title,
            author: books.author,
            description: books.description,
            coverImage: books.coverImage,
            categoryId: books.categoryId,
            readTime: books.readTime,
          })
          .from(books)
          .where(
            and(
              dsql`(${books.status} = 'published' OR ${books.status} = 'published_with_changes' OR ${books.status} IS NULL)`,
              dsql`(${books.title} ILIKE ${pattern} OR ${books.author} ILIKE ${pattern} OR ${books.description} ILIKE ${pattern})`
            )
          )
          .limit(20);

        for (const book of matchedBooks) {
          const highlightField = (text: string) => {
            if (!text) return text;
            const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
          };
          bookResults.push({
            ...book,
            highlightedTitle: highlightField(book.title),
            highlightedAuthor: highlightField(book.author),
            highlightedDescription: highlightField(book.description),
          });
        }
      }

      res.json({ books: bookResults });
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.delete("/api/admin/shorts/:id", isAuthenticated, requireAdminRole, async (req: any, res) => {
    try {
      await storage.deleteShort(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting short:", error);
      res.status(500).json({ message: "Failed to delete short" });
    }
  });

  return httpServer;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
