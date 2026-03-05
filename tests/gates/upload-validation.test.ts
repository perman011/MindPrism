import test from "node:test";
import assert from "node:assert/strict";
import { getUploadFolder, isAllowedUpload, sanitizeUploadBaseName } from "../../server/media/upload-validation";

test("getUploadFolder maps media mime types", () => {
  assert.equal(getUploadFolder("image/heic"), "images");
  assert.equal(getUploadFolder("audio/mpeg"), "audio");
  assert.equal(getUploadFolder("video/quicktime"), "video");
  assert.equal(getUploadFolder("application/octet-stream"), "general");
});

test("isAllowedUpload accepts common and mobile mime types", () => {
  assert.equal(isAllowedUpload("image/heic", "photo.HEIC"), true);
  assert.equal(isAllowedUpload("image/heif", "photo.heif"), true);
  assert.equal(isAllowedUpload("video/3gpp", "clip.3gp"), true);
  assert.equal(isAllowedUpload("audio/flac", "voice.flac"), true);
});

test("isAllowedUpload accepts generic mime when extension is safe", () => {
  assert.equal(isAllowedUpload("", "capture.mov"), true);
  assert.equal(isAllowedUpload("application/octet-stream", "capture.mp4"), true);
  assert.equal(isAllowedUpload("application/octet-stream", "recording.m4a"), true);
});

test("isAllowedUpload rejects unknown types and unsafe generic extensions", () => {
  assert.equal(isAllowedUpload("application/pdf", "file.pdf"), false);
  assert.equal(isAllowedUpload("application/octet-stream", "archive.zip"), false);
  assert.equal(isAllowedUpload("", "script.sh"), false);
});

test("sanitizeUploadBaseName keeps human readable slug names", () => {
  assert.equal(sanitizeUploadBaseName("My Launch Video Final.MOV"), "my-launch-video-final");
  assert.equal(sanitizeUploadBaseName("   $$$$.mp4"), "file");
});
