import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Clock, BarChart3, CalendarCheck } from "lucide-react";

interface ReadingStats {
  totalMinutes: number;
  totalSessions: number;
  todayMinutes: number;
}

export function ReadingStatsBar() {
  const { data: stats } = useQuery<ReadingStats>({
    queryKey: ["/api/sessions/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (!stats || (stats.totalSessions === 0 && stats.todayMinutes === 0)) {
    return null;
  }

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <section className="mb-6 px-5" data-testid="section-reading-stats">
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3" data-testid="stat-today">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tabular-nums">{formatMinutes(stats.todayMinutes)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Today</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3" data-testid="stat-total-time">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tabular-nums">{formatMinutes(stats.totalMinutes)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3" data-testid="stat-sessions">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tabular-nums">{stats.totalSessions}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Sessions</p>
          </div>
        </div>
      </div>
    </section>
  );
}
