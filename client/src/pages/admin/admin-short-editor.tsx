import { SEOHead } from "@/components/SEOHead";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Short, Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, Image, Headphones, Video } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function AdminShortEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [bookId, setBookId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [backgroundGradient, setBackgroundGradient] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [status, setStatus] = useState("draft");

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/admin/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: existing } = useQuery<Short>({
    queryKey: ["/api/admin/shorts", id],
    queryFn: async () => {
      const shorts = await (await fetch("/api/admin/shorts", { credentials: "include" })).json();
      return shorts.find((s: Short) => s.id === id);
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (existing) {
      setBookId(existing.bookId);
      setTitle(existing.title);
      setContent(existing.content);
      setMediaType(existing.mediaType);
      setMediaUrl(existing.mediaUrl || "");
      setThumbnailUrl(existing.thumbnailUrl || "");
      setBackgroundGradient(existing.backgroundGradient || "");
      setDuration(existing.duration || undefined);
      setStatus(existing.status);
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        bookId,
        title,
        content,
        mediaType,
        mediaUrl: mediaUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        backgroundGradient: backgroundGradient || null,
        duration: duration || null,
        status,
      };

      if (isNew) {
        return apiRequest("POST", "/api/admin/shorts", payload);
      } else {
        return apiRequest("PUT", `/api/admin/shorts/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shorts"] });
      toast({ title: "Saved", description: isNew ? "Short created" : "Short updated" });
      navigate("/admin/shorts");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save short", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/shorts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      toast({ title: "Deleted", description: "Short removed" });
      navigate("/admin/shorts");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete short", variant: "destructive" });
    },
  });

  const canSave = bookId && title.trim() && content.trim() && mediaType;
  const needsThumbnail = mediaType === "audio" || mediaType === "video";

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-8" data-testid="admin-short-editor">
      <SEOHead title={isNew ? "Create Short" : "Edit Short"} noIndex />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/shorts">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground mb-1" data-testid="button-back-shorts">
                <ArrowLeft className="w-4 h-4" />
                Back to Shorts
              </Button>
            </Link>
            <h1 className="text-2xl font-bold" data-testid="text-editor-title">
              {isNew ? "Create New Short" : "Edit Short"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => {
                  if (confirm("Delete this short? This cannot be undone.")) {
                    deleteMutation.mutate();
                  }
                }}
                data-testid="button-delete-short"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!canSave || saveMutation.isPending}
              className="gap-2"
              data-testid="button-save-short"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="book" className="text-sm font-medium mb-2 block">Book *</Label>
                <Select value={bookId} onValueChange={setBookId}>
                  <SelectTrigger data-testid="select-book">
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books?.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                  placeholder="Short title"
                  maxLength={100}
                  data-testid="input-title"
                />
                <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-medium mb-2 block">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder="Short content text"
                  rows={4}
                  maxLength={500}
                  data-testid="input-content"
                />
                <p className="text-xs text-muted-foreground mt-1">{content.length}/500</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Media Type *</Label>
                <div className="flex gap-3">
                  {[
                    { value: "image", label: "Image", icon: Image },
                    { value: "audio", label: "Audio", icon: Headphones },
                    { value: "video", label: "Video", icon: Video },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMediaType(value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                        mediaType === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/50"
                      }`}
                      data-testid={`radio-media-${value}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="mediaUrl" className="text-sm font-medium mb-2 block">Media URL</Label>
                <Input
                  id="mediaUrl"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-media-url"
                />
              </div>

              <div>
                <Label htmlFor="thumbnailUrl" className="text-sm font-medium mb-2 block">
                  Thumbnail URL {needsThumbnail && "*"}
                </Label>
                <Input
                  id="thumbnailUrl"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-thumbnail-url"
                />
                {needsThumbnail && (
                  <p className="text-xs text-purple-700 mt-1">Required for audio/video shorts</p>
                )}
              </div>

              <div>
                <Label htmlFor="backgroundGradient" className="text-sm font-medium mb-2 block">Background Gradient</Label>
                <Input
                  id="backgroundGradient"
                  value={backgroundGradient}
                  onChange={(e) => setBackgroundGradient(e.target.value)}
                  placeholder="linear-gradient(135deg, #34153930, #0F0F1A)"
                  data-testid="input-gradient"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-sm font-medium mb-2 block">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration || ""}
                  onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="30"
                  min={1}
                  data-testid="input-duration"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-xs text-muted-foreground">{status === "published" ? "Visible to users" : "Hidden from users"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{status === "published" ? "Published" : "Draft"}</span>
                  <Switch
                    checked={status === "published"}
                    onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
                    data-testid="switch-status"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Link href="/admin/shorts">
              <Button variant="outline" data-testid="button-cancel">Cancel</Button>
            </Link>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!canSave || saveMutation.isPending}
              className="gap-2"
              data-testid="button-save-bottom"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Short"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
