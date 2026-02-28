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
import { Plus, BookOpen, Edit, Trash2, Globe, FileText, Users, ExternalLink, Rocket, ArrowDownCircle, BarChart3, Film, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
  const userRole = user?.role || "user";
  const canDelete = hasMinRole(userRole, "admin");
  const canPublish = hasMinRole(userRole, "editor");
  const isSuperAdmin = hasMinRole(userRole, "super_admin");

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/admin/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: contentHealth } = useQuery<ContentHealthData>({
    queryKey: ["/api/admin/content-health"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createBookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/books", {
        title: "Untitled Book",
        author: "Unknown Author",
        description: "A new book breakdown",
        readTime: 10,
        listenTime: 8,
      });
      return res.json();
    },
    onSuccess: (newBook: Book) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-health"] });
      navigate(`/admin/books/${newBook.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create book", variant: "destructive" });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await apiRequest("DELETE", `/api/admin/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-health"] });
      toast({ title: "Deleted", description: "Book and all content removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Published", description: "Book is now live in the app" });
    },
    onError: () => toast({ title: "Error", description: "Failed to publish book", variant: "destructive" }),
  });

  const unpublishMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/unpublish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "Unpublished", description: "Book moved to draft" });
    },
    onError: () => toast({ title: "Error", description: "Failed to unpublish book", variant: "destructive" }),
  });

  const getBookScore = (bookId: string): BookContentScore | undefined => {
    return contentHealth?.books.find((b) => b.bookId === bookId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] p-8">
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
    <div className="min-h-screen bg-[#F5F0EB] p-8" data-testid="admin-books-page">
      <SEOHead title="Admin - Books" noIndex />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Manage book breakdowns</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="gap-2 text-muted-foreground" data-testid="button-view-app">
                <ExternalLink className="w-4 h-4" />
                View App
              </Button>
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/users">
                <Button variant="outline" className="gap-2" data-testid="button-admin-users">
                  <Users className="w-4 h-4" />
                  Team & Users
                </Button>
              </Link>
            )}
            <Link href="/admin/shorts">
              <Button variant="outline" className="gap-2" data-testid="button-admin-shorts">
                <Film className="w-4 h-4" />
                Shorts
              </Button>
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/analytics">
                <Button variant="outline" className="gap-2" data-testid="button-admin-analytics">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
              </Link>
            )}
            <Button
              onClick={() => createBookMutation.mutate()}
              disabled={createBookMutation.isPending}
              className="gap-2"
              data-testid="button-create-book"
            >
              <Plus className="w-4 h-4" />
              Create New Book Breakdown
            </Button>
          </div>
        </div>

        {contentHealth && books && books.length > 0 && (
          <div className="mb-8" data-testid="content-health-overview">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold" data-testid="text-content-health-title">Content Health</h2>
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

        {(!books || books.length === 0) ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-6">Create your first book breakdown to get started</p>
            <Button onClick={() => createBookMutation.mutate()} className="gap-2" data-testid="button-create-first">
              <Plus className="w-4 h-4" />
              Create New Book Breakdown
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const isPublished = book.status === "published" || book.status === "published_with_changes";
              const score = getBookScore(book.id);
              return (
                <Card
                  key={book.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                  data-testid={`card-book-${book.id}`}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                    {book.coverImage && (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
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
                          <><Globe className="w-3 h-3 mr-1" />Live</>
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
                          variant={isPublished ? "outline" : "default"}
                          size="sm"
                          className={`gap-1 text-xs ${!isPublished ? "bg-emerald-600" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPublished) {
                              unpublishMutation.mutate(book.id);
                            } else {
                              publishMutation.mutate(book.id);
                            }
                          }}
                          disabled={publishMutation.isPending || unpublishMutation.isPending}
                          data-testid={`button-publish-${book.id}`}
                        >
                          {isPublished ? (
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
