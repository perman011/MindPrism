import { useEffect, useState, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { hasMinRole } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, Image, Music, Video, FileIcon, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/admin/FileUpload";

interface MediaFile {
  url: string;
  filename: string;
  originalName?: string | null;
  displayName?: string | null;
  type: string;
  size: number;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "images": return Image;
    case "audio": return Music;
    case "video": return Video;
    default: return FileIcon;
  }
}

export default function AdminMediaLibrary() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = hasMinRole(user?.role || "user", "super_admin");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [uploadValue, setUploadValue] = useState("");

  useEffect(() => {
    document.title = "Media Library | MindPrism Admin";
  }, []);

  const { data: files, isLoading } = useQuery<MediaFile[]>({
    queryKey: ["/api/admin/media"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: MediaFile) => {
      const res = await fetch(`/api/admin/media/${file.type}/${file.filename}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({ title: "Deleted", description: "File removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    },
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  const handleUploadComplete = useCallback((url: string) => {
    setUploadValue("");
    queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    toast({ title: "Uploaded", description: "File uploaded successfully" });
  }, [toast]);

  const filteredFiles = files?.filter(f => filter === "all" || f.type === filter) || [];

  const typeCounts = files?.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="p-8" data-testid="admin-media-page">
      <SEOHead title="Media Library - Admin" noIndex />
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Media Library</h1>
          <p className="text-muted-foreground mt-1">Upload and manage images, audio, and video files</p>
        </div>

        <Card className="p-6 mb-8 dark:bg-[#1A1225] dark:border-[#2A1E35]">
          <h2 className="text-sm font-semibold mb-3">Upload New File</h2>
          <FileUpload
            accept="any"
            value={uploadValue}
            onChange={handleUploadComplete}
            maxSize={50}
            placeholder="Drop any file here — images, audio, or video"
          />
        </Card>

        <div className="flex items-center gap-2 mb-4">
          {["all", "images", "audio", "video"].map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
              className="text-xs"
              data-testid={`filter-${t}`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== "all" && typeCounts[t] ? ` (${typeCounts[t]})` : ""}
              {t === "all" && files ? ` (${files.length})` : ""}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const Icon = getTypeIcon(file.type);
              const isImage = file.type === "images";
              return (
                <Card
                  key={file.url}
                  className="overflow-hidden group dark:bg-[#1A1225] dark:border-[#2A1E35]"
                  data-testid={`media-card-${file.filename}`}
                >
                  {isImage ? (
                    <div className="aspect-square bg-muted">
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted/50 dark:bg-[#261530] flex items-center justify-center">
                      <Icon className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-medium truncate dark:text-gray-200" title={file.filename}>
                      {file.displayName || file.originalName || file.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {file.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatSize(file.size)}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopy(file.url)}
                          data-testid="button-copy-url"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => deleteMutation.mutate(file)}
                            data-testid="button-delete-file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
