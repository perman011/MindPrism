import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Timer, Pause, Play, Square, BookOpen, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ReadingSessionTimerProps {
  bookId: string;
  bookTitle: string;
  mode?: "read" | "listen";
  compact?: boolean;
}

export function ReadingSessionTimer({ bookId, bookTitle, mode = "read", compact = false }: ReadingSessionTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/sessions/start", { bookId, mode }),
    onSuccess: async (res) => {
      const data = await res.json();
      setSessionId(data.id);
      setIsActive(true);
      setIsPaused(false);
      setElapsed(0);
    },
  });

  const endMutation = useMutation({
    mutationFn: (durationMinutes: number) =>
      apiRequest("POST", `/api/sessions/${sessionId}/end`, { durationMinutes }),
    onSuccess: () => {
      setIsActive(false);
      setIsPaused(false);
      setSessionId(null);
      setElapsed(0);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  const handleStart = useCallback(() => {
    startMutation.mutate();
  }, [startMutation]);

  const handlePauseResume = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    if (sessionId && elapsed > 0) {
      const durationMinutes = Math.max(1, Math.round(elapsed / 60));
      endMutation.mutate(durationMinutes);
    } else {
      setIsActive(false);
      setIsPaused(false);
      setSessionId(null);
      setElapsed(0);
    }
  }, [sessionId, elapsed, endMutation]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const ModeIcon = mode === "listen" ? Headphones : BookOpen;

  if (compact) {
    return (
      <div className="flex items-center gap-2" data-testid="session-timer-compact">
        {!isActive ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="gap-1.5 text-xs"
            data-testid="button-start-session"
          >
            <Timer className="w-3.5 h-3.5" />
            Start Session
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold tabular-nums" data-testid="text-timer">
              {formatTime(elapsed)}
            </span>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handlePauseResume} data-testid="button-pause-session">
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={handleStop} data-testid="button-stop-session">
              <Square className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card p-4"
      data-testid="session-timer"
    >
      <div className="flex items-center gap-2 mb-3">
        <ModeIcon className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {mode === "listen" ? "Listening" : "Reading"} Session
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center py-2"
          >
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{bookTitle}</p>
            <Button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="gap-2"
              data-testid="button-start-session"
            >
              <Timer className="w-4 h-4" />
              Start Session
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center py-2"
          >
            <p className="text-3xl font-mono font-bold tabular-nums mb-1" data-testid="text-timer">
              {formatTime(elapsed)}
            </p>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{bookTitle}</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePauseResume}
                className="gap-1.5"
                data-testid="button-pause-session"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStop}
                className="gap-1.5"
                disabled={endMutation.isPending}
                data-testid="button-stop-session"
              >
                <Square className="w-3.5 h-3.5" />
                End
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
