import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, BookOpen, Lightbulb, Brain, AlertTriangle,
  Dumbbell, ListChecks, Layers, Bookmark, BookmarkCheck,
  Clock, Headphones, Play, ChevronRight, BarChart3,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useAudio } from "@/lib/audio-context";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";

interface ContentCounts {
  chapterSummaries: number;
  mentalModels: number;
  principles: number;
  commonMistakes: number;
  exercises: number;
  actionItems: number;
  infographics: number;
}

const BLUEPRINT_TILES = [
  {
    key: "chapter-summaries",
    label: "Chapter Summaries",
    icon: Layers,
    countKey: "chapterSummaries" as keyof ContentCounts,
    featured: true,
  },
  {
    key: "mental-models",
    label: "Mental Models",
    icon: Brain,
    countKey: "mentalModels" as keyof ContentCounts,
    featured: false,
  },
  {
    key: "principles",
    label: "Principles & Stories",
    icon: Lightbulb,
    countKey: "principles" as keyof ContentCounts,
    featured: false,
  },
  {
    key: "common-mistakes",
    label: "Common Mistakes",
    icon: AlertTriangle,
    countKey: "commonMistakes" as keyof ContentCounts,
    featured: false,
  },
  {
    key: "infographics",
    label: "Infographics",
    icon: BarChart3,
    countKey: "infographics" as keyof ContentCounts,
    featured: false,
  },
  {
    key: "exercises",
    label: "Exercises",
    icon: Dumbbell,
    countKey: "exercises" as keyof ContentCounts,
    featured: false,
  },
  {
    key: "action-items",
    label: "Action Items",
    icon: ListChecks,
    countKey: "actionItems" as keyof ContentCounts,
    featured: false,
  },
];

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { play } = useAudio();
  const [, navigate] = useLocation();

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: contentCounts } = useQuery<ContentCounts>({
    queryKey: ["/api/books", id, "content-counts"],
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

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
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
          </div>

          <div className="flex gap-3 mb-5">
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
        {book.coreThesis && (
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20" data-testid="card-core-thesis">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Core Thesis</p>
                <p className="text-sm leading-relaxed" data-testid="text-core-thesis">{book.coreThesis}</p>
              </div>
            </div>
          </Card>
        )}

        <h2 className="font-serif text-lg font-bold mb-3" data-testid="text-blueprint-heading">Blueprint</h2>

        <div className="grid grid-cols-2 gap-3" data-testid="grid-blueprint">
          {BLUEPRINT_TILES.map((tile) => {
            const count = contentCounts?.[tile.countKey] ?? 0;
            const Icon = tile.icon;

            if (tile.featured) {
              return (
                <Card
                  key={tile.key}
                  className="col-span-2 p-4 cursor-pointer hover-elevate active-elevate-2 overflow-visible"
                  onClick={() => navigate(`/book/${id}/journey?section=${tile.key}`)}
                  data-testid={`tile-${tile.key}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{tile.label}</p>
                      <p className="text-xs text-muted-foreground">Tap through key insights chapter by chapter</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold">{count}</Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              );
            }

            return (
              <Card
                key={tile.key}
                className="p-4 cursor-pointer hover-elevate active-elevate-2 overflow-visible"
                onClick={() => navigate(`/book/${id}/journey?section=${tile.key}`)}
                data-testid={`tile-${tile.key}`}
              >
                <div className="flex flex-col items-center justify-center text-center gap-2 min-h-[100px]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-xs leading-tight">{tile.label}</p>
                  <Badge variant="secondary" className="text-[10px] font-semibold">{count}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
