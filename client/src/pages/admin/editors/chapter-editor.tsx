import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChapterSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChapterEditorProps {
  bookId: string;
  chapters: ChapterSummary[];
}

export function ChapterEditor({ bookId, chapters }: ChapterEditorProps) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/chapters`, {
        chapterNumber: chapters.length + 1,
        chapterTitle: `Chapter ${chapters.length + 1}`,
        cards: [{ text: "Enter the first insight..." }],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create chapter", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/chapters/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/chapters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete chapter", variant: "destructive" }),
  });

  const addCard = (chapter: ChapterSummary) => {
    const existingCards = (chapter.cards as any[]) || [];
    updateMutation.mutate({
      id: chapter.id,
      data: { cards: [...existingCards, { text: "Enter insight..." }] },
    });
  };

  const updateCard = (chapter: ChapterSummary, cardIndex: number, text: string) => {
    const existingCards = [...((chapter.cards as any[]) || [])];
    existingCards[cardIndex] = { ...existingCards[cardIndex], text };
    updateMutation.mutate({ id: chapter.id, data: { cards: existingCards } });
  };

  const removeCard = (chapter: ChapterSummary, cardIndex: number) => {
    const existingCards = [...((chapter.cards as any[]) || [])];
    existingCards.splice(cardIndex, 1);
    updateMutation.mutate({ id: chapter.id, data: { cards: existingCards } });
  };

  return (
    <section id="section-chapters" data-testid="editor-chapters">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-700" />
          Chapter Summaries
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-chapter">
          <Plus className="w-3.5 h-3.5" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const cards = (chapter.cards as any[]) || [];
          return (
            <Card key={chapter.id} className="p-4 group relative" data-testid={`chapter-block-${chapter.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Badge variant="secondary" className="text-[10px]">Ch. {chapter.chapterNumber}</Badge>
                <Input
                  value={chapter.chapterTitle}
                  onChange={(e) => updateMutation.mutate({ id: chapter.id, data: { chapterTitle: e.target.value } })}
                  className="flex-1 h-8 text-sm font-semibold"
                  data-testid={`input-chapter-title-${chapter.id}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteMutation.mutate(chapter.id)}
                  data-testid={`button-delete-chapter-${chapter.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {cards.map((card: any, i: number) => (
                  <div key={i} className="min-w-[180px] max-w-[200px] flex-shrink-0 bg-muted/30 rounded-lg p-3 relative group/card">
                    <Badge variant="outline" className="text-[9px] mb-2">Tap {i + 1}</Badge>
                    <Textarea
                      value={card.text}
                      onChange={(e) => updateCard(chapter, i, e.target.value)}
                      rows={3}
                      className="text-xs resize-none"
                      placeholder="Tap screen text..."
                      data-testid={`input-card-text-${chapter.id}-${i}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover/card:opacity-100 text-destructive"
                      onClick={() => removeCard(chapter, i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <button
                  onClick={() => addCard(chapter)}
                  className="min-w-[120px] flex-shrink-0 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  data-testid={`button-add-card-${chapter.id}`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs">Add Tap</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
