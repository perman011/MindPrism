import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import type { UserGoal } from "@shared/schema";
import { Target, Plus, Trash2, BookOpen, Clock, Flame, Layers, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const GOAL_TYPE_CONFIG: Record<string, { label: string; unit: string; icon: typeof Target; color: string }> = {
  books_per_month: { label: "Books / Month", unit: "books", icon: BookOpen, color: "#8B5CF6" },
  minutes_per_day: { label: "Minutes / Day", unit: "min", icon: Clock, color: "#20808D" },
  streak_days: { label: "Streak Days", unit: "days", icon: Flame, color: "#F97316" },
  chapters_per_week: { label: "Chapters / Week", unit: "chapters", icon: Layers, color: "#22C55E" },
};

function GoalProgressRing({ current, target, color, size = 48 }: { current: number; target: number; color: string; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(current / target, 1);
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function AddGoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [goalType, setGoalType] = useState<string>("books_per_month");
  const [targetValue, setTargetValue] = useState(4);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/goals", { goalType, targetValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onClose();
      setGoalType("books_per_month");
      setTargetValue(4);
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Set a Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setGoalType(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    goalType === key
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                  data-testid={`goal-type-${key}`}
                >
                  <Icon className="w-4 h-4 mb-1.5" style={{ color: config.color }} />
                  <p className="text-xs font-semibold leading-tight">{config.label}</p>
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Target</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTargetValue(Math.max(1, targetValue - 1))}
                data-testid="button-decrease-target"
              >
                -
              </Button>
              <span className="text-2xl font-bold tabular-nums w-12 text-center" data-testid="text-target-value">
                {targetValue}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTargetValue(targetValue + 1)}
                data-testid="button-increase-target"
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">{GOAL_TYPE_CONFIG[goalType]?.unit}</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            data-testid="button-create-goal"
          >
            Set Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsWidget() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals } = useQuery<UserGoal[]>({
    queryKey: ["/api/goals/active"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const activeGoals = goals ?? [];

  if (activeGoals.length === 0) {
    return (
      <>
        <section className="mb-8 px-5" data-testid="section-goals">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Goals</p>
              <h2 className="text-xl font-bold text-foreground">My Goals</h2>
            </div>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            data-testid="button-add-first-goal"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Set your first goal</span>
          </button>
        </section>
        <AddGoalDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
      </>
    );
  }

  return (
    <>
      <section className="mb-8 px-5" data-testid="section-goals">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Goals</p>
            <h2 className="text-xl font-bold text-foreground">My Goals</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="gap-1 text-xs"
            data-testid="button-add-goal"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const config = GOAL_TYPE_CONFIG[goal.goalType] ?? GOAL_TYPE_CONFIG.books_per_month;
            const Icon = config.icon;
            const pct = Math.min(Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100), 100);
            const isComplete = (goal.currentValue ?? 0) >= goal.targetValue;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border bg-card p-4 transition-all ${
                  isComplete ? "border-green-300 dark:border-green-700" : "border-border"
                }`}
                data-testid={`goal-${goal.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <GoalProgressRing
                      current={goal.currentValue ?? 0}
                      target={goal.targetValue}
                      color={isComplete ? "#22C55E" : config.color}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isComplete ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{config.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.currentValue ?? 0} / {goal.targetValue} {config.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: isComplete ? "#22C55E" : config.color }}>
                      {pct}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(goal.id)}
                      data-testid={`button-delete-goal-${goal.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: isComplete ? "#22C55E" : config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      <AddGoalDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </>
  );
}
