import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { UserStreak, JournalEntry, SavedHighlight, Exercise, ChakraProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Headphones, PenLine, BookOpen, LogOut, Settings, Calendar, Bookmark } from "lucide-react";
import { useState } from "react";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { CHAKRA_MAP, type ChakraType } from "@shared/schema";

export default function Vault() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"journal" | "highlights" | "settings">("journal");

  const { data: streak } = useQuery<UserStreak | null>({
    queryKey: ["/api/streak"],
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

  const stats = [
    { icon: Flame, label: "Day Streak", value: streak?.currentStreak ?? 0, color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-500/10", barColor: "bg-orange-500" },
    { icon: Headphones, label: "Mins Listened", value: streak?.totalMinutesListened ?? 0, color: "text-blue-500 dark:text-blue-400", bgColor: "bg-blue-500/10", barColor: "bg-blue-500" },
    { icon: PenLine, label: "Exercises Done", value: streak?.totalExercisesCompleted ?? 0, color: "text-emerald-500 dark:text-emerald-400", bgColor: "bg-emerald-500/10", barColor: "bg-emerald-500" },
  ];

  const tabs = [
    { id: "journal" as const, label: "My Journal", icon: PenLine },
    { id: "highlights" as const, label: "Saved", icon: Bookmark },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold tracking-tight" data-testid="text-vault-name">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Your Progress</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8" data-testid="stats-grid">
          {stats.map((stat) => {
            const maxVal = stat.label === "Day Streak" ? 30 : stat.label === "Mins Listened" ? 600 : 50;
            const pct = Math.min((stat.value / maxVal) * 100, 100);
            return (
              <Card key={stat.label} className="p-3 text-center overflow-hidden relative">
                <div className={`w-9 h-9 rounded-md ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">{stat.label}</p>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-5 mb-8 bg-gradient-to-b from-primary/5 to-background border-primary/10">
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
      </div>

      <div className="px-5 pb-8">
        {activeTab === "journal" && (
          <div data-testid="journal-list">
            <h2 className="font-serif text-lg font-bold mb-1">Journal Entries</h2>
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
          </div>
        )}

        {activeTab === "highlights" && (
          <div data-testid="highlights-list">
            <h2 className="font-serif text-lg font-bold mb-1">Saved Highlights</h2>
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
          </div>
        )}

        {activeTab === "settings" && (
          <div data-testid="settings-section">
            <h2 className="font-serif text-lg font-bold mb-1">Settings</h2>
            <p className="text-[11px] text-muted-foreground mb-4">Manage your account and preferences</p>
            <div className="space-y-4">
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
                    <span className={user?.isPremium ? "text-amber-600 dark:text-amber-400 font-semibold" : "font-medium"}>
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
          </div>
        )}
      </div>
    </div>
  );
}
