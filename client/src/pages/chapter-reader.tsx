import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Book, ChapterSummary } from "@shared/schema";
import { useParams, useLocation, useSearch } from "wouter";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen,
  Play, Pause, Clock, List, X, BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { normalizeMediaUrl } from "@/lib/media-url";
import { useToast } from "@/hooks/use-toast";
import { trackHighlightSave } from "@/lib/analytics";

const READER_BG = "#0F172A";
const READER_TEXT = "#F5F0EB";
const ACCENT = "#341539";
const ACCENT_LIGHT = "rgba(52, 21, 57, 0.15)";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const ALLOWED_TAGS = ["p", "h2", "h3", "strong", "em", "mark", "blockquote", "ul", "ol", "li", "hr", "br"];
const ALLOWED_ATTR: string[] = [];

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const raw = error.message.replace(/^\d+:\s*/, "").trim();
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.message === "string" && parsed.message.trim().length > 0) {
      return parsed.message;
    }
  } catch {
    // fall through
  }
  return raw;
}

function ChapterContent({ html, fallbackCards }: { html: string | null; fallbackCards: any[] | null }) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return null;
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }, [html]);

  if (sanitizedHtml) {
    return (
      <div
        className="chapter-reader-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  if (fallbackCards && Array.isArray(fallbackCards) && fallbackCards.length > 0) {
    return (
      <div className="space-y-6">
        {fallbackCards.map((card: any, i: number) => (
          <p key={i} className="leading-[1.7]" style={{ fontSize: "18px", color: READER_TEXT }}>
            {card.text}
          </p>
        ))}
      </div>
    );
  }

  return (
    <p style={{ color: "rgba(245,240,235,0.5)", fontSize: "18px" }}>
      No content available for this chapter yet.
    </p>
  );
}

function AudioPlayer({ audioUrl, accentColor }: { audioUrl: string; accentColor: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const resolvedAudioUrl = useMemo(() => normalizeMediaUrl(audioUrl) ?? audioUrl, [audioUrl]);
  const [playing, setPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const progressRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    setPlaying(false);
    setIsBuffering(false);
    setLoadError(null);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  useEffect(() => {
    const tick = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    if (playing) {
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      setLoadError(null);
      audioRef.current.play().catch(() => {
        setPlaying(false);
        setLoadError("Playback failed. The audio file may be unavailable.");
      });
    }
  }, [playing]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audioRef.current.currentTime = fraction * duration;
    setCurrentTime(fraction * duration);
  }, [duration]);

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${accentColor}` }}
      data-testid="chapter-audio-player"
    >
      <audio
        ref={audioRef}
        src={resolvedAudioUrl}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = speed;
            setLoadError(null);
          }
        }}
        onPlay={() => {
          setPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          setIsBuffering(false);
          setLoadError("Audio failed to load. Re-upload this chapter audio in Admin.");
        }}
      />

      <div
        ref={progressRef}
        className="h-1 cursor-pointer relative"
        style={{ background: "rgba(245,240,235,0.1)" }}
        onClick={handleSeek}
        onTouchStart={handleSeek}
        data-testid="audio-seek-bar"
      >
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, background: accentColor }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: accentColor }}
          data-testid="audio-play-pause"
        >
          {playing ? (
            <Pause className="w-5 h-5" style={{ color: READER_TEXT }} />
          ) : (
            <Play className="w-5 h-5 ml-0.5" style={{ color: READER_TEXT }} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs" style={{ color: "rgba(245,240,235,0.6)" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
          </div>
          {(isBuffering || loadError) && (
            <p className="text-[11px] mt-1" style={{ color: loadError ? "#FCA5A5" : "rgba(245,240,235,0.65)" }}>
              {loadError || "Buffering audio..."}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ color: READER_TEXT, background: "rgba(245,240,235,0.1)" }}
            data-testid="audio-speed-btn"
          >
            {speed}x
          </button>
          {showSpeedMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden shadow-lg"
              style={{ background: "#1E293B", border: "1px solid rgba(245,240,235,0.1)" }}
            >
              {speeds.map(s => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className="block w-full px-4 py-2 text-xs text-left hover:bg-white/10 transition-colors"
                  style={{ color: s === speed ? accentColor : READER_TEXT }}
                  data-testid={`speed-option-${s}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TableOfContents({
  chapters,
  currentIndex,
  onSelect,
  onClose,
}: {
  chapters: ChapterSummary[];
  currentIndex: number;
  onSelect: (idx: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl max-h-[70vh] overflow-y-auto rounded-t-2xl p-6"
        style={{ background: "#1E293B" }}
        onClick={e => e.stopPropagation()}
        data-testid="table-of-contents"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: READER_TEXT }}>Chapters</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: "rgba(245,240,235,0.5)" }} />
          </button>
        </div>
        <div className="space-y-1">
          {chapters.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => { onSelect(i); onClose(); }}
              className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3"
              style={{
                background: i === currentIndex ? ACCENT_LIGHT : "transparent",
                color: READER_TEXT,
              }}
              data-testid={`toc-chapter-${ch.id}`}
            >
              <span className="text-xs font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: i === currentIndex ? ACCENT : "rgba(245,240,235,0.1)" }}
              >
                {ch.chapterNumber}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ch.chapterTitle}</p>
                {ch.subtitle && (
                  <p className="text-xs truncate" style={{ color: "rgba(245,240,235,0.5)" }}>
                    {ch.subtitle}
                  </p>
                )}
              </div>
              {ch.estimatedReadTime && (
                <span className="text-[10px] shrink-0" style={{ color: "rgba(245,240,235,0.4)" }}>
                  {ch.estimatedReadTime} min
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChapterReader() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isChapterHydrating, setIsChapterHydrating] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState("");
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const deepLinkedChapterId = useMemo(() => {
    const value = new URLSearchParams(searchString).get("chapter");
    return value?.trim() || null;
  }, [searchString]);

  const { data: book, isError: bookError } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: chapters = [], isLoading, isError: chaptersError } = useQuery<ChapterSummary[]>({
    queryKey: ["/api/books", id, "chapter-summaries"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const currentChapter = chapters[chapterIndex];
  const currentChapterAudioUrl = normalizeMediaUrl(currentChapter?.audioUrl);
  const hasAudio = !!currentChapterAudioUrl;

  useEffect(() => {
    setDeepLinkApplied(false);
  }, [id, deepLinkedChapterId]);

  useEffect(() => {
    if (!deepLinkedChapterId || deepLinkApplied || chapters.length === 0) {
      return;
    }
    const chapterIdx = chapters.findIndex((chapter) => chapter.id === deepLinkedChapterId);
    if (chapterIdx >= 0) {
      setChapterIndex(chapterIdx);
    }
    setDeepLinkApplied(true);
  }, [chapters, deepLinkedChapterId, deepLinkApplied]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
  }, [chapterIndex]);

  useEffect(() => {
    setIsChapterHydrating(true);
    const frameId = requestAnimationFrame(() => setIsChapterHydrating(false));
    return () => cancelAnimationFrame(frameId);
  }, [currentChapter?.id]);

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const max = scrollHeight - clientHeight;
    if (max > 0) {
      setScrollProgress((scrollTop / max) * 100);
    }
  }, []);

  const goToChapter = useCallback((idx: number) => {
    if (idx >= 0 && idx < chapters.length) {
      setChapterIndex(idx);
    }
  }, [chapters.length]);

  const saveHighlightMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!id) {
        throw new Error("Missing book id");
      }
      await apiRequest("POST", "/api/highlights", {
        bookId: id,
        chapterId: currentChapter?.id,
        content,
        type: "chapter",
      });
    },
    onSuccess: () => {
      if (id) {
        trackHighlightSave(id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/highlights"] });
      setSelectedHighlight("");
      const selection = window.getSelection();
      selection?.removeAllRanges();
      toast({ title: "Saved", description: "Highlight added to your vault." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: extractApiErrorMessage(error, "Failed to save highlight."),
        variant: "destructive",
      });
    },
  });

  const saveManualHighlight = useCallback(() => {
    const text = window.prompt("Save a highlight from this chapter:", "");
    if (!text) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    saveHighlightMutation.mutate(trimmed.slice(0, 400));
  }, [saveHighlightMutation]);

  useEffect(() => {
    const readSelection = () => {
      const container = contentRef.current;
      if (!container) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setSelectedHighlight("");
        return;
      }

      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode || !focusNode) {
        setSelectedHighlight("");
        return;
      }

      const containsAnchor = container.contains(anchorNode);
      const containsFocus = container.contains(focusNode);
      if (!containsAnchor || !containsFocus) {
        setSelectedHighlight("");
        return;
      }

      const text = selection.toString().replace(/\s+/g, " ").trim();
      setSelectedHighlight(text.slice(0, 400));
    };

    const container = contentRef.current;
    if (!container) return;

    container.addEventListener("mouseup", readSelection);
    container.addEventListener("keyup", readSelection);
    container.addEventListener("touchend", readSelection);
    return () => {
      container.removeEventListener("mouseup", readSelection);
      container.removeEventListener("keyup", readSelection);
      container.removeEventListener("touchend", readSelection);
    };
  }, [currentChapter?.id]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: READER_BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-md animate-pulse" style={{ background: ACCENT }} />
          <p className="text-sm" style={{ color: "rgba(245,240,235,0.5)" }}>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (bookError || chaptersError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: READER_BG }}>
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto" style={{ color: "rgba(245,240,235,0.3)" }} />
          <p style={{ color: READER_TEXT }}>Failed to load book content</p>
          <Button variant="outline" onClick={() => navigate(`/book/${id}`)} data-testid="button-back-to-book">
            Back to Book
          </Button>
        </div>
      </div>
    );
  }

  if (!book || chapters.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: READER_BG }}>
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto" style={{ color: "rgba(245,240,235,0.3)" }} />
          <p style={{ color: READER_TEXT }}>No chapters available</p>
          <Button variant="outline" onClick={() => navigate(`/book/${id}`)} data-testid="button-back-to-book">
            Back to Book
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: READER_BG }} data-testid="chapter-reader">
      <div
        className="h-0.5 transition-all duration-150"
        style={{ width: `${scrollProgress}%`, background: ACCENT }}
        data-testid="reading-progress-bar"
      />

      <header className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(245,240,235,0.08)" }}>
        <button onClick={() => navigate(`/book/${id}`)} data-testid="button-back">
          <ArrowLeft className="w-5 h-5" style={{ color: READER_TEXT }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: "rgba(245,240,235,0.4)" }}>
            {book.title}
          </p>
          <p className="text-sm font-medium truncate" style={{ color: READER_TEXT }}>
            Ch. {currentChapter?.chapterNumber}: {currentChapter?.chapterTitle}
          </p>
        </div>
        <button onClick={() => setShowToc(true)} data-testid="button-toc">
          <List className="w-5 h-5" style={{ color: READER_TEXT }} />
        </button>
      </header>

      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ paddingBottom: hasAudio ? "80px" : "20px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter?.id}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl mx-auto px-5 pt-2 pb-8"
          >
            {currentChapter?.subtitle && (
              <p className="text-sm mb-6 italic" style={{ color: "rgba(245,240,235,0.5)" }}>
                {currentChapter.subtitle}
              </p>
            )}

            {currentChapter?.estimatedReadTime && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge
                  className="text-[10px] gap-1 border-0"
                  style={{ background: "rgba(245,240,235,0.08)", color: "rgba(245,240,235,0.5)" }}
                >
                  <Clock className="w-3 h-3" />
                  {currentChapter.estimatedReadTime} min read
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs px-2.5 h-7"
                  style={{ color: READER_TEXT, border: "1px solid rgba(245,240,235,0.15)" }}
                  onClick={saveManualHighlight}
                  disabled={saveHighlightMutation.isPending}
                  data-testid="button-save-highlight-manual-reader"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Save Insight
                </Button>
              </div>
            )}

            <ChapterContent
              html={isChapterHydrating ? null : (currentChapter?.content || null)}
              fallbackCards={isChapterHydrating ? null : (currentChapter?.cards as any[] || null)}
            />

            {selectedHighlight && (
              <div
                className="rounded-lg px-4 py-3 mb-4 mt-2"
                style={{ background: "rgba(245,240,235,0.06)", border: "1px solid rgba(245,240,235,0.16)" }}
                data-testid="highlight-capture-panel"
              >
                <p className="text-xs mb-2" style={{ color: "rgba(245,240,235,0.65)" }}>
                  Selected text
                </p>
                <p className="text-sm mb-3 line-clamp-3" style={{ color: READER_TEXT }}>
                  "{selectedHighlight}"
                </p>
                <Button
                  size="sm"
                  className="gap-1"
                  style={{ background: ACCENT, color: READER_TEXT }}
                  onClick={() => saveHighlightMutation.mutate(selectedHighlight)}
                  disabled={saveHighlightMutation.isPending}
                  data-testid="button-save-highlight"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {saveHighlightMutation.isPending ? "Saving..." : "Save Highlight"}
                </Button>
              </div>
            )}

            {isChapterHydrating && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 rounded" style={{ background: "rgba(245,240,235,0.12)" }} />
                <div className="h-4 rounded" style={{ background: "rgba(245,240,235,0.08)" }} />
                <div className="h-4 rounded w-4/5" style={{ background: "rgba(245,240,235,0.08)" }} />
              </div>
            )}

            <div className="flex items-center justify-between mt-12 pt-6" style={{ borderTop: "1px solid rgba(245,240,235,0.08)" }}>
              <Button
                variant="ghost"
                onClick={() => goToChapter(chapterIndex - 1)}
                disabled={chapterIndex === 0}
                className="gap-1"
                style={{ color: READER_TEXT }}
                data-testid="button-prev-chapter"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-xs" style={{ color: "rgba(245,240,235,0.4)" }}>
                {chapterIndex + 1} / {chapters.length}
              </span>
              <Button
                variant="ghost"
                onClick={() => goToChapter(chapterIndex + 1)}
                disabled={chapterIndex === chapters.length - 1}
                className="gap-1"
                style={{ color: READER_TEXT }}
                data-testid="button-next-chapter"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasAudio && currentChapterAudioUrl && (
          <AudioPlayer audioUrl={currentChapterAudioUrl} accentColor={ACCENT} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToc && (
          <TableOfContents
            chapters={chapters}
            currentIndex={chapterIndex}
            onSelect={goToChapter}
            onClose={() => setShowToc(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .chapter-reader-content {
          font-size: 18px;
          line-height: 1.7;
          color: ${READER_TEXT};
        }
        .chapter-reader-content h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 2em 0 0.8em;
          color: ${READER_TEXT};
        }
        .chapter-reader-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 1.5em 0 0.6em;
          color: ${READER_TEXT};
        }
        .chapter-reader-content p {
          margin: 0 0 1.2em;
        }
        .chapter-reader-content blockquote {
          border-left: 3px solid ${ACCENT};
          padding: 0.8em 1.2em;
          margin: 1.5em 0;
          background: rgba(245,240,235,0.04);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: rgba(245,240,235,0.8);
        }
        .chapter-reader-content blockquote p {
          margin: 0;
        }
        .chapter-reader-content ul,
        .chapter-reader-content ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .chapter-reader-content li {
          margin: 0.4em 0;
        }
        .chapter-reader-content li::marker {
          color: rgba(245,240,235,0.4);
        }
        .chapter-reader-content strong {
          font-weight: 600;
          color: #fff;
        }
        .chapter-reader-content em {
          font-style: italic;
          color: rgba(245,240,235,0.85);
        }
        .chapter-reader-content mark {
          background: transparent;
          display: block;
          padding: 1em 1.2em;
          margin: 1.5em 0;
          border-left: 3px solid ${ACCENT};
          border-radius: 0 8px 8px 0;
          background: ${ACCENT_LIGHT};
          color: ${READER_TEXT};
          font-style: normal;
        }
        .chapter-reader-content hr {
          border: none;
          border-top: 1px solid rgba(245,240,235,0.1);
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
