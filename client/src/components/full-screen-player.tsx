import { useAudio } from "@/lib/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Headphones } from "lucide-react";

export function FullScreenPlayer() {
  const { book, isPlaying, currentTime, duration, speed, isFullScreen, togglePlay, seek, skip, setSpeed, setFullScreen } = useAudio();

  if (!book || !isFullScreen) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speeds = [1, 1.25, 1.5, 2];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col" data-testid="full-screen-player">
      <div className="absolute inset-0 z-0">
        {book.coverImage && (
          <img src={book.coverImage} alt="" className="w-full h-full object-cover opacity-20 blur-3xl scale-110" />
        )}
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={() => setFullScreen(false)}
            className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center"
            data-testid="button-minimize-player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Now Playing</p>
          <div className="w-9" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl mb-8">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center">
                <Headphones className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          <h2 className="font-serif text-xl font-bold text-center mb-1" data-testid="text-player-title">{book.title}</h2>
          <p className="text-sm text-muted-foreground mb-8">{book.author}</p>
        </div>

        <div className="px-8 pb-10">
          <Slider
            value={[progress]}
            onValueChange={(v) => seek((v[0] / 100) * duration)}
            max={100}
            step={0.1}
            className="w-full mb-2"
            data-testid="slider-player-progress"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => skip(-15)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-rewind-15"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg"
              data-testid="button-play-pause-main"
            >
              {isPlaying
                ? <Pause className="w-7 h-7 text-primary-foreground" />
                : <Play className="w-7 h-7 text-primary-foreground ml-1" />
              }
            </button>
            <button
              onClick={() => skip(15)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-forward-15"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                const idx = speeds.indexOf(speed);
                setSpeed(speeds[(idx + 1) % speeds.length]);
              }}
              className="px-4 py-1.5 rounded-full bg-muted text-xs font-medium"
              data-testid="button-speed-control"
            >
              {speed}x Speed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
