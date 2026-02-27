import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, RotateCcw, Check, X, Brain, Lightbulb, Eye, EyeOff, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Principle, FlashcardProgress } from "@shared/schema";

interface FlashcardData {
  cards: { principle: Principle; progress: FlashcardProgress | null }[];
  dueCount: number;
  masteredCount: number;
  total: number;
}

interface FlashcardPracticeProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
}

export function FlashcardPractice({ bookId, bookTitle, onClose }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ id: string; quality: number }[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  const { data, isLoading } = useQuery<FlashcardData>({
    queryKey: ["/api/books", bookId, "flashcards"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ principleId, quality }: { principleId: string; quality: number }) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/flashcards/${principleId}/review`, { quality });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "flashcards"] });
    },
  });

  const handleRate = useCallback((quality: number) => {
    if (!data) return;
    const card = data.cards[currentIndex];
    if (!card) return;

    reviewMutation.mutate({ principleId: card.principle.id, quality });
    setSessionResults(prev => [...prev, { id: card.principle.id, quality }]);
    setFlipped(false);

    if (currentIndex < data.cards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setShowComplete(true);
    }
  }, [data, currentIndex, reviewMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-5">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!data || data.cards.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <Brain className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h2 className="font-serif text-xl font-bold mb-2">No Flashcards Available</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          This book doesn't have principles to practice yet.
        </p>
        <Button variant="outline" onClick={onClose} data-testid="button-flashcard-close">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (showComplete) {
    const mastered = sessionResults.filter(r => r.quality >= 4).length;
    const learning = sessionResults.filter(r => r.quality >= 3 && r.quality < 4).length;
    const needsReview = sessionResults.filter(r => r.quality < 3).length;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2" data-testid="text-session-complete">Session Complete!</h2>
          <p className="text-sm text-muted-foreground mb-6">{bookTitle}</p>

          <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-xs mx-auto">
            <Card className="p-3 text-center bg-emerald-500/10 border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">{mastered}</p>
              <p className="text-[10px] text-muted-foreground">Mastered</p>
            </Card>
            <Card className="p-3 text-center bg-amber-500/10 border-amber-500/20">
              <p className="text-2xl font-bold text-amber-400">{learning}</p>
              <p className="text-[10px] text-muted-foreground">Learning</p>
            </Card>
            <Card className="p-3 text-center bg-rose-500/10 border-rose-500/20">
              <p className="text-2xl font-bold text-rose-400">{needsReview}</p>
              <p className="text-[10px] text-muted-foreground">Review</p>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-flashcard-done">
              Done
            </Button>
            <Button onClick={() => {
              setCurrentIndex(0);
              setSessionResults([]);
              setShowComplete(false);
              setFlipped(false);
            }} data-testid="button-flashcard-restart">
              <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const card = data.cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / data.cards.length) * 100);

  return (
    <div className="min-h-screen bg-black flex flex-col" data-testid="flashcard-practice">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="button-flashcard-back">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {currentIndex + 1}/{data.cards.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            {data.masteredCount} mastered
          </Badge>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm"
          >
            <Card
              className="p-6 min-h-[300px] flex flex-col cursor-pointer relative overflow-hidden"
              onClick={() => setFlipped(!flipped)}
              data-testid="flashcard-card"
            >
              <div className="absolute top-3 right-3">
                {flipped
                  ? <EyeOff className="w-4 h-4 text-muted-foreground/40" />
                  : <Eye className="w-4 h-4 text-muted-foreground/40" />
                }
              </div>

              {card.progress?.status && (
                <Badge
                  variant="outline"
                  className={`absolute top-3 left-3 text-[9px] ${
                    card.progress.status === "mastered" ? "border-emerald-500/30 text-emerald-400"
                    : card.progress.status === "learning" ? "border-amber-500/30 text-amber-400"
                    : "border-rose-500/30 text-rose-400"
                  }`}
                >
                  {card.progress.status}
                </Badge>
              )}

              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pt-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>

                <AnimatePresence mode="wait">
                  {!flipped ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="font-serif text-lg font-bold mb-2" data-testid="text-flashcard-title">
                        {card.principle.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">Tap to reveal</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm leading-relaxed" data-testid="text-flashcard-description">
                        {card.principle.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {flipped && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6 w-full max-w-sm"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-3">
              How well did you know this?
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                onClick={() => handleRate(1)}
                disabled={reviewMutation.isPending}
                data-testid="button-rate-hard"
              >
                <X className="w-4 h-4 mr-1" /> Hard
              </Button>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                onClick={() => handleRate(3)}
                disabled={reviewMutation.isPending}
                data-testid="button-rate-good"
              >
                <Brain className="w-4 h-4 mr-1" /> Good
              </Button>
              <Button
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => handleRate(5)}
                disabled={reviewMutation.isPending}
                data-testid="button-rate-easy"
              >
                <Check className="w-4 h-4 mr-1" /> Easy
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
