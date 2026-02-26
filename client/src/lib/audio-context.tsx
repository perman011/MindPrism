import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Book } from "@shared/schema";

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

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    book: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    isFullScreen: false,
  });

  const play = useCallback((book: Book) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setState((prev) => ({
      ...prev,
      book,
      isPlaying: false,
      currentTime: 0,
      duration: book.listenTime * 60,
      isFullScreen: true,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const seek = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const skip = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      currentTime: Math.max(0, Math.min(prev.duration, prev.currentTime + seconds)),
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const setFullScreen = useCallback((full: boolean) => {
    setState((prev) => ({ ...prev, isFullScreen: full }));
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setState({
      book: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      speed: 1,
      isFullScreen: false,
    });
  }, []);

  useEffect(() => {
    if (!state.isPlaying || !state.book) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.currentTime >= prev.duration) {
          return { ...prev, isPlaying: false, currentTime: 0 };
        }
        return { ...prev, currentTime: prev.currentTime + prev.speed };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isPlaying, state.book, state.speed]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !state.book) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.book.title,
      artist: state.book.author,
      album: "MindPrism",
      artwork: state.book.coverImage
        ? [{ src: state.book.coverImage, sizes: "256x256", type: "image/png" }]
        : [],
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
    navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
  }, [state.book, state.isPlaying, togglePlay, skip]);

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
