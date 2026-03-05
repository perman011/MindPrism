import test from "node:test";
import assert from "node:assert/strict";
import { parseJournalInput, parseHighlightInput } from "../../server/user-content/validation";

test("parseJournalInput trims content and rejects blank payloads", () => {
  assert.deepEqual(parseJournalInput({ content: "  Hello Journal  " }), { content: "Hello Journal" });
  assert.equal(parseJournalInput({ content: "    " }), null);
  assert.equal(parseJournalInput({}), null);
});

test("parseHighlightInput normalizes payload and defaults type", () => {
  assert.deepEqual(
    parseHighlightInput({
      bookId: "  book-123  ",
      chapterId: "  chapter-7  ",
      content: "  This   is   a key insight.  ",
      type: " chapter ",
    }),
    {
      bookId: "book-123",
      chapterId: "chapter-7",
      content: "This is a key insight.",
      type: "chapter",
    },
  );

  assert.deepEqual(
    parseHighlightInput({
      bookId: "book-abc",
      content: "Use friction to build habits",
    }),
    {
      bookId: "book-abc",
      content: "Use friction to build habits",
      type: "manual",
    },
  );
});

test("parseHighlightInput rejects invalid content", () => {
  assert.equal(parseHighlightInput({ bookId: "", content: "text", type: "chapter" }), null);
  assert.equal(parseHighlightInput({ bookId: "book-1", content: "   ", type: "chapter" }), null);
  assert.equal(parseHighlightInput({ bookId: "book-1", content: "text", type: "   " }), null);
  assert.equal(parseHighlightInput({ bookId: "book-1", chapterId: "   ", content: "text", type: "chapter" }), null);
});
