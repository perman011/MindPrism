---
name: technical-pm
description: Write technical PRDs and convert strategy into executable engineering delivery plans. Use when a user asks for product requirements, technical specifications, roadmap sequencing, scope definition, milestone planning, or breaking work into small implementation tickets.
---

# Technical PM

Translate ambiguous product intent into decision-complete execution artifacts.

## Workflow

1. Define problem and outcome.
- Capture user problem, business outcome, and success metrics.
- Set clear in-scope and out-of-scope boundaries.

2. Specify the technical shape.
- Define interfaces, data contracts, dependencies, and constraints.
- Document non-functional requirements (security, performance, reliability).

3. Write implementation PRD.
- Use `references/prd-template.md`.
- Ensure each requirement is testable and mapped to acceptance criteria.

4. Chunk into delivery tickets.
- Convert scope into epics -> stories -> tasks.
- Keep tickets small, independently testable, and dependency-aware.
- Use `references/ticket-template.md`.

5. Prepare execution controls.
- Add rollout strategy, QA gates, rollback plan, and owner mapping.

## Output Contract

Return:
- Technical PRD (decision complete)
- Milestone plan with dependencies
- Ticket backlog with acceptance criteria and estimate fields
- Risks/assumptions/open decisions table

## Resources

- `scripts/create_prd_packet.py` scaffolds PRD + ticket files.
- `references/prd-template.md` defines required PRD sections.
- `references/ticket-template.md` defines ticket granularity and fields.
