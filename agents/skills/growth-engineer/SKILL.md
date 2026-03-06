---
name: growth-engineer
description: Design and implement growth systems that increase activation, retention, and revenue for MindPrism. Use when a user asks for onboarding funnel optimization, retention mechanics, viral loops, referral programs, A/B testing, push notification strategy, email lifecycle campaigns, conversion rate optimization, or gamification design.
---

# Growth Engineer

Build the systems that turn new sign-ups into daily readers and free users into paying subscribers.

## Workflow

1. Audit the onboarding funnel.
- Map every step from sign-up to "aha moment" (first completed chapter or mental model).
- Instrument funnel stages in the analytics pipeline: registration → profile setup → first book selected → first chapter read → streak day 1 → streak day 3 → premium upsell shown → premium converted.
- Query `user_analytics` table for drop-off rate at each stage. Flag any step with >30% drop-off as a priority repair.
- Evaluate the current onboarding UI in `client/src/pages/` for friction points: required fields, time-to-value, skip options, and personalization hooks (interest selection, goal setting).

2. Design retention mechanics.
- Streaks: audit `streakData` logic in the frontend streak chart. Ensure streak freeze/recovery is available as a premium perk. Add streak milestone notifications at D3, D7, D14, D30, D100.
- Re-engagement: define re-engagement triggers — lapsed user (no session in 3 days), streak-at-risk (no session by 8pm local time), weekly recap (Sunday summary of books read, mental models learned).
- Notification timing: A/B test delivery times (morning 7am vs. evening 7pm) per user timezone. Store `notificationPreferences` in user profile table.
- Use `references/retention-playbook.md` as the mechanics catalog.

3. Build viral loops and referral systems.
- Design a referral flow: referrer gets 1 month free premium, referee gets 14-day premium trial.
- Add a `referral_codes` table (code, user_id, uses, created_at) via Drizzle migration.
- Implement share CTA on: book completion screen, mental model unlock, streak milestones.
- Generate shareable social cards via canvas (book cover + "I just mastered [Book Title] on MindPrism") using the existing canvas-confetti dependency as a template for canvas usage.

4. Implement A/B testing framework.
- Add a `feature_flags` table (flag_name, user_cohort, value, created_at) via Drizzle migration.
- Implement a lightweight server-side flag resolver in `server/routes.ts`: evaluate flag by user ID hash bucket.
- Expose `/api/flags` endpoint that returns active flags for the authenticated user.
- First A/B tests to run: onboarding skip vs. no-skip, streak recovery copy variants, premium upsell placement (post-chapter vs. paywall gate).

5. Design push notification strategy.
- Integrate FCM for Android and APNs for iOS via Capacitor Push Notifications plugin.
- Define notification taxonomy: transactional (streak at risk, new book added), behavioral (re-engagement, weekly recap), promotional (limited-time premium offer).
- Add `notification_log` table (user_id, type, sent_at, opened_at, action_taken) for CTR tracking.
- Implement quiet hours: no notifications between 10pm–7am user local time.

6. Build email lifecycle campaigns.
- Map trigger events to email sends: Day 0 welcome, Day 1 first-book nudge, Day 3 streak celebration, Day 7 weekly recap, Day 14 premium upsell, Day 30 power-user milestone.
- Store `email_preferences` (user_id, unsubscribed, frequency) in the user table via Drizzle migration.
- Use `references/retention-playbook.md` email templates section for copy scaffolds.
- Integrate with a transactional email provider (SendGrid or Resend) via environment variable `EMAIL_PROVIDER_API_KEY`.

7. Optimize free-to-premium conversion.
- Identify the top three content paywall gates: chapter 4+ of any book, all audio content, offline reading.
- A/B test paywall copy: value-led ("Unlock 500+ psychology books") vs. scarcity-led ("Only 3 books left in your free plan").
- Add conversion event tracking: `premium_upsell_shown`, `premium_upsell_clicked`, `checkout_started`, `checkout_completed`, `checkout_abandoned`.
- Run `scripts/generate_growth_audit.py` to baseline current conversion metrics before any experiment.

## Output Contract

Return:
- Onboarding funnel drop-off analysis
- Retention mechanics spec
- Referral system data model and flow
- A/B test plan with hypothesis, metric, and sample size
- Push notification taxonomy and schedule
- Email lifecycle map
- Conversion optimization experiment backlog

## Resources

- `scripts/generate_growth_audit.py` scaffolds a growth audit markdown report.
- `references/retention-playbook.md` catalogs retention mechanics, trigger logic, and copy templates.
- `references/gamification-framework.md` defines badge, level, and achievement schemas.
