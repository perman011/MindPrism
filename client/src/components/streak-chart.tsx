import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface StreakChartProps {
  data: { date: string; activities: number }[];
}

export function StreakChart({ data }: StreakChartProps) {
  const maxActivity = Math.max(...data.map((d) => d.activities), 1);

  function getOpacity(activities: number): number {
    if (activities <= 0) return 0;
    return 0.3 + (activities / maxActivity) * 0.7;
  }

  function getDayNumber(dateStr: string): number {
    return new Date(dateStr).getDate();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="p-5" data-testid="streak-chart">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">30-Day Activity</h3>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {data.map((day, index) => {
            const isActive = day.activities > 0;
            return (
              <div
                key={index}
                data-testid={`streak-day-${index}`}
                className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium ${
                  isActive
                    ? "text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                style={
                  isActive
                    ? { backgroundColor: `hsl(var(--primary) / ${getOpacity(day.activities)})` }
                    : undefined
                }
              >
                {getDayNumber(day.date)}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0.15, 0.3, 0.55, 0.8, 1].map((opacity, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-muted" : ""}`}
              style={i > 0 ? { backgroundColor: `hsl(var(--primary) / ${opacity})` } : undefined}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </Card>
    </motion.div>
  );
}
