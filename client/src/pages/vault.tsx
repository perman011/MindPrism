import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { UserStreak, JournalEntry, SavedHighlight, ChakraProgress, Book } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenLine, LogOut, Settings, Calendar, Bookmark, Sun, Moon, Monitor, Flame, Star, Shield, Zap, Trophy, Snowflake, BookOpen } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { CHAKRA_MAP, type ChakraType } from "@shared/schema";
import { NotificationSettings } from "@/components/notification-settings";
import { SummaryStats } from "@/components/summary-stats";
import { StreakChart } from "@/components/streak-chart";
import { motion } from "framer-motion";

interface VaultStats {
  booksStarted: number;
  currentStreak: number;
  totalMinutesListened: number;
  monthlyActivity: { date: string; activities: number }[];
}

export default function Vault() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"journal" | "highlights" | "settings">("journal");

  const { data: streak } = useQuery<UserStreak | null>({
    queryKey: ["/api/streak"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: vaultStats, isLoading: statsLoading } = useQuery<VaultStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: journalEntries, isLoading: journalLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: highlights, isLoading: highlightsLoading } = useQuery<SavedHighlight[]>({
    queryKey: ["/api/highlights"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: chakraProgress } = useQuery<ChakraProgress[]>({
    queryKey: ["/api/chakra-progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [selectedChakra, setSelectedChakra] = useState<ChakraType | null>(null);
  const { toast } = useToast();

  const STREAK_MILESTONES = [
    { days: 7, label: "1 Week", icon: Flame, color: "#E8A838" },
    { days: 14, label: "2 Weeks", icon: Star, color: "#C4A35A" },
    { days: 30, label: "1 Month", icon: Shield, color: "#4CAF7D" },
    { days: 60, label: "2 Months", icon: Zap, color: "#3D8B8B" },
    { days: 100, label: "100 Days", icon: Trophy, color: "#9B59B6" },
  ];

  const freezeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/streak/freeze"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
      toast({ title: "Streak Frozen", description: "Your streak has been preserved for today." });
    },
    onError: () => {
      toast({ title: "Cannot Freeze", description: "Streak freeze is not available.", variant: "destructive" });
    },
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  const tabs = [
    { id: "journal" as const, label: "Journal", icon: PenLine },
    { id: "highlights" as const, label: "My Highlights", icon: Bookmark },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Growth Vault"
        description="Your personal growth vault. Track streaks, journal entries, saved highlights, and monitor your learning progress."
        noIndex
      />

      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-[#E5E7EB]">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-sm font-bold bg-[#DBEAFE] text-[#3B82F6]">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-vault-name">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 px-3 py-2 rounded-full border border-orange-300 dark:border-orange-800" data-testid="badge-vault-streak">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <span className="text-sm font-bold text-[#F97316]">{streak?.currentStreak ?? 0}</span>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <ChakraAvatar
            activeChakra={selectedChakra}
            onChakraSelect={setSelectedChakra}
            progress={chakraProgress ?? []}
            size="sm"
          />
        </div>

        {selectedChakra && (
          <div className="text-center pb-4">
            <p className="text-sm font-semibold" style={{ color: CHAKRA_MAP[selectedChakra].color }}>
              {CHAKRA_MAP[selectedChakra].name} Chakra
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              {chakraProgress?.find(p => p.chakra === selectedChakra)?.points ?? 0} points earned
            </p>
          </div>
        )}
        {!selectedChakra && (
          <p className="text-xs text-[#6B7280] text-center pb-4">
            Tap a chakra to see your progress
          </p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-5 pt-6 pb-8"
      >
        <div className="mb-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Your Progress</p>
        </div>
        {statsLoading ? (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-md border border-border p-4 space-y-2">
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
            <div className="mb-6">
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <SummaryStats
                booksStarted={vaultStats?.booksStarted ?? 0}
                minutesListened={vaultStats?.totalMinutesListened ?? 0}
                currentStreak={vaultStats?.currentStreak ?? 0}
              />
            </div>
            <div className="mb-6">
              <StreakChart data={vaultStats?.monthlyActivity ?? []} />
            </div>
          </>
        )}

        <div className="mb-6" data-testid="card-streak-milestones">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Streak Milestones</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STREAK_MILESTONES.map((ms) => {
              const achieved = (streak?.currentStreak ?? 0) >= ms.days;
              const Icon = ms.icon;
              return (
                <div
                  key={ms.days}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                    achieved ? "border-transparent" : "border-border opacity-60"
                  }`}
                  style={achieved ? { background: `linear-gradient(135deg, ${ms.color}15, ${ms.color}05)`, borderColor: `${ms.color}30` } : {}}
                  data-testid={`vault-milestone-${ms.days}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={achieved ? { backgroundColor: `${ms.color}20` } : { backgroundColor: "var(--muted)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: achieved ? ms.color : "var(--muted-foreground)" }} />
                  </div>
                  <span className="text-[11px] font-semibold whitespace-nowrap">{ms.label}</span>
                </div>
              );
            })}
          </div>
          {streak?.streakFreezeAvailable && (streak?.currentStreak ?? 0) > 0 && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-semibold">Streak Freeze</p>
                  <p className="text-[10px] text-muted-foreground">Preserve your streak for a day off</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => freezeMutation.mutate()}
                disabled={freezeMutation.isPending}
                data-testid="button-freeze-streak"
              >
                {freezeMutation.isPending ? "Freezing..." : "Use Freeze"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "journal" && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-testid="journal-list"
          >
            <h2 className="text-lg font-bold mb-1">Journal Entries</h2>
            <p className="text-xs text-muted-foreground mb-4">Your reflections and exercise responses</p>
            <div className="space-y-3">
              {journalLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded-full" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                ))
              ) : !journalEntries || journalEntries.length === 0 ? (
                <div className="text-center py-14">
                  <PenLine className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No journal entries yet</p>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[240px] mx-auto leading-relaxed">Complete exercises while reading to see your reflections here. Your growth journey starts with the first book.</p>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <Card key={entry.id} className="p-4" data-testid={`journal-entry-${entry.id}`}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3">{entry.content}</p>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "highlights" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-testid="highlights-list"
          >
            <h2 className="text-lg font-bold mb-1">Saved Highlights</h2>
            <p className="text-xs text-muted-foreground mb-4">Bookmarked insights and key passages</p>
            <div className="space-y-3">
              {highlightsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-border p-4 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : !highlights || highlights.length === 0 ? (
                <div className="text-center py-14">
                  <Bookmark className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No saved highlights yet</p>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[240px] mx-auto leading-relaxed">Start highlighting text while reading to see your key insights collected here.</p>
                </div>
              ) : (
                highlights.map((h) => {
                  const book = books?.find(b => b.id === h.bookId);
                  return (
                    <Card key={h.id} className="p-4" data-testid={`highlight-${h.id}`}>
                      <p className="text-sm leading-relaxed">{h.content}</p>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {book && (
                          <span className="flex items-center gap-1 text-[11px] text-primary font-medium" data-testid={`highlight-book-${h.id}`}>
                            <BookOpen className="w-3 h-3" />
                            {book.title}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-testid="settings-section"
          >
            <h2 className="text-lg font-bold mb-1">Settings</h2>
            <p className="text-xs text-muted-foreground mb-4">Manage your account and preferences</p>
            <div className="space-y-4">
              <Card className="p-5" data-testid="theme-settings">
                <h3 className="font-semibold text-sm mb-4">Appearance</h3>
                <div className="flex gap-2">
                  {([
                    { value: "light" as const, icon: Sun, label: "Light" },
                    { value: "dark" as const, icon: Moon, label: "Dark" },
                    { value: "system" as const, icon: Monitor, label: "System" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-150 ${
                        theme === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-theme-${opt.value}`}
                      aria-label={`Set ${opt.label} theme`}
                      aria-pressed={theme === opt.value}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
              <NotificationSettings />
              <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4">Account</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate">{user?.email ?? "\u2014"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "\u2014"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Plan</span>
                    <span className={user?.isPremium ? "text-primary font-semibold" : "font-medium"}>
                      {user?.isPremium ? "Premium" : "Free"}
                    </span>
                  </div>
                </div>
              </Card>
              {user?.isPremium && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/stripe/create-portal-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });
                      let data: any = {};
                      try { data = await res.json(); } catch {}
                      if (res.ok && data.url) {
                        window.location.href = data.url;
                      } else if (res.status === 503 || data.code === "STRIPE_NOT_CONFIGURED") {
                        toast({ title: "Not Available", description: "Subscription management is not available yet. Please contact support." });
                      } else {
                        toast({ title: "Error", description: data.message || "Could not open subscription portal. Please try again later.", variant: "destructive" });
                      }
                    } catch {
                      toast({ title: "Error", description: "Could not connect to subscription service. Please try again later.", variant: "destructive" });
                    }
                  }}
                  data-testid="button-manage-subscription"
                >
                  <Settings className="w-4 h-4" />
                  Manage Subscription
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
