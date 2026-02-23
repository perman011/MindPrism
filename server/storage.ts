import {
  type Book, type InsertBook,
  type Principle, type InsertPrinciple,
  type Story, type InsertStory,
  type Exercise, type InsertExercise,
  type UserProgress, type InsertUserProgress,
  type JournalEntry, type InsertJournalEntry,
  type Category, type InsertCategory,
  books, principles, stories, exercises, userProgress, journalEntries, categories,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;

  getPrinciplesByBook(bookId: string): Promise<Principle[]>;
  createPrinciple(p: InsertPrinciple): Promise<Principle>;

  getStoriesByBook(bookId: string): Promise<Story[]>;
  createStory(s: InsertStory): Promise<Story>;

  getExercisesByBook(bookId: string): Promise<Exercise[]>;
  createExercise(e: InsertExercise): Promise<Exercise>;

  getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(data: InsertUserProgress): Promise<UserProgress>;
  toggleBookmark(userId: string, bookId: string): Promise<UserProgress>;
  togglePrincipleComplete(userId: string, bookId: string, principleId: string): Promise<UserProgress>;

  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(cat: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(cat).returning();
    return result;
  }

  async getBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [result] = await db.insert(books).values(book).returning();
    return result;
  }

  async getPrinciplesByBook(bookId: string): Promise<Principle[]> {
    return db.select().from(principles).where(eq(principles.bookId, bookId));
  }

  async createPrinciple(p: InsertPrinciple): Promise<Principle> {
    const [result] = await db.insert(principles).values(p).returning();
    return result;
  }

  async getStoriesByBook(bookId: string): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.bookId, bookId));
  }

  async createStory(s: InsertStory): Promise<Story> {
    const [result] = await db.insert(stories).values(s).returning();
    return result;
  }

  async getExercisesByBook(bookId: string): Promise<Exercise[]> {
    return db.select().from(exercises).where(eq(exercises.bookId, bookId));
  }

  async createExercise(e: InsertExercise): Promise<Exercise> {
    const [result] = await db.insert(exercises).values(e).returning();
    return result;
  }

  async getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined> {
    const [result] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.bookId, bookId)));
    return result;
  }

  async upsertUserProgress(data: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(data.userId, data.bookId);
    if (existing) {
      const [result] = await db.update(userProgress)
        .set({ ...data, lastAccessedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress).values(data).returning();
    return result;
  }

  async toggleBookmark(userId: string, bookId: string): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, bookId);
    if (existing) {
      const [result] = await db.update(userProgress)
        .set({ bookmarked: !existing.bookmarked, lastAccessedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress)
      .values({ userId, bookId, bookmarked: true, completedPrinciples: [], completedExercises: [] })
      .returning();
    return result;
  }

  async togglePrincipleComplete(userId: string, bookId: string, principleId: string): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, bookId);
    if (existing) {
      const currentCompleted = existing.completedPrinciples ?? [];
      const isCompleted = currentCompleted.includes(principleId);
      const newCompleted = isCompleted
        ? currentCompleted.filter((id) => id !== principleId)
        : [...currentCompleted, principleId];
      const [result] = await db.update(userProgress)
        .set({ completedPrinciples: newCompleted, lastAccessedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress)
      .values({ userId, bookId, completedPrinciples: [principleId], completedExercises: [], bookmarked: false })
      .returning();
    return result;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [result] = await db.insert(journalEntries).values(entry).returning();
    return result;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }
}

export const storage = new DatabaseStorage();
