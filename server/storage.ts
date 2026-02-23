import {
  type Book, type InsertBook,
  type Principle, type InsertPrinciple,
  type Story, type InsertStory,
  type Exercise, type InsertExercise,
  type UserProgress, type InsertUserProgress,
  type JournalEntry, type InsertJournalEntry,
  type Category, type InsertCategory,
  type UserInterest, type InsertUserInterests,
  type DailySpark, type InsertDailySpark,
  type UserStreak, type InsertUserStreak,
  type SavedHighlight, type InsertSavedHighlight,
  books, principles, stories, exercises, userProgress, journalEntries, categories,
  userInterests, dailySparks, userStreaks, savedHighlights,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBooksByCategory(categoryId: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;

  getPrinciplesByBook(bookId: string): Promise<Principle[]>;
  createPrinciple(p: InsertPrinciple): Promise<Principle>;

  getStoriesByBook(bookId: string): Promise<Story[]>;
  createStory(s: InsertStory): Promise<Story>;

  getExercisesByBook(bookId: string): Promise<Exercise[]>;
  createExercise(e: InsertExercise): Promise<Exercise>;

  getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  upsertUserProgress(data: InsertUserProgress): Promise<UserProgress>;
  toggleBookmark(userId: string, bookId: string): Promise<UserProgress>;
  togglePrincipleComplete(userId: string, bookId: string, principleId: string): Promise<UserProgress>;
  updateCardProgress(userId: string, bookId: string, cardIndex: number, totalCards: number): Promise<UserProgress>;

  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;

  getUserInterests(userId: string): Promise<UserInterest | undefined>;
  saveUserInterests(data: InsertUserInterests): Promise<UserInterest>;

  getDailySpark(): Promise<DailySpark | undefined>;
  createDailySpark(spark: InsertDailySpark): Promise<DailySpark>;

  getUserStreak(userId: string): Promise<UserStreak | undefined>;
  updateUserStreak(userId: string): Promise<UserStreak>;
  addListeningTime(userId: string, minutes: number): Promise<UserStreak>;
  incrementExercisesCompleted(userId: string): Promise<UserStreak>;

  getSavedHighlights(userId: string): Promise<SavedHighlight[]>;
  createSavedHighlight(highlight: InsertSavedHighlight): Promise<SavedHighlight>;
  deleteSavedHighlight(id: string, userId: string): Promise<void>;
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

  async getBooksByCategory(categoryId: string): Promise<Book[]> {
    return db.select().from(books).where(eq(books.categoryId, categoryId));
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

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastAccessedAt));
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

  async updateCardProgress(userId: string, bookId: string, cardIndex: number, totalCards: number): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, bookId);
    if (existing) {
      const [result] = await db.update(userProgress)
        .set({ currentCardIndex: cardIndex, totalCards, lastAccessedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress)
      .values({ userId, bookId, currentCardIndex: cardIndex, totalCards, completedPrinciples: [], completedExercises: [], bookmarked: false })
      .returning();
    return result;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [result] = await db.insert(journalEntries).values(entry).returning();
    return result;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getUserInterests(userId: string): Promise<UserInterest | undefined> {
    const [result] = await db.select().from(userInterests)
      .where(eq(userInterests.userId, userId));
    return result;
  }

  async saveUserInterests(data: InsertUserInterests): Promise<UserInterest> {
    const existing = await this.getUserInterests(data.userId);
    if (existing) {
      const [result] = await db.update(userInterests)
        .set({ interests: data.interests, onboardingCompleted: true })
        .where(eq(userInterests.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userInterests)
      .values({ ...data, onboardingCompleted: true })
      .returning();
    return result;
  }

  async getDailySpark(): Promise<DailySpark | undefined> {
    const allSparks = await db.select().from(dailySparks);
    if (allSparks.length === 0) return undefined;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return allSparks[dayOfYear % allSparks.length];
  }

  async createDailySpark(spark: InsertDailySpark): Promise<DailySpark> {
    const [result] = await db.insert(dailySparks).values(spark).returning();
    return result;
  }

  async getUserStreak(userId: string): Promise<UserStreak | undefined> {
    const [result] = await db.select().from(userStreaks)
      .where(eq(userStreaks.userId, userId));
    return result;
  }

  async updateUserStreak(userId: string): Promise<UserStreak> {
    const today = new Date().toISOString().split("T")[0];
    const existing = await this.getUserStreak(userId);

    if (existing) {
      const lastActive = existing.lastActiveDate;
      const lastActiveStr = lastActive ? new Date(lastActive).toISOString().split("T")[0] : null;

      if (lastActiveStr === today) return existing;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = lastActiveStr === yesterday
        ? (existing.currentStreak ?? 0) + 1
        : 1;
      const longestStreak = Math.max(newStreak, existing.longestStreak ?? 0);

      const [result] = await db.update(userStreaks)
        .set({ currentStreak: newStreak, longestStreak, lastActiveDate: today })
        .where(eq(userStreaks.id, existing.id))
        .returning();
      return result;
    }

    const [result] = await db.insert(userStreaks)
      .values({ userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalMinutesListened: 0, totalExercisesCompleted: 0, totalBooksStarted: 0 })
      .returning();
    return result;
  }

  async addListeningTime(userId: string, minutes: number): Promise<UserStreak> {
    const existing = await this.getUserStreak(userId);
    if (existing) {
      const [result] = await db.update(userStreaks)
        .set({ totalMinutesListened: (existing.totalMinutesListened ?? 0) + minutes })
        .where(eq(userStreaks.id, existing.id))
        .returning();
      return result;
    }
    const today = new Date().toISOString().split("T")[0];
    const [result] = await db.insert(userStreaks)
      .values({ userId, currentStreak: 0, longestStreak: 0, lastActiveDate: today, totalMinutesListened: minutes, totalExercisesCompleted: 0, totalBooksStarted: 0 })
      .returning();
    return result;
  }

  async incrementExercisesCompleted(userId: string): Promise<UserStreak> {
    const existing = await this.getUserStreak(userId);
    if (existing) {
      const [result] = await db.update(userStreaks)
        .set({ totalExercisesCompleted: (existing.totalExercisesCompleted ?? 0) + 1 })
        .where(eq(userStreaks.id, existing.id))
        .returning();
      return result;
    }
    const today = new Date().toISOString().split("T")[0];
    const [result] = await db.insert(userStreaks)
      .values({ userId, currentStreak: 0, longestStreak: 0, lastActiveDate: today, totalMinutesListened: 0, totalExercisesCompleted: 1, totalBooksStarted: 0 })
      .returning();
    return result;
  }

  async getSavedHighlights(userId: string): Promise<SavedHighlight[]> {
    return db.select().from(savedHighlights)
      .where(eq(savedHighlights.userId, userId))
      .orderBy(desc(savedHighlights.createdAt));
  }

  async createSavedHighlight(highlight: InsertSavedHighlight): Promise<SavedHighlight> {
    const [result] = await db.insert(savedHighlights).values(highlight).returning();
    return result;
  }

  async deleteSavedHighlight(id: string, userId: string): Promise<void> {
    await db.delete(savedHighlights)
      .where(and(eq(savedHighlights.id, id), eq(savedHighlights.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
