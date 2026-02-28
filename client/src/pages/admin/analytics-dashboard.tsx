import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BookOpen, Activity, BarChart3, TrendingUp, Eye, CreditCard, Percent, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface AnalyticsOverview {
  totalUsers: number;
  activeUsers7d: number;
  totalBooks: number;
  totalEvents: number;
  dailyActiveUsers: { date: string; count: number }[];
  signupTrend: { date: string; count: number }[];
  eventBreakdown: { eventType: string; count: number }[];
  popularBooks: { bookTitle: string; count: number }[];
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

interface SubscriptionStats {
  totalSubscribers: number;
  totalUsers: number;
  conversionRate: number;
  monthlyCount: number;
  yearlyCount: number;
  stripeSubscribers: number;
  manualGrants: number;
  recentSubscriptions: { date: string; count: number }[];
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className="p-4 bg-zinc-900 border-zinc-800" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-zinc-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function TrendLineChart({ data, color = "hsl(292, 46%, 15%)", testId }: { data: { date: string; count: number }[]; color?: string; testId?: string }) {
  const formatted = data.slice(-30).map(d => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div data-testid={testId} className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} allowDecimals={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} labelStyle={{ color: "#a1a1aa" }} />
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["hsl(292, 46%, 40%)", "hsl(180, 39%, 39%)"];

function RevenueTab() {
  const { data: stats, isLoading } = useQuery<SubscriptionStats>({
    queryKey: ["/api/admin/subscription-stats"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const planData = [
    { name: "Monthly", value: stats.monthlyCount },
    { name: "Yearly", value: stats.yearlyCount },
  ].filter(d => d.value > 0);

  const sourceData = [
    { name: "Stripe", value: stats.stripeSubscribers },
    { name: "Manual", value: stats.manualGrants },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Subscribers" value={stats.totalSubscribers} icon={CreditCard} color="bg-purple-700/20 text-purple-400" />
        <StatCard label="Monthly Plans" value={stats.monthlyCount} icon={CalendarDays} color="bg-purple-700/20 text-purple-600" />
        <StatCard label="Yearly Plans" value={stats.yearlyCount} icon={CalendarDays} color="bg-green-500/20 text-green-400" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon={Percent} color="bg-purple-700/20 text-purple-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            New Subscriptions (30 days)
          </h3>
          {stats.recentSubscriptions.some(d => d.count > 0) ? (
            <TrendLineChart data={stats.recentSubscriptions} color="hsl(292, 46%, 40%)" testId="chart-subscription-trend" />
          ) : (
            <p className="text-xs text-zinc-500 text-center py-8" data-testid="text-no-subscription-data">No subscription activity in the last 30 days</p>
          )}
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Plan Distribution
          </h3>
          {planData.length > 0 ? (
            <div className="h-48" data-testid="chart-plan-distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {planData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-8" data-testid="text-no-plan-data">No subscribers yet</p>
          )}
        </Card>
      </div>

      <Card className="p-4 bg-zinc-900 border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Subscription Source
        </h3>
        {sourceData.length > 0 ? (
          <div className="h-48" data-testid="chart-subscription-source">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} allowDecimals={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(292, 46%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-8" data-testid="text-no-source-data">No subscribers yet</p>
        )}
      </Card>

      <Card className="p-4 bg-zinc-900 border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Total Users</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-total-users">{stats.totalUsers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Premium Users</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-premium-users">{stats.totalSubscribers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Stripe Subs</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-stripe-subs">{stats.stripeSubscribers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-zinc-800/50">
            <span className="text-sm text-zinc-400">Manual Grants</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-manual-grants">{stats.manualGrants}</span>
          </div>
        </div>
      </Card>
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
    <div className="min-h-screen bg-[#F5F0EB]">
      <SEOHead title="Analytics | Admin" noIndex />

      <div className="border-b border-zinc-800 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin">
            <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4" data-testid="tabs-analytics">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overviewLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Total Users" value={overview.totalUsers} icon={Users} color="bg-purple-700/20 text-purple-600" />
                  <StatCard label="Active (7d)" value={overview.activeUsers7d} icon={Activity} color="bg-green-500/20 text-green-400" />
                  <StatCard label="Total Books" value={overview.totalBooks} icon={BookOpen} color="bg-purple-700/20 text-purple-400" />
                  <StatCard label="Total Events" value={overview.totalEvents} icon={Eye} color="bg-purple-700/20 text-purple-700" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Daily Active Users (30 days)
                    </h3>
                    {overview.dailyActiveUsers.length > 0 ? (
                      <TrendLineChart data={overview.dailyActiveUsers} testId="chart-daily-active" />
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
                      <TrendLineChart data={overview.signupTrend} color="#3b82f6" testId="chart-signup-trend" />
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-8">No data yet</p>
                    )}
                  </Card>
                </div>

                {overview.popularBooks.length > 0 && (
                  <Card className="p-4 bg-zinc-900 border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Most Popular Books
                    </h3>
                    <div className="h-48" data-testid="chart-popular-books">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview.popularBooks} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                          <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="bookTitle" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={{ stroke: "#3f3f46" }} tickLine={false} width={120} />
                          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                          <Bar dataKey="count" fill="hsl(292, 46%, 15%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}

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
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
