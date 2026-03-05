import { SEOHead } from "@/components/SEOHead";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Short, Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { hasMinRole } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Film, Edit, Trash2, Eye, EyeOff, ExternalLink, BookOpen, Users, BarChart3, ArrowLeft, Image, Headphones, Video, Sun, Moon, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

const MEDIA_ICONS: Record<string, any> = {
  text: Film,
  image: Image,
  audio: Headphones,
  video: Video,
};

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const raw = error.message.replace(/^\d+:\s*/, "").trim();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.validationErrors) && parsed.validationErrors.length > 0) {
      return parsed.validationErrors.join(", ");
    }
    if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
      return parsed.errors.join(", ");
    }
    if (typeof parsed.message === "string" && parsed.message.trim().length > 0) {
      return parsed.message;
    }
  } catch {
    // Keep raw fallback below
  }

  return raw;
}

function getDisplayMediaType(short: { mediaType: string; mediaUrl?: string | null }): string {
  if (!short.mediaUrl) return "text";
  return short.mediaType;
}

type PublishReadiness = {
  canPublish: boolean;
  reason?: string;
};

function getPublishReadiness(short: {
  mediaType: string;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
}): PublishReadiness {
  const mediaType = short.mediaType;
  const requiresMedia = mediaType === "image" || mediaType === "audio" || mediaType === "video";
  const hasMedia = typeof short.mediaUrl === "string" && short.mediaUrl.trim().length > 0;
  if (requiresMedia && !hasMedia) {
    return { canPublish: false, reason: "Add a media file before publishing." };
  }

  const needsThumbnail = mediaType === "audio" || mediaType === "video";
  const hasThumbnail = typeof short.thumbnailUrl === "string" && short.thumbnailUrl.trim().length > 0;
  if (needsThumbnail && !hasThumbnail) {
    return { canPublish: false, reason: "Audio/video shorts need a thumbnail before publishing." };
  }

  return { canPublish: true };
}

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
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

export default function AdminShorts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const userRole = user?.role || "user";
  const canDelete = hasMinRole(userRole, "admin");
  const isSuperAdmin = hasMinRole(userRole, "super_admin");

  const [filterBook, setFilterBook] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    document.title = "Shorts | MindPrism Admin";
  }, []);

  const { data: allShorts, isLoading } = useQuery<Short[]>({
    queryKey: ["/api/admin/shorts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/admin/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/shorts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      toast({ title: "Deleted", description: "Short removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete short", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (short: Short) => {
      const newStatus = short.status === "published" ? "draft" : "published";
      await apiRequest("PUT", `/api/admin/shorts/${short.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shorts"] });
      toast({ title: "Updated", description: "Short status changed" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: extractApiErrorMessage(error, "Failed to update status"),
        variant: "destructive",
      });
    },
  });

  const filtered = (allShorts || []).filter(s => {
    if (filterBook !== "all" && s.bookId !== filterBook) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const getBookTitle = (bookId: string) => books?.find(b => b.id === bookId)?.title || "Unknown";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8" data-testid="admin-shorts-page">
      <SEOHead title="Admin - Story Shorts" noIndex />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-shorts-title">Story Shorts</h1>
            <p className="text-muted-foreground mt-1">Manage bite-sized content shorts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/shorts/new">
              <Button className="gap-2" data-testid="button-create-short">
                <Plus className="w-4 h-4" />
                Create New Short
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Select value={filterBook} onValueChange={setFilterBook}>
            <SelectTrigger className="w-48" data-testid="select-filter-book">
              <SelectValue placeholder="All Books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              {books?.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="select-filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No shorts yet</h2>
            <p className="text-muted-foreground mb-6">Create your first story short to get started</p>
            <Link href="/admin/shorts/new">
              <Button className="gap-2" data-testid="button-create-first-short">
                <Plus className="w-4 h-4" />
                Create New Short
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((short) => {
              const MediaIcon = MEDIA_ICONS[getDisplayMediaType(short)] || Film;
              const thumbnailUrl = resolveMediaUrl(short.thumbnailUrl);
              const publishReadiness = getPublishReadiness(short);
              const needsFixBeforePublish = short.status !== "published" && !publishReadiness.canPublish;
              return (
                <Card key={short.id} className="p-4 hover:shadow-lg transition-shadow" data-testid={`card-short-${short.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted/20">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={short.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: short.backgroundGradient || "linear-gradient(135deg, #34153930, #34153910)" }}>
                          <MediaIcon className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" data-testid={`text-short-title-${short.id}`}>{short.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{getBookTitle(short.bookId)}</p>
                      {needsFixBeforePublish && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1" data-testid={`short-warning-${short.id}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {publishReadiness.reason}
                        </p>
                      )}
                    </div>

                    {(() => {
                      const displayType = getDisplayMediaType(short);
                      const TypeIcon = MEDIA_ICONS[displayType] || Film;
                      return (
                        <Badge variant="outline" className="capitalize flex-shrink-0" data-testid={`badge-media-${short.id}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {displayType}
                        </Badge>
                      );
                    })()}

                    <Badge
                      variant={short.status === "published" ? "default" : "secondary"}
                      className="flex-shrink-0"
                      data-testid={`badge-status-${short.id}`}
                    >
                      {short.status === "published" ? "Published" : "Draft"}
                    </Badge>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (short.status !== "published" && !publishReadiness.canPublish) {
                            toast({
                              title: "Cannot publish yet",
                              description: publishReadiness.reason ?? "Add required media before publishing.",
                              variant: "destructive",
                            });
                            navigate(`/admin/shorts/${short.id}/edit`);
                            return;
                          }
                          toggleStatusMutation.mutate(short);
                        }}
                        className="gap-1"
                        disabled={toggleStatusMutation.isPending}
                        data-testid={`button-toggle-${short.id}`}
                      >
                        {short.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {short.status === "published" ? "Unpublish" : needsFixBeforePublish ? "Fix Media" : "Publish"}
                      </Button>
                      <Link href={`/admin/shorts/${short.id}/edit`}>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-${short.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this short? This cannot be undone.")) {
                              deleteMutation.mutate(short.id);
                            }
                          }}
                          data-testid={`button-delete-${short.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
