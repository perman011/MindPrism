import { SEOHead } from "@/components/SEOHead";
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
  Clock, Headphones, ChevronRight, BarChart3, ShoppingCart, Share2,
  GraduationCap, HelpCircle, Film, Crown,
} from "lucide-react";
import type { Short } from "@shared/schema";
import { ShortsPlayer, ShortCard } from "@/components/shorts-player";
import { Link, useParams, useLocation } from "wouter";
import { useAudio } from "@/lib/audio-context";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Home } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { trackBookOpen } from "@/lib/analytics";
import { ShareModal } from "@/components/share-modal";
import { FlashcardPractice } from "@/components/flashcard-practice";
import { BookQuiz } from "@/components/book-quiz";
import confetti from "canvas-confetti";

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
  },
  {
    key: "mental-models",
    label: "Mental Models",
    icon: Brain,
    countKey: "mentalModels" as keyof ContentCounts,
  },
  {
    key: "principles",
    label: "Principles & Stories",
    icon: Lightbulb,
    countKey: "principles" as keyof ContentCounts,
  },
  {
    key: "common-mistakes",
    label: "Common Mistakes",
    icon: AlertTriangle,
    countKey: "commonMistakes" as keyof ContentCounts,
  },
  {
    key: "infographics",
    label: "Infographics",
    icon: BarChart3,
    countKey: "infographics" as keyof ContentCounts,
  },
  {
    key: "exercises",
    label: "Exercises",
    icon: Dumbbell,
    countKey: "exercises" as keyof ContentCounts,
  },
  {
    key: "action-items",
    label: "Action Items",
    icon: ListChecks,
    countKey: "actionItems" as keyof ContentCounts,
  },
];

function hasValidAudioUrl(audioUrl: string | null | undefined): boolean {
  if (!audioUrl) return false;
  if (audioUrl === "placeholder") return false;
  if (audioUrl.includes("placeholder")) return false;
  return true;
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { play } = useAudio();
  const [, navigate] = useLocation();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showShortsPlayer, setShowShortsPlayer] = useState(false);
  const [shortsPlayerIndex, setShortsPlayerIndex] = useState(0);

  const triggerCelebration = useCallback(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#3B82F6", "#60A5FA", "#DBEAFE", "#ffffff"] });
    setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } }), 200);
  }, []);

  const { data: book, isLoading: bookLoading, isFetching: bookFetching } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  useEffect(() => {
    if (book) {
      trackBookOpen(book.id, book.title);
    }
  }, [book]);

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

  const { data: bookShorts } = useQuery<Short[]>({
    queryKey: ["/api/books", id, "shorts"],
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
  const audioAvailable = hasValidAudioUrl(book?.audioUrl);

  const handleShare = useCallback(async () => {
    if (!book) return;
    const shareUrl = `https://mindprism.io/book/${book.id}`;
    const shareText = `I'm learning "${book.title}" by ${book.author} on MindPrism`;
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    setShowShareModal(true);
  }, [book]);

  if (bookLoading || bookFetching || !id) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="w-9 h-9 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="w-9 h-9 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col items-center px-6 pt-2 pb-6">
          <Skeleton className="w-40 h-56 rounded-xl mb-6" />
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-7 w-52 mb-2" />
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-3 w-48 mb-6" />
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div className="px-5 pt-2 pb-8">
          <Skeleton className="h-20 w-full rounded-md mb-6" />
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Book not found</h2>
          <Link href="/">
            <Button variant="outline" size="sm"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showFlashcards && book) {
    return (
      <FlashcardPractice
        bookId={book.id}
        bookTitle={book.title}
        onClose={() => setShowFlashcards(false)}
      />
    );
  }

  if (showQuiz && book) {
    return (
      <BookQuiz
        bookId={book.id}
        bookTitle={book.title}
        onClose={() => setShowQuiz(false)}
        onCelebrate={triggerCelebration}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={book?.title ? `${book.title} by ${book.author}` : "Book Detail"}
        description={book?.description || "Explore interactive psychology book breakdowns with principles, stories, exercises, and audio summaries."}
        ogType="article"
        ogImage={book?.coverImage || undefined}
        noIndex
        jsonLd={book ? {
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: { "@type": "Person", name: book.author },
          description: book.description || undefined,
          image: book.coverImage || undefined,
          url: window.location.href,
          publisher: { "@type": "Organization", name: "MindPrism" },
        } : undefined}
      />

      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.history.length > 1 ? window.history.back() : navigate("/")}
            data-testid="button-back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link href="/">
            <Button size="icon" variant="ghost" data-testid="button-home" aria-label="Go home">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleShare}
            data-testid="button-share"
            aria-label="Share book"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => bookmarkMutation.mutate()}
            data-testid="button-bookmark"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark book"}
          >
            {isBookmarked
              ? <BookmarkCheck className="w-5 h-5 text-primary" />
              : <Bookmark className="w-5 h-5" />
            }
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 pt-2 pb-6">
        <div className="w-40 h-56 rounded-xl overflow-hidden shadow-lg mb-6" data-testid="img-book-cover">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-1.5" data-testid="text-summary-label">Summary</p>
        <h1 className="text-2xl font-sans font-bold text-foreground mb-1 text-center leading-tight" data-testid="text-book-title">{book.title}</h1>
        {book.premiumOnly && (
          <Badge
            className="mt-1 mb-1 gap-1 text-[10px] font-semibold"
            style={{ backgroundColor: "hsl(var(--accent-gold))", color: "hsl(0 0% 10%)" }}
            data-testid="badge-premium"
          >
            <Crown className="w-3 h-3" />
            Premium
          </Badge>
        )}
        <p className="text-sm text-muted-foreground mb-2" data-testid="text-book-author">by {book.author}</p>
        {book.description && (
          <p className="text-muted-foreground text-sm text-center mb-4 leading-relaxed max-w-md" data-testid="text-book-description">{book.description}</p>
        )}

        <div className="flex items-center gap-1.5 mb-6 flex-wrap justify-center">
          <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-read-time">
            <Clock className="w-3 h-3" />
            {book.readTime} min read
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-listen-time">
            <Headphones className="w-3 h-3" />
            {book.listenTime} min listen
          </span>
        </div>

        <div className="w-full max-w-md space-y-3">
          <Button
            className="w-full gap-2"
            onClick={() => navigate(`/book/${id}/journey`)}
            data-testid="button-start-journey"
          >
            <BookOpen className="w-4 h-4" />
            {cardProgress > 0 ? `Resume (${cardProgress}%)` : "Read"}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => audioAvailable ? play(book) : undefined}
              disabled={!audioAvailable}
              data-testid="button-play-audio"
            >
              <Headphones className="w-4 h-4" />
              {audioAvailable ? "Listen" : "Listen"}
            </Button>
            {!audioAvailable && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-[9px] font-semibold" data-testid="badge-coming-soon">
                Coming Soon
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/book/${id}/journey?section=mental-models`}>
              <Button variant="outline" className="w-full gap-2" data-testid="button-mental-models">
                <Brain className="w-4 h-4" />
                Mental Models
              </Button>
            </Link>
            <Link href={`/book/${id}/journey?section=shorts`}>
              <Button variant="outline" className="w-full gap-2" data-testid="button-shorts">
                <Film className="w-4 h-4" />
                Shorts
              </Button>
            </Link>
          </div>

          <a
            href={book.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch("/api/user/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ eventType: "affiliate_click" as const, bookId: book.id }),
              }).catch(() => {});
            }}
            data-testid="button-buy-book"
          >
            <Button
              variant="outline"
              className="w-full gap-2"
              style={{ borderColor: "hsl(var(--accent-gold))", color: "hsl(var(--accent-gold))" }}
            >
              <ShoppingCart className="w-4 h-4" />
              Buy This Book
            </Button>
          </a>
        </div>
      </div>

      <div className="px-5 pt-2 pb-8">
        {book.coreThesis && (
          <Card className="p-4 mb-6" data-testid="card-core-thesis">
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

        {contentCounts && (
          <div className="mb-6" data-testid="section-blueprint">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">Content</p>
            </div>
            <h3 className="text-lg font-bold mb-4">Blueprint</h3>
            <div className="grid grid-cols-2 gap-3">
              {BLUEPRINT_TILES.map((tile) => {
                const count = contentCounts[tile.countKey] ?? 0;
                const TileIcon = tile.icon;
                return (
                  <Card
                    key={tile.key}
                    className={`p-4 hover-elevate cursor-pointer transition-opacity ${count === 0 ? "opacity-40" : ""}`}
                    onClick={() => count > 0 ? navigate(`/book/${id}/journey?section=${tile.key}`) : undefined}
                    data-testid={`card-blueprint-${tile.key}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TileIcon className="w-4 h-4 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold" data-testid={`badge-count-${tile.key}`}>
                        {count}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium leading-snug">{tile.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {bookShorts && bookShorts.length > 0 && (
          <div className="mt-4" data-testid="section-book-shorts">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">Quick Bites</p>
            </div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-bold">Shorts</h3>
              <Badge variant="secondary" className="text-[10px] font-semibold">{bookShorts.length} clip{bookShorts.length !== 1 ? "s" : ""}</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {bookShorts.map((short, i) => (
                <ShortCard
                  key={short.id}
                  short={short}
                  onClick={() => {
                    setShortsPlayerIndex(i);
                    setShowShortsPlayer(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {book && (
        <ShareModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          bookTitle={book.title}
          bookAuthor={book.author}
          bookId={book.id}
        />
      )}

      {showShortsPlayer && bookShorts && bookShorts.length > 0 && (
        <ShortsPlayer
          shorts={bookShorts}
          bookId={id}
          initialIndex={shortsPlayerIndex}
          onClose={() => setShowShortsPlayer(false)}
        />
      )}
    </div>
  );
}
