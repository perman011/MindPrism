import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BookOpen, Activity, BarChart3, TrendingUp, Eye, CreditCard, Percent, CalendarDays, Heart, Target } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

interface AnalyticsOverview {
  totalUsers: number;
  activeUsers7d: number;
  dau: number;
  wau: number;
  mau: number;
  totalBooks: number;
  totalEvents: number;
  dailyActiveUsers: { date: string; count: number }[];
  signupTrend: { date: string; count: number }[];
  eventBreakdown: { eventType: string; count: number }[];
  popularBooks: { bookTitle: string; count: number }[];
  engagementByDay: { date: string; sessions: number; uniqueUsers: number; avgDuration: number }[];
  funnel: { stage: string; count: number }[];
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

interface ContentHealthData {
  overview: {
    totalBooks: number;
    averageScore: number;
    completeBooks: number;
    needsWork: number;
  };
  books: {
    bookId: string;
    bookTitle: string;
    bookStatus: string;
    percentage: number;
    totalScore: number;
    maxScore: number;
    counts: Record<string, number>;
  }[];
}

type DateRange = "7" | "30" | "90";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--card-foreground))",
  fontSize: 12,
};

const axisTickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };
const axisLineStyle = { stroke: "hsl(var(--border))" };
const gridStroke = "hsl(var(--border))";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className="p-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function TrendLineChart({ data, color, testId }: { data: { date: string; count: number }[]; color?: string; testId?: string }) {
  const chartColor = color || CHART_COLORS[0];
  const formatted = data.map(d => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div data-testid={testId} className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="label" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} allowDecimals={false} width={30} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--muted-foreground))" }} />
          <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} dot={{ r: 3, fill: chartColor }} activeDot={{ r: 5, fill: chartColor }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div className="flex items-center gap-1" data-testid="date-range-selector">
      {(["7", "30", "90"] as DateRange[]).map((range) => (
        <Button
          key={range}
          size="sm"
          variant={value === range ? "default" : "outline"}
          onClick={() => onChange(range)}
          data-testid={`button-range-${range}d`}
          className="toggle-elevate"
        >
          {range}d
        </Button>
      ))}
    </div>
  );
}

function EngagementTab({ overview, rangeDays }: { overview: AnalyticsOverview; rangeDays: string }) {
  const engData = overview.engagementByDay.slice(-parseInt(rangeDays)).map(d => ({
    ...d,
    label: d.date.slice(5),
    avgDuration: Math.round(Number(d.avgDuration)),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="DAU" value={overview.dau} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="WAU" value={overview.wau} icon={Activity} color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" />
        <StatCard label="MAU" value={overview.mau} icon={TrendingUp} color="bg-[hsl(var(--accent-teal))]/10 text-[hsl(var(--accent-teal))]" />
        <StatCard label="Total Events" value={overview.totalEvents} icon={Eye} color="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sessions Over Time
          </h3>
          {engData.length > 0 ? (
            <div className="h-48" data-testid="chart-sessions">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="label" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="sessions" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="uniqueUsers" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No engagement data yet</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            User Funnel
          </h3>
          {overview.funnel.length > 0 ? (
            <div className="h-48" data-testid="chart-funnel">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.funnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {overview.funnel.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No funnel data yet</p>
          )}
        </Card>
      </div>

      {overview.eventBreakdown.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {overview.eventBreakdown.map((e) => (
              <Badge key={e.eventType} variant="outline" className="gap-1.5" data-testid={`badge-event-${e.eventType}`}>
                {e.eventType}
                <span className="text-primary font-bold">{e.count}</span>
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ContentTab() {
  const { data: healthData, isLoading } = useQuery<ContentHealthData>({
    queryKey: ["/api/admin/content-health"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!healthData) return null;

  const sortedBooks = [...healthData.books].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Books" value={healthData.overview.totalBooks} icon={BookOpen} color="bg-primary/10 text-primary" />
        <StatCard label="Avg Health Score" value={`${healthData.overview.averageScore}%`} icon={Heart} color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" />
        <StatCard label="Complete (80%+)" value={healthData.overview.completeBooks} icon={Target} color="bg-[hsl(var(--accent-teal))]/10 text-[hsl(var(--accent-teal))]" />
        <StatCard label="Needs Work (<50%)" value={healthData.overview.needsWork} icon={Activity} color="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" />
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Content Health by Book
        </h3>
        {sortedBooks.length > 0 ? (
          <div className="h-64" data-testid="chart-content-health">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedBooks.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} />
                <YAxis type="category" dataKey="bookTitle" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} width={140} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Health Score"]} />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {sortedBooks.slice(0, 10).map((book, idx) => (
                    <Cell key={idx} fill={book.percentage >= 80 ? CHART_COLORS[2] : book.percentage >= 50 ? CHART_COLORS[4] : CHART_COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No books yet</p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Book Details</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedBooks.map((book) => (
            <div key={book.bookId} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50 text-sm" data-testid={`content-row-${book.bookId}`}>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground truncate block">{book.bookTitle}</span>
                <span className="text-xs text-muted-foreground">
                  P:{book.counts.principles} S:{book.counts.stories} E:{book.counts.exercises} C:{book.counts.chapters}
                </span>
              </div>
              <Badge variant={book.bookStatus === "published" ? "default" : "outline"} className="shrink-0">
                {book.bookStatus}
              </Badge>
              <div className="w-16 text-right shrink-0">
                <span className={`text-sm font-bold ${book.percentage >= 80 ? "text-[hsl(var(--success))]" : book.percentage >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive"}`}>
                  {book.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

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
        <StatCard label="Total Subscribers" value={stats.totalSubscribers} icon={CreditCard} color="bg-primary/10 text-primary" />
        <StatCard label="Monthly Plans" value={stats.monthlyCount} icon={CalendarDays} color="bg-primary/10 text-primary" />
        <StatCard label="Yearly Plans" value={stats.yearlyCount} icon={CalendarDays} color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon={Percent} color="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            New Subscriptions (30 days)
          </h3>
          {stats.recentSubscriptions.some(d => d.count > 0) ? (
            <TrendLineChart data={stats.recentSubscriptions} color={CHART_COLORS[0]} testId="chart-subscription-trend" />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8" data-testid="text-no-subscription-data">No subscription activity in the last 30 days</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Plan Distribution
          </h3>
          {planData.length > 0 ? (
            <div className="h-48" data-testid="chart-plan-distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {planData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8" data-testid="text-no-plan-data">No subscribers yet</p>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Subscription Source
        </h3>
        {sourceData.length > 0 ? (
          <div className="h-48" data-testid="chart-subscription-source">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} allowDecimals={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8" data-testid="text-no-source-data">No subscribers yet</p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Total Users</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-total-users">{stats.totalUsers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Premium Users</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-premium-users">{stats.totalSubscribers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Stripe Subs</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-stripe-subs">{stats.stripeSubscribers}</span>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Manual Grants</span>
            <span className="text-sm font-semibold text-foreground" data-testid="text-manual-grants">{stats.manualGrants}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30");

  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/overview?days=${dateRange}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<AnalyticsEventsResponse>({
    queryKey: ["/api/analytics/admin-events"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Analytics | Admin" noIndex />

      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/admin">
            <Button size="icon" variant="ghost" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground flex-1">Analytics Dashboard</h1>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4" data-testid="tabs-analytics">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
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
                  <StatCard label="Total Users" value={overview.totalUsers} icon={Users} color="bg-primary/10 text-primary" />
                  <StatCard label="Active (7d)" value={overview.activeUsers7d} icon={Activity} color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" />
                  <StatCard label="Total Books" value={overview.totalBooks} icon={BookOpen} color="bg-[hsl(var(--accent-teal))]/10 text-[hsl(var(--accent-teal))]" />
                  <StatCard label="Total Events" value={overview.totalEvents} icon={Eye} color="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Daily Active Users ({dateRange}d)
                    </h3>
                    {overview.dailyActiveUsers.length > 0 ? (
                      <TrendLineChart data={overview.dailyActiveUsers} color={CHART_COLORS[0]} testId="chart-daily-active" />
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
                    )}
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Signup Trend ({dateRange}d)
                    </h3>
                    {overview.signupTrend.length > 0 ? (
                      <TrendLineChart data={overview.signupTrend} color={CHART_COLORS[2]} testId="chart-signup-trend" />
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
                    )}
                  </Card>
                </div>

                {overview.popularBooks.length > 0 && (
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Most Popular Books
                    </h3>
                    <div className="h-48" data-testid="chart-popular-books">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview.popularBooks} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                          <XAxis type="number" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="bookTitle" tick={axisTickStyle} axisLine={axisLineStyle} tickLine={false} width={120} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </>
            ) : null}

            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
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
                    <div key={event.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover-elevate text-sm" data-testid={`event-row-${event.id}`}>
                      <Badge variant="outline" className="text-xs font-mono shrink-0">
                        {event.eventType}
                      </Badge>
                      <span className="text-muted-foreground truncate flex-1">
                        {event.pageUrl || "\u2014"}
                      </span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No events recorded yet</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            {overviewLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : overview ? (
              <EngagementTab overview={overview} rangeDays={dateRange} />
            ) : null}
          </TabsContent>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
