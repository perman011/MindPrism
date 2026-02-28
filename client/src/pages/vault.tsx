import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { UserStreak, JournalEntry, SavedHighlight, Exercise, ChakraProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenLine, LogOut, Settings, Calendar, Bookmark, BarChart3 } from "lucide-react";
import { useState } from "react";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { CHAKRA_MAP, type ChakraType } from "@shared/schema";
import { NotificationSettings } from "@/components/notification-settings";
import { PersonalStats } from "@/components/personal-stats";
import { SummaryStats } from "@/components/summary-stats";
import { StreakChart } from "@/components/streak-chart";
import { motion } from "framer-motion";

interface VaultStats {
  principlesMastered: number;
  storiesRead: number;
  currentStreak: number;
  monthlyActivity: { date: string; activities: number }[];
}

export default function Vault() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "journal" | "highlights" | "settings">("stats");

  const { data: streak } = useQuery<UserStreak | null>({
    queryKey: ["/api/streak"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: vaultStats } = useQuery<VaultStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: journalEntries, isLoading: journalLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: highlights } = useQuery<SavedHighlight[]>({
    queryKey: ["/api/highlights"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: chakraProgress } = useQuery<ChakraProgress[]>({
    queryKey: ["/api/chakra-progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [selectedChakra, setSelectedChakra] = useState<ChakraType | null>(null);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  const tabs = [
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
    { id: "journal" as const, label: "Journal", icon: PenLine },
    { id: "highlights" as const, label: "Saved", icon: Bookmark },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Growth Vault"
        description="Your personal growth vault. Track streaks, journal entries, saved highlights, and monitor your learning progress."
        noIndex
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-5 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground tracking-tight" data-testid="text-vault-name">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Your Progress</p>
        </div>
        <div className="mb-8">
          <SummaryStats
            principlesLearned={vaultStats?.principlesMastered ?? 0}
            storiesRead={vaultStats?.storiesRead ?? 0}
            currentStreak={vaultStats?.currentStreak ?? 0}
          />
        </div>

        <div className="mb-8">
          <StreakChart data={vaultStats?.monthlyActivity ?? []} />
        </div>

        <Card className="p-5 mb-8 bg-[#F5F0EB] dark:bg-card border-primary/10">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-4 text-center">My Personal Aura</h3>
          <div className="flex justify-center mb-3">
            <ChakraAvatar
              activeChakra={selectedChakra}
              onChakraSelect={setSelectedChakra}
              progress={chakraProgress ?? []}
              size="sm"
            />
          </div>
          {selectedChakra ? (
            <div className="text-center mt-3">
              <p className="text-sm font-semibold" style={{ color: CHAKRA_MAP[selectedChakra].color }}>
                {CHAKRA_MAP[selectedChakra].name} Chakra
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {chakraProgress?.find(p => p.chakra === selectedChakra)?.points ?? 0} points earned
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Tap a chakra to see your progress
            </p>
          )}
        </Card>
      </motion.div>

      <div className="px-5 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 order-2 md:order-1">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-6 md:hidden">
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

            <div className="hidden md:block">
              <PersonalStats />
            </div>

            <div className="md:hidden">
              {activeTab === "stats" && <PersonalStats />}
            </div>
          </div>

          <div className="md:col-span-2 order-1 md:order-2">
            <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1 mb-6">
              {tabs.filter(t => t.id !== "stats").map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === tab.id || (activeTab === "stats" && tab.id === "journal")
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`tab-desktop-${tab.id}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {(activeTab === "journal" || activeTab === "stats") && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                data-testid="journal-list"
                className={activeTab === "stats" ? "hidden md:block" : ""}
              >
                <h2 className="text-lg font-bold mb-1">Journal Entries</h2>
                <p className="text-[11px] text-muted-foreground mb-4">Your reflections and exercise responses</p>
                <div className="space-y-3">
                  {journalLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-md" />
                    ))
                  ) : !journalEntries || journalEntries.length === 0 ? (
                    <div className="text-center py-14">
                      <PenLine className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No journal entries yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Complete exercises to build your journal</p>
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
                <p className="text-[11px] text-muted-foreground mb-4">Bookmarked insights and key passages</p>
                <div className="space-y-3">
                  {!highlights || highlights.length === 0 ? (
                    <div className="text-center py-14">
                      <Bookmark className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No saved highlights yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Long-press text or visuals to save them here</p>
                    </div>
                  ) : (
                    highlights.map((h) => (
                      <Card key={h.id} className="p-4" data-testid={`highlight-${h.id}`}>
                        <p className="text-sm leading-relaxed">{h.content}</p>
                        <p className="text-[11px] text-muted-foreground mt-2.5 font-medium">
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </p>
                      </Card>
                    ))
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
                <p className="text-[11px] text-muted-foreground mb-4">Manage your account and preferences</p>
                <div className="space-y-4">
                  <NotificationSettings />
                  <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-4">Account</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium truncate">{user?.email ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Member since</span>
                        <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
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
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                        } catch {}
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
          </div>
        </div>
      </div>
    </div>
  );
}
