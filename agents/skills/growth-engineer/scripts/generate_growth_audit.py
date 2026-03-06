#!/usr/bin/env python3
"""Generate a growth audit report for MindPrism with placeholder sections."""
from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MindPrism growth audit report.")
    parser.add_argument(
        "--wau",
        default="0",
        help="Current weekly active users (integer)",
    )
    parser.add_argument(
        "--mau",
        default="0",
        help="Current monthly active users (integer)",
    )
    parser.add_argument(
        "--mrr",
        default="0",
        help="Current monthly recurring revenue in USD (integer)",
    )
    parser.add_argument(
        "--conversion-rate",
        default="0",
        help="Current free-to-premium conversion rate as decimal (e.g. 0.05 for 5%%)",
    )
    parser.add_argument("--out", default="output/growth/growth-audit.md")
    args = parser.parse_args()

    wau = int(args.wau)
    mau = int(args.mau)
    mrr = int(args.mrr)
    conversion = float(args.conversion_rate)
    conversion_pct = f"{conversion * 100:.1f}%"
    premium_users = int(mau * conversion) if mau else 0

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []

    lines += [
        f"# MindPrism Growth Audit",
        f"Generated: {date.today()}",
        "",
        "---",
        "",
        "## 1. Current Baseline",
        "",
        "| Metric | Value | Target | Gap |",
        "|--------|-------|--------|-----|",
        f"| Weekly Active Users (WAU) | {wau:,} | TODO | TODO |",
        f"| Monthly Active Users (MAU) | {mau:,} | TODO | TODO |",
        f"| Monthly Recurring Revenue | ${mrr:,} | TODO | TODO |",
        f"| Free-to-Premium Conversion | {conversion_pct} | 10% | TODO |",
        f"| Estimated Premium Users | {premium_users:,} | TODO | TODO |",
        "| D7 Retention | TODO | 30% | TODO |",
        "| D30 Retention | TODO | 20% | TODO |",
        "| Streak D7 (7-day streak %) | TODO | 25% | TODO |",
        "| Push Notification CTR | TODO | 15% | TODO |",
        "| Email Open Rate | TODO | 35% | TODO |",
        "",
        "---",
        "",
        "## 2. Onboarding Funnel Analysis",
        "",
        "| Step | Users | Drop-off Rate | Status |",
        "|------|-------|---------------|--------|",
        "| App install / sign-up page | TODO | — | TODO |",
        "| Registration completed | TODO | TODO% | TODO |",
        "| Interest selection completed | TODO | TODO% | TODO |",
        "| First book selected | TODO | TODO% | TODO |",
        "| First chapter read | TODO | TODO% | TODO |",
        "| Streak day 1 achieved | TODO | TODO% | TODO |",
        "| Streak day 3 achieved | TODO | TODO% | TODO |",
        "| Premium upsell shown | TODO | TODO% | TODO |",
        "| Premium conversion | TODO | TODO% | TODO |",
        "",
        "**Priority repairs (>30% drop-off):**",
        "- [ ] TODO: Step with highest drop-off",
        "- [ ] TODO",
        "",
        "---",
        "",
        "## 3. Retention Mechanics Audit",
        "",
        "| Mechanic | Status | Notes |",
        "|----------|--------|-------|",
        "| Streak system | TODO (active/partial/missing) | TODO |",
        "| Streak freeze (premium) | TODO | TODO |",
        "| Streak-at-risk push notification | TODO | TODO |",
        "| Streak milestone celebrations (D3/D7/D30) | TODO | TODO |",
        "| Re-engagement push (3-day lapse) | TODO | TODO |",
        "| Re-engagement email (7-day lapse) | TODO | TODO |",
        "| Weekly recap email (Sunday) | TODO | TODO |",
        "| Badge / achievement unlocks | TODO | TODO |",
        "| XP progress bar | TODO | TODO |",
        "",
        "---",
        "",
        "## 4. Viral and Referral Audit",
        "",
        "| Item | Status |",
        "|------|--------|",
        "| Referral code system (referral_codes table) | TODO |",
        "| Share CTA on book completion | TODO |",
        "| Share CTA on streak milestone | TODO |",
        "| Social card generation on completion | TODO |",
        "| Double-sided reward configured | TODO |",
        "| Referral tracking in analytics | TODO |",
        "",
        f"**Estimated viral coefficient (K-factor):** TODO",
        f"**Target K-factor:** 0.3+ for organic growth loop",
        "",
        "---",
        "",
        "## 5. A/B Test Backlog",
        "",
        "| Test | Hypothesis | Primary Metric | Sample Size Needed | Status |",
        "|------|-----------|----------------|-------------------|--------|",
        "| Onboarding: skip vs. required interest selection | Forced selection increases aha-moment rate | D3 retention | TODO | TODO |",
        "| Streak recovery copy: 'Don't lose it' vs. 'Keep going' | Positive framing increases streak recovery purchase | Streak freeze CTR | TODO | TODO |",
        "| Premium upsell: post-chapter vs. paywall gate | Post-chapter placement has higher conversion intent | Premium conversion | TODO | TODO |",
        "| Push time: 7am vs. 7pm | Evening push drives more same-day sessions | Push CTR + session rate | TODO | TODO |",
        "| Paywall copy: value-led vs. scarcity-led | Value copy converts better for this audience | Premium conversion | TODO | TODO |",
        "",
        "**A/B framework status:**",
        "- [ ] feature_flags table migrated",
        "- [ ] /api/flags endpoint live",
        "- [ ] Flag resolver using user ID hash bucket",
        "",
        "---",
        "",
        "## 6. Conversion Rate Optimization",
        "",
        "| Conversion Trigger | Current Rate | Target | Blocker |",
        "|--------------------|-------------|--------|---------|",
        f"| Free-to-Premium (overall) | {conversion_pct} | 10% | TODO |",
        "| Post-chapter upsell CTA | TODO | 8% | TODO |",
        "| Paywall gate conversion | TODO | 12% | TODO |",
        "| Email upsell click-through | TODO | 5% | TODO |",
        "| Annual vs. monthly plan take rate | TODO | 60% annual | TODO |",
        "",
        "---",
        "",
        "## 7. Gamification Status",
        "",
        "| Element | Status | Notes |",
        "|---------|--------|-------|",
        "| XP system (xp_events table) | TODO | TODO |",
        "| Level system (8 levels) | TODO | TODO |",
        "| Streak badges | TODO | TODO |",
        "| Reading volume badges | TODO | TODO |",
        "| Mental model badges | TODO | TODO |",
        "| Vertical badges | TODO | TODO |",
        "| Achievements with progress bars | TODO | TODO |",
        "| XP progress bar on profile | TODO | TODO |",
        "| Streak milestone modal (confetti) | TODO | TODO |",
        "",
        "---",
        "",
        "## 8. Prioritized Growth Actions",
        "",
        "List the top 5 highest-impact growth actions based on this audit:",
        "",
        "1. TODO — Expected impact: TODO — Effort: TODO",
        "2. TODO — Expected impact: TODO — Effort: TODO",
        "3. TODO — Expected impact: TODO — Effort: TODO",
        "4. TODO — Expected impact: TODO — Effort: TODO",
        "5. TODO — Expected impact: TODO — Effort: TODO",
        "",
        "---",
        "",
        "_Fill in all TODO placeholders using analytics data from the user_analytics table and Stripe dashboard._",
    ]

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
