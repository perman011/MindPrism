import { useAudio } from "@/lib/audio-context";
import { Play, Pause, X } from "lucide-react";

export function MiniPlayer() {
  const { book, isPlaying, currentTime, duration, togglePlay, setFullScreen, close } = useAudio();

  if (!book) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 cursor-pointer"
      onClick={() => setFullScreen(true)}
      data-testid="mini-player"
    >
      <div className="max-w-2xl mx-auto">
        <div className="h-0.5 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <span className="font-serif text-sm font-bold text-primary/50">{book.title[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{book.title}</p>
            <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            data-testid="mini-player-toggle"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-primary-foreground" /> : <Play className="w-4 h-4 text-primary-foreground ml-0.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground"
            data-testid="mini-player-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
