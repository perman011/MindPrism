import path from "path";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/webm",
  "audio/flac",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
]);

const GENERIC_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
]);

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".heic", ".heif"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm", ".flac"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".3gp", ".3g2"]);

function normalizeMimeType(mimeType: string | undefined | null): string {
  return (mimeType || "").trim().toLowerCase();
}

function normalizeExtension(filename: string | undefined | null): string {
  return path.extname(filename || "").toLowerCase();
}

function basenameWithoutExtension(filename: string | undefined | null): string {
  const raw = path.basename(filename || "", path.extname(filename || ""));
  return raw.trim();
}

export function getUploadFolder(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  if (normalized.startsWith("image/")) return "images";
  if (normalized.startsWith("audio/")) return "audio";
  if (normalized.startsWith("video/")) return "video";
  return "general";
}

export function isAllowedUpload(mimeType: string | undefined | null, filename: string | undefined | null): boolean {
  const normalizedMime = normalizeMimeType(mimeType);
  const ext = normalizeExtension(filename);

  if (IMAGE_MIME_TYPES.has(normalizedMime) || AUDIO_MIME_TYPES.has(normalizedMime) || VIDEO_MIME_TYPES.has(normalizedMime)) {
    return true;
  }

  // Some mobile browsers upload as octet-stream or empty mime type; trust known extensions.
  if (GENERIC_MIME_TYPES.has(normalizedMime)) {
    return IMAGE_EXTENSIONS.has(ext) || AUDIO_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
  }

  return false;
}

export function sanitizeUploadBaseName(filename: string | undefined | null): string {
  const base = basenameWithoutExtension(filename);
  if (!base) return "file";

  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return sanitized || "file";
}
