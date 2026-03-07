import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Briefcase, Check, Clock, Crown, Dumbbell, Flower2, Heart, HeartHandshake, History, Lightbulb, MessageCircle, Palette, Scale, Sparkles, Sun, Target, TrendingUp, Users, Wallet, Zap, Baby, Cpu, Compass } from "lucide-react";
import { useState } from "react";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

const interestTiles = [
  { id: "habits", label: "Better Habits", icon: Target, iconGradient: "from-green-400 to-green-600", color: "from-green-500/20 to-green-600/10 border-green-500/30" },
  { id: "business", label: "Business & Strategy", icon: Briefcase, iconGradient: "from-blue-400 to-blue-600", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  { id: "leadership", label: "Leadership", icon: Crown, iconGradient: "from-amber-400 to-amber-600", color: "from-amber-500/20 to-amber-600/10 border-amber-500/30" },
  { id: "productivity", label: "Productivity", icon: Zap, iconGradient: "from-orange-400 to-orange-600", color: "from-orange-500/20 to-orange-600/10 border-orange-500/30" },
  { id: "finance", label: "Money & Finance", icon: Wallet, iconGradient: "from-emerald-400 to-emerald-600", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30" },
  { id: "science", label: "Science", icon: Lightbulb, iconGradient: "from-cyan-400 to-cyan-600", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30" },
  { id: "history", label: "History", icon: History, iconGradient: "from-amber-600 to-amber-800", color: "from-amber-700/20 to-amber-800/10 border-amber-700/30" },
  { id: "health", label: "Health & Fitness", icon: Dumbbell, iconGradient: "from-red-400 to-red-600", color: "from-red-500/20 to-red-600/10 border-red-500/30" },
  { id: "mindfulness", label: "Mindfulness & Calm", icon: Flower2, iconGradient: "from-teal-400 to-teal-600", color: "from-teal-500/20 to-teal-600/10 border-teal-500/30" },
  { id: "relationships", label: "Relationships", icon: Heart, iconGradient: "from-pink-400 to-pink-600", color: "from-pink-500/20 to-pink-600/10 border-pink-500/30" },
  { id: "mindset", label: "Mindset & Growth", icon: Brain, iconGradient: "from-purple-400 to-purple-600", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
  { id: "philosophy", label: "Philosophy", icon: BookOpen, iconGradient: "from-slate-400 to-slate-600", color: "from-slate-500/20 to-slate-600/10 border-slate-500/30" },
  { id: "creativity", label: "Creativity", icon: Palette, iconGradient: "from-violet-400 to-violet-600", color: "from-violet-500/20 to-violet-600/10 border-violet-500/30" },
  { id: "communication", label: "Communication", icon: MessageCircle, iconGradient: "from-lime-400 to-lime-600", color: "from-lime-500/20 to-lime-600/10 border-lime-500/30" },
  { id: "spirituality", label: "Spirituality", icon: Sun, iconGradient: "from-yellow-400 to-yellow-600", color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30" },
  { id: "technology", label: "Technology", icon: Cpu, iconGradient: "from-zinc-400 to-zinc-600", color: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30" },
  { id: "biography", label: "Biography", icon: Users, iconGradient: "from-stone-400 to-stone-600", color: "from-stone-500/20 to-stone-600/10 border-stone-500/30" },
  { id: "parenting", label: "Parenting", icon: Baby, iconGradient: "from-sky-400 to-sky-600", color: "from-sky-500/20 to-sky-600/10 border-sky-500/30" },
  { id: "emotions", label: "Emotional Intelligence", icon: HeartHandshake, iconGradient: "from-rose-400 to-rose-600", color: "from-rose-500/20 to-rose-600/10 border-rose-500/30" },
  { id: "purpose", label: "Purpose & Meaning", icon: Compass, iconGradient: "from-indigo-400 to-indigo-600", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30" },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  const saveMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const res = await apiRequest("POST", "/api/interests", { interests });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interests"] });
      setLocation("/");
    },
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Personalize Your Experience" description="Choose your interests to build a personalized book library." noIndex />
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center mb-6">
          <div className="flex flex-col items-center">
            <img src={mindprismLogo} alt="MindPrism" className="h-16 object-contain" style={{ aspectRatio: '1.618' }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] text-[#111827] mt-0.5">mindprism</span>
          </div>
        </div>

        <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mb-8">
          <div className="bg-[#3B82F6] h-1.5 rounded-full w-full transition-all" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#111827]" data-testid="text-onboarding-title">
          What topics interest you?
        </h1>
        <p className="text-[#6B7280] mb-6">
          Pick what you love. We'll build your library around it.
        </p>
      </div>

      <div className="flex-1 px-6 pb-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="grid-interests">
          {interestTiles.map((tile) => {
            const isSelected = selected.has(tile.id);
            return (
              <button
                key={tile.id}
                onClick={() => toggle(tile.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-br ${tile.color} border-primary scale-[1.02]`
                    : "bg-card border-border hover:border-primary/30"
                }`}
                data-testid={`tile-${tile.id}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tile.iconGradient} flex items-center justify-center mb-2`}>
                  <tile.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-sm">{tile.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 px-6 py-4 bg-background/90 backdrop-blur-xl border-t border-border/50">
        <Button
          size="lg"
          className="w-full rounded-full h-14 text-base font-semibold gap-2"
          disabled={selected.size === 0 || saveMutation.isPending}
          onClick={() => saveMutation.mutate(Array.from(selected))}
          data-testid="button-build-library"
        >
          <Sparkles className="w-4 h-4" />
          {saveMutation.isPending ? "Building..." : "Build My Library"}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {selected.size} topic{selected.size !== 1 ? "s" : ""} selected
        </p>
      </div>
    </div>
  );
}
