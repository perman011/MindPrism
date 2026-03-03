# Agent Setup

## Core Team (Requested)

This repository now includes a dedicated 4-agent core team with role-specific skills:

- UX Designer -> `agents/skills/ux-designer`
- Technical PM -> `agents/skills/technical-pm`
- QA E2E Engineer -> `agents/skills/qa-e2e`
- Solution Architect -> `agents/skills/solution-architect`

Team routing and outputs are defined in `agents/core-team.yaml`.

## How to delegate work

Use direct routing prompts, for example:
- `Route to UX: produce competitor-inspired flow + dark-purple design spec.`
- `Route to TPM: convert UX scope into technical PRD and 20 tickets.`
- `Route to ARCH: design scalable target architecture for this PRD.`
- `Route to QA: generate E2E coverage and release gate report.`

I will orchestrate these role streams and return merged deliverables.
