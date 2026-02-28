import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Check, X, Trophy, RotateCcw, Brain, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface QuizData {
  bookId: string;
  questions: QuizQuestion[];
  totalAvailable: number;
}

interface BookQuizProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  onCelebrate?: () => void;
}

export function BookQuiz({ bookId, bookTitle, onClose, onCelebrate }: BookQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);

  const { data: quiz, isLoading } = useQuery<QuizData>({
    queryKey: ["/api/books", bookId, "quiz"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { chapterId: string; score: number; totalQuestions: number; answers: any[] }) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/quiz/submit`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "quiz/results"] });
      if (data.percentage >= 80 && onCelebrate) {
        onCelebrate();
      }
    },
  });

  const handleAnswer = useCallback((optionIndex: number) => {
    if (answered || !quiz) return;
    setSelectedOption(optionIndex);
    setAnswered(true);

    const question = quiz.questions[currentIndex];
    const isCorrect = question.options[optionIndex].correct;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswers(prev => [...prev, {
      questionId: question.id,
      selected: optionIndex,
      correct: isCorrect,
    }]);
  }, [answered, quiz, currentIndex]);

  const handleNext = useCallback(() => {
    if (!quiz) return;

    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      submitMutation.mutate({
        chapterId: quiz.questions[0]?.chapterId || bookId,
        score,
        totalQuestions: quiz.questions.length,
        answers,
      });
      setShowResults(true);
    }
  }, [quiz, currentIndex, score, answers, bookId, submitMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] p-5">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center p-6">
        <Brain className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h2 className="font-serif text-xl font-bold mb-2">No Quiz Available</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          This book needs more content before a quiz can be generated.
        </p>
        <Button variant="outline" onClick={onClose} data-testid="button-quiz-close">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center p-6" data-testid="quiz-results">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-sm"
        >
          <div className={`w-24 h-24 rounded-full ${passed ? "bg-primary/10" : "bg-muted"} flex items-center justify-center mx-auto mb-4`}>
            {passed ? (
              <Trophy className="w-12 h-12 text-primary" />
            ) : (
              <Brain className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          <h2 className="font-serif text-2xl font-bold mb-1" data-testid="text-quiz-complete">
            {passed ? "Excellent!" : "Keep Learning!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">{bookTitle}</p>

          <div className="flex items-center justify-center gap-1 mb-6">
            <span className={`text-4xl font-bold ${passed ? "text-primary" : "text-white"}`}>{percentage}%</span>
          </div>

          <Card className="p-4 mb-6 bg-[#0F0F1A] border-primary/10">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">{score}</p>
                <p className="text-[10px] text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-rose-400">{quiz.questions.length - score}</p>
                <p className="text-[10px] text-muted-foreground">Wrong</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{quiz.questions.length}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>

          {passed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-1.5 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-semibold">Achievement Unlocked!</span>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-quiz-done">
              Done
            </Button>
            <Button onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setAnswered(false);
              setScore(0);
              setShowResults(false);
              setAnswers([]);
              queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "quiz"] });
            }} data-testid="button-quiz-retry">
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col" data-testid="book-quiz">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="button-quiz-back">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {currentIndex + 1}/{quiz.questions.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            Score: {score}
          </Badge>
        </div>
      </div>

      <div className="px-5 mb-6">
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-serif text-lg font-bold mb-6 leading-snug" data-testid="text-quiz-question">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((opt, i) => {
                let borderColor = "border-border";
                let bgColor = "bg-card";
                let textColor = "";

                if (answered) {
                  if (opt.correct) {
                    borderColor = "border-emerald-500/40";
                    bgColor = "bg-emerald-500/10";
                    textColor = "text-emerald-400";
                  } else if (i === selectedOption && !opt.correct) {
                    borderColor = "border-rose-500/40";
                    bgColor = "bg-rose-500/10";
                    textColor = "text-rose-400";
                  }
                } else if (i === selectedOption) {
                  borderColor = "border-primary/40";
                  bgColor = "bg-primary/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl border-2 ${borderColor} ${bgColor} text-left transition-all ${
                      !answered ? "hover:border-primary/30 active:scale-[0.98]" : ""
                    }`}
                    data-testid={`button-option-${i}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full border-2 ${borderColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        {answered && opt.correct && <Check className="w-4 h-4 text-emerald-400" />}
                        {answered && i === selectedOption && !opt.correct && <X className="w-4 h-4 text-rose-400" />}
                        {!answered && <span className="text-xs text-muted-foreground font-medium">{String.fromCharCode(65 + i)}</span>}
                      </div>
                      <p className={`text-sm leading-relaxed ${textColor}`}>{opt.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-4"
              >
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-primary font-semibold">Explanation: </span>
                    {question.explanation}
                  </p>
                </Card>

                <Button
                  className="w-full mt-4 gap-2"
                  onClick={handleNext}
                  data-testid="button-quiz-next"
                >
                  {currentIndex < quiz.questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
