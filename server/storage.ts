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
  type ChapterSummary, type InsertChapterSummary,
  type MentalModel, type InsertMentalModel,
  type CommonMistake, type InsertCommonMistake,
  type ActionItem, type InsertActionItem,
  type Infographic, type InsertInfographic,
  type Comment, type InsertComment,
  type ChakraProgress, type InsertChakraProgress,
  books, principles, stories, exercises, userProgress, journalEntries, categories,
  userInterests, dailySparks, userStreaks, savedHighlights,
  chapterSummaries, mentalModels, commonMistakes, actionItems, infographics, comments,
  chakraProgress,
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

  getPrinciplesByBook(bookId: string): Promise<Principle[]>;
  createPrinciple(p: InsertPrinciple): Promise<Principle>;

  getStoriesByBook(bookId: string): Promise<Story[]>;
  getStoriesByPrinciple(principleId: string): Promise<Story[]>;
  createStory(s: InsertStory): Promise<Story>;

  getExercisesByBook(bookId: string): Promise<Exercise[]>;
  getExercisesByBookSorted(bookId: string): Promise<Exercise[]>;
  createExercise(e: InsertExercise): Promise<Exercise>;

  getChapterSummariesByBook(bookId: string): Promise<ChapterSummary[]>;
  createChapterSummary(cs: InsertChapterSummary): Promise<ChapterSummary>;

  getMentalModelsByBook(bookId: string): Promise<MentalModel[]>;
  createMentalModel(mm: InsertMentalModel): Promise<MentalModel>;

  getCommonMistakesByBook(bookId: string): Promise<CommonMistake[]>;
  createCommonMistake(cm: InsertCommonMistake): Promise<CommonMistake>;

  getInfographicsByBook(bookId: string): Promise<Infographic[]>;
  createInfographic(inf: InsertInfographic): Promise<Infographic>;

  getActionItemsByBook(bookId: string, type?: string): Promise<ActionItem[]>;
  createActionItem(ai: InsertActionItem): Promise<ActionItem>;

  getUserProgress(userId: string, bookId: string): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  upsertUserProgress(data: InsertUserProgress): Promise<UserProgress>;
  toggleBookmark(userId: string, bookId: string): Promise<UserProgress>;
  togglePrincipleComplete(userId: string, bookId: string, principleId: string): Promise<UserProgress>;
  updateCardProgress(userId: string, bookId: string, cardIndex: number, totalCards: number, section?: string): Promise<UserProgress>;

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

  updateBook(id: string, data: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  deleteBookCascade(id: string): Promise<void>;

  updatePrinciple(id: string, data: Partial<InsertPrinciple>): Promise<Principle>;
  deletePrinciple(id: string): Promise<void>;

  updateStory(id: string, data: Partial<InsertStory>): Promise<Story>;
  deleteStory(id: string): Promise<void>;

  updateExercise(id: string, data: Partial<InsertExercise>): Promise<Exercise>;
  deleteExercise(id: string): Promise<void>;

  updateChapterSummary(id: string, data: Partial<InsertChapterSummary>): Promise<ChapterSummary>;
  deleteChapterSummary(id: string): Promise<void>;

  updateMentalModel(id: string, data: Partial<InsertMentalModel>): Promise<MentalModel>;
  deleteMentalModel(id: string): Promise<void>;

  updateCommonMistake(id: string, data: Partial<InsertCommonMistake>): Promise<CommonMistake>;
  deleteCommonMistake(id: string): Promise<void>;

  updateInfographic(id: string, data: Partial<InsertInfographic>): Promise<Infographic>;
  deleteInfographic(id: string): Promise<void>;

  updateActionItem(id: string, data: Partial<InsertActionItem>): Promise<ActionItem>;
  deleteActionItem(id: string): Promise<void>;

  updateOrderIndexes(type: string, items: { id: string; orderIndex: number }[]): Promise<void>;

  getCommentsByBook(bookId: string): Promise<Comment[]>;
  getCommentsByBlock(bookId: string, blockType: string, blockId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, data: Partial<InsertComment & { resolved: boolean }>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  getChakraProgress(userId: string): Promise<ChakraProgress[]>;
  updateChakraProgress(userId: string, chakra: string, points: number): Promise<ChakraProgress>;
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
    return db.select().from(principles).where(eq(principles.bookId, bookId)).orderBy(asc(principles.orderIndex));
  }

  async createPrinciple(p: InsertPrinciple): Promise<Principle> {
    const [result] = await db.insert(principles).values(p).returning();
    return result;
  }

  async getStoriesByBook(bookId: string): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.bookId, bookId)).orderBy(asc(stories.orderIndex));
  }

  async getStoriesByPrinciple(principleId: string): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.principleId, principleId)).orderBy(asc(stories.orderIndex));
  }

  async createStory(s: InsertStory): Promise<Story> {
    const [result] = await db.insert(stories).values(s).returning();
    return result;
  }

  async getExercisesByBook(bookId: string): Promise<Exercise[]> {
    return db.select().from(exercises).where(eq(exercises.bookId, bookId)).orderBy(asc(exercises.orderIndex));
  }

  async getExercisesByBookSorted(bookId: string): Promise<Exercise[]> {
    const all = await db.select().from(exercises).where(eq(exercises.bookId, bookId));
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return all.sort((a, b) => (order[a.impact ?? "medium"] ?? 1) - (order[b.impact ?? "medium"] ?? 1));
  }

  async createExercise(e: InsertExercise): Promise<Exercise> {
    const [result] = await db.insert(exercises).values(e).returning();
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

  async getCommonMistakesByBook(bookId: string): Promise<CommonMistake[]> {
    return db.select().from(commonMistakes).where(eq(commonMistakes.bookId, bookId)).orderBy(asc(commonMistakes.orderIndex));
  }

  async createCommonMistake(cm: InsertCommonMistake): Promise<CommonMistake> {
    const [result] = await db.insert(commonMistakes).values(cm).returning();
    return result;
  }

  async getInfographicsByBook(bookId: string): Promise<Infographic[]> {
    return db.select().from(infographics).where(eq(infographics.bookId, bookId)).orderBy(asc(infographics.orderIndex));
  }

  async createInfographic(inf: InsertInfographic): Promise<Infographic> {
    const [result] = await db.insert(infographics).values(inf).returning();
    return result;
  }

  async getActionItemsByBook(bookId: string, type?: string): Promise<ActionItem[]> {
    if (type) {
      return db.select().from(actionItems)
        .where(and(eq(actionItems.bookId, bookId), eq(actionItems.type, type)))
        .orderBy(asc(actionItems.orderIndex));
    }
    return db.select().from(actionItems).where(eq(actionItems.bookId, bookId)).orderBy(asc(actionItems.orderIndex));
  }

  async createActionItem(ai: InsertActionItem): Promise<ActionItem> {
    const [result] = await db.insert(actionItems).values(ai).returning();
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
      .values({ userId, bookId, currentCardIndex: cardIndex, totalCards, currentSection: section, completedPrinciples: [], completedExercises: [], bookmarked: false })
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

  async updateBook(id: string, data: Partial<InsertBook>): Promise<Book> {
    const [result] = await db.update(books).set({ ...data, updatedAt: new Date() }).where(eq(books.id, id)).returning();
    return result;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async deleteBookCascade(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.bookId, id));
    await db.delete(savedHighlights).where(eq(savedHighlights.bookId, id));
    await db.delete(userProgress).where(eq(userProgress.bookId, id));
    await db.delete(journalEntries).where(eq(journalEntries.exerciseId, id));
    await db.delete(actionItems).where(eq(actionItems.bookId, id));
    await db.delete(infographics).where(eq(infographics.bookId, id));
    await db.delete(commonMistakes).where(eq(commonMistakes.bookId, id));
    await db.delete(mentalModels).where(eq(mentalModels.bookId, id));
    await db.delete(chapterSummaries).where(eq(chapterSummaries.bookId, id));
    await db.delete(exercises).where(eq(exercises.bookId, id));
    await db.delete(stories).where(eq(stories.bookId, id));
    await db.delete(principles).where(eq(principles.bookId, id));
    await db.delete(dailySparks).where(eq(dailySparks.bookId, id));
    await db.delete(books).where(eq(books.id, id));
  }

  async updatePrinciple(id: string, data: Partial<InsertPrinciple>): Promise<Principle> {
    const [result] = await db.update(principles).set(data).where(eq(principles.id, id)).returning();
    return result;
  }

  async deletePrinciple(id: string): Promise<void> {
    await db.delete(stories).where(eq(stories.principleId, id));
    await db.delete(principles).where(eq(principles.id, id));
  }

  async updateStory(id: string, data: Partial<InsertStory>): Promise<Story> {
    const [result] = await db.update(stories).set(data).where(eq(stories.id, id)).returning();
    return result;
  }

  async deleteStory(id: string): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }

  async updateExercise(id: string, data: Partial<InsertExercise>): Promise<Exercise> {
    const [result] = await db.update(exercises).set(data).where(eq(exercises.id, id)).returning();
    return result;
  }

  async deleteExercise(id: string): Promise<void> {
    await db.delete(exercises).where(eq(exercises.id, id));
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

  async updateCommonMistake(id: string, data: Partial<InsertCommonMistake>): Promise<CommonMistake> {
    const [result] = await db.update(commonMistakes).set(data).where(eq(commonMistakes.id, id)).returning();
    return result;
  }

  async deleteCommonMistake(id: string): Promise<void> {
    await db.delete(commonMistakes).where(eq(commonMistakes.id, id));
  }

  async updateInfographic(id: string, data: Partial<InsertInfographic>): Promise<Infographic> {
    const [result] = await db.update(infographics).set(data).where(eq(infographics.id, id)).returning();
    return result;
  }

  async deleteInfographic(id: string): Promise<void> {
    await db.delete(infographics).where(eq(infographics.id, id));
  }

  async updateActionItem(id: string, data: Partial<InsertActionItem>): Promise<ActionItem> {
    const [result] = await db.update(actionItems).set(data).where(eq(actionItems.id, id)).returning();
    return result;
  }

  async deleteActionItem(id: string): Promise<void> {
    await db.delete(actionItems).where(eq(actionItems.id, id));
  }

  async updateOrderIndexes(type: string, items: { id: string; orderIndex: number }[]): Promise<void> {
    const tableMap: Record<string, any> = {
      principles,
      stories,
      exercises,
      mentalModels,
      commonMistakes,
      infographics,
      actionItems,
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
    const existing = await db.select().from(chakraProgress)
      .where(and(eq(chakraProgress.userId, userId), eq(chakraProgress.chakra, chakra)));

    if (existing.length > 0) {
      const [result] = await db.update(chakraProgress)
        .set({
          points: sql`${chakraProgress.points} + ${points}`,
          exercisesCompleted: sql`${chakraProgress.exercisesCompleted} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(chakraProgress.userId, userId), eq(chakraProgress.chakra, chakra)))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(chakraProgress)
        .values({ userId, chakra, points, exercisesCompleted: 1 })
        .returning();
      return result;
    }
  }
}

export const storage = new DatabaseStorage();
