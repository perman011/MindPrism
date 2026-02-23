import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, Principle, Story, Exercise, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, ArrowLeft, BookOpen, Lightbulb, BookMarked, Dumbbell,
  CheckCircle2, Circle, Bookmark, BookmarkCheck, Clock, Headphones,
  LogOut, Home, ChevronRight, PenLine, ChevronDown, ChevronUp
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("principles");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [journalText, setJournalText] = useState<Record<string, string>>({});

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: principles } = useQuery<Principle[]>({
    queryKey: ["/api/books", id, "principles"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: stories } = useQuery<Story[]>({
    queryKey: ["/api/books", id, "stories"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/books", id, "exercises"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: progress } = useQuery<UserProgress | null>({
    queryKey: ["/api/progress", id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/progress/${id}/bookmark`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update bookmark", variant: "destructive" });
    },
  });

  const completePrincipleMutation = useMutation({
    mutationFn: async (principleId: string) => {
      const res = await apiRequest("POST", `/api/progress/${id}/principle/${principleId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
    },
  });

  const saveJournalMutation = useMutation({
    mutationFn: async ({ exerciseId, content }: { exerciseId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/journal`, { exerciseId, content });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Saved", description: "Your journal entry has been saved." });
      setJournalText((prev) => ({ ...prev, [variables.exerciseId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to save journal entry", variant: "destructive" });
    },
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  const completedPrinciples = progress?.completedPrinciples ?? [];
  const isBookmarked = progress?.bookmarked ?? false;

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">Book not found</h2>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">MindSpark</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </Button>
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" data-testid="button-back">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Library
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row gap-6 mb-8" data-testid="section-book-header">
          <div className="w-40 h-52 flex-shrink-0 rounded-xl overflow-hidden">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="font-serif text-4xl font-bold text-primary/30">{book.title[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1" data-testid="text-book-title">
              {book.title}
            </h1>
            <p className="text-muted-foreground mb-3" data-testid="text-book-author">by {book.author}</p>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed" data-testid="text-book-description">
              {book.description}
            </p>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {book.readTime} min read
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Headphones className="w-3 h-3" />
                {book.listenTime} min listen
              </Badge>
              {principles && (
                <Badge variant="secondary" className="gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {principles.length} principles
                </Badge>
              )}
            </div>
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              data-testid="button-bookmark"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>

        {book.audioUrl && (
          <div className="mb-8">
            <AudioPlayer title={`${book.title} - Audio Summary`} audioUrl={book.audioUrl} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-book-content">
            <TabsTrigger value="principles" className="gap-1.5" data-testid="tab-principles">
              <Lightbulb className="w-3.5 h-3.5" />
              Principles
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1.5" data-testid="tab-stories">
              <BookMarked className="w-3.5 h-3.5" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="exercises" className="gap-1.5" data-testid="tab-exercises">
              <Dumbbell className="w-3.5 h-3.5" />
              Exercises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="principles">
            <div className="space-y-4" data-testid="list-principles">
              {principles?.map((principle, idx) => {
                const isCompleted = completedPrinciples.includes(principle.id);
                return (
                  <Card
                    key={principle.id}
                    className={`p-5 transition-all ${isCompleted ? "bg-primary/5 border-primary/20" : ""}`}
                    data-testid={`card-principle-${principle.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => completePrincipleMutation.mutate(principle.id)}
                        className="mt-0.5 flex-shrink-0"
                        data-testid={`button-complete-principle-${principle.id}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-semibold text-base">{principle.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {principle.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {(!principles || principles.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No principles available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="space-y-4" data-testid="list-stories">
              {stories?.map((story) => (
                <Card key={story.id} className="p-5" data-testid={`card-story-${story.id}`}>
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                    data-testid={`button-expand-story-${story.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-base">{story.title}</h3>
                      {expandedStory === story.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  {expandedStory === story.id && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {story.content}
                      </p>
                      {story.moral && (
                        <div className="bg-primary/5 rounded-md p-3 border-l-2 border-primary">
                          <p className="text-sm font-medium">
                            <span className="text-primary mr-1.5">Takeaway:</span>
                            {story.moral}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
              {(!stories || stories.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No stories available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exercises">
            <div className="space-y-6" data-testid="list-exercises">
              {exercises?.map((exercise) => {
                const exerciseContent = exercise.content as any;
                return (
                  <Card key={exercise.id} className="p-5" data-testid={`card-exercise-${exercise.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {exercise.type === "reflection" ? "Reflection" : exercise.type === "quiz" ? "Quiz" : "Action Plan"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base mb-2">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {exercise.description}
                    </p>

                    {exercise.type === "reflection" && (
                      <div>
                        {exerciseContent?.prompt && (
                          <p className="text-sm italic text-muted-foreground mb-3 bg-muted/50 p-3 rounded-md">
                            "{exerciseContent.prompt}"
                          </p>
                        )}
                        <Textarea
                          placeholder="Write your reflection here..."
                          className="mb-3 min-h-[100px]"
                          value={journalText[exercise.id] ?? ""}
                          onChange={(e) => setJournalText((prev) => ({ ...prev, [exercise.id]: e.target.value }))}
                          data-testid={`textarea-reflection-${exercise.id}`}
                        />
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => saveJournalMutation.mutate({ exerciseId: exercise.id, content: journalText[exercise.id] || "" })}
                          disabled={!journalText[exercise.id]?.trim() || saveJournalMutation.isPending}
                          data-testid={`button-save-journal-${exercise.id}`}
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          Save to Journal
                        </Button>
                      </div>
                    )}

                    {exercise.type === "quiz" && exerciseContent?.questions && (
                      <QuizExercise questions={exerciseContent.questions} />
                    )}

                    {exercise.type === "action_plan" && exerciseContent?.steps && (
                      <ActionPlanExercise steps={exerciseContent.steps} />
                    )}
                  </Card>
                );
              })}
              {(!exercises || exercises.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No exercises available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function QuizExercise({ questions }: { questions: { question: string; options: string[]; correct: number }[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-muted/30 rounded-md p-4">
          <p className="font-medium text-sm mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, optIdx) => {
              const isSelected = answers[qIdx] === optIdx;
              const isCorrect = showResults && optIdx === q.correct;
              const isWrong = showResults && isSelected && optIdx !== q.correct;
              return (
                <button
                  key={optIdx}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors border ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : isWrong
                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-background border-border/50"
                  }`}
                  onClick={() => !showResults && setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                  disabled={showResults}
                  data-testid={`quiz-option-${qIdx}-${optIdx}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!showResults && (
        <Button
          size="sm"
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < questions.length}
          data-testid="button-check-answers"
        >
          Check Answers
        </Button>
      )}
      {showResults && (
        <div className="text-sm text-muted-foreground">
          Score: {questions.filter((q, i) => answers[i] === q.correct).length} / {questions.length} correct
        </div>
      )}
    </div>
  );
}

function ActionPlanExercise({ steps }: { steps: string[] }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => (
        <button
          key={idx}
          className="w-full flex items-center gap-3 text-left p-3 rounded-md bg-muted/30 transition-colors"
          onClick={() => {
            setCompleted((prev) => {
              const next = new Set(prev);
              next.has(idx) ? next.delete(idx) : next.add(idx);
              return next;
            });
          }}
          data-testid={`action-step-${idx}`}
        >
          {completed.has(idx) ? (
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
          )}
          <span className={`text-sm ${completed.has(idx) ? "line-through text-muted-foreground" : ""}`}>
            {step}
          </span>
        </button>
      ))}
      <div className="text-xs text-muted-foreground mt-2">
        {completed.size} / {steps.length} steps completed
      </div>
    </div>
  );
}
