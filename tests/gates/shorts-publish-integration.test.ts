/**
 * Integration-style test that replicates the exact publish-toggle flow
 * from admin-shorts.tsx → PUT /api/admin/shorts/:id → server merge logic.
 *
 * We import the real Zod schemas and validation functions to ensure
 * the fix actually works end-to-end.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { insertShortSchema } from "../../shared/schema";
import { z } from "zod";
import {
  normalizeShortPayload,
  getPublishedMediaValidationError,
} from "../../server/shorts/publish-validation";

// Replicate the exact schema used in routes.ts
const shortPayloadSchema = insertShortSchema.extend({
  mediaType: z.enum(["text", "image", "audio", "video"]),
  status: z.enum(["draft", "published"]).optional(),
});

// Simulate a DB record (what storage.getShort() returns)
const MOCK_EXISTING_SHORT = {
  id: "test-short-123",
  bookId: "book-1",
  title: "afdafa",
  content: "test",
  mediaType: "video",
  mediaUrl: "/objects/uploads/video/abc123-atomichabits-clues-pramedic-short.mp4",
  thumbnailUrl: "/objects/uploads/images/def456-doodle-cover-v2-optimized.png",
  backgroundGradient: null,
  duration: null,
  orderIndex: 0,
  status: "draft",
  createdAt: new Date("2026-03-06"),
  updatedAt: new Date("2026-03-06"),
};

test("publish-toggle: status-only PATCH merges correctly with existing DB record", () => {
  // 1. Client sends only { status: "published" }
  const requestBody = { status: "published" };

  // 2. normalizeShortPayload on the raw body
  const normalizedPatch = normalizeShortPayload(requestBody);

  // Verify: mediaUrl and thumbnailUrl should NOT be in the patch
  assert.equal("mediaUrl" in normalizedPatch, false, "mediaUrl should not be injected");
  assert.equal("thumbnailUrl" in normalizedPatch, false, "thumbnailUrl should not be injected");

  // 3. Partial parse
  const patchParsed = shortPayloadSchema.partial().safeParse(normalizedPatch);
  assert.ok(patchParsed.success, `Partial parse failed: ${JSON.stringify(patchParsed.error?.issues)}`);

  // 4. Strip undefined values (the fix)
  const cleanPatch = Object.fromEntries(
    Object.entries(patchParsed.data).filter(([, v]) => v !== undefined),
  );

  console.log("cleanPatch keys:", Object.keys(cleanPatch));

  // 5. Merge with existing DB record
  const merged = { ...MOCK_EXISTING_SHORT, ...cleanPatch };

  // Verify: existing mediaUrl is preserved
  assert.equal(
    merged.mediaUrl,
    MOCK_EXISTING_SHORT.mediaUrl,
    "mediaUrl should be preserved from existing record",
  );
  assert.equal(
    merged.thumbnailUrl,
    MOCK_EXISTING_SHORT.thumbnailUrl,
    "thumbnailUrl should be preserved from existing record",
  );
  assert.equal(merged.status, "published", "status should be updated to published");

  // 6. Normalize the merged object
  const normalizedMerged = normalizeShortPayload(merged);

  // 7. Full parse (non-partial)
  const mergedParsed = shortPayloadSchema.safeParse(normalizedMerged);
  assert.ok(mergedParsed.success, `Full parse failed: ${JSON.stringify(mergedParsed.error?.issues)}`);

  // 8. Validate for publish
  const validationError = getPublishedMediaValidationError(mergedParsed.data);
  assert.equal(
    validationError,
    null,
    `Publish validation should pass, but got: "${validationError}"`,
  );

  console.log("✓ mergedParsed.data.mediaUrl:", mergedParsed.data.mediaUrl);
  console.log("✓ mergedParsed.data.thumbnailUrl:", mergedParsed.data.thumbnailUrl);
  console.log("✓ mergedParsed.data.status:", mergedParsed.data.status);
});

test("publish-toggle WITHOUT fix: demonstrates the bug", () => {
  // Simulate the OLD buggy behavior where normalizeShortPayload
  // unconditionally sets mediaUrl/thumbnailUrl
  const requestBody = { status: "published" };
  
  // OLD behavior: always normalize mediaUrl (even if absent → undefined)
  function oldNormalizeShortPayload(data: Record<string, unknown>) {
    const normalized = { ...data };
    // OLD code: unconditionally set these
    normalized.mediaUrl = typeof normalized.mediaUrl === "string" 
      ? normalized.mediaUrl.trim() || null 
      : (normalized.mediaUrl === undefined ? undefined : normalized.mediaUrl);
    normalized.thumbnailUrl = typeof normalized.thumbnailUrl === "string"
      ? normalized.thumbnailUrl.trim() || null
      : (normalized.thumbnailUrl === undefined ? undefined : normalized.thumbnailUrl);
    return normalized;
  }

  const normalizedPatch = oldNormalizeShortPayload(requestBody);
  
  // Old code produces { status: "published", mediaUrl: undefined, thumbnailUrl: undefined }
  assert.equal(normalizedPatch.mediaUrl, undefined);
  
  const patchParsed = shortPayloadSchema.partial().safeParse(normalizedPatch);
  assert.ok(patchParsed.success);

  // WITHOUT the cleanPatch fix, spread-merge overwrites existing values:
  const merged = { ...MOCK_EXISTING_SHORT, ...patchParsed.data };
  
  // BUG: mediaUrl could be overwritten with undefined depending on Zod behavior
  // Let's check what Zod does with the undefined value
  console.log("Old behavior - patchParsed.data has mediaUrl?:", "mediaUrl" in patchParsed.data);
  console.log("Old behavior - patchParsed.data.mediaUrl:", patchParsed.data.mediaUrl);
  console.log("Old behavior - merged.mediaUrl:", merged.mediaUrl);
});

test("full save from editor: payload with all fields works", () => {
  // When saving from the editor page, ALL fields are sent
  const requestBody = {
    bookId: "book-1",
    title: "afdafa",
    content: "test",
    mediaType: "video",
    mediaUrl: "/objects/uploads/video/abc123-atomichabits-clues-pramedic-short.mp4",
    thumbnailUrl: "/objects/uploads/images/def456-doodle-cover-v2-optimized.png",
    backgroundGradient: null,
    duration: null,
    status: "published",
  };

  const normalizedPatch = normalizeShortPayload(requestBody);
  const patchParsed = shortPayloadSchema.partial().safeParse(normalizedPatch);
  assert.ok(patchParsed.success);

  const cleanPatch = Object.fromEntries(
    Object.entries(patchParsed.data).filter(([, v]) => v !== undefined),
  );

  const normalizedMerged = normalizeShortPayload({ ...MOCK_EXISTING_SHORT, ...cleanPatch });
  const mergedParsed = shortPayloadSchema.safeParse(normalizedMerged);
  assert.ok(mergedParsed.success, `Full parse failed: ${JSON.stringify(mergedParsed.error?.issues)}`);

  const validationError = getPublishedMediaValidationError(mergedParsed.data);
  assert.equal(validationError, null, `Should pass but got: "${validationError}"`);
});
