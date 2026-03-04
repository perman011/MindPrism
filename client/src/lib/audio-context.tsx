import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Book } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { normalizeMediaUrl } from "@/lib/media-url";

interface AudioState {
  book: Book | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  isFullScreen: boolean;
}

interface AudioContextType extends AudioState {
  play: (book: Book) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setSpeed: (speed: number) => void;
  setFullScreen: (full: boolean) => void;
  close: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

function isPlaceholderAudio(url: string | null): boolean {
  if (!url) return true;
  return url === "placeholder" || url.includes("placeholder");
}

function toAbsoluteUrl(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [state, setState] = useState<AudioState>({
    book: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    isFullScreen: false,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setState((prev) => ({ ...prev, duration: audio.duration }));
      }
    };

    const onDurationChange = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setState((prev) => ({ ...prev, duration: audio.duration }));
      }
    };

    const onTimeUpdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    const onPlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const onPause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const onEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const onRateChange = () => {
      setState((prev) => ({ ...prev, speed: audio.playbackRate }));
    };

    const onError = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("ratechange", onRateChange);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("ratechange", onRateChange);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback((book: Book) => {
    const audio = audioRef.current;
    const normalizedAudioUrl = normalizeMediaUrl(book.audioUrl);

    if (!normalizedAudioUrl || isPlaceholderAudio(normalizedAudioUrl)) {
      toast({
        title: "Audio Coming Soon",
        description: `The audio summary for "${book.title}" is not yet available.`,
      });
      return;
    }

    if (!audio) return;

    const desiredSrc = toAbsoluteUrl(normalizedAudioUrl);
    const currentSrc = audio.currentSrc || audio.src;
    const sourceChanged = currentSrc !== desiredSrc;

    if (sourceChanged) {
      audio.src = normalizedAudioUrl;
      audio.currentTime = 0;
      audio.load();
    }

    audio.playbackRate = state.speed;

    const fallbackDuration =
      (typeof book.audioDuration === "number" && book.audioDuration > 0)
        ? book.audioDuration
        : (typeof book.listenTime === "number" && book.listenTime > 0)
          ? book.listenTime * 60
          : 0;

    setState((prev) => ({
      ...prev,
      book,
      isFullScreen: true,
      currentTime: sourceChanged ? 0 : audio.currentTime,
      duration: sourceChanged ? fallbackDuration : prev.duration,
    }));

    audio.play().catch(() => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      toast({
        title: "Playback blocked",
        description: "Tap play again to start audio.",
      });
    });
  }, [state.speed, toast]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.book) return;

    if (audio.paused) {
      audio.play().catch(() => {
        setState((prev) => ({ ...prev, isPlaying: false }));
      });
    } else {
      audio.pause();
    }
  }, [state.book]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const maxDuration = (Number.isFinite(audio.duration) && audio.duration > 0)
      ? audio.duration
      : state.duration;
    const boundedTime = Math.max(0, Math.min(maxDuration || 0, time));
    audio.currentTime = boundedTime;
    setState((prev) => ({ ...prev, currentTime: boundedTime }));
  }, [state.duration]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const maxDuration = (Number.isFinite(audio.duration) && audio.duration > 0)
      ? audio.duration
      : state.duration;
    const nextTime = Math.max(0, Math.min(maxDuration || 0, audio.currentTime + seconds));
    audio.currentTime = nextTime;
    setState((prev) => ({ ...prev, currentTime: nextTime }));
  }, [state.duration]);

  const setSpeed = useCallback((speed: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const setFullScreen = useCallback((full: boolean) => {
    setState((prev) => ({ ...prev, isFullScreen: full }));
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    setState((prev) => ({
      ...prev,
      book: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isFullScreen: false,
    }));
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !state.book) return;

    const normalizedCover = normalizeMediaUrl(state.book.coverImage);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.book.title,
      artist: state.book.author,
      album: "MindPrism",
      artwork: normalizedCover
        ? [{ src: normalizedCover, sizes: "256x256" }]
        : [],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.play().catch(() => {});
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
    navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
  }, [state.book, state.isPlaying, skip]);

  return (
    <AudioContext.Provider value={{ ...state, play, togglePlay, seek, skip, setSpeed, setFullScreen, close }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
