import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, Principle, Story, Exercise, CommonMistake, ActionItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  X, Lightbulb, BookMarked, Dumbbell, ChevronLeft, ChevronRight,
  CheckCircle2, PenLine, Brain, AlertTriangle, ListChecks,
  BookOpen, Eye, RotateCcw, Check, Zap, TrendingUp, Clock,
  ArrowRight, Sparkles,
} from "lucide-react";
import { useParams, useLocation, useSearch } from "wouter";
import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

type SectionType = "chapter-summaries" | "mental-models" | "principles" | "common-mistakes" | "exercises" | "action-items";

type CardItem = {
  type: string;
  data: any;
};

const SECTION_META: Record<SectionType, { label: string; icon: any; color: string }> = {
  "chapter-summaries": { label: "Chapter Summaries", icon: BookOpen, color: "text-blue-500" },
  "mental-models": { label: "Mental Models", icon: Brain, color: "text-purple-500" },
  "principles": { label: "Principles & Stories", icon: Lightbulb, color: "text-primary" },
  "common-mistakes": { label: "Common Mistakes", icon: AlertTriangle, color: "text-amber-500" },
  "exercises": { label: "Exercises", icon: Dumbbell, color: "text-emerald-500" },
  "action-items": { label: "Action Items", icon: ListChecks, color: "text-sky-500" },
};

function ConfettiOverlay() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-pink-500"][i % 5],
  }));

  return (
    <div className="absolute inset-0 z-[300] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute w-2 h-2 rounded-full ${p.color} animate-confetti-fall`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function ChapterSummaryCard({ card, onNext }: { card: CardItem; onNext: () => void }) {
  const d = card.data;
  if (card.type === "chapter-transition") {
    return (
      <div className="text-center" data-testid={`card-chapter-transition-${d.nextChapterNumber}`}>
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <ArrowRight className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">Up Next</p>
        <h2 className="font-serif text-2xl font-bold mb-2">Chapter {d.nextChapterNumber}</h2>
        <p className="text-base text-muted-foreground">{d.nextChapterTitle}</p>
        <Button className="mt-8 gap-2" onClick={onNext} data-testid="button-start-chapter">
          <Sparkles className="w-4 h-4" />
          Start Chapter {d.nextChapterNumber}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center" data-testid={`card-chapter-summary-${d.chapterId}-${d.cardIndex}`}>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Badge variant="secondary" className="text-[10px] gap-1">
          <BookOpen className="w-3 h-3" />
          Chapter {d.chapterNumber}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {d.cardIndex + 1} / {d.totalInChapter}
        </span>
      </div>
      <h3 className="font-serif text-lg font-semibold mb-6 text-muted-foreground">{d.chapterTitle}</h3>
      <p className="text-lg leading-relaxed">{d.text}</p>
    </div>
  );
}

function MentalModelCard({ card }: { card: CardItem }) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const d = card.data;

  if (card.type === "mental-model-intro") {
    return (
      <div className="text-center" data-testid={`card-mental-model-intro-${d.id}`}>
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-4">{d.title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">{d.description}</p>
        <Badge variant="secondary" className="text-[10px] gap-1">
          {d.totalSteps} steps to explore
        </Badge>
      </div>
    );
  }

  return (
    <div data-testid={`card-mental-model-step-${d.modelId}-${d.stepIndex}`}>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Brain className="w-3 h-3" />
          {d.modelTitle}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          Step {d.stepIndex + 1} / {d.totalSteps}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold mb-6 text-center">{d.label}</h3>
      <button
        className="w-full"
        onClick={() => setRevealedSteps((prev) => Math.min(prev + 1, 1))}
        data-testid={`button-reveal-step-${d.stepIndex}`}
      >
        <div
          className={`transition-all duration-500 ${
            revealedSteps > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Card className="p-5">
            <p className="text-base leading-relaxed">{d.explanation}</p>
          </Card>
        </div>
        {revealedSteps === 0 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Tap to reveal</span>
          </div>
        )}
      </button>
    </div>
  );
}

function PrincipleStoryCard({ card, cards, currentIndex, goTo }: { card: CardItem; cards: CardItem[]; currentIndex: number; goTo: (i: number) => void }) {
  const [flipped, setFlipped] = useState(false);
  const d = card.data;

  useEffect(() => {
    setFlipped(false);
  }, [currentIndex]);

  if (card.type === "principle") {
    const nextCard = cards[currentIndex + 1];
    const hasLinkedStory = nextCard?.type === "story";

    return (
      <div data-testid={`card-principle-${d.id}`}>
        <div className={`transition-all duration-500 ${flipped ? "opacity-0 scale-95 absolute inset-0" : "opacity-100 scale-100"}`}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>
            <Badge variant="secondary" className="text-[10px] gap-1 mb-4">
              Principle
            </Badge>
            <h2 className="font-serif text-2xl font-bold mb-4">{d.title}</h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">{d.content}</p>
            {hasLinkedStory && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setFlipped(true)}
                data-testid={`button-see-proof-${d.id}`}
              >
                <BookMarked className="w-4 h-4" />
                See the Proof
              </Button>
            )}
          </div>
        </div>
        {flipped && hasLinkedStory && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <BookMarked className="w-7 h-7 text-amber-500" />
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1 mb-4">
                Story
              </Badge>
              <h2 className="font-serif text-xl font-bold mb-4">{nextCard.data.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{nextCard.data.content}</p>
              {nextCard.data.moral && (
                <Card className="p-4 text-left">
                  <p className="text-sm">
                    <span className="text-primary font-semibold">Takeaway: </span>
                    {nextCard.data.moral}
                  </p>
                </Card>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 gap-1"
                onClick={() => setFlipped(false)}
                data-testid="button-back-to-principle"
              >
                <RotateCcw className="w-3 h-3" />
                Back to Principle
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (card.type === "story") {
    const prevCard = cards[currentIndex - 1];
    if (prevCard?.type === "principle") {
      return null;
    }

    return (
      <div data-testid={`card-story-${d.id}`}>
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <BookMarked className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="font-serif text-xl font-bold mb-4 text-center">{d.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{d.content}</p>
        {d.moral && (
          <Card className="p-4">
            <p className="text-sm">
              <span className="text-primary font-semibold">Takeaway: </span>
              {d.moral}
            </p>
          </Card>
        )}
      </div>
    );
  }

  return null;
}

function CommonMistakeCard({ card }: { card: CardItem }) {
  const d = card.data;

  return (
    <div data-testid={`card-common-mistake-${d.id}`}>
      <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-7 h-7 text-amber-500" />
      </div>

      <div className="space-y-4">
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <X className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs font-semibold text-destructive mb-1">DON'T</p>
              <p className="text-sm leading-relaxed">{d.mistake}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">DO</p>
              <p className="text-sm leading-relaxed">{d.correction}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ExerciseCard({ card, bookId }: { card: CardItem; bookId: string }) {
  const { toast } = useToast();
  const [journalText, setJournalText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const d = card.data;

  const saveJournalMutation = useMutation({
    mutationFn: async ({ exerciseId, content }: { exerciseId: string; content: string }) => {
      const res = await apiRequest("POST", "/api/journal", { exerciseId, content });
      return res.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      toast({ title: "Saved!", description: "Your reflection has been saved to your journal." });
      setJournalText("");
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const impactConfig: Record<string, { icon: any; label: string; className: string }> = {
    high: { icon: Zap, label: "High Impact", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    medium: { icon: TrendingUp, label: "Medium Impact", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    low: { icon: Clock, label: "Low Impact", className: "bg-muted text-muted-foreground" },
  };

  const impact = impactConfig[d.impact || "medium"] || impactConfig.medium;
  const ImpactIcon = impact.icon;

  return (
    <div data-testid={`card-exercise-${d.id}`} className="relative">
      {showConfetti && <ConfettiOverlay />}

      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <Dumbbell className="w-7 h-7 text-emerald-500" />
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge variant="secondary" className="text-[10px]">
          {d.type === "reflection" ? "Reflection" : d.type === "quiz" ? "Quiz" : "Action Plan"}
        </Badge>
        <Badge variant="outline" className={`text-[10px] gap-1 ${impact.className}`}>
          <ImpactIcon className="w-3 h-3" />
          {impact.label}
        </Badge>
      </div>

      <h2 className="font-serif text-xl font-bold mb-2 text-center">{d.title}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">{d.description}</p>

      {d.type === "reflection" && (() => {
        const content = d.content as any;
        return (
          <div>
            {content?.prompt && (
              <p className="text-sm italic text-muted-foreground mb-4 bg-muted/50 p-3 rounded-md">
                "{content.prompt}"
              </p>
            )}
            <Textarea
              placeholder="Write your reflection here..."
              className={`mb-3 transition-all duration-300 ${expanded ? "min-h-[200px]" : "min-h-[120px]"}`}
              value={journalText}
              onChange={(e) => {
                setJournalText(e.target.value);
                if (e.target.value.length > 50 && !expanded) setExpanded(true);
              }}
              onFocus={() => setExpanded(true)}
              data-testid={`textarea-reflection-${d.id}`}
            />
            <Button
              className="w-full gap-2"
              onClick={() => saveJournalMutation.mutate({ exerciseId: d.id, content: journalText })}
              disabled={!journalText.trim() || saveJournalMutation.isPending}
              data-testid={`button-save-journal-${d.id}`}
            >
              <PenLine className="w-4 h-4" />
              Save to Journal
            </Button>
          </div>
        );
      })()}

      {d.type === "quiz" && (() => {
        const content = d.content as any;
        const questions = content?.questions ?? [];
        return <QuizContent questions={questions} exerciseId={d.id} />;
      })()}

      {d.type === "action_plan" && (() => {
        const content = d.content as any;
        const steps = content?.steps ?? [];
        return <ActionPlanContent steps={steps} exerciseId={d.id} />;
      })()}
    </div>
  );
}

function QuizContent({ questions, exerciseId }: { questions: any[]; exerciseId: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      {questions.map((q: any, qi: number) => (
        <div key={qi} className="bg-muted/30 rounded-md p-4">
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
                  onClick={() => !revealed && setAnswers(prev => ({ ...prev, [qi]: oi }))}
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
          onClick={() => setRevealed(true)}
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
}

function ActionPlanContent({ steps, exerciseId }: { steps: string[]; exerciseId: string }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-2">
      {steps.map((step: string, i: number) => (
        <button
          key={i}
          className="w-full flex items-center gap-3 text-left p-3 rounded-md bg-muted/30 transition-colors"
          onClick={() => {
            setDone(prev => {
              const s = new Set(prev);
              s.has(i) ? s.delete(i) : s.add(i);
              return s;
            });
          }}
          data-testid={`action-step-${i}`}
        >
          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 transition-colors ${done.has(i) ? "text-primary" : "text-muted-foreground/30"}`} />
          <span className={`text-sm transition-all ${done.has(i) ? "line-through text-muted-foreground" : ""}`}>{step}</span>
        </button>
      ))}
      <p className="text-xs text-muted-foreground text-center mt-2">
        {done.size} / {steps.length} steps completed
      </p>
    </div>
  );
}

function ActionItemsCard({ card }: { card: CardItem }) {
  const items: ActionItem[] = card.data.items || [];
  const [filter, setFilter] = useState<"all" | "immediate" | "long_term">("all");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const filteredItems = items.filter((item) => filter === "all" || item.type === filter);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div data-testid="card-action-items">
      <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
        <ListChecks className="w-7 h-7 text-sky-500" />
      </div>

      <h2 className="font-serif text-xl font-bold mb-4 text-center">Action Items</h2>

      <div className="flex items-center justify-center gap-2 mb-6">
        {(["all", "immediate", "long_term"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            data-testid={`button-filter-${f}`}
            className="toggle-elevate"
          >
            {f === "all" ? "All" : f === "immediate" ? "Immediate" : "Long-term"}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredItems.map((item) => {
          const isChecked = checkedItems.has(item.id);
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 text-left p-3 rounded-md bg-muted/30 transition-all"
              onClick={() => toggleItem(item.id)}
              data-testid={`action-item-${item.id}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
              }`}>
                {isChecked && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm transition-all duration-300 ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                  {item.text}
                </span>
              </div>
              <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${
                item.type === "immediate"
                  ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "border-sky-500/30 text-sky-600 dark:text-sky-400"
              }`}>
                {item.type === "immediate" ? "Now" : "Later"}
              </Badge>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        {checkedItems.size} / {items.length} completed
      </p>
    </div>
  );
}

export default function StoryEngine() {
  const { id, section: routeSection } = useParams<{ id: string; section?: string }>();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const section = (routeSection || searchParams.get("section") || "chapter-summaries") as SectionType;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: cards, isLoading } = useQuery<CardItem[]>({
    queryKey: ["/api/books", id, "cards", section],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id && !!section,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async ({ cardIndex, totalCards }: { cardIndex: number; totalCards: number }) => {
      const res = await apiRequest("POST", `/api/progress/${id}/card`, { cardIndex, totalCards, section });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
  });

  const totalCards = cards?.length ?? 0;

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalCards) return;
    setCurrentIndex(index);
    if (cards) {
      saveProgressMutation.mutate({ cardIndex: index, totalCards });
    }
  }, [totalCards, cards, section]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
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

  useEffect(() => {
    setCurrentIndex(0);
  }, [section]);

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
          <p className="text-muted-foreground mb-4">No content available for this section yet.</p>
          <Button onClick={() => setLocation(`/book/${id}`)} data-testid="button-go-back-empty">Go Back</Button>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / totalCards) * 100;
  const meta = SECTION_META[section] || SECTION_META["chapter-summaries"];
  const SectionIcon = meta.icon;

  const shouldSkipCard = section === "principles" && card.type === "story" && currentIndex > 0 && cards[currentIndex - 1]?.type === "principle";

  useEffect(() => {
    if (shouldSkipCard) {
      goTo(currentIndex + 1);
    }
  }, [shouldSkipCard, currentIndex, goTo]);

  const renderCard = () => {
    if (shouldSkipCard) return null;
    switch (section) {
      case "chapter-summaries":
        return <ChapterSummaryCard card={card} onNext={() => goTo(currentIndex + 1)} />;
      case "mental-models":
        return <MentalModelCard card={card} key={currentIndex} />;
      case "principles":
        return <PrincipleStoryCard card={card} cards={cards} currentIndex={currentIndex} goTo={goTo} />;
      case "common-mistakes":
        return <CommonMistakeCard card={card} />;
      case "exercises":
        return <ExerciseCard card={card} bookId={id} key={card.data?.id || currentIndex} />;
      case "action-items":
        return <ActionItemsCard card={card} />;
      default:
        return <div className="text-center text-muted-foreground">Unknown section</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col" data-testid="story-engine">
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
            <SectionIcon className={`w-3 h-3 ${meta.color}`} />
            {meta.label}
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
          {renderCard()}
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
