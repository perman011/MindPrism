import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, BookOpen, Activity, BarChart3, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";

interface AnalyticsOverview {
  totalUsers: number;
  activeUsers7d: number;
  totalBooks: number;
  totalEvents: number;
  dailyActiveUsers: { date: string; count: number }[];
  signupTrend: { date: string; count: number }[];
  eventBreakdown: { eventType: string; count: number }[];
  popularBooks: { bookId: unknown; count: number }[];
}

interface AnalyticsEventsResponse {
  events: {
    id: string;
    userId: string | null;
    eventType: string;
    eventData: Record<string, unknown>;
    pageUrl: string | null;
    sessionId: string | null;
    createdAt: string;
  }[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className="p-4 bg-zinc-900 border-zinc-800" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function MiniBarChart({ data, maxBars = 30 }: { data: { date: string; count: number }[]; maxBars?: number }) {
  const sliced = data.slice(-maxBars);
  const maxVal = Math.max(...sliced.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-[2px] h-24" data-testid="chart-daily-active">
      {sliced.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/80 rounded-t-sm min-w-[3px] transition-all hover:bg-primary"
          style={{ height: `${(d.count / maxVal) * 100}%` }}
          title={`${d.date}: ${d.count} users`}
        />
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<AnalyticsEventsResponse>({
    queryKey: ["/api/analytics/admin-events"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-black">
      <SEOHead title="Analytics | Admin" noIndex />

      <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin">
            <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-white">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {overviewLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : overview ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Users" value={overview.totalUsers} icon={Users} color="bg-blue-500/20 text-blue-400" />
              <StatCard label="Active (7d)" value={overview.activeUsers7d} icon={Activity} color="bg-green-500/20 text-green-400" />
              <StatCard label="Total Books" value={overview.totalBooks} icon={BookOpen} color="bg-purple-500/20 text-purple-400" />
              <StatCard label="Total Events" value={overview.totalEvents} icon={Eye} color="bg-amber-500/20 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-zinc-900 border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Daily Active Users (30 days)
                </h3>
                {overview.dailyActiveUsers.length > 0 ? (
                  <MiniBarChart data={overview.dailyActiveUsers} />
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-8">No data yet</p>
                )}
              </Card>

              <Card className="p-4 bg-zinc-900 border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Signup Trend (30 days)
                </h3>
                {overview.signupTrend.length > 0 ? (
                  <MiniBarChart data={overview.signupTrend} />
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-8">No data yet</p>
                )}
              </Card>
            </div>

            {overview.eventBreakdown.length > 0 && (
              <Card className="p-4 bg-zinc-900 border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Event Breakdown (30 days)</h3>
                <div className="flex flex-wrap gap-2">
                  {overview.eventBreakdown.map((e) => (
                    <Badge key={e.eventType} variant="outline" className="border-zinc-700 text-zinc-300 gap-1.5" data-testid={`badge-event-${e.eventType}`}>
                      {e.eventType}
                      <span className="text-primary font-bold">{e.count}</span>
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : null}

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Events
          </h3>
          {eventsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : eventsData?.events.length ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {eventsData.events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 text-sm" data-testid={`event-row-${event.id}`}>
                  <Badge variant="outline" className="border-zinc-700 text-xs font-mono shrink-0">
                    {event.eventType}
                  </Badge>
                  <span className="text-zinc-400 truncate flex-1">
                    {event.pageUrl || "—"}
                  </span>
                  <span className="text-zinc-500 text-xs shrink-0">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-8">No events recorded yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
