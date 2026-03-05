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

test("published media validation enforces only audio/video required fields", () => {
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "image", mediaUrl: null, thumbnailUrl: null }),
    null,
  );
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "audio", mediaUrl: null, thumbnailUrl: "/objects/uploads/images/t.png" }),
    "Published audio/video shorts require an uploaded media file.",
  );
  assert.equal(
    getPublishedMediaValidationError({ status: "published", mediaType: "video", mediaUrl: "/objects/uploads/video/v.mp4", thumbnailUrl: null }),
    "Published audio/video shorts require a thumbnail image.",
  );
});

test("managed media targets are only required for published audio/video", () => {
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "draft", mediaType: "video", mediaUrl: "x", thumbnailUrl: "y" }),
    { mediaUrl: null, thumbnailUrl: null },
  );
  assert.deepEqual(
    getManagedMediaValidationTargets({ status: "published", mediaType: "image", mediaUrl: "x", thumbnailUrl: "y" }),
    { mediaUrl: null, thumbnailUrl: null },
  );
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
});
