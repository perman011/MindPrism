#!/usr/bin/env python3
"""Scaffold Product Owner deliverable files for a MindPrism planning cycle."""
from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  Wrote {path}")


def competitive_matrix(out: Path) -> None:
    write(
        out / "competitive-matrix.md",
        f"""# Competitive Positioning Matrix
Generated: {date.today()}

## Positioning Statement

> MindPrism is the only app that [differentiator] for [target user] who want [outcome].

**Fill in the blanks before using this document in stakeholder communication.**

---

## Competitor Comparison

| Dimension | MindPrism | Blinkist | Headway | Shortform | Imprint |
|-----------|-----------|----------|---------|-----------|---------|
| Content depth | TODO | TODO | TODO | TODO | TODO |
| Audio quality | TODO | TODO | TODO | TODO | TODO |
| Mental model density | TODO | TODO | TODO | TODO | TODO |
| Personalization | TODO | TODO | TODO | TODO | TODO |
| Price (monthly) | TODO | $15.99 | $11.99 | $19.99 | $9.99 |
| Offline support | TODO | Yes | Yes | No | Yes |
| Gamification | TODO | Basic | Basic | None | None |
| Platform | TODO | iOS/Android/Web | iOS/Android | Web | iOS/Android |

---

## Differentiation Summary

**Primary differentiator:**
TODO

**Secondary differentiators:**
1. TODO
2. TODO
3. TODO

**Known weaknesses vs. competitors:**
1. TODO
2. TODO

---

## Positioning Axes (2×2 Matrix)

Choose two dimensions and plot MindPrism vs. top 3 competitors:

- X-axis: [Content Breadth ←→ Content Depth]
- Y-axis: [Passive Consumption ←→ Active Learning]

```
           Active Learning
                ^
                |
  Shortform     |      MindPrism (target)
                |
--Blinkist------+------Headway----------->
                |                  Content Depth
  Imprint       |
                |
           Passive Consumption
```

---

## Actions

- [ ] Validate pricing against App Store/Play Store listings
- [ ] Confirm feature matrix with product audit
- [ ] Circulate to leadership for positioning sign-off
""",
    )


def persona_profiles(out: Path, personas: list[str]) -> None:
    for name in personas:
        slug = name.lower().replace(" ", "-")
        write(
            out / f"persona-{slug}.md",
            f"""# Persona: {name}
Generated: {date.today()}

> One-sentence archetype: "The [adjective] [role] who [goal]."

---

## Demographics

| Field | Value |
|-------|-------|
| Age range | TODO |
| Location | TODO |
| Occupation | TODO |
| Education | TODO |
| Income bracket | TODO |
| Primary device | TODO |
| Platform preference | TODO |

---

## Job-to-be-Done

> "When I [situation], I want to [motivation], so I can [outcome]."

- **Situation:** TODO
- **Motivation:** TODO
- **Outcome:** TODO

---

## Frustrations with Existing Tools

| Tool | Frustration |
|------|-------------|
| Blinkist | TODO |
| Audible | TODO |
| Kindle | TODO |

---

## Premium Trigger

> The one feature that would make {name} upgrade: TODO

---

## Content Vertical Affinity (rank 1–5)

1. TODO
2. TODO
3. TODO
4. TODO
5. TODO
""",
        )


def rice_backlog(out: Path) -> None:
    write(
        out / "rice-backlog.md",
        f"""# Feature Backlog — RICE Scoring
Generated: {date.today()}

## Scoring Methodology

RICE = (Reach × Impact × Confidence%) / Effort (person-weeks)

- **Reach:** Estimated weekly active users impacted
- **Impact:** 1 (low), 2 (medium), 3 (high)
- **Confidence:** 0–100% (how certain are we of reach and impact estimates)
- **Effort:** Person-weeks to implement

## MoSCoW Thresholds
- Must Have: RICE > 100 AND blocks monetization or retention
- Should Have: RICE 40–100
- Could Have: RICE < 40
- Won't Have This Cycle: deferred

---

## Backlog

| Feature | Reach | Impact | Confidence | Effort | RICE | MoSCoW | Notes |
|---------|-------|--------|------------|--------|------|---------|-------|
| TODO Feature 1 | 0 | 0 | 0% | 0 | 0 | TODO | TODO |
| TODO Feature 2 | 0 | 0 | 0% | 0 | 0 | TODO | TODO |
| TODO Feature 3 | 0 | 0 | 0% | 0 | 0 | TODO | TODO |
| TODO Feature 4 | 0 | 0 | 0% | 0 | 0 | TODO | TODO |
| TODO Feature 5 | 0 | 0 | 0% | 0 | 0 | TODO | TODO |

---

## Top 10 Prioritized Features

1. TODO
2. TODO
3. TODO
4. TODO
5. TODO
6. TODO
7. TODO
8. TODO
9. TODO
10. TODO

---

## Deferred (Won't Have This Cycle)

- TODO
- TODO
""",
    )


def kpi_dashboard(out: Path) -> None:
    write(
        out / "kpi-dashboard.md",
        f"""# KPI Dashboard Definition
Generated: {date.today()}

## Tier 1 — North Star Metric

**Weekly Active Readers (WAR)**
Definition: Users who complete ≥1 chapter or mental model in a calendar week.

| Baseline | Target | Alert Threshold |
|----------|--------|-----------------|
| TODO | TODO | TODO |

Analytics event: `chapter_completed` OR `mental_model_viewed`

---

## Tier 2 — Revenue Metrics

| KPI | Definition | Baseline | Target | Alert |
|-----|-----------|---------|--------|-------|
| Free-to-Premium Conversion | % free users who upgrade in 30 days | TODO | 10% | <3% |
| MRR | Monthly recurring revenue (Stripe) | $TODO | $TODO | -10% MoM |
| Churn Rate | % premium users who cancel per month | TODO | <3% | >8% |
| LTV | Average revenue per user over lifetime | $TODO | $TODO | — |
| CAC | Cost to acquire one premium user | $TODO | $TODO | >LTV/3 |

---

## Tier 3 — Engagement Metrics

| KPI | Definition | Baseline | Target | Alert |
|-----|-----------|---------|--------|-------|
| D7 Retention | % of new users still active on Day 7 | TODO | 30% | <15% |
| D30 Retention | % of new users still active on Day 30 | TODO | 20% | <8% |
| Streak D7 | % of users with 7-day reading streak | TODO | 25% | <10% |
| Journal Frequency | Avg journal entries per active user per week | TODO | 2.0 | <0.5 |
| Shorts Completion | % of started shorts completed | TODO | 70% | <40% |
| Push CTR | Push notification click-through rate | TODO | 15% | <5% |

---

## Analytics Gaps (Events to Instrument)

| KPI | Missing Event | Table | Owner |
|-----|--------------|-------|-------|
| TODO KPI | TODO event | analytics_events | TODO |

---

## Reporting Cadence

- Weekly: WAR, D7 retention, streak D7
- Monthly: MRR, churn, LTV/CAC, D30 retention
- Quarterly: Full KPI review + OKR alignment
""",
    )


def gtm_plan(out: Path) -> None:
    write(
        out / "gtm-plan.md",
        f"""# Go-to-Market Plan
Generated: {date.today()}

## Phase Map

| Phase | Status | Target Segment | Success Gate |
|-------|--------|---------------|--------------|
| Phase 0: Private Beta | TODO | Invite-only (50–100 users) | 40% D7 retention |
| Phase 1: Public Beta | TODO | Early adopters | 1,000 users, 5% conversion |
| Phase 2: v1.0 GA | TODO | Broad consumer | App Store + Play Store live |
| Phase 3: Growth | TODO | Scale | 10,000 MAU, LTV/CAC ≥ 3 |

---

## Phase 0: Private Beta

**Start date:** TODO
**End date / Gate:** TODO

**Activation channel:** Direct outreach, invite codes
**Content requirement:** 20 books at completeness ≥ 75
**Feedback mechanism:** In-app survey (Typeform embed)

**Success gate to advance:**
- [ ] 40% D7 retention across beta cohort
- [ ] No P0 bugs in auth, checkout, or streak flows
- [ ] NPS ≥ 30 from beta survey

---

## Phase 1: Public Beta

**Launch date:** TODO

**Activation channels:**
1. TODO (e.g., App Store organic, TestFlight)
2. TODO (e.g., Product Hunt soft launch)
3. TODO (e.g., Twitter/X content thread)

**Content requirement:** 50 books, 10 audio summaries
**Growth requirement:** Referral system live, email lifecycle D0–D14 active

**Success gate to advance:**
- [ ] 1,000 registered users
- [ ] 5% free-to-premium conversion
- [ ] MRR ≥ $1,000

---

## Phase 2: v1.0 General Availability

**Launch date:** TODO

**Launch activities:**
- [ ] Product Hunt launch
- [ ] Press outreach (10 publications)
- [ ] Influencer partnership (2–3 psychology creators)
- [ ] 4 SEO articles published

**Paid acquisition:**
- Budget: $TODO
- Channels: TODO (App install ads, content ads)
- CAC target: ≤ $TODO

---

## Content Marketing Pillars

1. **Cognitive biases** — "The 12 cognitive biases you use every day" (SEO + social)
2. **Psychology classics** — Book breakdown threads (Twitter/LinkedIn)
3. **Mental models** — "One mental model every Monday" newsletter
4. **Personal growth** — "What [Book] taught me about [life topic]" essays
5. **Productivity** — Cross-promotion with productivity tool communities

---

## Rollback Criteria

If any phase gate is not met within [N] weeks of target date:
1. Pause paid acquisition
2. Convene retrospective within 48 hours
3. Revise phase success gates or extend timeline with stakeholder approval
""",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Scaffold Product Owner deliverable files.")
    parser.add_argument(
        "--personas",
        default="Ambitious Professional,Lifelong Learner,Therapist Coach",
        help="Comma-separated persona names (default: 3 archetypes)",
    )
    parser.add_argument("--out", default="output/product-owner")
    args = parser.parse_args()

    out = Path(args.out)
    persona_list = [p.strip() for p in args.personas.split(",") if p.strip()]

    print(f"Scaffolding Product Owner packet → {out}/")
    competitive_matrix(out)
    persona_profiles(out, persona_list)
    rice_backlog(out)
    kpi_dashboard(out)
    gtm_plan(out)
    print(f"\nDone. {5 + len(persona_list) - 1} files written to {out}/")
    print("Fill in all TODO placeholders before sharing with stakeholders.")


if __name__ == "__main__":
    main()
