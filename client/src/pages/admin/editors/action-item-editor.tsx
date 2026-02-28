import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ActionItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, ListChecks, Zap, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionItemEditorProps {
  bookId: string;
  actionItems: ActionItem[];
}

export function ActionItemEditor({ bookId, actionItems }: ActionItemEditorProps) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/action-items`, {
        text: "New action item...",
        type: "immediate",
        orderIndex: actionItems.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "action-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create action item", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/action-items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "action-items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/action-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "action-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  const immediateItems = actionItems.filter((i) => i.type === "immediate");
  const longTermItems = actionItems.filter((i) => i.type === "long_term");

  return (
    <section id="section-action-items" data-testid="editor-action-items">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-teal-500" />
          Action Items
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-action-item">
          <Plus className="w-3.5 h-3.5" />
          Add Action Item
        </Button>
      </div>

      <div className="space-y-4">
        {actionItems.map((item) => (
          <Card key={item.id} className={`p-3 border-l-4 ${item.type === "immediate" ? "border-l-violet-400" : "border-l-blue-400"}`} data-testid={`action-item-block-${item.id}`}>
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
              <Input
                value={item.text}
                onChange={(e) => updateMutation.mutate({ id: item.id, data: { text: e.target.value } })}
                className="flex-1 h-8 text-sm"
                placeholder="Action item text..."
                data-testid={`input-action-text-${item.id}`}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  {item.type === "immediate" ? (
                    <Zap className="w-3.5 h-3.5 text-violet-500" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  <Badge variant="outline" className="text-[9px]">
                    {item.type === "immediate" ? "Do Today" : "Long-Term"}
                  </Badge>
                </div>
                <Switch
                  checked={item.type === "long_term"}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({ id: item.id, data: { type: checked ? "long_term" : "immediate" } })
                  }
                  data-testid={`switch-type-${item.id}`}
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {actionItems.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-violet-500" /> {immediateItems.length} immediate</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" /> {longTermItems.length} long-term</span>
        </div>
      )}
    </section>
  );
}
