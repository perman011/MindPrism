import { Card } from "@/components/ui/card";
import { BookOpen, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryStatsProps {
  booksStarted: number;
  currentStreak: number;
  minutesListened: number;
}

const stats = [
  { key: "books-started", icon: BookOpen, label: "Books Started" },
  { key: "current-streak", icon: Flame, label: "Current Streak" },
  { key: "minutes-listened", icon: Clock, label: "Minutes Listened" },
] as const;

export function SummaryStats({ booksStarted, currentStreak, minutesListened }: SummaryStatsProps) {
  const values = [booksStarted, currentStreak, minutesListened];

  return (
    <div className="grid grid-cols-3 gap-3" data-testid="summary-stats-row">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.2, ease: "easeOut" }}
        >
          <Card className="p-4 flex flex-col items-center text-center" data-testid={`stat-${stat.key}`}>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{values[i]}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
