import { Target, Brain, Eye, Lightbulb, Sparkles, BookOpen } from "lucide-react";

const iconMap: Record<string, any> = {
  target: Target,
  brain: Brain,
  eye: Eye,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  book: BookOpen,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? BookOpen;
  return <Icon className={className} />;
}
