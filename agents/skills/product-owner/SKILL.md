---
name: product-owner
description: Drive product strategy, market positioning, and go-to-market execution for MindPrism. Use when a user asks for competitive analysis, user persona definition, feature prioritization, MoSCoW or RICE scoring, go-to-market planning, revenue modeling, pricing strategy, KPI definition, or stakeholder communication.
---

# Product Owner

Define what to build, for whom, and why — then align the team and market around it.

## Workflow

1. Anchor on market position.
- Identify MindPrism's differentiators against competitors (Blinkist, Headway, Shortform, Imprint, Subtext).
- Map the competitive landscape across four axes: content depth, audio quality, mental model density, and personalization.
- Produce a positioning statement: "MindPrism is the only app that [differentiator] for [target user] who want [outcome]."
- Reference `references/gtm-checklist.md` for positioning validation gates.

2. Define and validate user personas.
- Use `references/persona-template.md` to build 2–3 primary personas (e.g., Ambitious Professional, Lifelong Learner, Therapist/Coach).
- For each persona define: demographics, psychographics, primary job-to-be-done, trigger events, frustrations with existing tools, and willingness-to-pay signal.
- Map each persona to a MindPrism content vertical (books, mental models, shorts, journaling).
- Validate personas against existing analytics data in the `user_analytics` table (session frequency, streak data, premium conversion rate by cohort).

3. Prioritize features with RICE scoring.
- Pull the current feature backlog. Score each candidate with: Reach (weekly active users impacted), Impact (1–3 scale), Confidence (%), Effort (person-weeks).
- Compute RICE = (Reach × Impact × Confidence) / Effort.
- Apply MoSCoW after RICE: Must Have (RICE > 100 and blocks monetization or retention), Should Have (RICE 40–100), Could Have (RICE < 40), Won't Have This Cycle.
- Output a ranked feature list with rationale for top 10.

4. Define KPIs and success metrics.
- Tier 1 (North Star): Weekly Active Readers (users who complete ≥1 chapter or mental model per week).
- Tier 2 (Revenue): Free-to-premium conversion rate, MRR, churn rate, LTV/CAC ratio.
- Tier 3 (Engagement): Streak retention D7/D30, journal entry frequency, shorts completion rate, push notification CTR.
- Instrument each KPI against an existing analytics event or identify the gap event to add.
- Set baseline, target, and alert threshold for each KPI.

5. Build revenue model and pricing strategy.
- Evaluate three models: freemium (current), annual subscription ($59.99/yr target), and team/institutional licensing.
- Map feature gates: free tier (3 books, 10 mental models, no audio), premium tier (unlimited, audio, offline, journal export, streak recovery).
- Model LTV scenarios at 5%, 10%, and 15% free-to-premium conversion with current WAU base.
- Evaluate Stripe pricing table configuration in `server/stripe-routes.ts` against proposed tier structure.

6. Create go-to-market plan.
- Use `references/gtm-checklist.md` as the structural backbone.
- Define launch phases: Private Beta → Public Beta → v1.0 GA → Growth.
- Per phase specify: target segment, activation channel (content marketing, App Store optimization, referral), success gate to advance, and rollback criteria.
- Identify content marketing pillars aligned with MindPrism's psychology-book focus (mental health, productivity, relationships, philosophy).

7. Prepare stakeholder communication.
- Produce a one-pager: problem, solution, market size, traction, roadmap, ask.
- Produce a weekly product update template: shipped last week, shipping this week, blockers, metrics delta.
- Produce a board-level OKR summary with three objectives mapped to Q-level key results.

## Output Contract

Return:
- Competitive positioning matrix
- Persona profiles (2–3)
- RICE-scored feature backlog
- KPI dashboard definition
- Revenue model scenarios
- Go-to-market phase plan
- Stakeholder one-pager

## Resources

- `scripts/create_po_packet.py` scaffolds all PO deliverable files.
- `references/persona-template.md` defines the standard persona structure.
- `references/gtm-checklist.md` defines go-to-market validation gates by phase.
