import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  isPremium: boolean("is_premium").default(false),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Phase 1: New user data fields
  lastLoginAt: timestamp("last_login_at"),
  signupSource: text("signup_source"),
  referralCode: varchar("referral_code"),
  preferredReadMode: text("preferred_read_mode").default("read"),
  timezone: text("timezone"),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
});

export const ROLE_HIERARCHY = ["user", "writer", "editor", "admin", "super_admin"] as const;
export type UserRole = (typeof ROLE_HIERARCHY)[number];

export function hasMinRole(userRole: string | null | undefined, minRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as any);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return userIndex >= minIndex;
}

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
