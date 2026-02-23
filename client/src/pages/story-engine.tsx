import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, Principle, Story, Exercise } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, BookMarked, Dumbbell, ChevronLeft, ChevronRight, CheckCircle2, PenLine } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type CardItem =
  | { type: "principle"; data: Principle }
  | { type: "story"; data: Story }
  | { type: "exercise"; data: Exercise };

export default function StoryEngine() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journalText, setJournalText] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizRevealed, setQuizRevealed] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: cards, isLoading } = useQuery<CardItem[]>({
    queryKey: ["/api/books", id, "cards"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async ({ cardIndex, totalCards }: { cardIndex: number; totalCards: number }) => {
      const res = await apiRequest("POST", `/api/progress/${id}/card`, { cardIndex, totalCards });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
  });

  const saveJournalMutation = useMutation({
    mutationFn: async ({ exerciseId, content }: { exerciseId: string; content: string }) => {
      const res = await apiRequest("POST", "/api/journal", { exerciseId, content });
      return res.json();
    },
    onSuccess: (_, variables) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      toast({ title: "Saved!", description: "Your reflection has been saved to your journal." });
      setJournalText((prev) => ({ ...prev, [variables.exerciseId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const totalCards = cards?.length ?? 0;

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalCards) return;
    setCurrentIndex(index);
    if (cards) {
      saveProgressMutation.mutate({ cardIndex: index, totalCards });
    }
  }, [totalCards, cards]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      goTo(currentIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(currentIndex - 1);
    } else if (e.key === "Escape") {
      setLocation(`/book/${id}`);
    }
  }, [currentIndex, goTo, id, setLocation]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading || !cards || !book) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-md bg-primary animate-pulse" />
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No content available for this book yet.</p>
          <Button onClick={() => setLocation(`/book/${id}`)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col" data-testid="story-engine">
      {showConfetti && (
        <div className="absolute inset-0 z-[300] pointer-events-none flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary/70" : "bg-muted"
            }`}
            data-testid={`progress-segment-${i}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] gap-1">
            {card.type === "principle" && <><Lightbulb className="w-3 h-3" /> Principle</>}
            {card.type === "story" && <><BookMarked className="w-3 h-3" /> Story</>}
            {card.type === "exercise" && <><Dumbbell className="w-3 h-3" /> Exercise</>}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{currentIndex + 1} / {totalCards}</span>
        </div>
        <button
          onClick={() => setLocation(`/book/${id}`)}
          className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
          data-testid="button-exit-journey"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          {card.type === "principle" && (
            <div className="text-center" data-testid={`card-principle-${card.data.id}`}>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-4">{card.data.title}</h2>
              <p className="text-base text-muted-foreground leading-relaxed">{card.data.content}</p>
            </div>
          )}

          {card.type === "story" && (
            <div data-testid={`card-story-${card.data.id}`}>
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <BookMarked className="w-7 h-7 text-amber-500" />
              </div>
              <h2 className="font-serif text-xl font-bold mb-4 text-center">{card.data.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{card.data.content}</p>
              {card.data.moral && (
                <div className="bg-primary/5 rounded-lg p-4 border-l-3 border-primary">
                  <p className="text-sm font-medium">
                    <span className="text-primary font-semibold">Takeaway: </span>
                    {card.data.moral}
                  </p>
                </div>
              )}
            </div>
          )}

          {card.type === "exercise" && (
            <div data-testid={`card-exercise-${card.data.id}`}>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="w-7 h-7 text-emerald-500" />
              </div>
              <Badge variant="secondary" className="mb-3 mx-auto flex w-fit text-[10px]">
                {card.data.type === "reflection" ? "Reflection" : card.data.type === "quiz" ? "Quiz" : "Action Plan"}
              </Badge>
              <h2 className="font-serif text-xl font-bold mb-2 text-center">{card.data.title}</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">{card.data.description}</p>

              {card.data.type === "reflection" && (() => {
                const content = card.data.content as any;
                return (
                  <div>
                    {content?.prompt && (
                      <p className="text-sm italic text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg">
                        "{content.prompt}"
                      </p>
                    )}
                    <Textarea
                      placeholder="Write your reflection here..."
                      className="mb-3 min-h-[120px]"
                      value={journalText[card.data.id] ?? ""}
                      onChange={(e) => setJournalText((prev) => ({ ...prev, [card.data.id]: e.target.value }))}
                      data-testid={`textarea-reflection-${card.data.id}`}
                    />
                    <Button
                      className="w-full gap-2"
                      onClick={() => saveJournalMutation.mutate({
                        exerciseId: card.data.id,
                        content: journalText[card.data.id] || "",
                      })}
                      disabled={!journalText[card.data.id]?.trim() || saveJournalMutation.isPending}
                      data-testid={`button-save-journal-${card.data.id}`}
                    >
                      <PenLine className="w-4 h-4" />
                      Save to Journal
                    </Button>
                  </div>
                );
              })()}

              {card.data.type === "quiz" && (() => {
                const content = card.data.content as any;
                const questions = content?.questions ?? [];
                const answers = quizAnswers[card.data.id] ?? {};
                const revealed = quizRevealed.has(card.data.id);

                return (
                  <div className="space-y-4">
                    {questions.map((q: any, qi: number) => (
                      <div key={qi} className="bg-muted/30 rounded-lg p-4">
                        <p className="font-medium text-sm mb-3">{q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oi: number) => {
                            const selected = answers[qi] === oi;
                            const isCorrect = revealed && oi === q.correct;
                            const isWrong = revealed && selected && oi !== q.correct;
                            return (
                              <button
                                key={oi}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
                                  isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                    : isWrong ? "bg-destructive/10 border-destructive/30 text-destructive"
                                      : selected ? "bg-primary/10 border-primary/30"
                                        : "bg-background border-border/50"
                                }`}
                                onClick={() => !revealed && setQuizAnswers(prev => ({
                                  ...prev,
                                  [card.data.id]: { ...(prev[card.data.id] ?? {}), [qi]: oi }
                                }))}
                                disabled={revealed}
                                data-testid={`quiz-option-${qi}-${oi}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!revealed && (
                      <Button
                        className="w-full"
                        disabled={Object.keys(answers).length < questions.length}
                        onClick={() => setQuizRevealed(prev => new Set(prev).add(card.data.id))}
                        data-testid="button-check-answers"
                      >
                        Check Answers
                      </Button>
                    )}
                    {revealed && (
                      <p className="text-center text-sm text-muted-foreground">
                        {questions.filter((q: any, i: number) => answers[i] === q.correct).length} / {questions.length} correct
                      </p>
                    )}
                  </div>
                );
              })()}

              {card.data.type === "action_plan" && (() => {
                const content = card.data.content as any;
                const steps = content?.steps ?? [];
                const done = completedSteps[card.data.id] ?? new Set<number>();

                return (
                  <div className="space-y-2">
                    {steps.map((step: string, i: number) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-muted/30 transition-colors"
                        onClick={() => {
                          setCompletedSteps(prev => {
                            const s = new Set(prev[card.data.id] ?? []);
                            s.has(i) ? s.delete(i) : s.add(i);
                            return { ...prev, [card.data.id]: s };
                          });
                        }}
                        data-testid={`action-step-${i}`}
                      >
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${done.has(i) ? "text-primary" : "text-muted-foreground/30"}`} />
                        <span className={`text-sm ${done.has(i) ? "line-through text-muted-foreground" : ""}`}>{step}</span>
                      </button>
                    ))}
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {done.size} / {steps.length} steps completed
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-sm border-t border-border/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="gap-1"
          data-testid="button-prev-card"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="w-24 bg-muted rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {currentIndex < totalCards - 1 ? (
          <Button
            size="sm"
            onClick={() => goTo(currentIndex + 1)}
            className="gap-1"
            data-testid="button-next-card"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setLocation(`/book/${id}`)}
            className="gap-1"
            data-testid="button-finish-journey"
          >
            Finish
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
