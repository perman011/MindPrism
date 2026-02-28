import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Brain, Check, Clock, Columns, Crown, Flower2, Heart, HeartHandshake, Palette, Scale, Sparkles, Target, Users, Zap } from "lucide-react";
import { useState } from "react";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

const interestTiles = [
  { id: "anxiety", label: "Overcome Anxiety", icon: Brain, iconGradient: "from-purple-400 to-purple-600", color: "from-purple-700/20 to-purple-800/10 border-purple-700/30" },
  { id: "productivity", label: "Ultimate Productivity", icon: Clock, iconGradient: "from-blue-400 to-teal-600", color: "from-purple-700/20 to-purple-800/10 border-purple-700/30" },
  { id: "body-language", label: "Read Body Language", icon: Users, iconGradient: "from-rose-400 to-rose-600", color: "from-rose-500/20 to-rose-600/10 border-rose-500/30" },
  { id: "leadership", label: "Leadership", icon: Crown, iconGradient: "from-indigo-400 to-indigo-600", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30" },
  { id: "mindfulness", label: "Mindfulness & Calm", icon: Flower2, iconGradient: "from-teal-400 to-teal-600", color: "from-teal-500/20 to-teal-600/10 border-teal-500/30" },
  { id: "habits", label: "Build Better Habits", icon: Target, iconGradient: "from-green-400 to-green-600", color: "from-green-500/20 to-green-600/10 border-green-500/30" },
  { id: "relationships", label: "Better Relationships", icon: Heart, iconGradient: "from-pink-400 to-pink-600", color: "from-pink-500/20 to-pink-600/10 border-pink-500/30" },
  { id: "decision-making", label: "Smarter Decisions", icon: Scale, iconGradient: "from-purple-400 to-purple-600", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
  { id: "confidence", label: "Build Confidence", icon: Zap, iconGradient: "from-orange-400 to-orange-600", color: "from-orange-500/20 to-orange-600/10 border-orange-500/30" },
  { id: "stoicism", label: "Stoic Philosophy", icon: Columns, iconGradient: "from-slate-400 to-slate-600", color: "from-slate-500/20 to-slate-600/10 border-slate-500/30" },
  { id: "creativity", label: "Unlock Creativity", icon: Palette, iconGradient: "from-violet-400 to-violet-600", color: "from-purple-700/20 to-purple-800/10 border-purple-700/30" },
  { id: "emotional-iq", label: "Emotional Intelligence", icon: HeartHandshake, iconGradient: "from-red-400 to-red-600", color: "from-red-500/20 to-red-600/10 border-red-500/30" },
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
      <SEOHead title="Personalize Your Experience" description="Choose your interests to build a personalized psychology learning library." noIndex />
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center mb-6 mix-blend-screen">
          <img src={mindprismLogo} alt="MindPrism" className="h-14 object-contain" style={{ aspectRatio: '1.618' }} />
        </div>

        <div className="w-full bg-muted rounded-full h-1.5 mb-8">
          <div className="bg-primary h-1.5 rounded-full w-full transition-all" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-onboarding-title">
          What areas of your mind do you want to master?
        </h1>
        <p className="text-muted-foreground mb-6">
          Select the topics that interest you most. We'll personalize your experience.
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
