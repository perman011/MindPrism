import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import type { Book, Comment, BookVersion } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { hasMinRole } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Rocket, AlertCircle, Globe, FileText, GitBranch, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PublishPanelProps {
  book: Book;
  contentCounts: any;
}

export function PublishPanel({ book, contentCounts }: PublishPanelProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canPublish = hasMinRole(user?.role, "editor");
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/admin/books", book.id, "comments"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: diffData } = useQuery<{ hasDraft: boolean; changes: Array<{ field: string; published: any; draft: any }> }>({
    queryKey: ["/api/admin/books", book.id, "diff"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: book.status === "published_with_changes",
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

  const publishDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${book.id}/publish-draft`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", book.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", book.id, "diff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", book.id, "draft"] });
      setShowPublishConfirm(false);
      toast({ title: "Changes Published", description: "Draft changes are now live for customers" });
    },
    onError: () => toast({ title: "Error", description: "Failed to publish changes", variant: "destructive" }),
  });

  const discardDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${book.id}/discard-draft`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", book.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", book.id, "diff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", book.id, "draft"] });
      setShowDiscardConfirm(false);
      toast({ title: "Draft Discarded", description: "Reverted to the published version" });
    },
    onError: () => toast({ title: "Error", description: "Failed to discard draft", variant: "destructive" }),
  });

  const statusBadge = () => {
    if (book.status === "published_with_changes") {
      return (
        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
          <GitBranch className="w-3 h-3 mr-1" />Draft Changes
        </Badge>
      );
    }
    if (book.status === "published") {
      return (
        <Badge variant="default" className="text-[10px]">
          <Globe className="w-3 h-3 mr-1" />Published
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px]">
        <FileText className="w-3 h-3 mr-1" />Draft
      </Badge>
    );
  };

  return (
    <div className="border rounded-xl p-4 bg-muted/20" data-testid="publish-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Rocket className="w-4 h-4" />
          Publishing
        </h3>
        {statusBadge()}
      </div>

      {book.status === "published_with_changes" && (
        <div className="flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary mb-3" data-testid="banner-draft-changes">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">You have unpublished changes.</p>
            <p className="text-primary/70 mt-0.5">Customers still see the previous version.</p>
            {diffData?.changes && diffData.changes.length > 0 && (
              <p className="text-primary/60 mt-1">{diffData.changes.length} field{diffData.changes.length > 1 ? "s" : ""} changed</p>
            )}
          </div>
        </div>
      )}

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

      {showPublishConfirm && (
        <div className="p-3 border border-primary/30 bg-primary/5 rounded-lg mb-3" data-testid="confirm-publish-draft">
          <p className="text-xs font-semibold mb-2">Publish these changes?</p>
          {diffData?.changes?.map((c, i) => (
            <div key={i} className="text-[10px] text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{c.field}</span>: changed
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground mt-2 mb-2">This will update what customers see.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1 text-xs"
              onClick={() => publishDraftMutation.mutate()}
              disabled={publishDraftMutation.isPending}
              data-testid="button-confirm-publish-draft"
            >
              <Rocket className="w-3 h-3" />
              Confirm Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowPublishConfirm(false)}
              data-testid="button-cancel-publish-draft"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showDiscardConfirm && (
        <div className="p-3 border border-destructive/30 bg-destructive/5 rounded-lg mb-3" data-testid="confirm-discard-draft">
          <p className="text-xs font-semibold mb-1">Discard all draft changes?</p>
          <p className="text-[10px] text-muted-foreground mb-2">This will revert to the last published version. This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 gap-1 text-xs"
              onClick={() => discardDraftMutation.mutate()}
              disabled={discardDraftMutation.isPending}
              data-testid="button-confirm-discard"
            >
              <Undo2 className="w-3 h-3" />
              Discard
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowDiscardConfirm(false)}
              data-testid="button-cancel-discard"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {canPublish ? (
        book.status === "published_with_changes" ? (
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setShowPublishConfirm(true)}
              disabled={!allPassed || publishDraftMutation.isPending}
              data-testid="button-publish-changes"
            >
              <Rocket className="w-3.5 h-3.5" />
              Publish Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setShowDiscardConfirm(true)}
              disabled={discardDraftMutation.isPending}
              data-testid="button-discard-draft"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Discard Changes
            </Button>
          </div>
        ) : book.status === "published" ? (
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
        )
      ) : (
        <p className="text-[10px] text-muted-foreground text-center">Only editors and above can publish.</p>
      )}
    </div>
  );
}
