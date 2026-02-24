import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Principle, Story } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Lightbulb, BookMarked } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrincipleEditorProps {
  bookId: string;
  principles: Principle[];
  stories: Story[];
}

export function PrincipleEditor({ bookId, principles, stories }: PrincipleEditorProps) {
  const { toast } = useToast();

  const createPrincipleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/principles`, {
        title: "New Principle",
        content: "Describe the principle...",
        orderIndex: principles.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "principles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create principle", variant: "destructive" }),
  });

  const updatePrincipleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/principles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "principles"] });
    },
  });

  const deletePrincipleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/principles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "principles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (principleId: string) => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/stories`, {
        principleId,
        title: "The Story",
        content: "Tell the real-world anecdote...",
        moral: "The lesson learned...",
        orderIndex: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "stories"] });
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/stories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "stories"] });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/stories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "stories"] });
    },
  });

  const getStoriesForPrinciple = (principleId: string) =>
    stories.filter((s) => s.principleId === principleId);

  return (
    <section id="section-principles" data-testid="editor-principles">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Principles & Stories
        </h2>
        <Button size="sm" onClick={() => createPrincipleMutation.mutate()} disabled={createPrincipleMutation.isPending} className="gap-1.5" data-testid="button-add-principle">
          <Plus className="w-3.5 h-3.5" />
          Add Principle
        </Button>
      </div>

      <div className="space-y-4">
        {principles.map((principle) => {
          const principleStories = getStoriesForPrinciple(principle.id);
          return (
            <Card key={principle.id} className="p-4" data-testid={`principle-block-${principle.id}`}>
              <div className="flex items-start gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={principle.title}
                    onChange={(e) => updatePrincipleMutation.mutate({ id: principle.id, data: { title: e.target.value } })}
                    className="font-semibold"
                    placeholder="Principle title..."
                    data-testid={`input-principle-title-${principle.id}`}
                  />
                  <Textarea
                    value={principle.content}
                    onChange={(e) => updatePrincipleMutation.mutate({ id: principle.id, data: { content: e.target.value } })}
                    rows={3}
                    className="text-sm"
                    placeholder="Describe the fundamental rule..."
                    data-testid={`input-principle-content-${principle.id}`}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                  if (principleStories.length > 0 && !confirm("Deleting this Principle will also delete its attached Story. Are you sure?")) return;
                  deletePrincipleMutation.mutate(principle.id);
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="ml-7 border-l-2 border-primary/20 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-primary">↳ Attached Story (Proof)</p>
                </div>
                {principleStories.length === 0 ? (
                  <Button variant="outline" size="sm" onClick={() => createStoryMutation.mutate(principle.id)} className="gap-1 text-xs w-full" data-testid={`button-attach-story-${principle.id}`}>
                    <Plus className="w-3 h-3" />
                    Attach Story
                  </Button>
                ) : (
                  principleStories.map((story) => (
                    <div key={story.id} className="bg-primary/5 rounded-lg p-3 space-y-2" data-testid={`story-block-${story.id}`}>
                      <div className="flex items-center gap-2">
                        <Input
                          value={story.title}
                          onChange={(e) => updateStoryMutation.mutate({ id: story.id, data: { title: e.target.value } })}
                          className="flex-1 h-7 text-xs font-semibold"
                          placeholder="Story title..."
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteStoryMutation.mutate(story.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={story.content}
                        onChange={(e) => updateStoryMutation.mutate({ id: story.id, data: { content: e.target.value } })}
                        rows={3}
                        className="text-xs resize-none"
                        placeholder="The real-world anecdote..."
                      />
                      <Input
                        value={story.moral || ""}
                        onChange={(e) => updateStoryMutation.mutate({ id: story.id, data: { moral: e.target.value } })}
                        className="h-7 text-xs"
                        placeholder="The moral / lesson..."
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
