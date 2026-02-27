import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image"),
  description: text("description").notNull(),
  coreThesis: text("core_thesis"),
  categoryId: varchar("category_id").references(() => categories.id),
  readTime: integer("read_time").notNull(),
  listenTime: integer("listen_time").notNull(),
  audioUrl: text("audio_url"),
  featured: boolean("featured").default(false),
  status: text("status").default("draft"),
  principleCount: integer("principle_count").default(0),
  storyCount: integer("story_count").default(0),
  exerciseCount: integer("exercise_count").default(0),
  primaryChakra: text("primary_chakra"),
  secondaryChakra: text("secondary_chakra"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const principles = pgTable("principles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
  icon: text("icon"),
  visualType: text("visual_type"),
  visualData: jsonb("visual_data"),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  principleId: varchar("principle_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  moral: text("moral"),
  orderIndex: integer("order_index").notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").notNull(),
  impact: text("impact").default("medium"),
  powersUpChakra: text("powers_up_chakra"),
  orderIndex: integer("order_index").notNull(),
});

export const chapterSummaries = pgTable("chapter_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  chapterTitle: text("chapter_title").notNull(),
  cards: jsonb("cards").notNull(),
});

export const mentalModels = pgTable("mental_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const commonMistakes = pgTable("common_mistakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  mistake: text("mistake").notNull(),
  correction: text("correction").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const infographics = pgTable("infographics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  steps: jsonb("steps").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  powersUpChakra: text("powers_up_chakra"),
  orderIndex: integer("order_index").notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  completedPrinciples: text("completed_principles").array().default([]),
  completedExercises: text("completed_exercises").array().default([]),
  bookmarked: boolean("bookmarked").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  currentCardIndex: integer("current_card_index").default(0),
  totalCards: integer("total_cards").default(0),
  currentSection: text("current_section"),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInterests = pgTable("user_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  interests: text("interests").array().default([]),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailySparks = pgTable("daily_sparks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  bookId: varchar("book_id").references(() => books.id),
  category: text("category"),
});

export const userStreaks = pgTable("user_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  totalMinutesListened: integer("total_minutes_listened").default(0),
  totalExercisesCompleted: integer("total_exercises_completed").default(0),
  totalBooksStarted: integer("total_books_started").default(0),
});

export const savedHighlights = pgTable("saved_highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  principleId: varchar("principle_id"),
  content: text("content").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chakraProgress = pgTable("chakra_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  chakra: text("chakra").notNull(),
  points: integer("points").default(0),
  exercisesCompleted: integer("exercises_completed").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  blockType: text("block_type").notNull(),
  blockId: text("block_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data"),
  pageUrl: text("page_url"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, { fields: [analyticsEvents.userId], references: [users.id] }),
}));

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, createdAt: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, { fields: [books.categoryId], references: [categories.id] }),
  principles: many(principles),
  stories: many(stories),
  exercises: many(exercises),
  chapterSummaries: many(chapterSummaries),
  mentalModels: many(mentalModels),
  commonMistakes: many(commonMistakes),
  actionItems: many(actionItems),
  infographics: many(infographics),
}));

export const principlesRelations = relations(principles, ({ one, many }) => ({
  book: one(books, { fields: [principles.bookId], references: [books.id] }),
  stories: many(stories),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  book: one(books, { fields: [stories.bookId], references: [books.id] }),
  principle: one(principles, { fields: [stories.principleId], references: [principles.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  book: one(books, { fields: [exercises.bookId], references: [books.id] }),
}));

export const chapterSummariesRelations = relations(chapterSummaries, ({ one }) => ({
  book: one(books, { fields: [chapterSummaries.bookId], references: [books.id] }),
}));

export const mentalModelsRelations = relations(mentalModels, ({ one }) => ({
  book: one(books, { fields: [mentalModels.bookId], references: [books.id] }),
}));

export const commonMistakesRelations = relations(commonMistakes, ({ one }) => ({
  book: one(books, { fields: [commonMistakes.bookId], references: [books.id] }),
}));

export const infographicsRelations = relations(infographics, ({ one }) => ({
  book: one(books, { fields: [infographics.bookId], references: [books.id] }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  book: one(books, { fields: [actionItems.bookId], references: [books.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  book: one(books, { fields: [userProgress.bookId], references: [books.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, { fields: [userInterests.userId], references: [users.id] }),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(users, { fields: [userStreaks.userId], references: [users.id] }),
}));

export const savedHighlightsRelations = relations(savedHighlights, ({ one }) => ({
  user: one(users, { fields: [savedHighlights.userId], references: [users.id] }),
  book: one(books, { fields: [savedHighlights.bookId], references: [books.id] }),
}));

export const chakraProgressRelations = relations(chakraProgress, ({ one }) => ({
  user: one(users, { fields: [chakraProgress.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  book: one(books, { fields: [comments.bookId], references: [books.id] }),
}));

export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export const insertPrincipleSchema = createInsertSchema(principles).omit({ id: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertUserInterestsSchema = createInsertSchema(userInterests).omit({ id: true });
export const insertDailySparkSchema = createInsertSchema(dailySparks).omit({ id: true });
export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({ id: true });
export const insertSavedHighlightSchema = createInsertSchema(savedHighlights).omit({ id: true });
export const insertChapterSummarySchema = createInsertSchema(chapterSummaries).omit({ id: true });
export const insertMentalModelSchema = createInsertSchema(mentalModels).omit({ id: true });
export const insertCommonMistakeSchema = createInsertSchema(commonMistakes).omit({ id: true });
export const insertInfographicSchema = createInsertSchema(infographics).omit({ id: true });
export const insertActionItemSchema = createInsertSchema(actionItems).omit({ id: true });
export const insertChakraProgressSchema = createInsertSchema(chakraProgress).omit({ id: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true });

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
export type InsertPrinciple = z.infer<typeof insertPrincipleSchema>;
export type Principle = typeof principles.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertUserInterests = z.infer<typeof insertUserInterestsSchema>;
export type UserInterest = typeof userInterests.$inferSelect;
export type InsertDailySpark = z.infer<typeof insertDailySparkSchema>;
export type DailySpark = typeof dailySparks.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertSavedHighlight = z.infer<typeof insertSavedHighlightSchema>;
export type SavedHighlight = typeof savedHighlights.$inferSelect;
export type InsertChapterSummary = z.infer<typeof insertChapterSummarySchema>;
export type ChapterSummary = typeof chapterSummaries.$inferSelect;
export type InsertMentalModel = z.infer<typeof insertMentalModelSchema>;
export type MentalModel = typeof mentalModels.$inferSelect;
export type InsertCommonMistake = z.infer<typeof insertCommonMistakeSchema>;
export type CommonMistake = typeof commonMistakes.$inferSelect;
export type InsertInfographic = z.infer<typeof insertInfographicSchema>;
export type Infographic = typeof infographics.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertChakraProgress = z.infer<typeof insertChakraProgressSchema>;
export type ChakraProgress = typeof chakraProgress.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const CHAKRA_MAP = {
  root: { name: "Root", sanskrit: "Muladhara", color: "#EF4444", theme: "Foundation & Routine" },
  sacral: { name: "Sacral", sanskrit: "Svadhisthana", color: "#F97316", theme: "Creativity & Emotion" },
  solar_plexus: { name: "Solar Plexus", sanskrit: "Manipura", color: "#EAB308", theme: "Willpower & Action" },
  heart: { name: "Heart", sanskrit: "Anahata", color: "#22C55E", theme: "Empathy & Connection" },
  throat: { name: "Throat", sanskrit: "Vishuddha", color: "#3B82F6", theme: "Communication & Truth" },
  third_eye: { name: "Third Eye", sanskrit: "Ajna", color: "#6366F1", theme: "Cognition & Intuition" },
  crown: { name: "Crown", sanskrit: "Sahasrara", color: "#8B5CF6", theme: "Purpose & Meaning" },
} as const;

export type ChakraType = keyof typeof CHAKRA_MAP;
