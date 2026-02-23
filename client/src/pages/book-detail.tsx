import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, Principle, Story, Exercise, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, BookOpen, Lightbulb, BookMarked, Dumbbell,
  CheckCircle2, Circle, Bookmark, BookmarkCheck, Clock, Headphones,
  Play, ChevronRight,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { useAudio } from "@/lib/audio-context";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { play } = useAudio();
  const [activeTab, setActiveTab] = useState("principles");

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

  const completedPrinciples = progress?.completedPrinciples ?? [];
  const isBookmarked = progress?.bookmarked ?? false;
  const cardProgress = progress?.currentCardIndex && progress?.totalCards
    ? Math.round((progress.currentCardIndex / progress.totalCards) * 100) : 0;

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full" />
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
            <Button variant="outline" size="sm"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="h-56 overflow-hidden">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/">
            <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <button
            onClick={() => bookmarkMutation.mutate()}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            data-testid="button-bookmark"
          >
            {isBookmarked
              ? <BookmarkCheck className="w-5 h-5 text-primary" />
              : <Bookmark className="w-5 h-5 text-white" />
            }
          </button>
        </div>

        <div className="px-5 -mt-16 relative z-10">
          <h1 className="font-serif text-2xl font-bold mb-1" data-testid="text-book-title">{book.title}</h1>
          <p className="text-sm text-muted-foreground mb-3" data-testid="text-book-author">by {book.author}</p>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Clock className="w-3 h-3" />{book.readTime} min read
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Headphones className="w-3 h-3" />{book.listenTime} min listen
            </Badge>
            {principles && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Lightbulb className="w-3 h-3" />{principles.length} principles
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5" data-testid="text-book-description">
            {book.description}
          </p>

          <div className="flex gap-3 mb-6">
            <Link href={`/book/${id}/journey`} className="flex-1">
              <Button className="w-full gap-2" data-testid="button-start-journey">
                <Play className="w-4 h-4" />
                {cardProgress > 0 ? `Resume (${cardProgress}%)` : "Start Journey"}
              </Button>
            </Link>
            {book.audioUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => play(book)}
                data-testid="button-play-audio"
              >
                <Headphones className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4" data-testid="tabs-book-content">
            <TabsTrigger value="principles" className="gap-1 text-xs" data-testid="tab-principles">
              <Lightbulb className="w-3 h-3" />Principles
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1 text-xs" data-testid="tab-stories">
              <BookMarked className="w-3 h-3" />Stories
            </TabsTrigger>
            <TabsTrigger value="exercises" className="gap-1 text-xs" data-testid="tab-exercises">
              <Dumbbell className="w-3 h-3" />Exercises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="principles">
            <div className="space-y-3" data-testid="list-principles">
              {principles?.map((principle, idx) => {
                const isCompleted = completedPrinciples.includes(principle.id);
                return (
                  <Card key={principle.id} className={`p-4 ${isCompleted ? "bg-primary/5 border-primary/20" : ""}`} data-testid={`card-principle-${principle.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted
                          ? <CheckCircle2 className="w-5 h-5 text-primary" />
                          : <Circle className="w-5 h-5 text-muted-foreground/30" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-muted-foreground font-mono">{String(idx + 1).padStart(2, "0")}</span>
                          <h3 className="font-semibold text-sm">{principle.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{principle.content}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {(!principles || principles.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No principles available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="space-y-3" data-testid="list-stories">
              {stories?.map((story) => (
                <Card key={story.id} className="p-4" data-testid={`card-story-${story.id}`}>
                  <h3 className="font-semibold text-sm mb-2">{story.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">{story.content}</p>
                  {story.moral && (
                    <div className="bg-primary/5 rounded-md p-3 border-l-2 border-primary">
                      <p className="text-xs"><span className="text-primary font-semibold">Takeaway: </span>{story.moral}</p>
                    </div>
                  )}
                </Card>
              ))}
              {(!stories || stories.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No stories available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exercises">
            <div className="space-y-3" data-testid="list-exercises">
              {exercises?.map((exercise) => (
                <Card key={exercise.id} className="p-4" data-testid={`card-exercise-${exercise.id}`}>
                  <Badge variant="secondary" className="text-[10px] mb-2">
                    {exercise.type === "reflection" ? "Reflection" : exercise.type === "quiz" ? "Quiz" : "Action Plan"}
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1">{exercise.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{exercise.description}</p>
                  <Link href={`/book/${id}/journey`}>
                    <Button variant="link" size="sm" className="mt-2 px-0 gap-1 text-xs h-auto" data-testid={`button-try-exercise-${exercise.id}`}>
                      Try in Journey <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              ))}
              {(!exercises || exercises.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No exercises available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
