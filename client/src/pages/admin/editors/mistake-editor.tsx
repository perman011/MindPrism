import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CommonMistake } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MistakeEditorProps {
  bookId: string;
  mistakes: CommonMistake[];
}

export function MistakeEditor({ bookId, mistakes }: MistakeEditorProps) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/common-mistakes`, {
        mistake: "What people do wrong...",
        correction: "The psychological correction...",
        orderIndex: mistakes.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "common-mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create mistake", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/common-mistakes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "common-mistakes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/common-mistakes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "common-mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  return (
    <section id="section-common-mistakes" data-testid="editor-common-mistakes">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-violet-500" />
          Common Mistakes
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-mistake">
          <Plus className="w-3.5 h-3.5" />
          Add Mistake
        </Button>
      </div>

      <div className="space-y-4">
        {mistakes.map((mistake) => (
          <Card key={mistake.id} className="p-4" data-testid={`mistake-block-${mistake.id}`}>
            <div className="flex items-start gap-3">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-red-500 font-semibold mb-2">The Mistake</p>
                  <Textarea
                    value={mistake.mistake}
                    onChange={(e) => updateMutation.mutate({ id: mistake.id, data: { mistake: e.target.value } })}
                    rows={3}
                    className="text-sm resize-none border-none p-0 focus-visible:ring-0"
                    placeholder="What people do wrong..."
                    data-testid={`input-mistake-${mistake.id}`}
                  />
                </div>
                <div className="border-2 border-emerald-200 dark:border-emerald-900 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-2">The Fix</p>
                  <Textarea
                    value={mistake.correction}
                    onChange={(e) => updateMutation.mutate({ id: mistake.id, data: { correction: e.target.value } })}
                    rows={3}
                    className="text-sm resize-none border-none p-0 focus-visible:ring-0"
                    placeholder="The psychological correction..."
                    data-testid={`input-correction-${mistake.id}`}
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(mistake.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
