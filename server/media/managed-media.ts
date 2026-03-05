import { ObjectStorageService, objectStorageClient } from "../replit_integrations/object_storage";

const objectStorageService = new ObjectStorageService();

export function normalizeManagedEntityPath(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/objects/uploads/")) {
    return trimmed.slice("/objects/".length);
  }
  if (trimmed.startsWith("/uploads/")) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith("uploads/")) {
    return trimmed;
  }
  return null;
}

function resolveBucketObjectPath(entityPath: string): { bucketName: string; objectPath: string } {
  const privateDir = objectStorageService.getPrivateObjectDir();
  const fullPath = `${privateDir}/${entityPath}`;
  const parts = fullPath.startsWith("/") ? fullPath.slice(1).split("/") : fullPath.split("/");
  const bucketName = parts[0];
  const objectPath = parts.slice(1).join("/");
  return { bucketName, objectPath };
}

export async function ensureManagedMediaExists(url: string | null | undefined): Promise<boolean> {
  const entityPath = normalizeManagedEntityPath(url);
  if (!entityPath) {
    return true;
  }

  const { bucketName, objectPath } = resolveBucketObjectPath(entityPath);
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  return exists;
}
