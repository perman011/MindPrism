import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Flame, BookOpen, BarChart3, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { sendTestNotification, requestNotificationPermission, getNotificationPermission, subscribeToPush } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [testSending, setTestSending] = useState(false);

  const { data: prefs, isLoading } = useQuery<any>({
    queryKey: ["/api/notifications/preferences"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, any>) =>
      apiRequest("PUT", "/api/notifications/preferences", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleTimeChange = (time: string) => {
    updateMutation.mutate({ reminderTime: time });
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    const success = await sendTestNotification();
    setTestSending(false);
    toast({
      title: success ? "Test sent!" : "Failed to send",
      description: success
        ? "Check your notifications"
        : "Make sure notifications are enabled in your browser",
    });
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      toast({ title: "Notifications enabled", description: "You'll now receive MindPrism updates" });
    } else {
      toast({ title: "Permission denied", description: "You can enable notifications in your browser settings" });
    }
  };

  const permissionGranted = getNotificationPermission() === "granted";
  const hasSubscription = !!prefs?.pushSubscription;

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, "0");
    return { value: `${h}:00`, label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? "AM" : "PM"}` };
  });

  return (
    <Card className="p-5" data-testid="notification-settings-card">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        Notifications
      </h3>

      {!permissionGranted && !hasSubscription ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Enable push notifications to get daily wisdom, streak reminders, and new book alerts.
          </p>
          <Button
            onClick={handleEnableNotifications}
            className="w-full bg-primary text-black font-semibold rounded-full h-10"
            data-testid="button-enable-push"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Push Notifications
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between" data-testid="toggle-daily-reminder">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Daily Reminder</p>
                <p className="text-[10px] text-muted-foreground">Time for your daily mind session</p>
              </div>
            </div>
            <Switch
              checked={prefs?.dailyReminder ?? true}
              onCheckedChange={(v) => handleToggle("dailyReminder", v)}
              data-testid="switch-daily-reminder"
            />
          </div>

          {prefs?.dailyReminder && (
            <div className="ml-11 mb-1">
              <select
                value={prefs?.reminderTime || "09:00"}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full bg-black border border-primary/20 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
                data-testid="select-reminder-time"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} UTC
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between" data-testid="toggle-streak-alerts">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Streak Alerts</p>
                <p className="text-[10px] text-muted-foreground">When your streak is at risk</p>
              </div>
            </div>
            <Switch
              checked={prefs?.streakAlerts ?? true}
              onCheckedChange={(v) => handleToggle("streakAlerts", v)}
              data-testid="switch-streak-alerts"
            />
          </div>

          <div className="flex items-center justify-between" data-testid="toggle-new-content">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">New Content</p>
                <p className="text-[10px] text-muted-foreground">When new books are published</p>
              </div>
            </div>
            <Switch
              checked={prefs?.newContent ?? true}
              onCheckedChange={(v) => handleToggle("newContent", v)}
              data-testid="switch-new-content"
            />
          </div>

          <div className="flex items-center justify-between" data-testid="toggle-weekly-summary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Weekly Summary</p>
                <p className="text-[10px] text-muted-foreground">Your weekly progress recap</p>
              </div>
            </div>
            <Switch
              checked={prefs?.weeklySummary ?? true}
              onCheckedChange={(v) => handleToggle("weeklySummary", v)}
              data-testid="switch-weekly-summary"
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 h-9"
              onClick={handleTestNotification}
              disabled={testSending}
              data-testid="button-test-notification"
            >
              {testSending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              Test Notification
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
