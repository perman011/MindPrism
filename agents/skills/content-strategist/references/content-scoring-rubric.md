# Content Scoring Rubric

A 0–100 scoring system for evaluating MindPrism book content quality and completeness. Books must score ≥ 75 before publication.

---

## Scoring Dimensions

### 1. Metadata Completeness (0–20 points)

| Item | Points |
|------|--------|
| Cover image (min 400×600px, no text overlap) | 4 |
| Title and subtitle | 2 |
| Author name and bio (50–150 words) | 3 |
| Book description (100–250 words) | 3 |
| Category/vertical assigned (exactly one of five) | 2 |
| Publication year | 2 |
| Goodreads or ISBN reference | 2 |
| Page count or estimated read time | 2 |

**Subtotal: /20**

---

### 2. Chapter Content Quality (0–30 points)

Score is averaged across all chapters, then mapped to 0–30.

Per chapter evaluation:

| Criterion | Points |
|-----------|--------|
| Summary present (not empty) | 2 |
| Word count 300–600 (proportional penalty below 200 or above 800) | 3 |
| Hook sentence present (first line captures core claim) | 2 |
| Key insight callout present (bolded or labeled) | 2 |
| Practical takeaway present (actionable last sentence) | 2 |
| No filler phrases ("In this chapter...", "The author argues that...") | 2 |
| Voice consistency (second-person, present tense) | 2 |

Per chapter max: 15 points
Average all chapters → normalize to 0–30.

**Subtotal: /30**

---

### 3. Mental Model Density (0–20 points)

| Condition | Points |
|-----------|--------|
| 1–2 mental models | 5 |
| 3–4 mental models | 12 |
| 5–7 mental models | 18 |
| 8+ mental models | 20 |

Each mental model must have: name, description, when-to-apply, worked example. Missing any field: −2 per model.

**Subtotal: /20**

---

### 4. Audio and Shorts (0–15 points)

| Item | Points |
|------|--------|
| Audio summary present | 8 |
| Audio length 8–12 minutes | 2 (partial credit: 1pt for 6–8min or 12–15min) |
| At least 1 short published for this book | 3 |
| At least 2 shorts published for this book | 2 |

**Subtotal: /15**

---

### 5. SEO and Discoverability (0–15 points)

| Item | Points |
|------|--------|
| Meta title present (≤60 chars) | 3 |
| Meta description present (≤155 chars) | 3 |
| Slug follows pattern: `/books/{author-lastname-title}` | 2 |
| At least 2 internal links to related mental models | 3 |
| At least 1 related book linked | 2 |
| Book schema structured data present | 2 |

**Subtotal: /15**

---

## Score Thresholds

| Score | Status | Action |
|-------|--------|--------|
| 90–100 | Featured-eligible | Can appear in "Editor's Picks" and featured slots |
| 75–89 | Published | Appears in search, browse, and recommendations |
| 60–74 | Draft | Visible to admins only; requires improvement before publish |
| Below 60 | Incomplete | Blocked from all surfaces; assigned to content queue |

---

## Scoring Worksheet (Quick Reference)

```
Metadata Completeness:  __ / 20
Chapter Content:        __ / 30
Mental Model Density:   __ / 20
Audio + Shorts:         __ / 15
SEO + Discoverability:  __ / 15
---------------------------------
TOTAL:                  __ / 100
Status: [ ] Featured  [ ] Published  [ ] Draft  [ ] Incomplete
```

---

## Disqualifying Conditions (Automatic Fail, Score = 0)

Any of the following immediately blocks publication regardless of total score:
- Plagiarized content (direct copy from source text without transformation)
- Cover image missing or corrupted
- No chapters at all
- Summary contains HTML injection or unescaped markdown
- Author name missing
