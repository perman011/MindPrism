import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BookOpen, Edit, Trash2, Globe, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminBooks() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books?includeAll=true"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/books?includeAll=true"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/books?includeAll=true"] });
      toast({ title: "Deleted", description: "Book and all content removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8" data-testid="admin-books-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Manage book breakdowns</p>
          </div>
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
            {books.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`card-book-${book.id}`}
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  {book.coverImage && (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  )}
                  <Badge
                    variant={book.status === "published" ? "default" : "secondary"}
                    className="absolute top-3 right-3 text-[10px]"
                    data-testid={`badge-status-${book.id}`}
                  >
                    {book.status === "published" ? (
                      <><Globe className="w-3 h-3 mr-1" />Published</>
                    ) : (
                      <><FileText className="w-3 h-3 mr-1" />Draft</>
                    )}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">by {book.author}</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/books/${book.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5" data-testid={`button-edit-${book.id}`}>
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </Link>
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
