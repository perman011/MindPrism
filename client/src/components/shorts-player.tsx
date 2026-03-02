import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Short } from "@shared/schema";
import { X, Play, Pause, Volume2, VolumeX, Image, Headphones, Video, Share2 } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

function AudioShort({ short, isActive, isPaused }: { short: Short; isActive: boolean; isPaused: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if ((!isActive || isPaused) && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [isActive, isPaused]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || isPaused) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing, isPaused]);

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
              backgroundColor: bar.isPlayed ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)",
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

function VideoShort({ short, isActive, isMuted, isPaused, onProgressUpdate }: { short: Short; isActive: boolean; isMuted: boolean; isPaused: boolean; onProgressUpdate?: (progress: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && !isPaused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive, isPaused]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgressUpdate) return;
    const update = () => {
      if (video.duration) {
        onProgressUpdate(video.currentTime / video.duration);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    if (isActive && !isPaused) {
      animFrameRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, isPaused, onProgressUpdate]);

  const seekTo = useCallback((fraction: number) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = fraction * videoRef.current.duration;
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      (videoRef.current as any)._seekTo = seekTo;
    }
  }, [seekTo]);

  return (
    <div className="absolute inset-0" data-testid="video-short-player">
      {short.mediaUrl && (
        <video
          ref={videoRef}
          src={short.mediaUrl}
          className="w-full h-full object-cover"
          playsInline
          loop
          muted={isMuted}
          data-video-element="true"
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
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem("mindprism-shorts-muted");
    return stored !== "false";
  });
  const [isPaused, setIsPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const playIconTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressBarRef = useRef<HTMLDivElement>(null);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem("mindprism-shorts-muted", String(next));
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    setShowPlayIcon(true);
    if (playIconTimerRef.current) clearTimeout(playIconTimerRef.current);
    playIconTimerRef.current = setTimeout(() => setShowPlayIcon(false), 800);
  }, []);

  const DEFAULT_GRADIENTS = [
    "linear-gradient(135deg, #341539 0%, #5B2C6F 50%, #8E44AD 100%)",
    "linear-gradient(135deg, #1e40AF 0%, #3B82F6 50%, #60A5FA 100%)",
    "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #f97316 100%)",
    "linear-gradient(135deg, #0F4C3A 0%, #1B7A5A 50%, #4CAF7D 100%)",
    "linear-gradient(135deg, #1e3a5f 0%, #2563EB 50%, #93C5FD 100%)",
    "linear-gradient(135deg, #4A1942 0%, #6B2FA0 50%, #9B59B6 100%)",
    "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
    "linear-gradient(135deg, #1A1225 0%, #341539 50%, #6B3FA0 100%)",
  ];

  const getDefaultGradient = useCallback((short: Short) => {
    const seed = short.bookId || short.id || "0";
    let hash = 0;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return DEFAULT_GRADIENTS[Math.abs(hash) % DEFAULT_GRADIENTS.length];
  }, []);

  const { data: fetchedShorts } = useQuery<Short[]>({
    queryKey: bookId ? ["/api/books", bookId, "shorts"] : ["/api/shorts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !propShorts,
  });

  const allShorts = propShorts ?? fetchedShorts ?? [];

  const handleProgressScrub = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.floor(fraction * allShorts.length);
    if (idx !== currentIndex && idx >= 0 && idx < allShorts.length) {
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    }
    const video = document.querySelector("[data-video-element]") as any;
    if (video?._seekTo && idx === currentIndex) {
      const withinSegment = (fraction * allShorts.length) - idx;
      video._seekTo(withinSegment);
    }
  }, [allShorts.length, currentIndex]);
  const currentShort = allShorts[currentIndex];

  useEffect(() => {
    if (!currentShort) return;
    fetch(`/api/shorts/${currentShort.id}/view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [currentShort?.id]);

  useEffect(() => {
    if (!currentShort || isPaused) return;
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
  }, [currentIndex, currentShort, allShorts.length, isPaused]);

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
      <div className="fixed inset-0 z-[60] bg-background flex items-center justify-center" data-testid="shorts-player-empty">
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
    <div className="fixed inset-0 z-[60] bg-background" data-testid="shorts-player">
      <div
        ref={progressBarRef}
        className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3 cursor-pointer"
        data-testid="shorts-progress-bar"
        onClick={handleProgressScrub}
        onTouchStart={handleProgressScrub}
      >
        {allShorts.map((_, i) => (
          <div key={i} className="flex-1 h-[5px] rounded-full overflow-hidden bg-white/20">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: i < currentIndex ? "100%" : i === currentIndex ? (currentShort?.mediaType === "video" ? `${videoProgress * 100}%` : "100%") : "0%",
                backgroundColor: "hsl(var(--primary))",
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
        {currentShort?.mediaType === "video" && (
          <button
            onClick={toggleMute}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            data-testid="button-mute-toggle"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" aria-hidden="true" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" aria-hidden="true" />
            )}
          </button>
        )}
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
            <VideoShort short={currentShort} isActive isMuted={isMuted} isPaused={isPaused} onProgressUpdate={setVideoProgress} />
          )}

          {currentShort.mediaType === "image" && currentShort.mediaUrl && (
            <img
              src={currentShort.mediaUrl}
              alt={currentShort.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}

          {!currentShort.mediaUrl && (
            <div
              className="absolute inset-0"
              style={{ background: currentShort.backgroundGradient || getDefaultGradient(currentShort) }}
            />
          )}

          {currentShort.mediaUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          )}
          {!currentShort.mediaUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />
          )}

          <div
            className="absolute inset-0 z-10"
            onClick={togglePause}
            data-testid="button-pause-toggle"
          >
            {showPlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-200">
                  {isPaused ? (
                    <Play className="w-10 h-10 text-white ml-1" aria-hidden="true" />
                  ) : (
                    <Pause className="w-10 h-10 text-white" aria-hidden="true" />
                  )}
                </div>
              </div>
            )}
          </div>

          {!currentShort.mediaUrl ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 pointer-events-none">
              {currentShort.mediaType === "audio" ? (
                <div className="mb-6 w-full pointer-events-auto">
                  <AudioShort short={currentShort} isActive isPaused={isPaused} />
                </div>
              ) : null}
              {(() => {
                const hasDistinctContent = currentShort.content &&
                  currentShort.content.trim() !== currentShort.title.trim() &&
                  currentShort.content.trim().length > 0;
                return hasDistinctContent ? (
                  <>
                    <h2
                      className="text-white font-bold mb-4 text-center"
                      style={{ fontSize: "22px", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                      data-testid="text-short-title"
                    >
                      {currentShort.title}
                    </h2>
                    <div
                      className="text-white leading-relaxed text-center"
                      style={{ fontSize: "16px", opacity: 0.95, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                      data-testid="text-short-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(currentShort.content) }}
                    />
                  </>
                ) : (
                  <h2
                    className="text-white font-bold text-center"
                    style={{ fontSize: "28px", lineHeight: 1.3, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                    data-testid="text-short-title"
                  >
                    {currentShort.title}
                  </h2>
                );
              })()}
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 z-10">
              {currentShort.mediaType === "audio" ? (
                <div className="mb-6">
                  <AudioShort short={currentShort} isActive isPaused={isPaused} />
                </div>
              ) : null}
              <h2
                className="text-white font-bold mb-2"
                style={{ fontSize: "20px" }}
                data-testid="text-short-title"
              >
                {currentShort.title}
              </h2>
              <div
                className="text-white leading-relaxed"
                style={{ fontSize: "15px", opacity: 0.9 }}
                data-testid="text-short-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(currentShort.content || "") }}
              />
            </div>
          )}
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
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #341539 0%, #5B2C6F 50%, #8E44AD 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
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
