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
} from "@shared/schema";
import { z } from "zod";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await authStorage.getUser(user.claims.sub);
  if (!dbUser || !["admin", "editor", "writer"].includes(dbUser.role ?? "")) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  (req as any).dbUser = dbUser;
  next();
};

export function registerAdminRoutes(app: Express) {
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
      const partial = insertBookSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "Invalid data", errors: partial.error.errors });
      const book = await storage.updateBook(req.params.id, partial.data);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/admin/books/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteBookCascade(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  app.post("/api/admin/books/:id/publish", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const book = await storage.updateBook(req.params.id, { status: "published" });
      res.json(book);
    } catch (error) {
      console.error("Error publishing book:", error);
      res.status(500).json({ message: "Failed to publish book" });
    }
  });

  app.post("/api/admin/books/:id/unpublish", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const book = await storage.updateBook(req.params.id, { status: "draft" });
      res.json(book);
    } catch (error) {
      console.error("Error unpublishing book:", error);
      res.status(500).json({ message: "Failed to unpublish book" });
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
}
