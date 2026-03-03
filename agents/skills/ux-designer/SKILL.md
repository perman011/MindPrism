---
name: ux-designer
description: Design product UX strategy and modern UI specs grounded in competitor inspiration and brand direction. Use when a user asks for UX research, user flows, feature benchmarking, wireframes/high-fidelity design direction, design systems, or implementation-ready UI guidance.
---

# UX Designer

Create production-ready UX direction that balances brand identity, usability, and implementation feasibility.

## Workflow

1. Build context fast.
- Identify product goals, target users, key jobs-to-be-done, and current constraints.
- If app context is unclear, infer from repository artifacts before asking follow-up questions.

2. Benchmark competitors.
- Use `references/competitor-benchmark.md` as the baseline set.
- Extract reusable interaction patterns (onboarding, navigation, dashboards, notifications, search, collaboration).
- Do not clone competitor visuals; reuse only proven product patterns.

3. Apply brand system.
- Start from the primary brand color and logo provided by the user.
- For this workspace default visual direction: dark-purple first.
- Use `references/dark-purple-design-system.md` token suggestions unless user overrides.

4. Design core UX deliverables.
- Information architecture map.
- Primary user flows (happy path + critical edge path).
- Screen-level structure and component inventory.
- Interaction states: empty, loading, error, success.

5. Produce implementation-ready output.
- Include layout behavior for desktop and mobile.
- Include component-level rules (spacing, typography scale, states, accessibility constraints).
- Include engineering notes for handoff.

## Output Contract

When asked to design or redesign, return a packet with:
- `UX Brief`
- `Competitor Pattern Matrix`
- `Feature + Flow Spec`
- `Visual Direction` (palette, type, component style)
- `Handoff Notes` for frontend implementation

## Resources

- Use `scripts/create_ux_brief.py` to scaffold a repeatable design brief.
- Use `references/competitor-benchmark.md` for competitor inspiration seeds.
- Use `references/dark-purple-design-system.md` for initial token system.
