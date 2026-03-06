# Gamification Framework

A structured system for badges, levels, achievements, and experience points (XP) in MindPrism.

---

## 1. Design Principles

1. **Reward behavior, not just outcomes.** Badge for "Read 5 days in a row" not just "Read 100 books."
2. **Make progress visible.** Show XP bars, level names, and next-milestone distance on the profile screen.
3. **Tie to content discovery.** Achievements should surface unexplored verticals ("Try your first Relationships book").
4. **Never punish.** Streaks can freeze; XP never decays. Progress is always permanent.
5. **Premium perks, not paywalled achievements.** All achievements are earnable for free users; premium gets cosmetic boosts (badge colors, streak recovery) only.

---

## 2. Experience Points (XP) System

### XP Awards

| Action | XP Earned |
|--------|-----------|
| Complete a chapter summary | 10 XP |
| Complete a full book | 50 XP bonus |
| Unlock a mental model | 15 XP |
| Complete a short | 5 XP |
| Write a journal entry | 20 XP |
| Maintain a reading streak (per day) | 5 XP/day |
| Reach a streak milestone (7/14/30/100) | 50 XP bonus |
| Refer a friend who signs up | 100 XP |
| Complete onboarding | 25 XP |

### XP Data Model (Drizzle)

```typescript
export const xpEvents = pgTable('xp_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  eventType: text('event_type').notNull(),  // 'chapter_complete', 'mental_model', etc.
  xpAmount: integer('xp_amount').notNull(),
  referenceId: integer('reference_id'),     // book_id, chapter_id, etc.
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 3. Level System

| Level | Name | XP Required | Unlock |
|-------|------|-------------|--------|
| 1 | Curious Mind | 0 | — |
| 2 | Eager Reader | 100 | Profile frame: Blue |
| 3 | Bookworm | 300 | Streak freeze 1/month |
| 4 | Deep Thinker | 700 | Profile frame: Purple |
| 5 | Mental Model Builder | 1,500 | Custom avatar accent |
| 6 | Philosophy Seeker | 3,000 | "Scholar" badge on profile |
| 7 | Knowledge Architect | 6,000 | Profile frame: Gold |
| 8 | MindPrism Scholar | 12,000 | Exclusive "Scholar" role + community flair |

---

## 4. Badge Catalog

### Streak Badges
| Badge | Trigger |
|-------|---------|
| Spark | 3-day streak |
| Flame | 7-day streak |
| Torch | 14-day streak |
| Bonfire | 30-day streak |
| Eternal Flame | 100-day streak |

### Reading Volume Badges
| Badge | Trigger |
|-------|---------|
| First Chapter | Complete first chapter |
| First Book | Complete first book |
| Bookshelf | Complete 5 books |
| Library Card | Complete 20 books |
| Librarian | Complete 50 books |

### Mental Model Badges
| Badge | Trigger |
|-------|---------|
| Pattern Spotter | Unlock 5 mental models |
| Framework Builder | Unlock 25 mental models |
| Systems Thinker | Unlock 100 mental models |

### Content Vertical Badges (one per vertical)
| Badge | Trigger |
|-------|---------|
| Cognitive Explorer | Complete 3 Cognition books |
| Relationship Expert | Complete 3 Relationships books |
| Productivity Pro | Complete 3 Productivity books |
| Mental Health Advocate | Complete 3 Mental Health books |
| Philosopher | Complete 3 Philosophy books |
| Renaissance Mind | All 5 vertical badges earned |

### Engagement Badges
| Badge | Trigger |
|-------|---------|
| Journaling Habit | Write 7 journal entries |
| Audio Learner | Listen to 5 audio summaries |
| Shorts Lover | Watch 20 shorts |
| Social Learner | Refer 1 friend |
| Ambassador | Refer 5 friends |

---

## 5. Achievements (Multi-Step Milestones)

Achievements differ from badges in that they have visible progress bars and multi-step unlock sequences.

| Achievement | Steps | Reward |
|-------------|-------|--------|
| The Completionist | Complete 1 / 5 / 10 / 25 full books | XP bonus per tier |
| The Polymath | Earn vertical badges in 3 / 5 verticals | XP + "Renaissance Mind" badge |
| Habit Former | 7-day / 30-day / 100-day streaks | XP + level-up |
| The Archivist | Unlock 25 / 50 / 100 mental models | XP bonus per tier |
| Community Pillar | Refer 1 / 3 / 5 friends | XP + free premium months |

---

## 6. UI Components Required

- `XPProgressBar` — Displays current XP, level name, and XP to next level. Lives on Profile screen.
- `BadgeGrid` — Earned badges displayed as icons. Locked badges shown as grayed silhouettes.
- `AchievementCard` — Shows achievement name, progress (e.g., 3/5 books), and reward preview.
- `StreakMilestoneModal` — Full-screen celebration modal on streak milestone hit. Includes confetti (canvas-confetti) and share CTA.
- `XPToast` — Non-blocking toast notification: "+15 XP — Mental Model Unlocked!"

---

## 7. Anti-Gaming Rules

- Journal entries earn XP only once per day (no farming with short entries).
- Shorts XP capped at 5 per day.
- Chapter XP requires scroll depth ≥ 80% (track via IntersectionObserver in chapter-reader.tsx).
- Referral XP awarded only after referee completes onboarding (not just sign-up).
