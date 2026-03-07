import {
  type Book, type InsertBook,
  type UserProgress, type InsertUserProgress,
  type JournalEntry, type InsertJournalEntry,
  type Category, type InsertCategory,
  type UserInterest, type InsertUserInterests,
  type UserStreak, type InsertUserStreak,
  type SavedHighlight, type InsertSavedHighlight,
  type ChapterSummary, type InsertChapterSummary,
  type MentalModel, type InsertMentalModel,
  type Comment, type InsertComment,
  type ChakraProgress, type InsertChakraProgress,
  type Short, type InsertShort,
  type ShortView, type InsertShortView,
  type BookRating, type InsertBookRating,
  type Collection, type InsertCollection,
  type CollectionBook, type InsertCollectionBook,
  books, userProgress, journalEntries, categories,
  userInterests, userStreaks, savedHighlights,
  chapterSummaries, mentalModels, comments,
  chakraProgress, shorts, shortViews, userActivityLog,
  bookRatings, collections, collectionBooks,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBooksByCategory(categoryId: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;

  getChapterSummariesByBook(bookId: string): Promise<ChapterSummary[]>;
  createChapterSummary(cs: InsertChapterSummary): Promise<ChapterSummary>;

  getMentalModelsByBook(bookId: string): Promise<MentalModel[]>;
  createMentalModel(mm: InsertMentalModel): Promise<MentalModel>;

  getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  upsertUserProgress(data: InsertUserProgress): Promise<UserProgress>;
  toggleBookmark(userId: string, bookId: string): Promise<UserProgress>;
  updateCardProgress(userId: string, bookId: string, cardIndex: number, totalCards: number, section?: string): Promise<UserProgress>;

  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;

  getUserInterests(userId: string): Promise<UserInterest | undefined>;
  saveUserInterests(data: InsertUserInterests): Promise<UserInterest>;

  getUserStreak(userId: string): Promise<UserStreak | undefined>;
  updateUserStreak(userId: string): Promise<UserStreak>;
  addListeningTime(userId: string, minutes: number): Promise<UserStreak>;
  freezeStreak(userId: string): Promise<UserStreak>;

  getSavedHighlights(userId: string): Promise<SavedHighlight[]>;
  createSavedHighlight(highlight: InsertSavedHighlight): Promise<SavedHighlight>;
  deleteSavedHighlight(id: string, userId: string): Promise<void>;

  updateBook(id: string, data: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  deleteBookCascade(id: string): Promise<void>;

  updateChapterSummary(id: string, data: Partial<InsertChapterSummary>): Promise<ChapterSummary>;
  deleteChapterSummary(id: string): Promise<void>;

  updateMentalModel(id: string, data: Partial<InsertMentalModel>): Promise<MentalModel>;
  deleteMentalModel(id: string): Promise<void>;

  updateOrderIndexes(type: string, items: { id: string; orderIndex: number }[]): Promise<void>;

  getCommentsByBook(bookId: string): Promise<Comment[]>;
  getCommentsByBlock(bookId: string, blockType: string, blockId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, data: Partial<InsertComment & { resolved: boolean }>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  getChakraProgress(userId: string): Promise<ChakraProgress[]>;
  updateChakraProgress(userId: string, chakra: string, points: number): Promise<ChakraProgress>;

  getPublishedShorts(): Promise<Short[]>;
  getShortsByBook(bookId: string): Promise<Short[]>;
  getShort(id: string): Promise<Short | undefined>;
  createShort(data: InsertShort): Promise<Short>;
  updateShort(id: string, data: Partial<InsertShort>): Promise<Short>;
  deleteShort(id: string): Promise<void>;
  recordShortView(data: InsertShortView): Promise<ShortView>;
  getShortViewCount(shortId: string): Promise<number>;

  // Phase 2: Ratings
  getBookRating(userId: string, bookId: string): Promise<BookRating | undefined>;
  getBookRatings(bookId: string): Promise<BookRating[]>;
  upsertBookRating(data: InsertBookRating): Promise<BookRating>;
  deleteBookRating(userId: string, bookId: string): Promise<void>;
  getBookAverageRating(bookId: string): Promise<{ avg: number; count: number }>;

  // Phase 2: Collections
  getUserCollections(userId: string): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(data: InsertCollection): Promise<Collection>;
  updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  getCollectionBooks(collectionId: string): Promise<CollectionBook[]>;
  addBookToCollection(data: InsertCollectionBook): Promise<CollectionBook>;
  removeBookFromCollection(collectionId: string, bookId: string): Promise<void>;

  // Phase 2: Completion
  markBookCompleted(userId: string, bookId: string): Promise<UserProgress>;
}

async function withQueryTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  if (duration > 500) {
    console.warn(`[SLOW QUERY] ${label} took ${duration.toFixed(1)}ms`);
  }
  return result;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return withQueryTiming("getCategories", () => db.select().from(categories));
  }

  async createCategory(cat: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(cat).returning();
    return result;
  }

  async getBooks(): Promise<Book[]> {
    return withQueryTiming("getBooks", () => db.select().from(books));
  }

  async getBook(id: string): Promise<Book | undefined> {
    return withQueryTiming("getBook", async () => {
      const [book] = await db.select().from(books).where(eq(books.id, id));
      return book;
    });
  }

  async getBooksByCategory(categoryId: string): Promise<Book[]> {
    return withQueryTiming("getBooksByCategory", () =>
      db.select().from(books).where(eq(books.categoryId, categoryId))
    );
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [result] = await db.insert(books).values(book).returning();
    return result;
  }

  async getChapterSummariesByBook(bookId: string): Promise<ChapterSummary[]> {
    return db.select().from(chapterSummaries).where(eq(chapterSummaries.bookId, bookId)).orderBy(asc(chapterSummaries.chapterNumber));
  }

  async createChapterSummary(cs: InsertChapterSummary): Promise<ChapterSummary> {
    const [result] = await db.insert(chapterSummaries).values(cs).returning();
    return result;
  }

  async getMentalModelsByBook(bookId: string): Promise<MentalModel[]> {
    return db.select().from(mentalModels).where(eq(mentalModels.bookId, bookId)).orderBy(asc(mentalModels.orderIndex));
  }

  async createMentalModel(mm: InsertMentalModel): Promise<MentalModel> {
    const [result] = await db.insert(mentalModels).values(mm).returning();
    return result;
  }


  async getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined> {
    const [result] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.bookId, bookId)));
    return result;
  }

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    return withQueryTiming("getAllUserProgress", () =>
      db.select().from(userProgress)
        .where(eq(userProgress.userId, userId))
        .orderBy(desc(userProgress.lastAccessedAt))
    );
  }

  async upsertUserProgress(data: InsertUserProgress): Promise<UserProgress> {
    // S5 fix: Use atomic upsert to prevent race condition on concurrent requests
    const [result] = await db.insert(userProgress)
      .values(data)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.bookId],
        set: {
          ...data,
          lastAccessedAt: new Date(),
        },
      })
      .returning();
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
      .values({ userId, bookId, bookmarked: true })
      .returning();
    return result;
  }

  async updateCardProgress(userId: string, bookId: string, cardIndex: number, totalCards: number, section?: string): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, bookId);
    if (existing) {
      const [result] = await db.update(userProgress)
        .set({ currentCardIndex: cardIndex, totalCards, currentSection: section ?? existing.currentSection, lastAccessedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress)
      .values({ userId, bookId, currentCardIndex: cardIndex, totalCards, currentSection: section, bookmarked: false })
      .returning();
    return result;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [result] = await db.insert(journalEntries).values(entry).returning();
    return result;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return withQueryTiming("getJournalEntries", () =>
      db.select().from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt))
    );
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
      .values({ userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalMinutesListened: 0, totalBooksStarted: 0 })
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
      .values({ userId, currentStreak: 0, longestStreak: 0, lastActiveDate: today, totalMinutesListened: minutes, totalBooksStarted: 0 })
      .returning();
    return result;
  }


  async freezeStreak(userId: string): Promise<UserStreak> {
    const existing = await this.getUserStreak(userId);
    if (!existing) {
      throw new Error("No streak record found");
    }
    if (!existing.streakFreezeAvailable) {
      throw new Error("Streak freeze not available");
    }
    const now = new Date();
    const [result] = await db.update(userStreaks)
      .set({
        streakFreezeAvailable: false,
        lastFreezeUsedAt: now,
        lastActiveDate: now.toISOString().split("T")[0],
      })
      .where(eq(userStreaks.id, existing.id))
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

  async updateBook(id: string, data: Partial<InsertBook>): Promise<Book> {
    const [result] = await db.update(books).set({ ...data, updatedAt: new Date() }).where(eq(books.id, id)).returning();
    return result;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async deleteBookCascade(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      const bookShorts = await tx.select({ id: shorts.id }).from(shorts).where(eq(shorts.bookId, id));
      const shortIds = bookShorts.map((s) => s.id);
      if (shortIds.length > 0) {
        await tx.delete(shortViews).where(inArray(shortViews.shortId, shortIds));
      }

      await tx.delete(shorts).where(eq(shorts.bookId, id));
      await tx.delete(userActivityLog).where(eq(userActivityLog.bookId, id));
      await tx.delete(comments).where(eq(comments.bookId, id));
      await tx.delete(savedHighlights).where(eq(savedHighlights.bookId, id));
      await tx.delete(userProgress).where(eq(userProgress.bookId, id));
      await tx.delete(mentalModels).where(eq(mentalModels.bookId, id));
      await tx.delete(chapterSummaries).where(eq(chapterSummaries.bookId, id));
      await tx.delete(books).where(eq(books.id, id));
    });
  }

  async updateChapterSummary(id: string, data: Partial<InsertChapterSummary>): Promise<ChapterSummary> {
    const [result] = await db.update(chapterSummaries).set(data).where(eq(chapterSummaries.id, id)).returning();
    return result;
  }

  async deleteChapterSummary(id: string): Promise<void> {
    await db.delete(chapterSummaries).where(eq(chapterSummaries.id, id));
  }

  async updateMentalModel(id: string, data: Partial<InsertMentalModel>): Promise<MentalModel> {
    const [result] = await db.update(mentalModels).set(data).where(eq(mentalModels.id, id)).returning();
    return result;
  }

  async deleteMentalModel(id: string): Promise<void> {
    await db.delete(mentalModels).where(eq(mentalModels.id, id));
  }


  async updateOrderIndexes(type: string, items: { id: string; orderIndex: number }[]): Promise<void> {
    const tableMap: Record<string, any> = {
      mentalModels,
    };
    const table = tableMap[type];
    if (!table) throw new Error(`Unknown type: ${type}`);
    await Promise.all(
      items.map((item) =>
        db.update(table).set({ orderIndex: item.orderIndex }).where(eq(table.id, item.id))
      )
    );
  }

  async getCommentsByBook(bookId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.bookId, bookId)).orderBy(asc(comments.createdAt));
  }

  async getCommentsByBlock(bookId: string, blockType: string, blockId: string): Promise<Comment[]> {
    return db.select().from(comments)
      .where(and(eq(comments.bookId, bookId), eq(comments.blockType, blockType), eq(comments.blockId, blockId)))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db.insert(comments).values(comment).returning();
    return result;
  }

  async updateComment(id: string, data: Partial<InsertComment & { resolved: boolean }>): Promise<Comment> {
    const [result] = await db.update(comments).set(data).where(eq(comments.id, id)).returning();
    return result;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getChakraProgress(userId: string): Promise<ChakraProgress[]> {
    return db.select().from(chakraProgress).where(eq(chakraProgress.userId, userId));
  }

  async updateChakraProgress(userId: string, chakra: string, points: number): Promise<ChakraProgress> {
    // S5 fix: Use atomic upsert to prevent race condition on concurrent requests
    const [result] = await db.insert(chakraProgress)
      .values({ userId, chakra, points })
      .onConflictDoUpdate({
        target: [chakraProgress.userId, chakraProgress.chakra],
        set: {
          points: sql`${chakraProgress.points} + ${points}`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getPublishedShorts(): Promise<Short[]> {
    return withQueryTiming("getPublishedShorts", () =>
      db.select().from(shorts)
        .where(eq(shorts.status, "published"))
        .orderBy(desc(shorts.createdAt))
    );
  }

  async getShortsByBook(bookId: string): Promise<Short[]> {
    return db.select().from(shorts)
      .where(eq(shorts.bookId, bookId))
      .orderBy(asc(shorts.orderIndex));
  }

  async getShort(id: string): Promise<Short | undefined> {
    const [result] = await db.select().from(shorts).where(eq(shorts.id, id));
    return result;
  }

  async createShort(data: InsertShort): Promise<Short> {
    const [result] = await db.insert(shorts).values(data).returning();
    return result;
  }

  async updateShort(id: string, data: Partial<InsertShort>): Promise<Short> {
    const [result] = await db.update(shorts).set({ ...data, updatedAt: new Date() }).where(eq(shorts.id, id)).returning();
    return result;
  }

  async deleteShort(id: string): Promise<void> {
    await db.delete(shortViews).where(eq(shortViews.shortId, id));
    await db.delete(shorts).where(eq(shorts.id, id));
  }

  async recordShortView(data: InsertShortView): Promise<ShortView> {
    const [result] = await db.insert(shortViews).values(data).returning();
    return result;
  }

  async getShortViewCount(shortId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(shortViews).where(eq(shortViews.shortId, shortId));
    return result?.count ?? 0;
  }

  // Phase 2: Ratings
  async getBookRating(userId: string, bookId: string): Promise<BookRating | undefined> {
    const [result] = await db.select().from(bookRatings)
      .where(and(eq(bookRatings.userId, userId), eq(bookRatings.bookId, bookId)));
    return result;
  }

  async getBookRatings(bookId: string): Promise<BookRating[]> {
    return db.select().from(bookRatings)
      .where(eq(bookRatings.bookId, bookId))
      .orderBy(desc(bookRatings.createdAt));
  }

  async upsertBookRating(data: InsertBookRating): Promise<BookRating> {
    const existing = await this.getBookRating(data.userId, data.bookId);
    if (existing) {
      const [result] = await db.update(bookRatings)
        .set({ rating: data.rating, review: data.review ?? existing.review, updatedAt: new Date() })
        .where(eq(bookRatings.id, existing.id))
        .returning();
      return result;
    }
    const [result] = await db.insert(bookRatings).values(data).returning();
    return result;
  }

  async deleteBookRating(userId: string, bookId: string): Promise<void> {
    await db.delete(bookRatings)
      .where(and(eq(bookRatings.userId, userId), eq(bookRatings.bookId, bookId)));
  }

  async getBookAverageRating(bookId: string): Promise<{ avg: number; count: number }> {
    const [result] = await db.select({
      avg: sql<number>`COALESCE(AVG(rating), 0)::float`,
      count: sql<number>`COUNT(*)::int`,
    }).from(bookRatings).where(eq(bookRatings.bookId, bookId));
    return { avg: result?.avg ?? 0, count: result?.count ?? 0 };
  }

  // Phase 2: Collections
  async getUserCollections(userId: string): Promise<Collection[]> {
    return db.select().from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.createdAt));
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [result] = await db.select().from(collections).where(eq(collections.id, id));
    return result;
  }

  async createCollection(data: InsertCollection): Promise<Collection> {
    const [result] = await db.insert(collections).values(data).returning();
    return result;
  }

  async updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection> {
    const [result] = await db.update(collections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return result;
  }

  async deleteCollection(id: string): Promise<void> {
    // collectionBooks cascade-deletes via FK
    await db.delete(collections).where(eq(collections.id, id));
  }

  async getCollectionBooks(collectionId: string): Promise<CollectionBook[]> {
    return db.select().from(collectionBooks)
      .where(eq(collectionBooks.collectionId, collectionId))
      .orderBy(desc(collectionBooks.addedAt));
  }

  async addBookToCollection(data: InsertCollectionBook): Promise<CollectionBook> {
    const [result] = await db.insert(collectionBooks).values(data).returning();
    return result;
  }

  async removeBookFromCollection(collectionId: string, bookId: string): Promise<void> {
    await db.delete(collectionBooks)
      .where(and(eq(collectionBooks.collectionId, collectionId), eq(collectionBooks.bookId, bookId)));
  }

  // Phase 2: Completion
  async markBookCompleted(userId: string, bookId: string): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, bookId);
    if (existing) {
      const [result] = await db.update(userProgress)
        .set({ completedAt: new Date(), lastAccessedAt: new Date() })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.bookId, bookId)))
        .returning();
      return result;
    }
    const [result] = await db.insert(userProgress)
      .values({ userId, bookId, completedAt: new Date() })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
