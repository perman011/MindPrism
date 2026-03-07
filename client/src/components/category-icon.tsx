import {
  Target, Brain, Eye, Lightbulb, Sparkles, BookOpen, Briefcase, Crown, Zap,
  FlaskConical, ScrollText, HeartPulse, Users, Wallet, Palette, Baby, Sun,
  MessageCircle, Cpu, User, History,
} from "lucide-react";

const iconMap: Record<string, any> = {
  target: Target,
  brain: Brain,
  eye: Eye,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  book: BookOpen,
  "book-open": BookOpen,
  briefcase: Briefcase,
  crown: Crown,
  zap: Zap,
  flask: FlaskConical,
  scroll: ScrollText,
  "heart-pulse": HeartPulse,
  users: Users,
  wallet: Wallet,
  palette: Palette,
  baby: Baby,
  sun: Sun,
  "message-circle": MessageCircle,
  cpu: Cpu,
  user: User,
  history: History,
};

export function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = iconMap[name ?? "book"] ?? BookOpen;
  return <Icon className={className} />;
}
