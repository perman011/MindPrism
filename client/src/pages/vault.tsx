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
    { icon: Flame, label: "Day Streak", value: streak?.currentStreak ?? 0, color: "text-orange-500 bg-orange-500/10" },
    { icon: Headphones, label: "Mins Listened", value: streak?.totalMinutesListened ?? 0, color: "text-blue-500 bg-blue-500/10" },
    { icon: PenLine, label: "Exercises Done", value: streak?.totalExercisesCompleted ?? 0, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  const tabs = [
    { id: "journal" as const, label: "My Journal", icon: PenLine },
    { id: "highlights" as const, label: "Saved", icon: Bookmark },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-xl font-bold" data-testid="text-vault-name">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6" data-testid="stats-grid">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-3 text-center">
              <div className={`w-8 h-8 rounded-md ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 mb-5 bg-gradient-to-b from-primary/5 to-background border-primary/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 text-center">My Personal Aura</h3>
          <div className="flex justify-center mb-3">
            <ChakraAvatar
              activeChakra={selectedChakra}
              onChakraSelect={setSelectedChakra}
              progress={chakraProgress ?? []}
              size="sm"
            />
          </div>
          {selectedChakra ? (
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: CHAKRA_MAP[selectedChakra].color }}>
                {CHAKRA_MAP[selectedChakra].name} Chakra
              </p>
              <p className="text-[11px] text-muted-foreground">
                {chakraProgress?.find(p => p.chakra === selectedChakra)?.points ?? 0} points earned
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center">
              Tap a chakra to see your progress
            </p>
          )}
        </Card>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
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
          <div className="space-y-3" data-testid="journal-list">
            {journalLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : !journalEntries || journalEntries.length === 0 ? (
              <div className="text-center py-12">
                <PenLine className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No journal entries yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete exercises to build your journal</p>
              </div>
            ) : (
              journalEntries.map((entry) => (
                <Card key={entry.id} className="p-4" data-testid={`journal-entry-${entry.id}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3">{entry.content}</p>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "highlights" && (
          <div className="space-y-3" data-testid="highlights-list">
            {!highlights || highlights.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No saved highlights yet</p>
                <p className="text-xs text-muted-foreground mt-1">Long-press text or visuals to save them here</p>
              </div>
            ) : (
              highlights.map((h) => (
                <Card key={h.id} className="p-4" data-testid={`highlight-${h.id}`}>
                  <p className="text-sm leading-relaxed">{h.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ""}
                  </p>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-3" data-testid="settings-section">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Account</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user?.email ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className={user?.isPremium ? "text-amber-600 font-semibold" : ""}>
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
        )}
      </div>
    </div>
  );
}
