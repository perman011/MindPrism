import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Trophy, Brain, Clock, Flame, TrendingUp,
  Target, PenLine, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { ProgressShareCard } from "./progress-share-card";

interface UserStats {
  booksStarted: number;
  booksCompleted: number;
  principlesMastered: number;
  exercisesDone: number;
  categoriesExplored: number;
  totalTimeInvested: number;
  avgTimePerBook: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutesListened: number;
  totalExercisesCompleted: number;
  journalEntries: number;
  weeklyActivity: { day: string; date: string; activities: number }[];
}

export function PersonalStats() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: BookOpen, label: "Books Started", value: stats.booksStarted, color: "text-primary", bg: "bg-primary/10" },
    { icon: Trophy, label: "Books Completed", value: stats.booksCompleted, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Brain, label: "Principles Mastered", value: stats.principlesMastered, color: "text-blue-500", bg: "bg-blue-400/10" },
    { icon: Target, label: "Domains Explored", value: stats.categoriesExplored, color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Clock, label: "Minutes Invested", value: stats.totalTimeInvested, color: "text-blue-500", bg: "bg-blue-400/10" },
    { icon: TrendingUp, label: "Avg Min/Book", value: stats.avgTimePerBook, color: "text-rose-400", bg: "bg-rose-400/10" },
  ];

  const highlights = [
    { icon: Flame, label: "Current Streak", value: `${stats.currentStreak} days`, color: "text-primary" },
    { icon: Trophy, label: "Longest Streak", value: `${stats.longestStreak} days`, color: "text-amber-400" },
    { icon: PenLine, label: "Journal Entries", value: stats.journalEntries, color: "text-emerald-400" },
    { icon: BarChart3, label: "Exercises Done", value: stats.exercisesDone, color: "text-blue-500" },
  ];

  const maxActivity = Math.max(...stats.weeklyActivity.map(d => d.activities), 1);

  return (
    <div data-testid="personal-stats">
      <h2 className="font-serif text-lg font-bold mb-1">Your Stats</h2>
      <p className="text-[11px] text-muted-foreground mb-4">Your learning journey at a glance</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-3.5 relative overflow-hidden" data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 mb-6 bg-[#F5F0EB] border-primary/10" data-testid="weekly-activity-chart">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-4">Weekly Activity</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyActivity} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid hsl(220 13% 91%)",
                  borderRadius: "8px",
                  color: "#111827",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(217 91% 60%)" }}
                cursor={false}
              />
              <Bar dataKey="activities" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {stats.weeklyActivity.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.activities > 0
                      ? `hsl(217 91% ${60 - (entry.activities / maxActivity) * 10}%)`
                      : "hsl(var(--muted) / 0.5)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {highlights.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Card className="p-3.5 flex items-center gap-3" data-testid={`highlight-${h.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <h.icon className={`w-5 h-5 ${h.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm font-bold">{h.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{h.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <ProgressShareCard />
    </div>
  );
}
