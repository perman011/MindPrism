import { useEffect, useState, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { hasMinRole } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, BookOpen, Edit, Trash2, Globe, FileText, Users, ExternalLink, Rocket, ArrowDownCircle, BarChart3, Film, Activity, CheckCircle2, AlertTriangle, Search, ArrowUpDown, X, Info, Sun, Moon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { normalizeMediaUrl } from "@/lib/media-url";

interface ContentHealthSection {
  label: string;
  score: number;
  maxScore: number;
  details: string[];
}

interface BookContentScore {
  bookId: string;
  bookTitle: string;
  bookStatus: string;
  percentage: number;
  totalScore: number;
  maxScore: number;
  sections: Record<string, ContentHealthSection>;
  counts: Record<string, number>;
}

interface ContentHealthData {
  overview: {
    totalBooks: number;
    averageScore: number;
    completeBooks: number;
    needsWork: number;
  };
  books: BookContentScore[];
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (percentage >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "[&>div]:bg-emerald-500";
  if (percentage >= 50) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export default function AdminBooks() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const userRole = user?.role || "user";
  const canDelete = hasMinRole(userRole, "admin");
  const canPublish = hasMinRole(userRole, "editor");
  const isSuperAdmin = hasMinRole(userRole, "super_admin");

  useEffect(() => {
    document.title = "Admin Dashboard | MindPrism";
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "completeness-desc" | "completeness-asc">("name-asc");
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [bulkConfirmAction, setBulkConfirmAction] = useState<"published" | "draft" | null>(null);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/admin/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: contentHealth } = useQuery<ContentHealthData>({
    queryKey: ["/api/admin/content-health"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    let result = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((b) => {
        const isPublished = b.status === "published" || b.status === "published_with_changes";
        return statusFilter === "published" ? isPublished : !isPublished;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      const scoreA = contentHealth?.books.find((s) => s.bookId === a.id)?.percentage ?? 0;
      const scoreB = contentHealth?.books.find((s) => s.bookId === b.id)?.percentage ?? 0;
      return sortBy === "completeness-desc" ? scoreB - scoreA : scoreA - scoreB;
    });

    return result;
  }, [books, searchQuery, statusFilter, sortBy, contentHealth]);

  const handleCreateNewBook = () => {
    navigate("/admin/books/new");
  };


  const invalidateConsumerContentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    queryClient.invalidateQueries({ queryKey: ["/api/books/recommended"] });
    queryClient.invalidateQueries({ queryKey: ["/api/books/because-you-read"] });
    queryClient.invalidateQueries({ queryKey: ["/api/shorts"] });
  };

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await apiRequest("DELETE", `/api/admin/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-health"] });
      toast({ title: "Deleted", description: "Book and all content removed" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete book";
      const description = message.includes("403")
        ? "You need admin role to delete books"
        : message.includes("500")
          ? "Could not delete book because related content is still linked"
          : "Failed to delete book";
      toast({ title: "Error", description, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      invalidateConsumerContentQueries();
      toast({ title: "Published", description: "Book is now live in the app" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message.replace(/^\d+\:\s*/, "") : "Failed to publish book";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/unpublish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      invalidateConsumerContentQueries();
      toast({ title: "Unpublished", description: "Book moved to draft" });
    },
    onError: () => toast({ title: "Error", description: "Failed to unpublish book", variant: "destructive" }),
  });

  const publishDraftMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/publish-draft`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      invalidateConsumerContentQueries();
      toast({ title: "Changes Published", description: "Latest draft changes are now live" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message.replace(/^\d+\:\s*/, "") : "Failed to publish draft changes";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });


  const bulkStatusMutation = useMutation({
    mutationFn: async ({ bookIds, status }: { bookIds: string[]; status: "published" | "draft" }) => {
      const res = await apiRequest("POST", "/api/admin/books/bulk-status", { bookIds, status });
      return res.json();
    },
    onSuccess: (data: { updated: number; total: number }, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      invalidateConsumerContentQueries();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-health"] });
      setSelectedBookIds(new Set());
      const action = variables.status === "published" ? "published" : "unpublished";
      toast({ title: "Bulk Update Complete", description: `${data.updated} of ${data.total} books ${action}` });
    },
    onError: () => toast({ title: "Error", description: "Failed to update books", variant: "destructive" }),
  });

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBookIds.size === filteredBooks.length) {
      setSelectedBookIds(new Set());
    } else {
      setSelectedBookIds(new Set(filteredBooks.map((b) => b.id)));
    }
  };

  const getBookScore = (bookId: string): BookContentScore | undefined => {
    return contentHealth?.books.find((b) => b.bookId === bookId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8" data-testid="admin-books-page">
      <SEOHead title="Admin - Books" noIndex />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Manage book breakdowns</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateNewBook}
              className="gap-2"
              data-testid="button-create-book"
            >
              <Plus className="w-4 h-4" />
              Create New Book
            </Button>
          </div>
        </div>

        {contentHealth && books && books.length > 0 && (
          <div className="mb-8" data-testid="content-health-overview">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold" data-testid="text-content-health-title">Content Health</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" data-testid="icon-content-health-info" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs text-xs" data-testid="tooltip-content-health">
                  <p>Score is based on: Title &amp; Author (10%), Description (10%), Cover Image (10%), Core Thesis (15%), Chapters (20%), Mental Models (15%), Principles (10%), Exercises (10%)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4" data-testid="stat-total-books">
                <p className="text-xs text-muted-foreground mb-1">Total Books</p>
                <p className="text-2xl font-bold" data-testid="text-total-books">{contentHealth.overview.totalBooks}</p>
              </Card>
              <Card className="p-4" data-testid="stat-avg-score">
                <p className="text-xs text-muted-foreground mb-1">Average Completeness</p>
                <p className={`text-2xl font-bold ${getScoreColor(contentHealth.overview.averageScore)}`} data-testid="text-avg-score">
                  {contentHealth.overview.averageScore}%
                </p>
              </Card>
              <Card className="p-4" data-testid="stat-complete-books">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Complete (80%+)</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-complete-books">
                  {contentHealth.overview.completeBooks}
                </p>
              </Card>
              <Card className="p-4" data-testid="stat-needs-work">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Needs Work (&lt;50%)</p>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-needs-work">
                  {contentHealth.overview.needsWork}
                </p>
              </Card>
            </div>
          </div>
        )}

        {books && books.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3" data-testid="book-filters">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-books"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "published" | "draft")}>
              <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="completeness-desc">Completeness High-Low</SelectItem>
                <SelectItem value="completeness-asc">Completeness Low-High</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== "all") && (
              <Badge variant="secondary" className="gap-1" data-testid="badge-filter-count">
                {filteredBooks.length} of {books.length} books
              </Badge>
            )}
          </div>
        )}

        {canPublish && books && books.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3" data-testid="bulk-actions-bar">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredBooks.length > 0 && selectedBookIds.size === filteredBooks.length}
                onCheckedChange={toggleSelectAll}
                data-testid="checkbox-select-all"
              />
              <span className="text-sm text-muted-foreground">
                {selectedBookIds.size > 0
                  ? `${selectedBookIds.size} selected`
                  : "Select all"}
              </span>
            </div>
            {selectedBookIds.size > 0 && (
              <>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600"
                  onClick={() => setBulkConfirmAction("published")}
                  disabled={bulkStatusMutation.isPending}
                  data-testid="button-bulk-publish"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Publish ({selectedBookIds.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setBulkConfirmAction("draft")}
                  disabled={bulkStatusMutation.isPending}
                  data-testid="button-bulk-unpublish"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  Unpublish ({selectedBookIds.size})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => setSelectedBookIds(new Set())}
                  data-testid="button-clear-selection"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              </>
            )}
          </div>
        )}

        <AlertDialog open={bulkConfirmAction !== null} onOpenChange={(open) => { if (!open) setBulkConfirmAction(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle data-testid="text-bulk-confirm-title">
                {bulkConfirmAction === "published" ? "Publish" : "Unpublish"} {selectedBookIds.size} {selectedBookIds.size === 1 ? "book" : "books"}?
              </AlertDialogTitle>
              <AlertDialogDescription data-testid="text-bulk-confirm-description">
                {bulkConfirmAction === "published"
                  ? `This will make ${selectedBookIds.size} ${selectedBookIds.size === 1 ? "book" : "books"} live in the app.`
                  : `This will move ${selectedBookIds.size} ${selectedBookIds.size === 1 ? "book" : "books"} back to draft status.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-bulk-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (bulkConfirmAction) {
                    bulkStatusMutation.mutate({ bookIds: Array.from(selectedBookIds), status: bulkConfirmAction });
                    setBulkConfirmAction(null);
                  }
                }}
                data-testid="button-bulk-confirm"
              >
                {bulkConfirmAction === "published" ? "Publish All" : "Unpublish All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {(!books || books.length === 0) ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-6">Create your first book breakdown to get started</p>
            <Button onClick={handleCreateNewBook} className="gap-2" data-testid="button-create-first">
              <Plus className="w-4 h-4" />
              Create New Book Breakdown
            </Button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1" data-testid="text-no-results">No matching books</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} data-testid="button-clear-filters">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const isPublished = book.status === "published" || book.status === "published_with_changes";
              const score = getBookScore(book.id);
              const isSelected = selectedBookIds.has(book.id);
              const coverUrl = normalizeMediaUrl(book.coverImage);
              return (
                <Card
                  key={book.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}
                  data-testid={`card-book-${book.id}`}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                    {coverUrl && (
                      <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    )}
                    {canPublish && (
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleBookSelection(book.id)}
                          className="bg-background/80 backdrop-blur-sm"
                          data-testid={`checkbox-book-${book.id}`}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate flex-1">{book.title}</h3>
                      <Badge
                        variant={isPublished ? "default" : "secondary"}
                        className={`text-[10px] flex-shrink-0 ${isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100" : ""}`}
                        data-testid={`badge-status-${book.id}`}
                      >
                        {isPublished ? (
                          <><Globe className="w-3 h-3 mr-1" />{book.status === "published_with_changes" ? "Live + Draft" : "Live"}</>
                        ) : (
                          <><FileText className="w-3 h-3 mr-1" />Draft</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">by {book.author}</p>

                    {score && (
                      <div className="mb-3" data-testid={`content-score-${book.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Content Completeness</span>
                          <span className={`text-[10px] font-semibold ${getScoreColor(score.percentage)}`} data-testid={`text-score-${book.id}`}>
                            {score.percentage}%
                          </span>
                        </div>
                        <Progress
                          value={score.percentage}
                          className={`h-1.5 ${getProgressColor(score.percentage)}`}
                          data-testid={`progress-score-${book.id}`}
                        />
                        {score.percentage < 50 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {Object.values(score.sections)
                              .filter((s) => s.details.length > 0)
                              .slice(0, 2)
                              .map((s) => (
                                <Badge key={s.label} variant="outline" className="text-[9px] py-0 border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                                  {s.details[0]}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/books/${book.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5" data-testid={`button-edit-${book.id}`}>
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </Link>
                      {canPublish && (
                        <Button
                          variant={book.status === "published_with_changes" ? "default" : isPublished ? "outline" : "default"}
                          size="sm"
                          className={`gap-1 text-xs ${!isPublished || book.status === "published_with_changes" ? "bg-emerald-600" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (book.status === "published_with_changes") {
                              publishDraftMutation.mutate(book.id);
                            } else if (isPublished) {
                              unpublishMutation.mutate(book.id);
                            } else {
                              publishMutation.mutate(book.id);
                            }
                          }}
                          disabled={publishMutation.isPending || unpublishMutation.isPending || publishDraftMutation.isPending}
                          data-testid={`button-publish-${book.id}`}
                        >
                          {book.status === "published_with_changes" ? (
                            <><Rocket className="w-3.5 h-3.5" />Publish Changes</>
                          ) : isPublished ? (
                            <><ArrowDownCircle className="w-3.5 h-3.5" />Unpublish</>
                          ) : (
                            <><Rocket className="w-3.5 h-3.5" />Publish</>
                          )}
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${book.title}" and ALL its content? This cannot be undone.`)) {
                              deleteBookMutation.mutate(book.id);
                            }
                          }}
                          data-testid={`button-delete-${book.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
