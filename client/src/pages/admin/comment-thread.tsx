import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Send, MessageSquare } from "lucide-react";

interface CommentThreadProps {
  bookId: string;
  blockType: string;
  blockId: string;
  onClose: () => void;
}

export function CommentThread({ bookId, blockType, blockId, onClose }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const { data: allComments } = useQuery<Comment[]>({
    queryKey: ["/api/admin/books", bookId, "comments"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const comments = (allComments || []).filter(
    (c) => c.blockType === blockType && c.blockId === blockId
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/comments", {
        bookId,
        blockType,
        blockId,
        content: newComment,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", bookId, "comments"] });
      setNewComment("");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/comments/${id}`, { resolved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", bookId, "comments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/books", bookId, "comments"] });
    },
  });

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#F5F0EB] shadow-2xl border-l border-border z-50 flex flex-col" data-testid="comment-thread">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Comments</p>
          <Badge variant="secondary" className="text-[10px]">{blockType}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} data-testid="button-close-comments">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No comments yet</p>
          </div>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg text-sm ${
              comment.resolved
                ? "bg-muted/30 opacity-60"
                : "bg-blue-50 dark:bg-blue-50 border border-blue-200 dark:border-blue-200"
            }`}
            data-testid={`comment-${comment.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs leading-relaxed flex-1">{comment.content}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => resolveMutation.mutate({ id: comment.id, resolved: !comment.resolved })}
                  title={comment.resolved ? "Unresolve" : "Resolve"}
                  data-testid={`button-resolve-${comment.id}`}
                >
                  <Check className={`w-3 h-3 ${comment.resolved ? "text-emerald-500" : "text-muted-foreground"}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive"
                  onClick={() => deleteMutation.mutate(comment.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {comment.resolved && (
              <Badge variant="outline" className="text-[8px] mt-1 text-emerald-600">Resolved</Badge>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="text-xs resize-none flex-1"
            data-testid="input-new-comment"
          />
          <Button
            size="icon"
            className="h-full"
            onClick={() => createMutation.mutate()}
            disabled={!newComment.trim() || createMutation.isPending}
            data-testid="button-send-comment"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
