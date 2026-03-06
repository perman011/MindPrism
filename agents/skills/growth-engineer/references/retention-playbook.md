# Retention Playbook

A catalog of retention mechanics, trigger logic, copy templates, and email lifecycle flows for MindPrism.

---

## 1. Streak Mechanics

### Streak Rules
- A streak day is earned when a user completes at least one reading session (≥1 chapter, ≥1 mental model, or ≥5 minutes reading time) within a calendar day in their local timezone.
- Streak resets at midnight local time if no session occurred.
- Streak freeze: premium users receive 1 free streak freeze per month. Activating a freeze preserves the streak through one missed day. Additional freezes are purchasable (see IAP).

### Streak Milestone Notifications
| Milestone | Message | Action |
|-----------|---------|--------|
| Day 3 | "3 days strong! You're building a real habit." | Confetti animation |
| Day 7 | "One week! You've read more than 90% of users." | Badge unlock |
| Day 14 | "Two weeks! Your streak is officially a habit." | Achievement + share CTA |
| Day 30 | "30-day legend! You're in the top 1% of readers." | Premium upsell (if free) |
| Day 100 | "100 days. You're a MindPrism Scholar." | Exclusive badge + email |

### Streak-at-Risk Logic
- Trigger: user has not opened the app by 7pm local time on a day their streak is active.
- Notification: "Don't break your [N]-day streak! Read for just 5 minutes tonight."
- Cooldown: do not send streak-at-risk notification more than once per day.

---

## 2. Re-engagement Triggers

| Trigger | Condition | Channel | Message |
|---------|-----------|---------|---------|
| Lapsed (3 days) | No session in 3 calendar days | Push + Email | "We miss you. [Book title] is waiting for you." |
| Lapsed (7 days) | No session in 7 days | Email only | "Your reading list is getting dusty. Here's what's new." |
| Lapsed (14 days) | No session in 14 days | Email only | "Come back — we've added [N] new books." |
| Lapsed (30 days) | No session in 30 days | Email only | "Is MindPrism still right for you? Here's what you've missed." |
| Streak broken | Streak reset to 0 | Push (within 1hr) | "Your streak ended, but your progress didn't. Start again today." |

---

## 3. Weekly Recap Email

**Send time:** Sunday 9am local timezone
**Subject line variants (A/B test):**
- A: "Your week in review: [N] insights from [Book title]"
- B: "You read [N] days this week — here's what you learned"

**Body structure:**
1. This week's reading summary (books touched, chapters read, mental models unlocked)
2. Streak status ("Current streak: N days")
3. Featured mental model (one from a book they haven't started yet — discovery hook)
4. Upcoming: new books added this week
5. CTA: "Continue reading →"

---

## 4. Email Lifecycle Map

| Day | Trigger | Subject | Goal |
|-----|---------|---------|------|
| 0 | Sign-up | "Welcome to MindPrism — your first book is waiting" | Activate (first session) |
| 1 | No first session | "Your reading journey starts with one chapter" | Activation nudge |
| 3 | First streak day | "3 days in — you're on a roll 🔥" | Streak reinforcement |
| 7 | 7-day streak OR day 7 since signup | "One week of growth — here's what you've built" | Celebrate + deepen |
| 10 | Free user, no premium action | "Unlock [feature] — try premium free for 7 days" | First upsell |
| 14 | Day 14 | "Your mental model library is growing" | Re-engage + social proof |
| 21 | No premium, 3+ books read | "You've read [N] books. Premium users read 10x more." | Conversion push |
| 30 | Active user | "30 days in — you're a MindPrism regular" | Power-user milestone |
| 60 | Premium subscriber | "Thank you for 2 months — here's what's new" | Retention |

---

## 5. Push Notification Taxonomy

### Transactional (always send, no frequency cap)
- New book added in a user's interest vertical
- Streak freeze about to expire
- Payment failed (subscription renewal)

### Behavioral (capped at 1/day max)
- Streak-at-risk (7pm local time if no session)
- Re-engagement (3-day lapse)
- Weekly recap summary available

### Promotional (max 2/week, honor quiet hours)
- Limited-time offer: "Get annual plan — save 40% this weekend"
- New feature launch: "Audio summaries are here — listen to [Book]"
- Social proof: "127 people finished [Book] this week"

### Quiet Hours
- No push notifications between 10pm and 7am in user's local timezone.
- Store `notificationPreferences.quietHoursEnabled` (default: true) in user profile.

---

## 6. Cohort Retention Benchmarks

Use these as targets when evaluating A/B test results and growth experiments:

| Metric | Current Baseline | Phase 1 Target | Phase 2 Target |
|--------|-----------------|----------------|----------------|
| D1 retention | — | 40% | 50% |
| D7 retention | — | 20% | 30% |
| D30 retention | — | 10% | 20% |
| Streak D7 (users with 7-day streak) | — | 15% | 25% |
| Free-to-premium conversion | — | 5% | 10% |
| Email open rate | — | 30% | 40% |
| Push CTR | — | 8% | 15% |
