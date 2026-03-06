import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStoredMediaPath,
  normalizeShortPayload,
  getPublishedMediaValidationError,
  getManagedMediaValidationTargets,
} from "../../server/shorts/publish-validation";

test("normalizeStoredMediaPath maps upload-style paths to /objects routes", () => {
  assert.equal(normalizeStoredMediaPath("/uploads/audio/test.mp3"), "/objects/uploads/audio/test.mp3");
  assert.equal(normalizeStoredMediaPath("uploads/video/test.mp4"), "/objects/uploads/video/test.mp4");
  assert.equal(normalizeStoredMediaPath("/objects/uploads/images/test.jpg"), "/objects/uploads/images/test.jpg");
});

test("normalizeShortPayload auto-fills image mediaUrl from thumbnail", () => {
  const normalized = normalizeShortPayload({
    mediaType: "image",
    mediaUrl: "",
    thumbnailUrl: "/uploads/images/cover.png",
    title: "  test title  ",
    content: "  test content  ",
  });

  assert.equal(normalized.mediaUrl, "/objects/uploads/images/cover.png");
  assert.equal(normalized.thumbnailUrl, "/objects/uploads/images/cover.png");
  assert.equal(normalized.title, "test title");
  assert.equal(normalized.content, "test content");
});

test("published media validation enforces required fields by mediaType", () => {
  // Image shorts require at least one of mediaUrl or thumbnailUrl
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "image", mediaUrl: null, thumbnailUrl: null }),
    "Published image shorts require an uploaded image (media or thumbnail).",
  );
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "image", mediaUrl: null, thumbnailUrl: "/objects/uploads/images/t.png" }),
    null,
  );

  // Audio/video shorts require both mediaUrl and thumbnailUrl
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "audio", mediaUrl: null, thumbnailUrl: "/objects/uploads/images/t.png" }),
    "Published audio shorts require an uploaded media file.",
  );
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "video", mediaUrl: "/objects/uploads/video/v.mp4", thumbnailUrl: null }),
    "Published video shorts require a thumbnail image.",
  );
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "video", mediaUrl: "/objects/uploads/video/v.mp4", thumbnailUrl: "/objects/uploads/images/t.png" }),
    null,
  );

  // Text shorts never need media
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "text" }),
    null,
  );

  // Drafts skip all validation
  assert.equal(
    getPublishedMediaValidationError({ status: "draft", mediaType: "video" }),
    null,
  );
});

test("managed media targets are only required for published non-text types", () => {
  // Drafts have no targets regardless of mediaType
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "draft", mediaType: "video", mediaUrl: "x", thumbnailUrl: "y" }),
    { mediaUrl: null, thumbnailUrl: null },
  );

  // Published image: validates whichever URLs are present
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "published", mediaType: "image", mediaUrl: "x", thumbnailUrl: "y" }),
    { mediaUrl: "x", thumbnailUrl: "y" },
  );
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "published", mediaType: "image", mediaUrl: "", thumbnailUrl: "y" }),
    { mediaUrl: null, thumbnailUrl: "y" },
  );

  // Published audio/video: validates both
  assert.deepEqual(
    getManagedMediaValidationTargets({
      status: "published",
      mediaType: "audio",
      mediaUrl: "/objects/uploads/audio/a.mp3",
      thumbnailUrl: "/objects/uploads/images/t.png",
    }),
    {
      mediaUrl: "/objects/uploads/audio/a.mp3",
      thumbnailUrl: "/objects/uploads/images/t.png",
    },
  );

  // Text shorts have no targets
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "published", mediaType: "text", mediaUrl: null, thumbnailUrl: null }),
    { mediaUrl: null, thumbnailUrl: null },
  );
});

test("normalizeShortPayload does NOT inject undefined mediaUrl/thumbnailUrl for status-only patches", () => {
  // Simulates the quick publish toggle: only { status: "published" } is sent.
  // The normalizer must NOT add mediaUrl/thumbnailUrl keys so they don't
  // overwrite existing DB values during a spread-merge.
  const patch = normalizeShortPayload({ status: "published" });
  assert.equal("mediaUrl" in patch, false, "mediaUrl should not be present in status-only patch");
  assert.equal("thumbnailUrl" in patch, false, "thumbnailUrl should not be present in status-only patch");
  assert.equal(patch.status, "published");
});

test("normalizeShortPayload DOES normalize mediaUrl/thumbnailUrl when explicitly provided", () => {
  const patch = normalizeShortPayload({
    status: "published",
    mediaUrl: "/uploads/video/test.mp4",
    thumbnailUrl: "uploads/images/thumb.png",
  });
  assert.equal(patch.mediaUrl, "/objects/uploads/video/test.mp4");
  assert.equal(patch.thumbnailUrl, "/objects/uploads/images/thumb.png");
});
