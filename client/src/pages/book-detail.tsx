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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showShortsPlayer, setShowShortsPlayer] = useState(false);
  const [shortsPlayerIndex, setShortsPlayerIndex] = useState(0);

  const triggerCelebration = useCallback(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#341539", "#60A5FA", "#2A0F2E", "#ffffff"] });
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
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : navigate("/")}
              className="w-9 h-9 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
              data-testid="button-back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <Link href="/">
              <button className="w-9 h-9 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center" data-testid="button-home" aria-label="Go home">
                <Home className="w-4 h-4 text-white" />
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
              data-testid="button-share"
              aria-label="Share book"
            >
              <Share2 className="w-4.5 h-4.5 text-white" />
            </button>
            <button
              onClick={() => bookmarkMutation.mutate()}
              className="w-9 h-9 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
              data-testid="button-bookmark"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark book"}
            >
              {isBookmarked
                ? <BookmarkCheck className="w-5 h-5 text-white" />
                : <Bookmark className="w-5 h-5 text-white" />
              }
            </button>
          </div>
        </div>

        <div className="pt-20 pb-6 flex flex-col items-center bg-background">
          <div className="w-40 h-56 rounded-md overflow-hidden shadow-lg shadow-black/20 mb-6" data-testid="img-book-cover">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary/40" />
              </div>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-1.5" data-testid="text-summary-label">Summary</p>
          <h1 className="text-2xl font-bold font-serif text-foreground mb-1 text-center px-6 leading-tight" data-testid="text-book-title">{book.title}</h1>
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
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-book-author">by {book.author}</p>

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

          <div className="flex gap-3 w-full px-6">
            <Link href={`/book/${id}/journey`} className="flex-1">
              <Button className="w-full gap-2" data-testid="button-start-journey">
                <BookOpen className="w-4 h-4" />
                {cardProgress > 0 ? `Resume (${cardProgress}%)` : "Read"}
              </Button>
            </Link>
            {book.audioUrl && (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => play(book)}
                data-testid="button-play-audio"
              >
                <Headphones className="w-4 h-4" />
                Listen
              </Button>
            )}
          </div>
          <div className="w-full px-6 mt-3">
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
      </div>

      <div className="px-5 pt-6 pb-8">
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

        {bookShorts && bookShorts.length > 0 && (
          <div className="mt-8" data-testid="section-book-shorts">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold">Quick Bites</p>
            </div>
            <div className="flex items-center justify-between mb-4">
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
