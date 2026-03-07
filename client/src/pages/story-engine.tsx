import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";
import { PenWritingLoader } from "@/components/pen-writing-loader";
import { PremiumGate } from "@/components/premium-gate";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  X, ChevronLeft, ChevronRight,
  CheckCircle2, Brain,
  BookOpen, Eye, ArrowRight, Sparkles,
} from "lucide-react";
import { useParams, useLocation, useSearch } from "wouter";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

type SectionType = "chapter-summaries" | "mental-models";

type CardItem = {
  type: string;
  data: any;
};

const SECTION_META: Record<SectionType, { label: string; icon: any; color: string }> = {
  "chapter-summaries": { label: "Chapter Summaries", icon: BookOpen, color: "text-[#3B82F6]" },
  "mental-models": { label: "Mental Models", icon: Brain, color: "text-[#3B82F6]" },
};

function ChapterSummaryCard({ card, onNext }: { card: CardItem; onNext: () => void }) {
  const d = card.data;
  if (card.type === "chapter-transition") {
    return (
      <div className="text-center" data-testid={`card-chapter-transition-${d.nextChapterNumber}`}>
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <ArrowRight className="w-8 h-8 text-[#3B82F6]" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">Up Next</p>
        <h2 className="text-2xl font-bold mb-2">Chapter {d.nextChapterNumber}</h2>
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
      <h3 className="text-lg font-semibold mb-6 text-muted-foreground">{d.chapterTitle}</h3>
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
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-[#3B82F6]" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{d.title}</h2>
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
      <h3 className="text-xl font-bold mb-6 text-center">{d.label}</h3>
      <button
        className="w-full"
        onClick={() => setRevealedSteps((prev) => Math.min(prev + 1, 1))}
        data-testid={`button-reveal-step-${d.stepIndex}`}
        aria-label={`Reveal explanation for ${d.label}`}
        aria-expanded={revealedSteps > 0}
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

export default function StoryEngine() {
  const { id, section: routeSection } = useParams<{ id: string; section?: string }>();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const section = (routeSection || searchParams.get("section") || "chapter-summaries") as SectionType;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: cardsResponse, isLoading } = useQuery<CardItem[] | { cards: CardItem[]; truncated: boolean; totalCards: number }>({
    queryKey: ["/api/books", id, "cards", section],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id && !!section,
  });

  const cards = Array.isArray(cardsResponse) ? cardsResponse : cardsResponse?.cards;
  const isContentTruncated = !Array.isArray(cardsResponse) && cardsResponse?.truncated;

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

  useEffect(() => {
    if (book && section) {
      trackEvent("chapter_start", { bookId: id, bookTitle: book.title, section });
    }
  }, [book, section]);

  useEffect(() => {
    if (book && totalCards > 0 && currentIndex === totalCards - 1) {
      trackEvent("chapter_complete", { bookId: id, bookTitle: book.title, section });
    }
  }, [currentIndex, totalCards, book, section]);

  const card = cards?.[currentIndex];

  if (isLoading || !cards || !book) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <PenWritingLoader size="md" />
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Content Coming Soon</h2>
          <p className="text-muted-foreground mb-6">Explore other sections of this book below</p>
          <Button onClick={() => setLocation(`/book/${id}`)} className="gap-2" data-testid="button-go-back-empty">
            <ChevronLeft className="w-4 h-4" />
            Back to Book
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / totalCards) * 100;
  const meta = SECTION_META[section] || SECTION_META["chapter-summaries"];
  const SectionIcon = meta.icon;

  const currentCard = cards[currentIndex];

  const isAtPaywall = isContentTruncated && currentIndex === totalCards - 1;

  const renderCard = () => {
    if (isAtPaywall) {
      return (
        <PremiumGate isPremium={user?.isPremium ?? false}>
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Continue Reading</h2>
            <p className="text-muted-foreground">Upgrade to access the full content of this book.</p>
          </div>
        </PremiumGate>
      );
    }
    if (!currentCard) return null;
    switch (section) {
      case "chapter-summaries":
        return <ChapterSummaryCard card={currentCard} onNext={() => goTo(currentIndex + 1)} />;
      case "mental-models":
        return <MentalModelCard card={currentCard} key={currentIndex} />;
      default:
        return <div className="text-center text-muted-foreground">Unknown section</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col" data-testid="story-engine" role="region" aria-label={`${meta.label} journey for ${book.title}`}>
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={totalCards} aria-label={`Progress: card ${currentIndex + 1} of ${totalCards}`}>
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 motion-reduce:transition-none ${
              i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary/70" : "bg-muted"
            }`}
            data-testid={`progress-segment-${i}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <SectionIcon className={`w-3 h-3 ${meta.color}`} />
            {meta.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground" data-testid="text-key-point-indicator">Key Point {currentIndex + 1} of {totalCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation("/")}
            className="w-11 h-11 rounded-full bg-muted/50 flex items-center justify-center"
            data-testid="button-home-journey"
            aria-label="Go to home"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={() => setLocation(`/book/${id}`)}
            className="w-11 h-11 rounded-full bg-muted/50 flex items-center justify-center"
            data-testid="button-exit-journey"
            aria-label="Exit journey"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-y-auto relative" role="main" aria-live="polite">
        <button
          className="absolute left-0 top-0 bottom-0 w-1/5 z-10 opacity-0 cursor-w-resize"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Go to previous card"
          data-testid="tap-zone-left"
          tabIndex={-1}
        />
        <button
          className="absolute right-0 top-0 bottom-0 w-1/5 z-10 opacity-0 cursor-e-resize"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex >= totalCards - 1}
          aria-label="Go to next card"
          data-testid="tap-zone-right"
          tabIndex={-1}
        />
        <div className="w-full max-w-lg">
          {renderCard()}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-sm border-t border-border/30" role="navigation" aria-label="Card navigation">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="gap-1"
          data-testid="button-prev-card"
          aria-label="Go to previous card"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>

        <div className="w-24 bg-muted rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>

        {currentIndex < totalCards - 1 ? (
          <Button
            size="sm"
            onClick={() => goTo(currentIndex + 1)}
            className="gap-1"
            data-testid="button-next-card"
            aria-label="Go to next card"
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setLocation(`/book/${id}`)}
            className="gap-1"
            data-testid="button-finish-journey"
            aria-label="Finish journey and return to book"
          >
            Finish
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
