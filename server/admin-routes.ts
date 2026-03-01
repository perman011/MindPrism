import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { isAuthenticated } from "./replit_integrations/auth";
import {
  insertBookSchema,
  insertPrincipleSchema,
  insertStorySchema,
  insertExerciseSchema,
  insertChapterSummarySchema,
  insertMentalModelSchema,
  insertCommonMistakeSchema,
  insertInfographicSchema,
  insertActionItemSchema,
  insertCommentSchema,
  bookVersions,
  books,
  userProgress,
  analyticsEvents,
} from "@shared/schema";
import { hasMinRole } from "@shared/models/auth";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, sql, count, isNotNull } from "drizzle-orm";
import { z } from "zod";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await authStorage.getUser(user.claims.sub);
  if (!dbUser || !hasMinRole(dbUser.role, "writer")) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  (req as any).dbUser = dbUser;
  next();
};

const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await authStorage.getUser(user.claims.sub);
  if (!dbUser || !hasMinRole(dbUser.role, "super_admin")) {
    return res.status(403).json({ message: "Forbidden: super_admin required" });
  }
  (req as any).dbUser = dbUser;
  next();
};

const requireRole = (minRole: "writer" | "editor" | "admin" | "super_admin") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = (req as any).dbUser;
    if (!dbUser || !hasMinRole(dbUser.role, minRole)) {
      return res.status(403).json({ message: `Forbidden: ${minRole} role or above required` });
    }
    next();
  };
};

export function registerAdminRoutes(app: Express) {
  app.get("/api/admin/books", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allBooks = await storage.getBooks();
      res.json(allBooks);
    } catch (error) {
      console.error("Error fetching admin books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/admin/books/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      console.error("Error fetching admin book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/admin/books", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertBookSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const book = await storage.createBook(parsed.data);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/admin/books/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const body = { ...req.body };
      if (body.primaryChakra === "") body.primaryChakra = null;
      if (body.secondaryChakra === "") body.secondaryChakra = null;
      if (body.categoryId === "") body.categoryId = null;
      const partial = insertBookSchema.partial().safeParse(body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const book = await storage.updateBook(req.params.id, partial.data);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/admin/books/:id", isAuthenticated, isAdmin, requireRole("admin"), async (req: any, res) => {
    try {
      await storage.deleteBookCascade(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  app.post("/api/admin/books/:id/publish", isAuthenticated, isAdmin, requireRole("editor"), async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      const [chapters, models] = await Promise.all([
        storage.getChapterSummariesByBook(bookId),
        storage.getMentalModelsByBook(bookId),
      ]);

      const validationErrors: string[] = [];
      if (!book.coreThesis || book.coreThesis.length < 50) {
        validationErrors.push("Core thesis must be at least 50 characters");
      }
      if (chapters.length < 3) {
        validationErrors.push("At least 3 chapter summaries required");
      }
      if (models.length < 1) {
        validationErrors.push("At least 1 mental model required");
      }
      if (!book.description || book.description.trim().length === 0) {
        validationErrors.push("Book description must not be empty");
      }
      if (!book.coverImage || book.coverImage.trim().length === 0) {
        validationErrors.push("Cover image must exist");
      }
      if (!book.categoryId || book.categoryId.trim().length === 0) {
        validationErrors.push("Category must be assigned");
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({ message: "Publishing validation failed", validationErrors });
      }

      const updatedBook = await storage.updateBook(bookId, { status: "published" });
      res.json(updatedBook);
    } catch (error) {
      console.error("Error publishing book:", error);
      res.status(500).json({ message: "Failed to publish book" });
    }
  });

  app.post("/api/admin/books/:id/unpublish", isAuthenticated, isAdmin, requireRole("editor"), async (req: any, res) => {
    try {
      const book = await storage.updateBook(req.params.id, { status: "draft" });
      res.json(book);
    } catch (error) {
      console.error("Error unpublishing book:", error);
      res.status(500).json({ message: "Failed to unpublish book" });
    }
  });

  app.get("/api/admin/books/:id/draft", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const [draft] = await db.select().from(bookVersions)
        .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionType, "draft")))
        .orderBy(desc(bookVersions.createdAt))
        .limit(1);
      res.json(draft ?? null);
    } catch (error) {
      console.error("Error fetching draft:", error);
      res.status(500).json({ message: "Failed to fetch draft" });
    }
  });

  app.put("/api/admin/books/:id/draft", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const userId = req.user.claims.sub;
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      const draftContent = req.body;

      const [existingDraft] = await db.select().from(bookVersions)
        .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionType, "draft")))
        .orderBy(desc(bookVersions.createdAt))
        .limit(1);

      let draft;
      if (existingDraft) {
        const mergedContent = { ...(existingDraft.content as object), ...draftContent };
        [draft] = await db.update(bookVersions)
          .set({ content: mergedContent, createdBy: userId })
          .where(eq(bookVersions.id, existingDraft.id))
          .returning();
      } else {
        const publishedSnapshot: Record<string, any> = {};
        const snapshotFields = ["title", "author", "coverImage", "description", "coreThesis",
          "categoryId", "readTime", "listenTime", "audioUrl", "audioDuration", "featured",
          "primaryChakra", "secondaryChakra", "premiumOnly", "freePreviewCards"] as const;
        for (const f of snapshotFields) {
          publishedSnapshot[f] = book[f];
        }
        const mergedContent = { ...publishedSnapshot, ...draftContent };
        [draft] = await db.insert(bookVersions)
          .values({ bookId, versionType: "draft", content: mergedContent, createdBy: userId })
          .returning();
      }

      await db.update(books)
        .set({
          currentDraftVersionId: draft.id,
          status: book.status === "published" || book.status === "published_with_changes"
            ? "published_with_changes" : book.status,
          updatedAt: new Date(),
        })
        .where(eq(books.id, bookId));

      if (book.status !== "draft") {
        res.json(draft);
      } else {
        await storage.updateBook(bookId, draftContent);
        res.json(draft);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      res.status(500).json({ message: "Failed to save draft" });
    }
  });

  app.post("/api/admin/books/:id/publish-draft", isAuthenticated, isAdmin, requireRole("editor"), async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const userId = req.user.claims.sub;
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      const [draft] = await db.select().from(bookVersions)
        .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionType, "draft")))
        .orderBy(desc(bookVersions.createdAt))
        .limit(1);

      if (!draft) return res.status(400).json({ message: "No draft to publish" });

      const draftContent = draft.content as Record<string, any>;

      const updateData: Record<string, any> = {};
      const allowedFields = ["title", "author", "coverImage", "description", "coreThesis",
        "categoryId", "readTime", "listenTime", "audioUrl", "audioDuration", "featured",
        "primaryChakra", "secondaryChakra", "premiumOnly", "freePreviewCards"];
      for (const field of allowedFields) {
        if (field in draftContent) {
          updateData[field] = draftContent[field];
        }
      }

      const mergedBook = { ...book, ...updateData };
      const [chapters, models] = await Promise.all([
        storage.getChapterSummariesByBook(bookId),
        storage.getMentalModelsByBook(bookId),
      ]);

      const validationErrors: string[] = [];
      if (!mergedBook.coreThesis || mergedBook.coreThesis.length < 50) {
        validationErrors.push("Core thesis must be at least 50 characters");
      }
      if (chapters.length < 3) {
        validationErrors.push("At least 3 chapter summaries required");
      }
      if (models.length < 1) {
        validationErrors.push("At least 1 mental model required");
      }
      if (!mergedBook.description || mergedBook.description.trim().length === 0) {
        validationErrors.push("Book description must not be empty");
      }
      if (!mergedBook.coverImage || mergedBook.coverImage.trim().length === 0) {
        validationErrors.push("Cover image must exist");
      }
      if (!mergedBook.categoryId || mergedBook.categoryId.trim().length === 0) {
        validationErrors.push("Category must be assigned");
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({ message: "Publishing validation failed", validationErrors });
      }

      await storage.updateBook(bookId, { ...updateData, status: "published" });

      await db.update(bookVersions)
        .set({ versionType: "published", publishedAt: new Date(), createdBy: userId })
        .where(eq(bookVersions.id, draft.id));

      await db.update(books)
        .set({
          currentPublishedVersionId: draft.id,
          currentDraftVersionId: null,
        })
        .where(eq(books.id, bookId));

      const updatedBook = await storage.getBook(bookId);
      res.json(updatedBook);
    } catch (error) {
      console.error("Error publishing draft:", error);
      res.status(500).json({ message: "Failed to publish draft" });
    }
  });

  app.post("/api/admin/books/:id/discard-draft", isAuthenticated, isAdmin, requireRole("editor"), async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      await db.delete(bookVersions)
        .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionType, "draft")));

      const revertStatus = book.status === "published_with_changes" ? "published" : book.status;
      await db.update(books)
        .set({ currentDraftVersionId: null, status: revertStatus, updatedAt: new Date() })
        .where(eq(books.id, bookId));

      const updatedBook = await storage.getBook(bookId);
      res.json(updatedBook);
    } catch (error) {
      console.error("Error discarding draft:", error);
      res.status(500).json({ message: "Failed to discard draft" });
    }
  });

  app.get("/api/admin/books/:id/diff", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const bookId = req.params.id;
      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Book not found" });

      const [draft] = await db.select().from(bookVersions)
        .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionType, "draft")))
        .orderBy(desc(bookVersions.createdAt))
        .limit(1);

      if (!draft) return res.json({ hasDraft: false, changes: [] });

      const draftContent = draft.content as Record<string, any>;
      const changes: Array<{ field: string; published: any; draft: any }> = [];

      const compareFields = ["title", "author", "coverImage", "description", "coreThesis",
        "categoryId", "readTime", "listenTime", "audioUrl", "audioDuration", "featured",
        "primaryChakra", "secondaryChakra", "premiumOnly", "freePreviewCards"];

      for (const field of compareFields) {
        const pubVal = book[field as keyof typeof book];
        const draftVal = draftContent[field];
        if (draftVal !== undefined && JSON.stringify(pubVal) !== JSON.stringify(draftVal)) {
          changes.push({ field, published: pubVal, draft: draftVal });
        }
      }

      res.json({ hasDraft: true, draftId: draft.id, changes });
    } catch (error) {
      console.error("Error fetching diff:", error);
      res.status(500).json({ message: "Failed to fetch diff" });
    }
  });

  app.get("/api/admin/books/:id/versions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const versions = await db.select().from(bookVersions)
        .where(eq(bookVersions.bookId, req.params.id))
        .orderBy(desc(bookVersions.createdAt));
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch versions" });
    }
  });

  app.post("/api/admin/books/:bookId/chapters", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertChapterSummarySchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const chapter = await storage.createChapterSummary(parsed.data);
      res.status(201).json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  app.put("/api/admin/chapters/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertChapterSummarySchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const chapter = await storage.updateChapterSummary(req.params.id, partial.data);
      res.json(chapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  app.delete("/api/admin/chapters/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteChapterSummary(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  app.post("/api/admin/books/:bookId/mental-models", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertMentalModelSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const model = await storage.createMentalModel(parsed.data);
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating mental model:", error);
      res.status(500).json({ message: "Failed to create mental model" });
    }
  });

  app.put("/api/admin/mental-models/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertMentalModelSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const model = await storage.updateMentalModel(req.params.id, partial.data);
      res.json(model);
    } catch (error) {
      console.error("Error updating mental model:", error);
      res.status(500).json({ message: "Failed to update mental model" });
    }
  });

  app.delete("/api/admin/mental-models/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteMentalModel(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting mental model:", error);
      res.status(500).json({ message: "Failed to delete mental model" });
    }
  });

  app.post("/api/admin/books/:bookId/principles", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertPrincipleSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const principle = await storage.createPrinciple(parsed.data);
      res.status(201).json(principle);
    } catch (error) {
      console.error("Error creating principle:", error);
      res.status(500).json({ message: "Failed to create principle" });
    }
  });

  app.put("/api/admin/principles/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertPrincipleSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const principle = await storage.updatePrinciple(req.params.id, partial.data);
      res.json(principle);
    } catch (error) {
      console.error("Error updating principle:", error);
      res.status(500).json({ message: "Failed to update principle" });
    }
  });

  app.delete("/api/admin/principles/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deletePrinciple(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting principle:", error);
      res.status(500).json({ message: "Failed to delete principle" });
    }
  });

  app.post("/api/admin/books/:bookId/stories", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertStorySchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const story = await storage.createStory(parsed.data);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.put("/api/admin/stories/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertStorySchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const story = await storage.updateStory(req.params.id, partial.data);
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  app.delete("/api/admin/stories/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteStory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  app.post("/api/admin/books/:bookId/common-mistakes", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertCommonMistakeSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const mistake = await storage.createCommonMistake(parsed.data);
      res.status(201).json(mistake);
    } catch (error) {
      console.error("Error creating common mistake:", error);
      res.status(500).json({ message: "Failed to create common mistake" });
    }
  });

  app.put("/api/admin/common-mistakes/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertCommonMistakeSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const mistake = await storage.updateCommonMistake(req.params.id, partial.data);
      res.json(mistake);
    } catch (error) {
      console.error("Error updating common mistake:", error);
      res.status(500).json({ message: "Failed to update common mistake" });
    }
  });

  app.delete("/api/admin/common-mistakes/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteCommonMistake(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting common mistake:", error);
      res.status(500).json({ message: "Failed to delete common mistake" });
    }
  });

  app.post("/api/admin/books/:bookId/infographics", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertInfographicSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const infographic = await storage.createInfographic(parsed.data);
      res.status(201).json(infographic);
    } catch (error) {
      console.error("Error creating infographic:", error);
      res.status(500).json({ message: "Failed to create infographic" });
    }
  });

  app.put("/api/admin/infographics/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertInfographicSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const infographic = await storage.updateInfographic(req.params.id, partial.data);
      res.json(infographic);
    } catch (error) {
      console.error("Error updating infographic:", error);
      res.status(500).json({ message: "Failed to update infographic" });
    }
  });

  app.delete("/api/admin/infographics/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteInfographic(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting infographic:", error);
      res.status(500).json({ message: "Failed to delete infographic" });
    }
  });

  app.post("/api/admin/books/:bookId/exercises", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertExerciseSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const exercise = await storage.createExercise(parsed.data);
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.put("/api/admin/exercises/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertExerciseSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const exercise = await storage.updateExercise(req.params.id, partial.data);
      res.json(exercise);
    } catch (error) {
      console.error("Error updating exercise:", error);
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  app.delete("/api/admin/exercises/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteExercise(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  app.post("/api/admin/books/:bookId/action-items", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const data = { ...req.body, bookId: req.params.bookId };
      const parsed = insertActionItemSchema.safeParse(data);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const item = await storage.createActionItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating action item:", error);
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  app.put("/api/admin/action-items/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const partial = insertActionItemSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const item = await storage.updateActionItem(req.params.id, partial.data);
      res.json(item);
    } catch (error) {
      console.error("Error updating action item:", error);
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  app.delete("/api/admin/action-items/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteActionItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting action item:", error);
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });

  app.post("/api/admin/books/bulk-status", isAuthenticated, isAdmin, requireRole("editor"), async (req: any, res) => {
    try {
      const schema = z.object({
        bookIds: z.array(z.string()).min(1),
        status: z.enum(["published", "draft"]),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });

      const results = await Promise.all(
        parsed.data.bookIds.map(async (bookId) => {
          try {
            if (parsed.data.status === "published") {
              const book = await storage.getBook(bookId);
              if (!book) return { bookId, success: false, error: "Book not found" };
              const chapters = await storage.getChapterSummariesByBook(bookId);
              const models = await storage.getMentalModelsByBook(bookId);
              const errors: string[] = [];
              if (!book.coreThesis || book.coreThesis.length < 50) errors.push("Core thesis must be at least 50 characters");
              if (chapters.length < 3) errors.push("At least 3 chapter summaries required");
              if (models.length < 1) errors.push("At least 1 mental model required");
              if (!book.description) errors.push("Book description is required");
              if (!book.coverImage) errors.push("Cover image is required");
              if (!book.categoryId) errors.push("Category must be assigned");
              if (errors.length > 0) {
                return { bookId, success: false, title: book.title, error: errors.join("; ") };
              }
            }
            const book = await storage.updateBook(bookId, { status: parsed.data.status });
            return { bookId, success: true, book };
          } catch (err) {
            return { bookId, success: false, error: "Failed to update" };
          }
        })
      );

      res.json({ results, updated: results.filter(r => r.success).length, total: results.length });
    } catch (error) {
      console.error("Error bulk updating book status:", error);
      res.status(500).json({ message: "Failed to bulk update book status" });
    }
  });

  app.put("/api/admin/reorder", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const schema = z.object({
        type: z.string(),
        items: z.array(z.object({ id: z.string(), orderIndex: z.number() })),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      await storage.updateOrderIndexes(parsed.data.type, parsed.data.items);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering:", error);
      res.status(500).json({ message: "Failed to reorder" });
    }
  });

  app.get("/api/admin/books/:bookId/comments", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const comments = await storage.getCommentsByBook(req.params.bookId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/admin/comments", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertCommentSchema.omit({ userId: true, createdAt: true }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const comment = await storage.createComment({ ...parsed.data, userId });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.patch("/api/admin/comments/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const schema = z.object({ resolved: z.boolean().optional(), content: z.string().optional() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const comment = await storage.updateComment(req.params.id, parsed.data);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.get("/api/admin/content-health", isAuthenticated, isAdmin, async (_req: any, res) => {
    try {
      const allBooks = await storage.getBooks();
      const scores = await Promise.all(
        allBooks.map(async (book) => {
          const [principles, stories, exercises, chapters, mentalModels, commonMistakes, infographics, actionItems] = await Promise.all([
            storage.getPrinciplesByBook(book.id),
            storage.getStoriesByBook(book.id),
            storage.getExercisesByBook(book.id),
            storage.getChapterSummariesByBook(book.id),
            storage.getMentalModelsByBook(book.id),
            storage.getCommonMistakesByBook(book.id),
            storage.getInfographicsByBook(book.id),
            storage.getActionItemsByBook(book.id),
          ]);

          const sections = {
            basicInfo: {
              label: "Basic Info",
              score: 0,
              maxScore: 5,
              details: [] as string[],
            },
            principles: {
              label: "Principles",
              score: Math.min(principles.length, 3),
              maxScore: 3,
              details: principles.length === 0 ? ["No principles added"] : [],
            },
            stories: {
              label: "Stories",
              score: Math.min(stories.length, 2),
              maxScore: 2,
              details: stories.length === 0 ? ["No stories added"] : [],
            },
            exercises: {
              label: "Exercises",
              score: Math.min(exercises.length, 2),
              maxScore: 2,
              details: exercises.length === 0 ? ["No exercises added"] : [],
            },
            chapters: {
              label: "Chapters",
              score: Math.min(chapters.length, 2),
              maxScore: 2,
              details: chapters.length === 0 ? ["No chapter summaries"] : [],
            },
            mentalModels: {
              label: "Mental Models",
              score: Math.min(mentalModels.length, 1),
              maxScore: 1,
              details: mentalModels.length === 0 ? ["No mental models"] : [],
            },
            commonMistakes: {
              label: "Common Mistakes",
              score: Math.min(commonMistakes.length, 1),
              maxScore: 1,
              details: commonMistakes.length === 0 ? ["No common mistakes"] : [],
            },
            infographics: {
              label: "Infographics",
              score: Math.min(infographics.length, 1),
              maxScore: 1,
              details: infographics.length === 0 ? ["No infographics"] : [],
            },
            actionItems: {
              label: "Action Items",
              score: Math.min(actionItems.length, 2),
              maxScore: 2,
              details: actionItems.length === 0 ? ["No action items"] : [],
            },
          };

          let basicScore = 0;
          const basicDetails: string[] = [];
          if (book.title && book.title !== "Untitled Book") basicScore++;
          else basicDetails.push("Missing title");
          if (book.author && book.author !== "Unknown Author") basicScore++;
          else basicDetails.push("Missing author");
          if (book.description && book.description.length > 20) basicScore++;
          else basicDetails.push("Missing or short description");
          if (book.coverImage) basicScore++;
          else basicDetails.push("Missing cover image");
          if (book.coreThesis) basicScore++;
          else basicDetails.push("Missing core thesis");
          sections.basicInfo.score = basicScore;
          sections.basicInfo.details = basicDetails;

          const totalScore = Object.values(sections).reduce((sum, s) => sum + s.score, 0);
          const maxScore = Object.values(sections).reduce((sum, s) => sum + s.maxScore, 0);
          const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

          return {
            bookId: book.id,
            bookTitle: book.title,
            bookStatus: book.status,
            percentage,
            totalScore,
            maxScore,
            sections,
            counts: {
              principles: principles.length,
              stories: stories.length,
              exercises: exercises.length,
              chapters: chapters.length,
              mentalModels: mentalModels.length,
              commonMistakes: commonMistakes.length,
              infographics: infographics.length,
              actionItems: actionItems.length,
            },
          };
        })
      );

      const totalBooks = scores.length;
      const avgScore = totalBooks > 0 ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / totalBooks) : 0;
      const completeBooks = scores.filter((s) => s.percentage >= 80).length;
      const needsWork = scores.filter((s) => s.percentage < 50).length;

      res.json({
        overview: {
          totalBooks,
          averageScore: avgScore,
          completeBooks,
          needsWork,
        },
        books: scores,
      });
    } catch (error) {
      console.error("Error calculating content health:", error);
      res.status(500).json({ message: "Failed to calculate content health" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isSuperAdmin, async (_req: any, res) => {
    try {
      const allUsers = await db.select().from(users);

      const progressRows = await db.select({
        userId: userProgress.userId,
        booksStarted: count(userProgress.bookId),
        avgProgress: sql<number>`COALESCE(AVG(
          CASE WHEN ${userProgress.totalCards} > 0
            THEN (${userProgress.currentCardIndex}::float / ${userProgress.totalCards}::float) * 100
            ELSE 0
          END
        ), 0)`,
      }).from(userProgress).groupBy(userProgress.userId);

      const lastLoginRows = await db.select({
        userId: analyticsEvents.userId,
        lastLogin: sql<string>`MAX(${analyticsEvents.createdAt})`,
      }).from(analyticsEvents).where(
        eq(analyticsEvents.eventType, "page_view")
      ).groupBy(analyticsEvents.userId);

      const progressMap = new Map(progressRows.map(r => [r.userId, { booksStarted: Number(r.booksStarted), avgProgress: Math.round(Number(r.avgProgress)) }]));
      const lastLoginMap = new Map(lastLoginRows.map(r => [r.userId, r.lastLogin]));

      const enrichedUsers = allUsers.map(u => ({
        ...u,
        booksStarted: progressMap.get(u.id)?.booksStarted ?? 0,
        avgProgress: progressMap.get(u.id)?.avgProgress ?? 0,
        lastLogin: lastLoginMap.get(u.id) ?? null,
      }));

      res.json(enrichedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const schema = z.object({ role: z.enum(["user", "writer", "editor", "admin", "super_admin"]) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid role", errors: parsed.error.errors });
      const [updated] = await db.update(users).set({ role: parsed.data.role, updatedAt: new Date() }).where(eq(users.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.patch("/api/admin/users/:id/premium", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const schema = z.object({ isPremium: z.boolean() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const [updated] = await db.update(users).set({ isPremium: parsed.data.isPremium, updatedAt: new Date() }).where(eq(users.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating premium status:", error);
      res.status(500).json({ message: "Failed to update premium status" });
    }
  });

  app.get("/api/admin/subscription-stats", isAuthenticated, isAdmin, async (_req: any, res) => {
    try {
      const allUsers = await db.select().from(users);
      const totalUsers = allUsers.length;
      const premiumUsers = allUsers.filter(u => u.isPremium);
      const totalSubscribers = premiumUsers.length;
      const conversionRate = totalUsers > 0 ? (totalSubscribers / totalUsers) * 100 : 0;

      const now = new Date();
      let monthlyCount = 0;
      let yearlyCount = 0;
      const recentSubscriptions: { date: string; count: number }[] = [];

      for (const u of premiumUsers) {
        if (u.currentPeriodEnd) {
          const periodEnd = new Date(u.currentPeriodEnd);
          const diffDays = (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 60) {
            yearlyCount++;
          } else {
            monthlyCount++;
          }
        } else {
          monthlyCount++;
        }
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dateMap.set(d.toISOString().slice(0, 10), 0);
      }
      for (const u of premiumUsers) {
        if (u.updatedAt && new Date(u.updatedAt) >= thirtyDaysAgo) {
          const dateKey = new Date(u.updatedAt).toISOString().slice(0, 10);
          if (dateMap.has(dateKey)) {
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
          }
        }
      }
      dateMap.forEach((cnt, date) => {
        recentSubscriptions.push({ date, count: cnt });
      });

      const withStripe = premiumUsers.filter(u => u.stripeSubscriptionId).length;
      const manualGrants = totalSubscribers - withStripe;

      res.json({
        totalSubscribers,
        totalUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        monthlyCount,
        yearlyCount,
        stripeSubscribers: withStripe,
        manualGrants,
        recentSubscriptions,
      });
    } catch (error) {
      console.error("Error fetching subscription stats:", error);
      res.status(500).json({ message: "Failed to fetch subscription stats" });
    }
  });
}
