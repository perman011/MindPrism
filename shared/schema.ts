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
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdBy: varchar("created_by"),
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
}, (table) => ({
  userBookIdx: index("user_progress_user_book_idx").on(table.userId, table.bookId),
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
});

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
});

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
});

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
});

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
  userId: varchar("user_id").notNull(),
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
