import { z } from "zod";

const journalInputSchema = z.object({
  content: z.string().max(5000),
});

const highlightInputSchema = z.object({
  bookId: z.string().min(1),
  content: z.string().max(500),
  type: z.string().max(64).optional(),
});

export function parseJournalInput(body: unknown): { content: string } | null {
  const parsed = journalInputSchema.safeParse(body);
  if (!parsed.success) return null;

  const content = parsed.data.content.trim();
  if (!content) return null;
  return { content };
}

export function parseHighlightInput(
  body: unknown,
): { bookId: string; content: string; type: string } | null {
  const parsed = highlightInputSchema.safeParse(body);
  if (!parsed.success) return null;

  const bookId = parsed.data.bookId.trim();
  const content = parsed.data.content.replace(/\s+/g, " ").trim();
  const type = (parsed.data.type ?? "manual").trim();
  if (!bookId || !content || !type) return null;

  return { bookId, content, type };
}
