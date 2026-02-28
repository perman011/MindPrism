import { SEOHead } from "@/components/SEOHead";
import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, Link } from "wouter";
import type {
  Book, ChapterSummary, MentalModel, Principle, Story,
  CommonMistake, Infographic, Exercise, ActionItem, BookVersion, Short,
} from "@shared/schema";
import { MindTree } from "./mind-tree";
import { MobilePreview } from "./mobile-preview";
import { PublishPanel } from "./publish-panel";
import { BookSetupEditor } from "./editors/book-setup-editor";
import { ChapterEditor } from "./editors/chapter-editor";
import { MentalModelEditor } from "./editors/mental-model-editor";
import { PrincipleEditor } from "./editors/principle-editor";
import { MistakeEditor } from "./editors/mistake-editor";
import { InfographicEditor } from "./editors/infographic-editor";
import { ExerciseEditor } from "./editors/exercise-editor";
import { ActionItemEditor } from "./editors/action-item-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, GitBranch, Plus, Trash2, Edit2, Film, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DREAM_CURTAIN_GRADIENTS = [
  { name: "Midnight Amethyst", value: "linear-gradient(135deg, #341539 0%, #0F0F1A 100%)" },
  { name: "Deep Ocean", value: "linear-gradient(135deg, #0D1B2A 0%, #1B2838 50%, #2C3E50 100%)" },
  { name: "Twilight Rose", value: "linear-gradient(135deg, #4A1942 0%, #2D1B4E 50%, #1A1A2E 100%)" },
  { name: "Forest Dusk", value: "linear-gradient(135deg, #1A3A2A 0%, #0F2027 50%, #2C5364 100%)" },
  { name: "Golden Ember", value: "linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #1A1A2E 100%)" },
  { name: "Cosmic Lavender", value: "linear-gradient(135deg, #2E1065 0%, #581C87 50%, #0F0F1A 100%)" },
];

function ShortsEditor({ bookId, shorts }: { bookId: string; shorts: Short[] }) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [backgroundGradient, setBackgroundGradient] = useState("");
  const [status, setStatus] = useState("draft");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setBackgroundGradient("");
    setStatus("draft");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (s: Short) => {
    setEditingId(s.id);
    setTitle(s.title);
    setContent(s.content);
    setBackgroundGradient(s.backgroundGradient || "");
    setStatus(s.status);
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        bookId,
        title,
        content,
        mediaType: "image",
        backgroundGradient: backgroundGradient || null,
        status,
      };
      if (editingId) {
        return apiRequest("PUT", `/api/admin/shorts/${editingId}`, payload);
      }
      return apiRequest("POST", "/api/admin/shorts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shorts"] });
      toast({ title: "Saved", description: editingId ? "Short updated" : "Short created" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save short", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/shorts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shorts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shorts"] });
      toast({ title: "Deleted", description: "Short removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete short", variant: "destructive" });
    },
  });

  const canSave = title.trim() && content.trim();

  return (
    <div id="section-shorts" data-testid="shorts-editor">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Story Shorts</h2>
          <Badge variant="secondary" className="text-[10px]">{shorts.length}</Badge>
        </div>
        {!showForm && (
          <Button size="sm" className="gap-1" onClick={() => { resetForm(); setShowForm(true); }} data-testid="button-add-short">
            <Plus className="w-4 h-4" />
            Add Short
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5 mb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-semibold">{editingId ? "Edit Short" : "New Short"}</p>
              <Button variant="ghost" size="icon" onClick={resetForm} data-testid="button-cancel-short-form">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="Short title"
                maxLength={100}
                data-testid="input-short-title"
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="Short content. Use **bold** and *italic* for formatting."
                rows={3}
                maxLength={500}
                data-testid="input-short-content"
              />
              <p className="text-xs text-muted-foreground mt-1">{content.length}/500</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Background Gradient</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {DREAM_CURTAIN_GRADIENTS.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => setBackgroundGradient(g.value)}
                    className={`relative rounded-md overflow-visible aspect-[4/3] border-2 transition-all ${
                      backgroundGradient === g.value
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    }`}
                    data-testid={`short-gradient-${g.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="absolute inset-0 rounded-md" style={{ background: g.value }} />
                    <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] text-white/80 text-center truncate">{g.name}</span>
                    {backgroundGradient === g.value && (
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Input
                value={backgroundGradient}
                onChange={(e) => setBackgroundGradient(e.target.value)}
                placeholder="Or enter a custom gradient..."
                data-testid="input-short-gradient"
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
                  data-testid="switch-short-status"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm} data-testid="button-cancel-short">Cancel</Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => saveMutation.mutate()}
                disabled={!canSave || saveMutation.isPending}
                data-testid="button-save-short"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {shorts.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No shorts for this book yet</p>
          <Button size="sm" className="gap-1" onClick={() => { resetForm(); setShowForm(true); }} data-testid="button-add-short-empty">
            <Plus className="w-4 h-4" />
            Add First Short
          </Button>
        </Card>
      )}

      {shorts.length > 0 && (
        <div className="space-y-2">
          {shorts.map((s) => (
            <Card key={s.id} className="p-4" data-testid={`short-card-${s.id}`}>
              <div className="flex items-start gap-3">
                {s.backgroundGradient && (
                  <div className="w-12 h-12 rounded-md flex-shrink-0 border border-border" style={{ background: s.backgroundGradient }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <Badge variant={s.status === "published" ? "default" : "secondary"} className="text-[10px]">
                      {s.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.content}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(s)} data-testid={`button-edit-short-${s.id}`}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this short?")) {
                        deleteMutation.mutate(s.id);
                      }
                    }}
                    data-testid={`button-delete-short-${s.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBookEditor() {
  const [, params] = useRoute("/admin/books/:id");
  const bookId = params?.id || "";
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("setup");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const centerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ["/api/books", bookId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: contentCounts } = useQuery<any>({
    queryKey: ["/api/books", bookId, "content-counts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: chapters = [] } = useQuery<ChapterSummary[]>({
    queryKey: ["/api/books", bookId, "chapter-summaries"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: mentalModels = [] } = useQuery<MentalModel[]>({
    queryKey: ["/api/books", bookId, "mental-models"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: principles = [] } = useQuery<Principle[]>({
    queryKey: ["/api/books", bookId, "principles"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ["/api/books", bookId, "stories"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: mistakes = [] } = useQuery<CommonMistake[]>({
    queryKey: ["/api/books", bookId, "common-mistakes"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: infographics = [] } = useQuery<Infographic[]>({
    queryKey: ["/api/books", bookId, "infographics"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/books", bookId, "exercises"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: actionItems = [] } = useQuery<ActionItem[]>({
    queryKey: ["/api/books", bookId, "action-items"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const { data: allShorts = [] } = useQuery<Short[]>({
    queryKey: ["/api/admin/shorts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!bookId,
  });

  const bookShorts = useMemo(() => allShorts.filter(s => s.bookId === bookId), [allShorts, bookId]);

  const { data: draftVersion } = useQuery<BookVersion | null>({
    queryKey: ["/api/admin/books", bookId, "draft"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!bookId,
  });

  const isPublishedBook = book?.status === "published" || book?.status === "published_with_changes";
  const hasDraft = book?.status === "published_with_changes" && !!draftVersion;

  const editableBook = useMemo(() => {
    if (!book) return null;
    if (hasDraft && draftVersion?.content) {
      const dc = draftVersion.content as Record<string, any>;
      return { ...book, ...dc } as Book;
    }
    return book;
  }, [book, hasDraft, draftVersion]);

  const updateBookMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isPublishedBook) {
        const res = await apiRequest("PUT", `/api/admin/books/${bookId}/draft`, data);
        return res.json();
      }
      const res = await apiRequest("PUT", `/api/admin/books/${bookId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", bookId, "draft"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", bookId, "diff"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to save book", variant: "destructive" }),
  });

  const handleBookFieldChange = useCallback((field: string, value: string | number | boolean) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateBookMutation.mutateAsync({ [field]: value });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 1500);
  }, [bookId, isPublishedBook]);

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    const el = centerRef.current?.querySelector(`#section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPreviewData = () => {
    switch (activeSection) {
      case "chapters": return chapters;
      case "mental-models": return mentalModels;
      case "principles": return principles;
      case "common-mistakes": return mistakes;
      case "infographics": return infographics;
      case "exercises": return exercises;
      case "action-items": return actionItems;
      default: return undefined;
    }
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-[280px] border-r p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8 w-full mb-2" />)}
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-96 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-lg font-semibold mb-2">Book not found</p>
          <Link href="/admin">
            <Button variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="admin-book-editor">
      <SEOHead title={`Edit - ${book.title}`} noIndex />
      <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back-admin">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{book.title}</p>
          <p className="text-[10px] text-muted-foreground">by {book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {saveStatus === "saved" && (
            <Badge variant="secondary" className="gap-1 text-[10px] text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </Badge>
          )}
          {saveStatus === "error" && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertCircle className="w-3 h-3" />
              Error
            </Badge>
          )}
          {book.status === "published_with_changes" ? (
            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
              <GitBranch className="w-3 h-3 mr-1" />Draft Changes
            </Badge>
          ) : (
            <Badge variant={book.status === "published" ? "default" : "secondary"} className="text-[10px]">
              {book.status === "published" ? "Published" : "Draft"}
            </Badge>
          )}
        </div>
      </header>

      {book.status === "published_with_changes" && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center gap-2" data-testid="banner-editing-published">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-primary">
            You have unpublished changes. Customers still see the previous version.
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[280px] flex-shrink-0 overflow-y-auto">
          <MindTree
            counts={contentCounts ? { ...contentCounts, shorts: bookShorts.length } : undefined}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            bookTitle={editableBook?.title || book.title}
          />
          <div className="p-3 border-t">
            <PublishPanel book={book} contentCounts={contentCounts} />
          </div>
        </div>

        <div ref={centerRef} className="flex-1 overflow-y-auto p-6 space-y-10" data-testid="block-builder">
          <BookSetupEditor
            title={editableBook?.title || book.title}
            author={editableBook?.author || book.author}
            description={editableBook?.description || book.description || ""}
            coreThesis={editableBook?.coreThesis || book.coreThesis || ""}
            coverImage={editableBook?.coverImage || book.coverImage || ""}
            audioUrl={editableBook?.audioUrl || book.audioUrl || ""}
            primaryChakra={editableBook?.primaryChakra || book.primaryChakra || ""}
            secondaryChakra={editableBook?.secondaryChakra || book.secondaryChakra || ""}
            categoryId={editableBook?.categoryId || book.categoryId || ""}
            onChange={handleBookFieldChange}
          />

          <ChapterEditor bookId={bookId} chapters={chapters} />
          <MentalModelEditor bookId={bookId} models={mentalModels} />
          <PrincipleEditor bookId={bookId} principles={principles} stories={stories} />
        </div>

        <div className="w-[375px] flex-shrink-0 overflow-hidden">
          <MobilePreview
            bookTitle={editableBook?.title || book.title}
            bookAuthor={editableBook?.author || book.author}
            coreThesis={editableBook?.coreThesis || book.coreThesis || ""}
            activeSection={activeSection}
            sectionData={getPreviewData()}
          />
        </div>
      </div>
    </div>
  );
}
