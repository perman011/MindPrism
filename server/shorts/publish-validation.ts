export type ShortPublishValidationInput = {
  status?: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
};

export function normalizeStoredMediaPath(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/")) return `/objects${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `/objects/${trimmed}`;
  return trimmed;
}

export function normalizeShortPayload(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...data };
  normalized.mediaUrl = normalizeStoredMediaPath(normalized.mediaUrl);
  normalized.thumbnailUrl = normalizeStoredMediaPath(normalized.thumbnailUrl);

  // If an image short only has a thumbnail, use it as the image media source.
  if (normalized.mediaType === "image") {
    const mediaUrl = typeof normalized.mediaUrl === "string" ? normalized.mediaUrl.trim() : "";
    const thumbnailUrl = typeof normalized.thumbnailUrl === "string" ? normalized.thumbnailUrl.trim() : "";
    if (!mediaUrl && thumbnailUrl) {
      normalized.mediaUrl = thumbnailUrl;
    }
  }

  if (typeof normalized.backgroundGradient === "string") {
    normalized.backgroundGradient = normalized.backgroundGradient.trim() || null;
  }
  if (typeof normalized.title === "string") {
    normalized.title = normalized.title.trim();
  }
  if (typeof normalized.content === "string") {
    normalized.content = normalized.content.trim();
  }
  return normalized;
}

export function getPublishedMediaValidationError(data: ShortPublishValidationInput): string | null {
  const status = data.status ?? "draft";
  if (status !== "published") return null;

  const mediaType = data.mediaType;
  const requiresMedia = mediaType === "audio" || mediaType === "video";
  const mediaUrl = typeof data.mediaUrl === "string" ? data.mediaUrl.trim() : "";
  if (requiresMedia && !mediaUrl) {
    return "Published audio/video shorts require an uploaded media file.";
  }

  if (mediaType === "audio" || mediaType === "video") {
    const thumbnailUrl = typeof data.thumbnailUrl === "string" ? data.thumbnailUrl.trim() : "";
    if (!thumbnailUrl) {
      return "Published audio/video shorts require a thumbnail image.";
    }
  }

  return null;
}

export function getManagedMediaValidationTargets(
  data: ShortPublishValidationInput,
): { mediaUrl: string | null; thumbnailUrl: string | null } {
  const status = data.status ?? "draft";
  if (status !== "published") {
    return { mediaUrl: null, thumbnailUrl: null };
  }

  const isAudioOrVideo = data.mediaType === "audio" || data.mediaType === "video";
  if (!isAudioOrVideo) {
    return { mediaUrl: null, thumbnailUrl: null };
  }

  const mediaUrl = typeof data.mediaUrl === "string" ? data.mediaUrl.trim() : "";
  const thumbnailUrl = typeof data.thumbnailUrl === "string" ? data.thumbnailUrl.trim() : "";
  return {
    mediaUrl: mediaUrl || null,
    thumbnailUrl: thumbnailUrl || null,
  };
}
