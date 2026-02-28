import { SEOHead } from "@/components/SEOHead";
import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, Link } from "wouter";
import type {
  Book, ChapterSummary, MentalModel, Principle, Story,
  CommonMistake, Infographic, Exercise, ActionItem, BookVersion,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-[#F5F0EB] flex">
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
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
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
    <div className="h-screen flex flex-col bg-[#F5F0EB]" data-testid="admin-book-editor">
      <SEOHead title={`Edit - ${book.title}`} noIndex />
      <header className="h-14 bg-[#F5F0EB] border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
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
            counts={contentCounts}
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
            audioDuration={editableBook?.audioDuration ?? book.audioDuration ?? 0}
            affiliateUrl={editableBook?.affiliateUrl || book.affiliateUrl || ""}
            readTime={editableBook?.readTime ?? book.readTime}
            listenTime={editableBook?.listenTime ?? book.listenTime}
            primaryChakra={editableBook?.primaryChakra || book.primaryChakra || ""}
            secondaryChakra={editableBook?.secondaryChakra || book.secondaryChakra || ""}
            categoryId={editableBook?.categoryId || book.categoryId || ""}
            premiumOnly={editableBook?.premiumOnly ?? book.premiumOnly ?? false}
            freePreviewCards={editableBook?.freePreviewCards ?? book.freePreviewCards ?? 5}
            onChange={handleBookFieldChange}
          />

          <ChapterEditor bookId={bookId} chapters={chapters} />
          <MentalModelEditor bookId={bookId} models={mentalModels} />
          <PrincipleEditor bookId={bookId} principles={principles} stories={stories} />
          <MistakeEditor bookId={bookId} mistakes={mistakes} />
          <InfographicEditor bookId={bookId} infographics={infographics} />
          <ExerciseEditor bookId={bookId} exercises={exercises} />
          <ActionItemEditor bookId={bookId} actionItems={actionItems} />
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
