import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { requestNotificationPermission, shouldShowPrompt, getNotificationPermission } from "@/lib/notifications";
import { Bell, X, Flame, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

export function NotificationPrompt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const { data: prefs } = useQuery<any>({
    queryKey: ["/api/notifications/preferences"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const dismissMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/notifications/dismiss-prompt"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
    },
  });

  useEffect(() => {
    if (!user || !prefs) return;
    if (getNotificationPermission() !== "default") return;
    if (!shouldShowPrompt(prefs.lastPromptDismissed)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, prefs]);

  const handleEnable = async () => {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
    }
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  const handleDismiss = () => {
    dismissMutation.mutate();
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${animating ? "opacity-100" : "opacity-0"}`}
      data-testid="notification-prompt-overlay"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDismiss} />
      <div
        className={`relative w-full max-w-sm bg-white border border-border rounded-2xl p-6 text-center shadow-lg transition-all duration-300 ${animating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        data-testid="notification-prompt-modal"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          data-testid="button-dismiss-notification-prompt"
          aria-label="Dismiss notification prompt"
        >
          <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
          <img src={logoImage} alt="MindPrism" className="w-12 h-12 object-contain" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">Stay in the Flow</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Get daily wisdom, streak reminders, and new book alerts
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-left px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-white/80">Daily mind session reminders</span>
          </div>
          <div className="flex items-center gap-3 text-left px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-white/80">Streak protection alerts</span>
          </div>
          <div className="flex items-center gap-3 text-left px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-white/80">New book and content alerts</span>
          </div>
        </div>

        <Button
          onClick={handleEnable}
          className="w-full bg-primary text-black font-semibold rounded-full h-11 mb-3"
          data-testid="button-enable-notifications"
        >
          <Bell className="w-4 h-4 mr-2" />
          Enable Notifications
        </Button>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-white/70 transition-colors"
          data-testid="button-maybe-later-notifications"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
