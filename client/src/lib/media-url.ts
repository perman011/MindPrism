export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/")) {
    return `/objects${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `/objects/${trimmed}`;
  }

  if (trimmed.startsWith("/objects/uploads/")) {
    return trimmed;
  }

  if (/^(https?:\/\/|\/|blob:|data:)/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

