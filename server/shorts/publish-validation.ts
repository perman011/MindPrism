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

  // Only normalize media URLs when they are explicitly present in the input.
  // Normalizing absent keys would set them to `undefined`, which overwrites
  // existing values during a spread-merge (e.g. `{ ...existing, ...patch }`).
  if ("mediaUrl" in data) {
    normalized.mediaUrl = normalizeStoredMediaPath(normalized.mediaUrl);
  }
  if ("thumbnailUrl" in data) {
    normalized.thumbnailUrl = normalizeStoredMediaPath(normalized.thumbnailUrl);
  }

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
  const mediaUrl = typeof data.mediaUrl === "string" ? data.mediaUrl.trim() : "";
  const thumbnailUrl = typeof data.thumbnailUrl === "string" ? data.thumbnailUrl.trim() : "";

  // For image shorts, either mediaUrl or thumbnailUrl is sufficient
  if (mediaType === "image") {
    if (!mediaUrl && !thumbnailUrl) {
      return "Published image shorts require an uploaded image (media or thumbnail).";
    }
    return null;
  }

  // For text shorts, no media is strictly required (content is the media)
  if (mediaType === "text") {
    return null;
  }

  // For audio/video shorts, both media file and thumbnail are required
  if (!mediaUrl) {
    return `Published ${mediaType} shorts require an uploaded media file.`;
  }
  if (!thumbnailUrl) {
    return `Published ${mediaType} shorts require a thumbnail image.`;
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

  // Text shorts have no media to validate
  if (data.mediaType === "text") {
    return { mediaUrl: null, thumbnailUrl: null };
  }

  const mediaUrl = typeof data.mediaUrl === "string" ? data.mediaUrl.trim() : "";
  const thumbnailUrl = typeof data.thumbnailUrl === "string" ? data.thumbnailUrl.trim() : "";

  // For image shorts, validate whichever URL(s) are present
  if (data.mediaType === "image") {
    return {
      mediaUrl: mediaUrl || null,
      thumbnailUrl: thumbnailUrl || null,
    };
  }

  // For audio/video, validate both
  return {
    mediaUrl: mediaUrl || null,
    thumbnailUrl: thumbnailUrl || null,
  };
}
