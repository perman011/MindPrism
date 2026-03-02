import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, BookOpen, Brain,
  Bookmark, BookmarkCheck,
  Clock, Headphones, Share2,
  Film, ExternalLink,
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
  const [showShortsPlayer, setShowShortsPlayer] = useState(false);
  const [shortsPlayerIndex, setShortsPlayerIndex] = useState(0);

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

  const { data: progress } = useQuery<UserProgress | null>({
    queryKey: ["/api/progress", id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  const { data: bookShorts = [] } = useQuery<Short[]>({
    queryKey: ["/api/books", id, "shorts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: mentalModels } = useQuery<any[]>({
    queryKey: ["/api/books", id, "mental-models"],
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={book?.title ? `${book.title} by ${book.author}` : "Book Detail"}
        description={book?.description || "Explore interactive book breakdowns with chapter summaries, mental models, and audio summaries."}
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
            onClick={() => navigate(`/book/${id}/read`)}
            data-testid="button-read-chapters"
          >
            <BookOpen className="w-4 h-4" />
            Read Chapters
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              const searchQuery = encodeURIComponent(`${book.title} ${book.author}`);
              window.open(`https://www.amazon.com/s?k=${searchQuery}`, "_blank", "noopener");
            }}
            data-testid="button-buy-online"
          >
            <ExternalLink className="w-4 h-4" />
            Buy Online
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
              Listen
            </Button>
            {!audioAvailable && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-[9px] font-semibold" data-testid="badge-coming-soon">
                Coming Soon
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              {mentalModels && mentalModels.length > 0 ? (
                <Link href={`/book/${id}/journey?section=mental-models`}>
                  <Button variant="outline" className="w-full gap-2" data-testid="button-mental-models">
                    <Brain className="w-4 h-4" />
                    Mental Models
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full gap-2 opacity-50 cursor-not-allowed" disabled data-testid="button-mental-models">
                  <Brain className="w-4 h-4" />
                  Mental Models
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-[9px] font-semibold">Soon</Badge>
                </Button>
              )}
            </div>
            <div className="relative">
              {bookShorts && bookShorts.length > 0 ? (
                <Link href={`/book/${id}/journey?section=shorts`}>
                  <Button variant="outline" className="w-full gap-2" data-testid="button-shorts">
                    <Film className="w-4 h-4" />
                    Shorts
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full gap-2 opacity-50 cursor-not-allowed" disabled data-testid="button-shorts">
                  <Film className="w-4 h-4" />
                  Shorts
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-[9px] font-semibold">Soon</Badge>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-2 pb-8">
        {bookShorts && bookShorts.length > 0 && (
          <div data-testid="section-book-shorts">
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
