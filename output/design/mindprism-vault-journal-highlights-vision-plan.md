# MindPrism Vault: Journal + Highlights Vision Plan

Date: 2026-03-04  
Prepared by: Orchestrated UX/Product consultation (Visionary + Technical execution view)

## 1) Current-State Audit (What is actually happening now)

## Working today
1. Vault shows existing journal entries from `GET /api/journal`.
2. Vault shows existing highlights from `GET /api/highlights`.
3. Backend supports create/delete APIs:
- `POST /api/journal`
- `POST /api/highlights`
- `DELETE /api/highlights/:id`

## Broken / Missing user flows
1. No UI path to create a journal entry.
- There is no compose box, CTA, or dedicated journal entry screen in user app.

2. No UI path to save highlights.
- No text selection/highlight affordance in chapter reader or story engine.
- No explicit “Save highlight” button tied to `/api/highlights`.

3. Analytics hooks exist but are not wired.
- `trackJournalWrite()` and `trackHighlightSave()` are defined but unused.

4. Empty states currently tell users to do actions that are not possible.
- Vault says “Complete exercises while reading...” and “Start highlighting text...”, but those flows are not exposed in current UI.

## 2) Product Vision (Useful, consumer-grade behavior)

Design principle: **Capture in context, then organize in Vault.**

1. Journal should be fast and guided.
- Quick note entry in Vault (free-form).
- In-reading reflection prompts (contextual to chapter/card).
- Optional templates: “Key insight”, “What I’ll apply today”, “Question I still have”.

2. Highlights should be one-tap from reading flow.
- Tap-and-hold text in chapter reader to save highlight.
- “Save quote” action in story engine cards.
- Optional note attached to highlight for personal meaning.

3. Vault should support retrieval, not just storage.
- Search across journal + highlights.
- Filters by book, date, chakra, and content type.
- Grouping by “Recent”, “By Book”, and “Actionable insights”.

4. Insight-to-action loop.
- Convert highlight/journal note into a “Do this today” action.
- Weekly recap card: top 3 highlights + 1 journal reflection reminder.

## 3) UX Flows to implement

## Flow A: Journal Capture (Vault-first)
1. User opens Vault -> Journal tab.
2. User taps `+ New Journal`.
3. Bottom-sheet composer opens:
- title (optional)
- content (required)
- tags (optional)
- related book (optional)
4. Save -> optimistic insert into list.

## Flow B: In-Reader Highlight Capture
1. User selects text in chapter reader.
2. Mini action bar appears: `Highlight`, `Highlight + Note`.
3. Save highlight to backend with metadata:
- `bookId`, `chapterId`, `selectedText`, `sourceType`.
4. Toast confirms + CTA `View in Vault`.

## Flow C: Story Engine Quote Save
1. On each card, overflow menu contains `Save insight`.
2. Save card text as highlight with `type=card_insight`.

## Flow D: Vault Retrieval
1. Highlights tab gets search + filter chips.
2. Highlight item opens source context (`Go to chapter/card`).
3. Swipe actions: edit note / delete / convert to journal entry.

## 4) Data and API Plan

## Phase 1 (no schema change, fastest path)
1. Wire existing `POST /api/journal` and `POST /api/highlights` to new UI actions.
2. Use existing `type` field values:
- `text_selection`
- `card_insight`
- `manual_note`

## Phase 2 (schema improvements for retrieval quality)
1. Extend `saved_highlights`:
- `chapterId` nullable
- `cardId` nullable
- `note` nullable
- `tags` array/json
2. Extend `journal_entries`:
- `title` nullable
- `bookId` nullable
- `promptType` nullable
3. Add indexes:
- highlights `(userId, createdAt desc)`
- highlights `(userId, bookId)`
- journals `(userId, createdAt desc)`

## 5) Execution Chunks

## Chunk 1 (P0): Make features usable now
1. Add `+ New Journal` composer in Vault.
2. Add `Save Highlight` action in chapter reader and story engine.
3. Wire analytics events for create actions.
4. Fix Vault empty-state copy to match real actions.

## Chunk 2 (P1): Retrieval and quality
1. Add search + filters to Journal/Highlights.
2. Add delete/edit actions.
3. Add source-linking from highlight back to content.

## Chunk 3 (P1): Insight system
1. “Convert to action” from highlight/journal.
2. Weekly recap surfaced in Vault.

## 6) QA Acceptance Criteria

1. User can create a journal entry in <= 2 taps from Vault Journal tab.
2. User can save a highlight while reading without leaving context.
3. New entries appear in Vault immediately after save.
4. Highlight delete works and updates UI instantly.
5. Empty states only describe actions that are actually available.
6. Event tracking fires for journal/highlight create/delete actions.

## 7) Release Gate for this feature

Ship only when all are true:
1. P0 journal/highlight creation flows pass E2E.
2. No broken/hidden CTA paths in Vault.
3. Median create action latency under 500ms in staging.
4. No open P0/P1 defects in journal/highlight suites.
