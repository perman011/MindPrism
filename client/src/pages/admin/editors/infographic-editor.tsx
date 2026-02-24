import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Infographic } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InfographicEditorProps {
  bookId: string;
  infographics: Infographic[];
}

export function InfographicEditor({ bookId, infographics }: InfographicEditorProps) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/infographics`, {
        title: "New Infographic",
        description: "Visual framework...",
        steps: [{ label: "Step 1", explanation: "Explain..." }],
        orderIndex: infographics.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "infographics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create infographic", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/infographics/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "infographics"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/infographics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "infographics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  const addStep = (inf: Infographic) => {
    const steps = [...((inf.steps as any[]) || []), { label: "New Step", explanation: "Explain..." }];
    updateMutation.mutate({ id: inf.id, data: { steps } });
  };

  const updateStep = (inf: Infographic, stepIndex: number, field: string, value: string) => {
    const steps = [...((inf.steps as any[]) || [])];
    steps[stepIndex] = { ...steps[stepIndex], [field]: value };
    updateMutation.mutate({ id: inf.id, data: { steps } });
  };

  const removeStep = (inf: Infographic, stepIndex: number) => {
    const steps = [...((inf.steps as any[]) || [])];
    steps.splice(stepIndex, 1);
    updateMutation.mutate({ id: inf.id, data: { steps } });
  };

  return (
    <section id="section-infographics" data-testid="editor-infographics">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Infographics
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-infographic">
          <Plus className="w-3.5 h-3.5" />
          Add Infographic
        </Button>
      </div>

      <div className="space-y-4">
        {infographics.map((inf) => {
          const steps = (inf.steps as any[]) || [];
          return (
            <Card key={inf.id} className="p-4" data-testid={`infographic-block-${inf.id}`}>
              <div className="flex items-start gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={inf.title}
                    onChange={(e) => updateMutation.mutate({ id: inf.id, data: { title: e.target.value } })}
                    className="font-semibold"
                    placeholder="Infographic title..."
                  />
                  <Textarea
                    value={inf.description}
                    onChange={(e) => updateMutation.mutate({ id: inf.id, data: { description: e.target.value } })}
                    rows={2}
                    className="text-sm"
                    placeholder="Description..."
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(inf.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="ml-7 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reveal Steps</p>
                {steps.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 bg-indigo-500/5 rounded-lg p-3">
                    <Badge variant="outline" className="text-[9px] mt-0.5 flex-shrink-0">{i + 1}</Badge>
                    <div className="flex-1 space-y-1">
                      <Input value={step.label} onChange={(e) => updateStep(inf, i, "label", e.target.value)} className="h-7 text-xs font-semibold" placeholder="Step label..." />
                      <Textarea value={step.explanation} onChange={(e) => updateStep(inf, i, "explanation", e.target.value)} rows={2} className="text-xs resize-none" placeholder="Explanation..." />
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStep(inf, i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addStep(inf)} className="gap-1 text-xs w-full">
                  <Plus className="w-3 h-3" />
                  Add Step
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
