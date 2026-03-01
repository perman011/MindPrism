import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Headphones, Clock, Play } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { trackAudioPlay } from "@/lib/analytics";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AudioPage() {
  const { play, book: currentBook, isPlaying } = useAudio();

  const handlePlay = (book: Book) => {
    trackAudioPlay(book.id, book.title);
    play(book);
  };

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const audioBooks = books?.filter(b => b.audioUrl && b.audioUrl !== 'placeholder' && !b.audioUrl.includes('placeholder')) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Audio Summaries"
        description="Listen to psychology book summaries on the go. Bite-sized audio insights for personal growth."
        noIndex
      />
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[32px] font-bold text-[#111827]" data-testid="text-audio-title">Audio Summaries</h1>
        <p className="text-sm text-[#6B7280] mt-1" data-testid="text-audio-subtitle">Listen and learn on the go</p>
      </div>

      <div className="px-5 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : audioBooks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 px-6 text-center" data-testid="audio-empty-state">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Headphones className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No audio summaries yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Audio summaries will appear here once they are available. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="audio-list">
            {audioBooks.map((book) => {
              const isCurrentlyPlaying = currentBook?.id === book.id && isPlaying;
              return (
                <button
                  key={book.id}
                  onClick={() => handlePlay(book)}
                  className="group w-full flex items-center gap-4 p-3 rounded-xl bg-card border border-card-border hover-elevate active-elevate-2 transition-all text-left"
                  data-testid={`audio-item-${book.id}`}
                  aria-label={`Play ${book.title} by ${book.author}`}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary/30">{book.title[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center invisible group-hover:visible" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-foreground" data-testid={`text-audio-title-${book.id}`}>{book.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1" data-testid={`text-audio-author-${book.id}`}>{book.author}</p>
                    <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1" data-testid={`text-audio-duration-${book.id}`}>
                        <Clock className="w-3 h-3" />
                        {book.audioDuration
                          ? formatDuration(book.audioDuration)
                          : `${book.listenTime} min`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        Audio Summary
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCurrentlyPlaying ? "bg-primary" : "bg-primary/10"
                    }`}
                    data-testid={`button-play-${book.id}`}
                  >
                    <Play className={`w-4 h-4 ml-0.5 ${isCurrentlyPlaying ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
