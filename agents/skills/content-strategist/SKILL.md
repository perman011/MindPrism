---
name: content-strategist
description: Curate, score, and produce psychology book content that drives engagement and discoverability on MindPrism. Use when a user asks for book selection criteria, content quality scoring, chapter summary guidelines, mental model creation, audio content production, shorts strategy, SEO optimization, or publishing cadence planning.
---

# Content Strategist

Build the content engine that makes MindPrism the definitive psychology reading platform.

## Workflow

1. Select and curate books.
- Apply the MindPrism book selection criteria: published within 10 years OR a recognized classic (top 100 psychology/self-help canon), minimum 4.0 Goodreads rating with 1,000+ ratings, clear mental model density (at least 3 extractable frameworks), and alignment with one of five verticals: Cognition, Relationships, Productivity, Mental Health, Philosophy.
- Cross-check the `books` table for duplicates and coverage gaps by vertical.
- Use `references/content-scoring-rubric.md` to score each candidate (0–100) before adding.
- Prioritize books with strong audiobook demand signals (Audible bestseller rank, YouTube summary view count).

2. Score content quality and track completeness.
- For each book in the `books` table, verify completeness: cover image, description, author bio, chapter count, all chapter summaries, at least 3 mental models, audio status, and shorts status.
- Run `scripts/generate_content_audit.py` to output a completeness matrix.
- Flag books with completeness < 70% as "incomplete" — block them from appearing in featured or search until resolved.
- Set a quality floor: chapter summaries must be 300–600 words, include a key insight callout, and end with a practical takeaway.

3. Write chapter summaries.
- Follow the writing style in `references/writing-style-guide.md`: second-person voice, present tense, conversational but precise, no jargon without definition.
- Structure: Hook (1 sentence capturing the chapter's core claim) → Core Argument (2–3 paragraphs) → Key Insight callout (bold) → Practical Takeaway (1–2 actionable sentences).
- Target 400–500 words. Shorter for introductory chapters, longer for dense theoretical chapters.
- Avoid spoiling the author's conclusion — summarize enough to deliver value and motivate reading the full book.

4. Create mental models.
- A mental model must: have a memorable name (2–5 words), originate from a specific book/chapter, be expressed as a reusable thinking tool, and include: definition, when to apply, a worked example, and a common misapplication warning.
- Store in `mental_models` table with fields: id, book_id, chapter_id, name, description, framework, example, misapplication, created_at.
- Target 3–7 mental models per book. Prioritize models that are cross-domain applicable (usable in both work and personal life).
- Each mental model should be short enough to render as a MindPrism "card" (title + 3 bullet points + one-liner example).

5. Produce audio content.
- Audio summary target: 8–12 minutes per book (not per chapter). Script should be a narrative distillation, not a chapter-by-chapter recitation.
- Script format: Introduction (30s hook) → 5–7 key ideas with transitions → Closing (30s action prompt).
- Use `references/writing-style-guide.md` tone rules. Avoid passive voice. Write for listening, not reading — short sentences, rhetorical questions, vivid examples.
- File naming convention: `audio/{book-slug}-summary.mp3`. Store audio URL in `books.audioUrl` column.

6. Execute shorts content strategy.
- Shorts are 60–90 second text-and-image cards tied to a single mental model or chapter insight.
- Each short must have: a hook line (max 12 words), 3–5 insight bullets, a source attribution, and a CTA ("Read the full summary in MindPrism").
- Production cadence: 2 shorts per new book added, 1 short per week from back-catalog.
- Track shorts in `book_shorts` table (id, book_id, mental_model_id, title, content, published_at).
- Repurpose top-performing shorts as social media carousels (Instagram, LinkedIn).

7. Plan content calendar and SEO.
- SEO targets: rank for "[book title] summary", "[book title] key takeaways", "[author] best ideas", and category pages ("best psychology books", "cognitive bias explained").
- Each book page must have: meta title (<60 chars), meta description (<155 chars), structured data (Book schema), and internal links to related mental models.
- Publishing cadence: 4 new books per month (1 per week), 2 audio summaries per month, 8 shorts per month.
- Use `references/content-scoring-rubric.md` to gate publication: no book goes live with score < 75.

## Output Contract

Return:
- Book selection shortlist with rubric scores
- Content completeness matrix
- Chapter summary drafts (per request)
- Mental model cards (per book)
- Audio script (per book)
- Shorts production queue
- Content calendar (monthly)
- SEO metadata for each book page

## Resources

- `scripts/generate_content_audit.py` scaffolds a content completeness audit report.
- `references/content-scoring-rubric.md` defines the 0–100 content quality scoring system.
- `references/writing-style-guide.md` defines voice, tone, structure, and style rules for all written content.
