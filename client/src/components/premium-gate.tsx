import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium?: boolean;
}

export function PremiumGate({ children, isPremium }: PremiumGateProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: stripeStatus } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ["/api/stripe/status"],
    staleTime: 5 * 60 * 1000,
  });

  if (isPremium) {
    return <>{children}</>;
  }

  const stripeConfigured = stripeStatus?.configured ?? true;

  const handleUpgrade = async () => {
    if (!stripeConfigured) {
      toast({
        title: "Payments not available",
        description: "Premium subscriptions are not yet set up. Please check back later.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/stripe/create-checkout-session", { plan: "monthly" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.code === "STRIPE_NOT_CONFIGURED" || data.code === "STRIPE_PRICE_NOT_CONFIGURED") {
        toast({
          title: "Payments not available",
          description: "Premium subscriptions are not yet set up. Please check back later.",
        });
      } else {
        toast({
          title: "Upgrade",
          description: data.message || "Unable to start checkout",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Upgrade unavailable",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
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
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-purple-800 dark:text-purple-300" />
          </div>
          <h3 className="text-lg font-bold" data-testid="text-premium-title">Premium Content</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]" data-testid="text-premium-description">
            Unlock all book breakdowns, exercises, and audio summaries.
          </p>
          {!stripeConfigured && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-stripe-not-configured">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Payments coming soon</span>
            </div>
          )}
          <Button
            onClick={handleUpgrade}
            disabled={loading || !stripeConfigured}
            className="bg-gradient-to-r from-purple-700 to-purple-800 text-white gap-2"
            data-testid="button-upgrade-premium"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Loading..." : !stripeConfigured ? "Coming Soon" : "Upgrade — $9.99/mo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
