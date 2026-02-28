import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Exercise } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExerciseEditorProps {
  bookId: string;
  exercises: Exercise[];
}

export function ExerciseEditor({ bookId, exercises }: ExerciseEditorProps) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/exercises`, {
        title: "New Exercise",
        description: "Describe the exercise...",
        type: "reflection",
        content: { prompt: "What did you learn?" },
        impact: "medium",
        orderIndex: exercises.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "exercises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to create exercise", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/exercises/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "exercises"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "exercises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
  });

  const impactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium": return "bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-blue-500";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "";
    }
  };

  const addOption = (exercise: Exercise) => {
    const content = { ...((exercise.content as any) || {}), options: [...((exercise.content as any)?.options || []), "New option"] };
    updateMutation.mutate({ id: exercise.id, data: { content } });
  };

  const updateOption = (exercise: Exercise, index: number, value: string) => {
    const options = [...((exercise.content as any)?.options || [])];
    options[index] = value;
    const content = { ...((exercise.content as any) || {}), options };
    updateMutation.mutate({ id: exercise.id, data: { content } });
  };

  const removeOption = (exercise: Exercise, index: number) => {
    const options = [...((exercise.content as any)?.options || [])];
    options.splice(index, 1);
    const content = { ...((exercise.content as any) || {}), options };
    updateMutation.mutate({ id: exercise.id, data: { content } });
  };

  return (
    <section id="section-exercises" data-testid="editor-exercises">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-emerald-500" />
          Exercises
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-exercise">
          <Plus className="w-3.5 h-3.5" />
          Add Exercise
        </Button>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise) => {
          const content = (exercise.content as any) || {};
          return (
            <Card key={exercise.id} className="p-4" data-testid={`exercise-block-${exercise.id}`}>
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={exercise.title}
                      onChange={(e) => updateMutation.mutate({ id: exercise.id, data: { title: e.target.value } })}
                      className="flex-1 font-semibold"
                      placeholder="Exercise title..."
                      data-testid={`input-exercise-title-${exercise.id}`}
                    />
                    <Badge className={`text-[10px] ${impactColor(exercise.impact || "medium")}`}>
                      {exercise.impact || "medium"}
                    </Badge>
                  </div>

                  <Textarea
                    value={exercise.description || ""}
                    onChange={(e) => updateMutation.mutate({ id: exercise.id, data: { description: e.target.value } })}
                    rows={2}
                    className="text-sm"
                    placeholder="Description..."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Type</p>
                      <Select value={exercise.type} onValueChange={(val) => updateMutation.mutate({ id: exercise.id, data: { type: val } })}>
                        <SelectTrigger className="h-8 text-xs" data-testid={`select-type-${exercise.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reflection">Text Journal</SelectItem>
                          <SelectItem value="quiz">Multiple Choice</SelectItem>
                          <SelectItem value="action_plan">Action Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Impact</p>
                      <Select value={exercise.impact || "medium"} onValueChange={(val) => updateMutation.mutate({ id: exercise.id, data: { impact: val } })}>
                        <SelectTrigger className="h-8 text-xs" data-testid={`select-impact-${exercise.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Prompt</p>
                    <Textarea
                      value={content.prompt || ""}
                      onChange={(e) => updateMutation.mutate({ id: exercise.id, data: { content: { ...content, prompt: e.target.value } } })}
                      rows={2}
                      className="text-sm"
                      placeholder="What should the user reflect on?"
                    />
                  </div>

                  {exercise.type === "quiz" && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Options</p>
                      <div className="space-y-1.5">
                        {(content.options || []).map((opt: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] flex-shrink-0">{String.fromCharCode(65 + i)}</Badge>
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(exercise, i, e.target.value)}
                              className="h-7 text-xs flex-1"
                              placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeOption(exercise, i)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addOption(exercise)} className="gap-1 text-xs w-full">
                          <Plus className="w-3 h-3" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(exercise.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
