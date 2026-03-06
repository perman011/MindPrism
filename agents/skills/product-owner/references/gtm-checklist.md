# Go-to-Market Checklist

Use this checklist to validate readiness at each MindPrism launch phase. No phase advances until all gates in the previous phase are checked.

---

## Phase 0: Private Beta (Invite-Only)

### Product Readiness
- [ ] Core read flow works end-to-end (discover → select → read chapter → mental model)
- [ ] Streak system tracks correctly across sessions and devices
- [ ] Authentication (sign-up, login, logout, password reset) functions without error
- [ ] Stripe subscription checkout completes and activates premium flag
- [ ] Basic error handling: 404, 500, network failure states all show graceful UI
- [ ] Mobile web is usable on iOS Safari and Android Chrome (no layout breaks)

### Content Readiness
- [ ] Minimum 20 books with full completeness score ≥ 75 (see content-scoring-rubric.md)
- [ ] At least 5 books with audio summaries
- [ ] At least 40 mental model cards
- [ ] All books have cover images and descriptions

### Infrastructure Readiness
- [ ] PostgreSQL on production server (not localhost)
- [ ] connect-pg-simple session store active (not MemoryStore)
- [ ] HTTPS enforced on all routes
- [ ] Environment variables rotated from defaults (SESSION_SECRET, STRIPE_SECRET_KEY)
- [ ] Daily database backups configured

### GTM Readiness
- [ ] Positioning statement finalized (see SKILL.md Step 1)
- [ ] 2–3 primary personas defined (see persona-template.md)
- [ ] Beta invite list of 50–100 target users assembled
- [ ] Feedback collection mechanism in place (in-app survey or Typeform)

---

## Phase 1: Public Beta

### Product Readiness
- [ ] Onboarding flow polished (interest selection, first-book recommendation, streak setup)
- [ ] Push notification permission request implemented (post-onboarding, not at signup)
- [ ] Offline reading works for downloaded books
- [ ] PWA install prompt tested on Android Chrome
- [ ] Capacitor iOS and Android builds pass TestFlight / Play Store internal track

### Content Readiness
- [ ] Minimum 50 books at completeness ≥ 75
- [ ] 10+ audio summaries
- [ ] 100+ mental model cards
- [ ] 20+ shorts published

### Growth Readiness
- [ ] Referral system live (codes, tracking, reward fulfilment)
- [ ] Email lifecycle: Day 0 welcome and Day 3 streak email active
- [ ] Analytics funnel instrumented (registration → aha moment → premium upsell → conversion)
- [ ] A/B testing framework deployed (feature_flags table, flag resolver endpoint)

### GTM Readiness
- [ ] App Store listing copy finalized (title, subtitle, description, keywords)
- [ ] Play Store listing copy finalized
- [ ] Press kit ready (logo pack, screenshots, founder bio, product description)
- [ ] Social accounts created (Twitter/X, Instagram, LinkedIn) with 3 posts pre-queued
- [ ] Launch announcement blog post drafted

---

## Phase 2: v1.0 General Availability

### Product Readiness
- [ ] App Store submission approved and live
- [ ] Play Store submission approved and live
- [ ] All Tier 1 and Tier 2 KPIs instrumented and reporting in dashboard
- [ ] Stripe production webhooks live (all 6 events handled)
- [ ] Health endpoints (/health, /ready) live and monitored
- [ ] SLA: 99.5% uptime for 30 consecutive days in beta

### Revenue Readiness
- [ ] Pricing page live on web with annual plan prominently featured
- [ ] In-app purchase products registered in App Store Connect and Play Console
- [ ] Free tier limitations enforced (3 book cap, no audio, no offline)
- [ ] Premium upsell shown at correct conversion triggers

### GTM Readiness
- [ ] PR outreach sent to 10+ relevant publications (Hacker News, Product Hunt, psychology blogs)
- [ ] Product Hunt launch scheduled
- [ ] Influencer/creator partnership outreach sent (psychology YouTubers, newsletter authors)
- [ ] Content marketing: 4 SEO articles published targeting priority keywords
- [ ] Paid acquisition test budget allocated ($500–1,000 for initial CAC measurement)

### Success Gate for Phase 2 → Growth
- [ ] 1,000 registered users
- [ ] 10% weekly retention at Day 7
- [ ] 5% free-to-premium conversion rate
- [ ] MRR ≥ $1,000

---

## Phase 3: Growth

### Growth Levers to Activate
- [ ] Referral program scaled (double-sided reward in place)
- [ ] SEO: target 50 long-tail keywords with book summary pages
- [ ] Institutional/team plan launched (B2B licensing for therapists, coaches, HR)
- [ ] API for partner integrations scoped (e.g., Notion widget, Obsidian plugin)
- [ ] Localization: one non-English market prioritized (Spanish or German)

### Retention Depth
- [ ] Streak recovery (1 free per month, additional as premium perk) live
- [ ] Weekly digest email active with personalized content recommendations
- [ ] Social proof mechanisms: "X people read this book this week" copy

### Success Gate: Series A Signal
- [ ] 10,000 MAU
- [ ] 30-day retention ≥ 20%
- [ ] LTV/CAC ratio ≥ 3:1
- [ ] MRR ≥ $10,000
