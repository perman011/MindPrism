import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  index,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const books = pgTable("books", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image"),
  description: text("description").notNull(),
  coreThesis: text("core_thesis"),
  categoryId: varchar("category_id").references(() => categories.id),
  readTime: integer("read_time").notNull(),
  listenTime: integer("listen_time").notNull(),
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"),
  featured: boolean("featured").default(false),
  status: text("status").default("draft"),
  primaryChakra: text("primary_chakra"),
  secondaryChakra: text("secondary_chakra"),
  tags: text("tags"),
  // Phase 1: New book metadata fields
  publisher: text("publisher"),
  isbn: text("isbn"),
  publishedDate: text("published_date"),
  pageCount: integer("page_count"),
  language: text("language").default("English"),
  edition: text("edition"),
  originalPrice: numeric("original_price"),
  authorBio: text("author_bio"),
  sourceUrl: text("source_url"),
  rating: integer("rating"),
  difficultyLevel: text("difficulty_level"),
  keyTakeaways: jsonb("key_takeaways").default([]),
  secondaryCategoryId: varchar("secondary_category_id").references(() => categories.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusCategoryIdx: index("books_status_category_idx").on(table.status, table.categoryId),
}));

export const bookVersions = pgTable("book_versions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bookId: varchar("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  versionType: varchar("version_type").notNull().default("draft"),
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  publishedAt: timestamp("published_at"),
});


export const chapterSummaries = pgTable("chapter_summaries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bookId: varchar("book_id")
    .references(() => books.id)
    .notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  chapterTitle: text("chapter_title").notNull(),
  cards: jsonb("cards").notNull(),
  content: text("content"),
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"),
  subtitle: text("subtitle"),
  estimatedReadTime: integer("estimated_read_time"),
});

export const mentalModels = pgTable("mental_models", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bookId: varchar("book_id")
    .references(() => books.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").notNull(),
  orderIndex: integer("order_index").notNull(),
});


export const userProgress = pgTable("user_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: varchar("book_id")
    .references(() => books.id)
    .notNull(),
  bookmarked: boolean("bookmarked").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  currentCardIndex: integer("current_card_index").default(0),
  totalCards: integer("total_cards").default(0),
  currentSection: text("current_section"),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userBookIdx: index("user_progress_user_book_idx").on(table.userId, table.bookId),
  userBookUnique: uniqueIndex("user_progress_user_book_unique").on(table.userId, table.bookId),
}));

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userCreatedAtIdx: index("journal_entries_user_created_idx").on(table.userId, table.createdAt),
}));

export const userInterests = pgTable("user_interests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  interests: text("interests").array().default([]),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdUnique: uniqueIndex("user_interests_user_id_unique").on(table.userId),
}));

export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
}, (table) => ({
  processedAtIdx: index("stripe_webhook_events_processed_idx").on(table.processedAt),
  eventTypeIdx: index("stripe_webhook_events_type_idx").on(table.eventType),
}));

export const userStreaks = pgTable("user_streaks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  totalMinutesListened: integer("total_minutes_listened").default(0),
  totalBooksStarted: integer("total_books_started").default(0),
  streakFreezeAvailable: boolean("streak_freeze_available").default(true),
  lastFreezeUsedAt: timestamp("last_freeze_used_at"),
});

export const savedHighlights = pgTable("saved_highlights", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: varchar("book_id")
    .references(() => books.id)
    .notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("saved_highlights_user_id_idx").on(table.userId),
}));

export const chakraProgress = pgTable("chakra_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  chakra: text("chakra").notNull(),
  points: integer("points").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userChakraUnique: uniqueIndex("chakra_progress_user_chakra_unique").on(table.userId, table.chakra),
}));

export const comments = pgTable("comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bookId: varchar("book_id")
    .references(() => books.id)
    .notNull(),
  blockType: text("block_type").notNull(),
  blockId: text("block_id").notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data"),
  pageUrl: text("page_url"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  eventTypeCreatedAtIdx: index("analytics_events_type_created_idx").on(table.eventType, table.createdAt),
}));

export const analyticsEventsRelations = relations(
  analyticsEvents,
  ({ one }) => ({
    user: one(users, {
      fields: [analyticsEvents.userId],
      references: [users.id],
    }),
  }),
);

export const insertAnalyticsEventSchema = createInsertSchema(
  analyticsEvents,
).omit({ id: true, createdAt: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export const shorts = pgTable("shorts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id", { length: 255 }).notNull().references(() => books.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaType: text("media_type").notNull(),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  backgroundGradient: text("background_gradient"),
  duration: integer("duration"),
  orderIndex: integer("order_index").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shortViews = pgTable("short_views", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  shortId: varchar("short_id", { length: 255 }).notNull().references(() => shorts.id),
  userId: text("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow(),
}, (table) => ({
  shortIdIdx: index("short_views_short_id_idx").on(table.shortId),
}));

export const shortsRelations = relations(shorts, ({ one }) => ({
  book: one(books, { fields: [shorts.bookId], references: [books.id] }),
}));

export const shortViewsRelations = relations(shortViews, ({ one }) => ({
  short: one(shorts, { fields: [shortViews.shortId], references: [shorts.id] }),
}));

export const insertShortSchema = createInsertSchema(shorts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShort = z.infer<typeof insertShortSchema>;
export type Short = typeof shorts.$inferSelect;

export const insertShortViewSchema = createInsertSchema(shortViews).omit({ id: true, viewedAt: true });
export type InsertShortView = z.infer<typeof insertShortViewSchema>;
export type ShortView = typeof shortViews.$inferSelect;

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  chapterSummaries: many(chapterSummaries),
  mentalModels: many(mentalModels),
  versions: many(bookVersions),
  shorts: many(shorts),
}));

export const bookVersionsRelations = relations(bookVersions, ({ one }) => ({
  book: one(books, { fields: [bookVersions.bookId], references: [books.id] }),
}));


export const chapterSummariesRelations = relations(
  chapterSummaries,
  ({ one }) => ({
    book: one(books, {
      fields: [chapterSummaries.bookId],
      references: [books.id],
    }),
  }),
);

export const mentalModelsRelations = relations(mentalModels, ({ one }) => ({
  book: one(books, { fields: [mentalModels.bookId], references: [books.id] }),
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

export const savedHighlightsRelations = relations(
  savedHighlights,
  ({ one }) => ({
    user: one(users, {
      fields: [savedHighlights.userId],
      references: [users.id],
    }),
    book: one(books, {
      fields: [savedHighlights.bookId],
      references: [books.id],
    }),
  }),
);

export const chakraProgressRelations = relations(chakraProgress, ({ one }) => ({
  user: one(users, { fields: [chakraProgress.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  book: one(books, { fields: [comments.bookId], references: [books.id] }),
}));

// ---------------------------------------------------------------------------
// Spaced Repetition (P0)
// ---------------------------------------------------------------------------

/**
 * Admin-created recall cards for a book. Each card contains a scenario-based
 * question drawn from the book's core psychology concepts.
 */
export const recallCards = pgTable("recall_cards", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id", { length: 255 }).notNull().references(() => books.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  /** Optional hint shown before revealing the answer */
  hint: text("hint"),
  /** Difficulty rating set by admin: 1 (easy) – 5 (hard) */
  difficulty: integer("difficulty").notNull().default(3),
  /** Admin ordering within a book */
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  bookIdx: index("recall_cards_book_id_idx").on(table.bookId),
}));

/**
 * Per-user spaced repetition schedule for each recall card.
 * Tracks SM-2-style parameters for optimal review intervals.
 */
export const userRecallSchedule = pgTable("user_recall_schedule", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  cardId: varchar("card_id", { length: 255 }).notNull().references(() => recallCards.id),
  /** SM-2 easiness factor (≥ 1.3) */
  easeFactor: integer("ease_factor").notNull().default(250),
  /** Current review interval in days */
  intervalDays: integer("interval_days").notNull().default(1),
  /** How many consecutive correct reviews */
  repetitions: integer("repetitions").notNull().default(0),
  /** Next scheduled review date */
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  /** Last review date */
  lastReviewedAt: timestamp("last_reviewed_at"),
  /** Last self-rated quality (0-5, SM-2 scale) */
  lastQuality: integer("last_quality"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userCardUnique: uniqueIndex("user_recall_schedule_user_card_idx").on(table.userId, table.cardId),
  nextReviewIdx: index("user_recall_schedule_next_review_idx").on(table.userId, table.nextReviewAt),
}));

export const recallCardsRelations = relations(recallCards, ({ one }) => ({
  book: one(books, { fields: [recallCards.bookId], references: [books.id] }),
}));

export const userRecallScheduleRelations = relations(userRecallSchedule, ({ one }) => ({
  user: one(users, { fields: [userRecallSchedule.userId], references: [users.id] }),
  card: one(recallCards, { fields: [userRecallSchedule.cardId], references: [recallCards.id] }),
}));

// ---------------------------------------------------------------------------
// "Apply This Week" Action Cards (P0)
// ---------------------------------------------------------------------------

/**
 * Admin-created micro-challenges tied to a book. Each book produces a set
 * of 3 low-effort behavioral experiments (< 10 min/day) that close the
 * gap between reading psychology and practicing it.
 */
export const actionCards = pgTable("action_cards", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id", { length: 255 }).notNull().references(() => books.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** Day within the week (1-7) this card is suggested for */
  dayNumber: integer("day_number").notNull().default(1),
  /** Estimated minutes to complete */
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  bookIdx: index("action_cards_book_id_idx").on(table.bookId),
}));

/**
 * Tracks a user's progress through action cards. Each row records that a
 * user has accepted and/or completed a specific action card, with an
 * optional reflection note.
 */
export const userActionProgress = pgTable("user_action_progress", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  cardId: varchar("card_id", { length: 255 }).notNull().references(() => actionCards.id),
  status: text("status").notNull().default("pending"),
  /** User's optional reflection after completing the challenge */
  reflection: text("reflection"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userCardUnique: uniqueIndex("user_action_progress_user_card_idx").on(table.userId, table.cardId),
  userStatusIdx: index("user_action_progress_user_status_idx").on(table.userId, table.status),
}));

export const actionCardsRelations = relations(actionCards, ({ one }) => ({
  book: one(books, { fields: [actionCards.bookId], references: [books.id] }),
}));

export const userActionProgressRelations = relations(userActionProgress, ({ one }) => ({
  user: one(users, { fields: [userActionProgress.userId], references: [users.id] }),
  card: one(actionCards, { fields: [userActionProgress.cardId], references: [actionCards.id] }),
}));

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
});
export const insertBookVersionSchema = createInsertSchema(bookVersions).omit({
  id: true,
});
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit(
  { id: true },
);
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});
export const insertUserInterestsSchema = createInsertSchema(userInterests).omit(
  { id: true },
);
export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true,
});
export const insertSavedHighlightSchema = createInsertSchema(
  savedHighlights,
).omit({ id: true });
export const insertChapterSummarySchema = createInsertSchema(
  chapterSummaries,
).omit({ id: true });
export const insertMentalModelSchema = createInsertSchema(mentalModels).omit({
  id: true,
});
export const insertChakraProgressSchema = createInsertSchema(
  chakraProgress,
).omit({ id: true });
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBookVersion = z.infer<typeof insertBookVersionSchema>;
export type BookVersion = typeof bookVersions.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertUserInterests = z.infer<typeof insertUserInterestsSchema>;
export type UserInterest = typeof userInterests.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertSavedHighlight = z.infer<typeof insertSavedHighlightSchema>;
export type SavedHighlight = typeof savedHighlights.$inferSelect;
export type InsertChapterSummary = z.infer<typeof insertChapterSummarySchema>;
export type ChapterSummary = typeof chapterSummaries.$inferSelect;
export type InsertMentalModel = z.infer<typeof insertMentalModelSchema>;
export type MentalModel = typeof mentalModels.$inferSelect;
export type InsertChakraProgress = z.infer<typeof insertChakraProgressSchema>;
export type ChakraProgress = typeof chakraProgress.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Spaced Repetition schemas
export const insertRecallCardSchema = createInsertSchema(recallCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserRecallScheduleSchema = createInsertSchema(userRecallSchedule).omit({ id: true, createdAt: true });
export type InsertRecallCard = z.infer<typeof insertRecallCardSchema>;
export type RecallCard = typeof recallCards.$inferSelect;
export type InsertUserRecallSchedule = z.infer<typeof insertUserRecallScheduleSchema>;
export type UserRecallSchedule = typeof userRecallSchedule.$inferSelect;

// Action Card schemas
export const insertActionCardSchema = createInsertSchema(actionCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserActionProgressSchema = createInsertSchema(userActionProgress).omit({ id: true, createdAt: true });
export type InsertActionCard = z.infer<typeof insertActionCardSchema>;
export type ActionCard = typeof actionCards.$inferSelect;
export type InsertUserActionProgress = z.infer<typeof insertUserActionProgressSchema>;
export type UserActionProgress = typeof userActionProgress.$inferSelect;

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  dailyReminder: boolean("daily_reminder").default(true),
  streakAlerts: boolean("streak_alerts").default(true),
  newContent: boolean("new_content").default(true),
  weeklySummary: boolean("weekly_summary").default(true),
  reminderTime: text("reminder_time").default("09:00"),
  pushSubscription: jsonb("push_subscription"),
  permissionStatus: text("permission_status").default("default"),
  lastPromptDismissed: timestamp("last_prompt_dismissed"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
);

export const insertNotificationPreferencesSchema = createInsertSchema(
  notificationPreferences,
).omit({ id: true, updatedAt: true });
export type InsertNotificationPreferences = z.infer<
  typeof insertNotificationPreferencesSchema
>;
export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;

export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").default({}),
  bookId: varchar("book_id").references(() => books.id),
  sessionDuration: integer("session_duration"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userCreatedAtIdx: index("user_activity_log_user_created_idx").on(table.userId, table.createdAt),
}));

export const userActivityLogRelations = relations(
  userActivityLog,
  ({ one }) => ({
    user: one(users, {
      fields: [userActivityLog.userId],
      references: [users.id],
    }),
    book: one(books, {
      fields: [userActivityLog.bookId],
      references: [books.id],
    }),
  }),
);

export const insertUserActivityLogSchema = createInsertSchema(
  userActivityLog,
).omit({ id: true, createdAt: true });
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type UserActivityLog = typeof userActivityLog.$inferSelect;


export const quizResults = pgTable("quiz_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapterId: varchar("chapter_id")
    .notNull()
    .references(() => chapterSummaries.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").default([]),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  book: one(books, { fields: [quizResults.bookId], references: [books.id] }),
  chapter: one(chapterSummaries, {
    fields: [quizResults.chapterId],
    references: [chapterSummaries.id],
  }),
}));

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  completedAt: true,
});
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// ---------------------------------------------------------------------------
// Book Ratings (Phase 2)
// ---------------------------------------------------------------------------

export const bookRatings = pgTable("book_ratings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userBookUnique: uniqueIndex("book_ratings_user_book_unique").on(table.userId, table.bookId),
  bookIdx: index("book_ratings_book_id_idx").on(table.bookId),
}));

export const bookRatingsRelations = relations(bookRatings, ({ one }) => ({
  user: one(users, { fields: [bookRatings.userId], references: [users.id] }),
  book: one(books, { fields: [bookRatings.bookId], references: [books.id] }),
}));

export const insertBookRatingSchema = createInsertSchema(bookRatings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBookRating = z.infer<typeof insertBookRatingSchema>;
export type BookRating = typeof bookRatings.$inferSelect;

// ---------------------------------------------------------------------------
// User Collections / Shelves (Phase 2)
// ---------------------------------------------------------------------------

export const collections = pgTable("collections", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").default("📚"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("collections_user_id_idx").on(table.userId),
}));

export const collectionBooks = pgTable("collection_books", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => ({
  collectionBookUnique: uniqueIndex("collection_books_unique").on(table.collectionId, table.bookId),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  books: many(collectionBooks),
}));

export const collectionBooksRelations = relations(collectionBooks, ({ one }) => ({
  collection: one(collections, { fields: [collectionBooks.collectionId], references: [collections.id] }),
  book: one(books, { fields: [collectionBooks.bookId], references: [books.id] }),
}));

export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCollectionBookSchema = createInsertSchema(collectionBooks).omit({ id: true, addedAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollectionBook = z.infer<typeof insertCollectionBookSchema>;
export type CollectionBook = typeof collectionBooks.$inferSelect;

// ---------------------------------------------------------------------------
// Reading Sessions (Phase 3)
// ---------------------------------------------------------------------------

export const readingSessions = pgTable("reading_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"),
  pagesRead: integer("pages_read"),
  mode: text("mode").notNull().default("read"), // 'read' | 'listen'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userBookIdx: index("reading_sessions_user_book_idx").on(table.userId, table.bookId),
  userStartedIdx: index("reading_sessions_user_started_idx").on(table.userId, table.startedAt),
}));

export const readingSessionsRelations = relations(readingSessions, ({ one }) => ({
  user: one(users, { fields: [readingSessions.userId], references: [users.id] }),
  book: one(books, { fields: [readingSessions.bookId], references: [books.id] }),
}));

export const insertReadingSessionSchema = createInsertSchema(readingSessions).omit({ id: true, createdAt: true });
export type InsertReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type ReadingSession = typeof readingSessions.$inferSelect;

// ---------------------------------------------------------------------------
// User Goals (Phase 3)
// ---------------------------------------------------------------------------

export const userGoals = pgTable("user_goals", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalType: text("goal_type").notNull(), // 'books_per_month' | 'minutes_per_day' | 'streak_days' | 'chapters_per_week'
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").notNull().default(0),
  periodStart: timestamp("period_start").notNull().defaultNow(),
  periodEnd: timestamp("period_end"),
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'expired'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userActiveIdx: index("user_goals_user_active_idx").on(table.userId, table.status),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, { fields: [userGoals.userId], references: [users.id] }),
}));

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;

export const CHAKRA_MAP = {
  root: {
    name: "Root",
    sanskrit: "Muladhara",
    color: "#EF4444",
    theme: "Foundation & Routine",
  },
  sacral: {
    name: "Sacral",
    sanskrit: "Svadhisthana",
    color: "#F97316",
    theme: "Creativity & Emotion",
  },
  solar_plexus: {
    name: "Solar Plexus",
    sanskrit: "Manipura",
    color: "#EAB308",
    theme: "Willpower & Action",
  },
  heart: {
    name: "Heart",
    sanskrit: "Anahata",
    color: "#22C55E",
    theme: "Empathy & Connection",
  },
  throat: {
    name: "Throat",
    sanskrit: "Vishuddha",
    color: "#3B82F6",
    theme: "Communication & Truth",
  },
  third_eye: {
    name: "Third Eye",
    sanskrit: "Ajna",
    color: "#6366F1",
    theme: "Cognition & Intuition",
  },
  crown: {
    name: "Crown",
    sanskrit: "Sahasrara",
    color: "#8B5CF6",
    theme: "Purpose & Meaning",
  },
} as const;

export type ChakraType = keyof typeof CHAKRA_MAP;
