import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Headphones, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  title: string;
  audioUrl?: string;
}

export function AudioPlayer({ title, audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    if (audioUrl && audioUrl !== "placeholder") {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setHasAudio(true);

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("error", () => {
        setHasAudio(false);
      });

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = useCallback((value: number[]) => {
    const time = (value[0] / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, [duration]);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  }, [duration]);

  const cycleSpeed = useCallback(() => {
    const speeds = [1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const newSpeed = speeds[(idx + 1) % speeds.length];
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [speed]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-4" data-testid="audio-player">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" data-testid="text-audio-title">{title}</p>
          <p className="text-xs text-muted-foreground">
            {hasAudio ? "Audio Summary" : "Audio summary coming soon"}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <Slider
          value={[progressPercent]}
          onValueChange={seek}
          max={100}
          step={0.1}
          className="w-full"
          disabled={!hasAudio}
          data-testid="slider-audio-progress"
        />
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-15)}
            disabled={!hasAudio}
            data-testid="button-rewind"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            disabled={!hasAudio}
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(15)}
            disabled={!hasAudio}
            data-testid="button-forward"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={cycleSpeed}
          disabled={!hasAudio}
          data-testid="button-speed"
        >
          {speed}x
        </Button>
      </div>
    </Card>
  );
}
