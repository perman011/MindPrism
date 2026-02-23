import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  categoryId: varchar("category_id").references(() => categories.id),
  readTime: integer("read_time").notNull(),
  listenTime: integer("listen_time").notNull(),
  audioUrl: text("audio_url"),
  featured: boolean("featured").default(false),
});

export const principles = pgTable("principles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
  icon: text("icon"),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
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
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, { fields: [books.categoryId], references: [categories.id] }),
  principles: many(principles),
  stories: many(stories),
  exercises: many(exercises),
}));

export const principlesRelations = relations(principles, ({ one }) => ({
  book: one(books, { fields: [principles.bookId], references: [books.id] }),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  book: one(books, { fields: [stories.bookId], references: [books.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  book: one(books, { fields: [exercises.bookId], references: [books.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  book: one(books, { fields: [userProgress.bookId], references: [books.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [journalEntries.exerciseId], references: [exercises.id] }),
}));

export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export const insertPrincipleSchema = createInsertSchema(principles).omit({ id: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

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
