import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import type { Book, Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Rocket, AlertCircle, Globe, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishPanelProps {
  book: Book;
  contentCounts: any;
}

export function PublishPanel({ book, contentCounts }: PublishPanelProps) {
  const { toast } = useToast();

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/admin/books", book.id, "comments"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const unresolvedCount = (comments || []).filter((c) => !c.resolved).length;

  const checks = [
    { label: "Book title", pass: !!book.title && book.title !== "Untitled Book" },
    { label: "Author name", pass: !!book.author && book.author !== "Unknown Author" },
    { label: "Core thesis", pass: !!book.coreThesis && book.coreThesis.length > 10 },
    { label: "At least 1 chapter", pass: (contentCounts?.chapterSummaries || 0) > 0 },
    { label: "At least 1 principle", pass: (contentCounts?.principles || 0) > 0 },
    { label: "No unresolved comments", pass: unresolvedCount === 0 },
  ];

  const allPassed = checks.every((c) => c.pass);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${book.id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", book.id] });
      toast({ title: "Published", description: `"${book.title}" is now live in the app` });
    },
    onError: () => toast({ title: "Error", description: "Failed to publish", variant: "destructive" }),
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${book.id}/unpublish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", book.id] });
      toast({ title: "Unpublished", description: `"${book.title}" has been moved to draft` });
    },
  });

  return (
    <div className="border rounded-xl p-4 bg-muted/20" data-testid="publish-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Rocket className="w-4 h-4" />
          Publishing
        </h3>
        <Badge variant={book.status === "published" ? "default" : "secondary"} className="text-[10px]">
          {book.status === "published" ? (
            <><Globe className="w-3 h-3 mr-1" />Published</>
          ) : (
            <><FileText className="w-3 h-3 mr-1" />Draft</>
          )}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {check.pass ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            )}
            <span className={check.pass ? "text-muted-foreground" : "text-foreground font-medium"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {unresolvedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400 mb-3">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {unresolvedCount} unresolved comment{unresolvedCount > 1 ? "s" : ""}
        </div>
      )}

      {book.status === "published" ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => unpublishMutation.mutate()}
          disabled={unpublishMutation.isPending}
          data-testid="button-unpublish"
        >
          Move to Draft
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full gap-1.5"
          onClick={() => publishMutation.mutate()}
          disabled={!allPassed || publishMutation.isPending}
          data-testid="button-publish"
        >
          <Rocket className="w-3.5 h-3.5" />
          Publish to App
        </Button>
      )}
    </div>
  );
}
