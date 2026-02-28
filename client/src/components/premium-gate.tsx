import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium?: boolean;
}

export function PremiumGate({ children, isPremium }: PremiumGateProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (isPremium) {
    return <>{children}</>;
  }

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/stripe/create-checkout-session", { plan: "monthly" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Upgrade", description: data.message || "Unable to start checkout", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upgrade unavailable", description: "Premium subscriptions are not yet configured. Check back soon!", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" data-testid="premium-gate">
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-50 flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-lg font-bold">Premium Content</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Unlock all book breakdowns, exercises, and audio summaries.
          </p>
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
            data-testid="button-upgrade-premium"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Loading..." : "Upgrade — $9.99/mo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
