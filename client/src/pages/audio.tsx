import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Headphones, Clock, Play } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { trackAudioPlay } from "@/lib/analytics";

export default function AudioPage() {
  const { play } = useAudio();

  const handlePlay = (book: Book) => {
    trackAudioPlay(book.id, book.title);
    play(book);
  };

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const audioBooks = books?.filter(b => b.audioUrl) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Audio Summaries"
        description="Listen to psychology book summaries on the go. Bite-sized audio insights for personal growth."
        noIndex
      />
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-audio-title">Audio Summaries</h1>
        <p className="text-sm text-muted-foreground mb-6">Listen and learn on the go</p>
      </div>

      <div className="px-5 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3" data-testid="audio-list">
            {audioBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => handlePlay(book)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-card border border-card-border hover-elevate transition-all text-left"
                data-testid={`audio-item-${book.id}`}
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary/30">{book.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{book.author}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.audioDuration
                        ? `${Math.floor(book.audioDuration / 60)}:${String(book.audioDuration % 60).padStart(2, '0')}`
                        : `${book.listenTime} min`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3 h-3" />
                      Audio Summary
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
