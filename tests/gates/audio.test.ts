import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMediaUrl } from "../../client/src/lib/media-url";
import { normalizeManagedEntityPath } from "../../server/media/managed-media";

test("normalizeMediaUrl maps legacy upload paths to object paths", () => {
  assert.equal(normalizeMediaUrl("/uploads/audio/test.mp3"), "/objects/uploads/audio/test.mp3");
  assert.equal(normalizeMediaUrl("uploads/video/test.mp4"), "/objects/uploads/video/test.mp4");
  assert.equal(normalizeMediaUrl("/objects/uploads/images/test.jpg"), "/objects/uploads/images/test.jpg");
});

test("normalizeMediaUrl blocks unknown non-http strings", () => {
  assert.equal(normalizeMediaUrl("not-a-valid-media-path"), null);
});

test("managed entity path parser resolves all managed URL forms", () => {
  assert.equal(normalizeManagedEntityPath("/objects/uploads/audio/a.mp3"), "uploads/audio/a.mp3");
  assert.equal(normalizeManagedEntityPath("/uploads/images/b.png"), "uploads/images/b.png");
  assert.equal(normalizeManagedEntityPath("uploads/video/c.mp4"), "uploads/video/c.mp4");
  assert.equal(normalizeManagedEntityPath("https://cdn.example.com/file.mp4"), null);
});
