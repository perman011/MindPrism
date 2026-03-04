import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MentalModel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MentalModelEditorProps {
  bookId: string;
  models: MentalModel[];
}

export function MentalModelEditor({ bookId, models }: MentalModelEditorProps) {
  const { toast } = useToast();
  const [modelDrafts, setModelDrafts] = useState<Record<string, { title: string; description: string; steps: any[] }>>({});
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/mental-models`, {
        title: "New Mental Model",
        description: "Describe the framework...",
        steps: [{ label: "Step 1", explanation: "Explain..." }],
        orderIndex: models.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "mental-models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create mental model", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/mental-models/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "mental-models"] });
    },
  });

  const queueModelSave = useCallback((id: string, data: any, delay = 350) => {
    const existing = saveTimersRef.current[id];
    if (existing) clearTimeout(existing);
    saveTimersRef.current[id] = setTimeout(() => {
      updateMutation.mutate({ id, data });
    }, delay);
  }, [updateMutation]);

  useEffect(() => {
    setModelDrafts((prev) => {
      const next = { ...prev };
      for (const model of models) {
        const existing = next[model.id];
        next[model.id] = {
          title: existing?.title ?? model.title,
          description: existing?.description ?? model.description,
          steps: existing?.steps ?? [ ...((model.steps as any[]) || []) ],
        };
      }
      return next;
    });
  }, [models]);

  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/mental-models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "mental-models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  const addStep = (model: MentalModel) => {
    const currentSteps = modelDrafts[model.id]?.steps ?? ((model.steps as any[]) || []);
    const steps = [...currentSteps, { label: "New Step", explanation: "Explain..." }];
    setModelDrafts((prev) => ({ ...prev, [model.id]: { ...(prev[model.id] || { title: model.title, description: model.description, steps: [] }), steps } }));
    updateMutation.mutate({ id: model.id, data: { steps } });
  };

  const updateStep = (model: MentalModel, stepIndex: number, field: string, value: string) => {
    const baseSteps = modelDrafts[model.id]?.steps ?? ((model.steps as any[]) || []);
    const steps = [...baseSteps];
    steps[stepIndex] = { ...steps[stepIndex], [field]: value };
    setModelDrafts((prev) => ({ ...prev, [model.id]: { ...(prev[model.id] || { title: model.title, description: model.description, steps: [] }), steps } }));
    queueModelSave(model.id, { steps });
  };

  const removeStep = (model: MentalModel, stepIndex: number) => {
    const baseSteps = modelDrafts[model.id]?.steps ?? ((model.steps as any[]) || []);
    const steps = [...baseSteps];
    steps.splice(stepIndex, 1);
    setModelDrafts((prev) => ({ ...prev, [model.id]: { ...(prev[model.id] || { title: model.title, description: model.description, steps: [] }), steps } }));
    updateMutation.mutate({ id: model.id, data: { steps } });
  };

  return (
    <section id="section-mental-models" data-testid="editor-mental-models">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-700" />
          Mental Models
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-model">
          <Plus className="w-3.5 h-3.5" />
          Add Model
        </Button>
      </div>

      <div className="space-y-4">
        {models.map((model) => {
          const draft = modelDrafts[model.id];
          const steps = draft?.steps ?? ((model.steps as any[]) || []);
          return (
            <Card key={model.id} className="p-4" data-testid={`model-block-${model.id}`}>
              <div className="flex items-start gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={draft?.title ?? model.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModelDrafts((prev) => ({
                        ...prev,
                        [model.id]: {
                          title: value,
                          description: prev[model.id]?.description ?? model.description,
                          steps: prev[model.id]?.steps ?? ((model.steps as any[]) || []),
                        },
                      }));
                      queueModelSave(model.id, { title: value });
                    }}
                    className="font-semibold"
                    placeholder="Model title..."
                    data-testid={`input-model-title-${model.id}`}
                  />
                  <Textarea
                    value={draft?.description ?? model.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModelDrafts((prev) => ({
                        ...prev,
                        [model.id]: {
                          title: prev[model.id]?.title ?? model.title,
                          description: value,
                          steps: prev[model.id]?.steps ?? ((model.steps as any[]) || []),
                        },
                      }));
                      queueModelSave(model.id, { description: value });
                    }}
                    rows={2}
                    className="text-sm"
                    placeholder="Description..."
                    data-testid={`input-model-desc-${model.id}`}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(model.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="ml-7 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tap-to-Reveal Steps</p>
                {steps.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 bg-purple-700/5 rounded-lg p-3">
                    <Badge variant="outline" className="text-[9px] mt-0.5 flex-shrink-0">{i + 1}</Badge>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={step.label}
                        onChange={(e) => updateStep(model, i, "label", e.target.value)}
                        className="h-7 text-xs font-semibold"
                        placeholder="Step label..."
                      />
                      <Textarea
                        value={step.explanation}
                        onChange={(e) => updateStep(model, i, "explanation", e.target.value)}
                        rows={2}
                        className="text-xs resize-none"
                        placeholder="Explanation..."
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStep(model, i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addStep(model)} className="gap-1 text-xs w-full">
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
