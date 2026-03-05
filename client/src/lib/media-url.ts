export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  let clean = url.trim();
  if (!clean) return null;

  if (clean.startsWith("/objects/uploads/")) return clean;
  if (clean.startsWith("objects/uploads/")) return `/${clean}`;

  if (clean.startsWith("/uploads/")) return `/objects${clean}`;
  if (clean.startsWith("uploads/")) return `/objects/${clean}`;

  if (/^(https?:\/\/|blob:|data:)/i.test(clean)) return clean;

  if (clean.startsWith("/")) {
    return clean;
  }

  console.warn("[normalizeMediaUrl] Unrecognized media URL format:", clean);
  return null;
}
