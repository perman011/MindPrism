import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Short } from "@shared/schema";
import { X, Play, Pause, Volume2, Image, Headphones, Video, Share2 } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

function AudioShort({ short, isActive }: { short: Short; isActive: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setDuration(audio.duration);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    if (playing) {
      animFrameRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing]);

  const bars = Array.from({ length: 40 }, (_, i) => {
    const barProgress = i / 40;
    const isPlayed = barProgress <= progress;
    const height = 12 + Math.sin(i * 0.8 + (playing ? Date.now() * 0.003 : 0)) * 10 + Math.random() * (playing ? 8 : 2);
    return { height: Math.max(4, height), isPlayed };
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8" data-testid="audio-short-player">
      {short.mediaUrl && <audio ref={audioRef} src={short.mediaUrl} preload="metadata" />}
      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
        <Volume2 className="w-10 h-10 text-primary" />
      </div>
      <div className="flex items-end justify-center gap-[3px] h-12 w-full max-w-xs">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="w-[4px] rounded-full transition-all"
            style={{
              height: `${bar.height}px`,
              backgroundColor: bar.isPlayed ? "#341539" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 w-full max-w-xs">
        <span className="text-[11px] text-white/50 w-8 text-right">{formatTime(progress * duration)}</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-white/50 w-8">{formatTime(duration)}</span>
      </div>
      <button
        onClick={togglePlay}
        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform"
        data-testid="button-audio-toggle"
        aria-label={playing ? "Pause audio" : "Play audio"}
      >
        {playing ? <Pause className="w-7 h-7 text-black" aria-hidden="true" /> : <Play className="w-7 h-7 text-black ml-1" aria-hidden="true" />}
      </button>
    </div>
  );
}

function VideoShort({ short, isActive }: { short: Short; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <div className="absolute inset-0" data-testid="video-short-player">
      {short.mediaUrl && (
        <video
          ref={videoRef}
          src={short.mediaUrl}
          className="w-full h-full object-cover"
          playsInline
          loop
          muted
        />
      )}
    </div>
  );
}

interface ShortsPlayerProps {
  shorts?: Short[];
  bookId?: string;
  initialIndex?: number;
  onClose: () => void;
}

export function ShortsPlayer({ shorts: propShorts, bookId, initialIndex = 0, onClose }: ShortsPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: fetchedShorts } = useQuery<Short[]>({
    queryKey: bookId ? ["/api/books", bookId, "shorts"] : ["/api/shorts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !propShorts,
  });

  const allShorts = propShorts ?? fetchedShorts ?? [];
  const currentShort = allShorts[currentIndex];

  useEffect(() => {
    if (!currentShort) return;
    fetch(`/api/shorts/${currentShort.id}/view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [currentShort?.id]);

  useEffect(() => {
    if (!currentShort) return;
    if (currentShort.mediaType === "image" && currentShort.duration) {
      timerRef.current = setTimeout(() => {
        if (currentIndex < allShorts.length - 1) {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
        }
      }, currentShort.duration * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, currentShort, allShorts.length]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold && currentIndex < allShorts.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else if (info.offset.y > threshold && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, allShorts.length]);

  if (allShorts.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#F5F0EB] flex items-center justify-center" data-testid="shorts-player-empty">
        <p className="text-white/60 text-sm">No shorts available</p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
          data-testid="button-close-shorts"
          aria-label="Close shorts"
        >
          <X className="w-6 h-6 text-white" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#F5F0EB]" data-testid="shorts-player">
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3" data-testid="shorts-progress-bar">
        {allShorts.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/20">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: i < currentIndex ? "100%" : i === currentIndex ? "100%" : "0%",
                backgroundColor: "#341539",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-10 right-3 z-30 flex flex-col gap-2">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          data-testid="button-close-shorts"
          aria-label="Close shorts"
        >
          <X className="w-6 h-6 text-white" aria-hidden="true" />
        </button>
        <button
          onClick={() => {
            if (!currentShort) return;
            const shareData = {
              title: currentShort.title,
              text: currentShort.content,
              url: `${window.location.origin}/shorts?id=${currentShort.id}`,
            };
            if (navigator.share) {
              navigator.share(shareData).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareData.url).then(() => {
                const el = document.getElementById("share-toast");
                if (el) {
                  el.style.opacity = "1";
                  setTimeout(() => { el.style.opacity = "0"; }, 2000);
                }
              }).catch(() => {});
            }
          }}
          className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          data-testid="button-share-short"
          aria-label="Share short"
        >
          <Share2 className="w-5 h-5 text-white" aria-hidden="true" />
        </button>
      </div>

      <div
        id="share-toast"
        className="absolute top-24 right-3 z-30 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs transition-opacity duration-300"
        style={{ opacity: 0 }}
        data-testid="text-share-copied"
      >
        Link copied
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
          style={{ height: "100dvh" }}
        >
          {currentShort.mediaType === "video" && (
            <VideoShort short={currentShort} isActive />
          )}

          {currentShort.mediaType === "image" && currentShort.mediaUrl && (
            <img
              src={currentShort.mediaUrl}
              alt={currentShort.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {!currentShort.mediaUrl && currentShort.backgroundGradient && (
            <div
              className="absolute inset-0"
              style={{ background: currentShort.backgroundGradient }}
            />
          )}

          {!currentShort.mediaUrl && !currentShort.backgroundGradient && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#0F0F1A] to-[#0F0F1A]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A]/80 via-transparent to-[#0F0F1A]/30" />

          <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 z-10">
            {currentShort.mediaType === "audio" ? (
              <div className="mb-6">
                <AudioShort short={currentShort} isActive />
              </div>
            ) : null}
            <h2
              className="text-white font-bold mb-2"
              style={{ fontSize: "20px" }}
              data-testid="text-short-title"
            >
              {currentShort.title}
            </h2>
            <p
              className="text-white leading-relaxed"
              style={{ fontSize: "15px", opacity: 0.9 }}
              data-testid="text-short-content"
            >
              {currentShort.content}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ShortCard({ short, onClick, fluid }: { short: Short & { bookTitle?: string }; onClick: () => void; fluid?: boolean }) {
  const MediaIcon = short.mediaType === "audio" ? Headphones : short.mediaType === "video" ? Video : Image;

  return (
    <div
      className={`cursor-pointer active:scale-95 transition-transform ${fluid ? "w-full" : "flex-shrink-0 w-[120px]"}`}
      onClick={onClick}
      data-testid={`card-short-${short.id}`}
    >
      <div className={`relative rounded-xl overflow-hidden ${fluid ? "w-full aspect-[2/3]" : "w-[120px] h-[180px]"}`}>
        {short.thumbnailUrl ? (
          <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" />
        ) : short.backgroundGradient ? (
          <div className="w-full h-full" style={{ background: short.backgroundGradient }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-[#FFFFFF] to-[#0F0F1A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A]/80 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
          <MediaIcon className="w-3 h-3 text-white" />
        </div>
        {short.duration && (
          <div className="absolute bottom-12 left-2 px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-white/80">
            {short.duration}s
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          {short.bookTitle && (
            <p className="text-[11px] font-medium text-primary truncate mb-0.5">{short.bookTitle}</p>
          )}
          <p className="text-[13px] font-semibold text-white leading-tight line-clamp-2">{short.title}</p>
        </div>
      </div>
    </div>
  );
}
