import { SEOHead } from "@/components/SEOHead";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category, UserStreak, UserProgress, ChakraProgress, ChakraType } from "@shared/schema";
import { CHAKRA_MAP } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, ArrowRight, Sparkles, BookOpen, ChevronRight, ChevronLeft, X, Film, Headphones, Play, Trophy, Star, Shield, Zap, Award } from "lucide-react";
import logoImg from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { Link, useLocation } from "wouter";
import type { Short } from "@shared/schema";
import { ShortsPlayer, ShortCard } from "@/components/shorts-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { useAudio } from "@/lib/audio-context";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { trackPageView } from "@/lib/analytics";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShareMilestonePrompt, useShareTriggers } from "@/components/progress-share-card";

const STREAK_MILESTONES = [
  { days: 7, label: "1 Week", icon: Flame, color: "#E8A838" },
  { days: 14, label: "2 Weeks", icon: Star, color: "#C4A35A" },
  { days: 30, label: "1 Month", icon: Shield, color: "#4CAF7D" },
  { days: 60, label: "2 Months", icon: Zap, color: "#3D8B8B" },
  { days: 100, label: "100 Days", icon: Trophy, color: "#9B59B6" },
];

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/")) {
    return `/objects${trimmed}`;
  }
  if (trimmed.startsWith("uploads/")) {
    return `/objects/${trimmed}`;
  }
  if (trimmed.startsWith("/objects/uploads/")) {
    return trimmed;
  }
  if (/^(https?:\/\/|\/|blob:|data:)/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function CelebrationModal({ milestone, open, onClose }: { milestone: typeof STREAK_MILESTONES[0] | null; open: boolean; onClose: () => void }) {
  if (!milestone) return null;
  const Icon = milestone.icon;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm text-center p-8" data-testid="modal-celebration">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${milestone.color}33, ${milestone.color}11)`, border: `2px solid ${milestone.color}55` }}
          >
            <Icon className="w-10 h-10" style={{ color: milestone.color }} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1" data-testid="text-celebration-label">Milestone Achieved</p>
            <h2 className="text-2xl font-bold font-serif" data-testid="text-celebration-title">{milestone.label} Streak</h2>
            <p className="text-sm text-muted-foreground mt-2">{milestone.days} consecutive days of learning</p>
          </div>
          <Button onClick={onClose} className="mt-2" data-testid="button-celebration-close">Continue</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function HorizontalScroll({ children, title, accentLabel, actionHref, actionLabel, testId }: {
  children: React.ReactNode;
  title: string;
  accentLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  testId?: string;
}) {
  return (
    <section className="mb-10" data-testid={testId}>
      <div className="flex items-center justify-between gap-2 px-5 mb-4">
        <div>
          {accentLabel && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">{accentLabel}</p>
          )}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        {actionHref && (
          <Link href={actionHref}>
            <button className="text-xs text-primary font-medium flex items-center gap-0.5" data-testid={`link-${testId}-action`}>
              {actionLabel ?? "See All"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide">
        {children}
      </div>
    </section>
  );
}

function BookSlider({ books, title, testId }: { books: Book[]; title: string; testId: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setScrollPos(el.scrollLeft);
    setMaxScroll(el.scrollWidth - el.clientWidth);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateScrollState, 100);
    window.addEventListener("resize", updateScrollState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, books]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = 200;
    const amount = direction === "left" ? -cardWidth : cardWidth;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  const canScrollLeft = scrollPos > 5;
  const canScrollRight = maxScroll > 0 && scrollPos < maxScroll - 5;

  return (
    <section className="mb-10" data-testid={testId}>
      <div className="flex items-center justify-between gap-2 px-5 mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            data-testid={`${testId}-scroll-left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            data-testid={`${testId}-scroll-right`}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-5 pb-3 scrollbar-hide snap-x snap-mandatory"
        onScroll={updateScrollState}
      >
        {books.map((book) => (
          <div key={book.id} className="flex-shrink-0 w-[180px] snap-start">
            <BookCard book={book} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { play } = useAudio();
  const [, navigate] = useLocation();
  const [activeChakra, setActiveChakra] = useState<ChakraType | null>(null);
  const [dashboardMode, setDashboardMode] = useState<"chakra" | "shorts">("chakra");
  const [celebrationMilestone, setCelebrationMilestone] = useState<typeof STREAK_MILESTONES[0] | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [shownMilestones, setShownMilestones] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem("mindprism_shown_milestones");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    trackPageView("dashboard");
  }, []);

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: streak } = useQuery<UserStreak | null>({
    queryKey: ["/api/streak"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (!streak?.currentStreak) return;
    const current = streak.currentStreak;
    for (const ms of STREAK_MILESTONES) {
      if (current >= ms.days && !shownMilestones.has(ms.days)) {
        setCelebrationMilestone(ms);
        setCelebrationOpen(true);
        const updated = new Set(shownMilestones);
        updated.add(ms.days);
        setShownMilestones(updated);
        localStorage.setItem("mindprism_shown_milestones", JSON.stringify(Array.from(updated)));
        break;
      }
    }
  }, [streak?.currentStreak]);

  const streakDataMemo = useMemo(
    () => streak?.currentStreak != null ? { currentStreak: streak.currentStreak } : undefined,
    [streak?.currentStreak]
  );
  const { pendingTrigger: shareTrigger, dismissTrigger: dismissShareTrigger } = useShareTriggers(
    undefined,
    streakDataMemo
  );

  const { data: allProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: chakraProgressData } = useQuery<ChakraProgress[]>({
    queryKey: ["/api/chakra-progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: recommendedBooks } = useQuery<Book[]>({
    queryKey: ["/api/books/recommended"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: becauseYouRead } = useQuery<{ sourceBook: { id: string; title: string } | null; books: Book[] } | null>({
    queryKey: ["/api/books/because-you-read"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: publishedShorts, isLoading: shortsLoading } = useQuery<(Short & { bookTitle?: string })[]>({
    queryKey: ["/api/shorts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [shortsPlayerOpen, setShortsPlayerOpen] = useState(false);
  const [shortsPlayerIndex, setShortsPlayerIndex] = useState(0);

  const allBooks = books ?? [];
  const inProgressBooks = allProgress?.filter(p => p.currentCardIndex && p.currentCardIndex > 0 && p.totalCards && p.currentCardIndex < p.totalCards) ?? [];

  const chakraFilteredBooks = activeChakra
    ? allBooks.filter(b => b.primaryChakra === activeChakra || b.secondaryChakra === activeChakra)
    : [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Dashboard"
        description="Your personalized psychology learning dashboard. Track your streaks, explore insights, and continue your growth journey."
        noIndex
      />
      <div className="bg-background">
        <div className="px-5 pt-4 pb-1 flex items-center justify-between" data-testid="header-brand">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="mindprism"
              className="w-10 h-10 object-contain dark:brightness-125"
            />
            <span className="text-lg font-bold tracking-tight text-foreground dark:text-primary-lighter">mindprism</span>
          </div>
        </div>
        {booksLoading ? (
          <div className="px-5 pt-4 pb-5 flex items-center justify-between gap-3">
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ) : (
        <div className="px-5 pt-4 pb-5 flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{greeting()}</p>
            <h1 className="text-[32px] font-bold text-[#111827] dark:text-foreground tracking-tight leading-tight" data-testid="text-welcome">
              {user?.firstName ?? "Explorer"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 px-4 py-2.5 rounded-full border border-orange-300 dark:border-orange-700" data-testid="badge-streak">
              <motion.div
                animate={(streak?.currentStreak ?? 0) > 0 ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Flame className="w-4 h-4 text-[#F97316]" />
              </motion.div>
              <span className="text-sm font-bold text-orange-500 dark:text-orange-400">{streak?.currentStreak ?? 0} day{(streak?.currentStreak ?? 0) !== 1 ? "s" : ""}</span>
            </div>
            <Link href="/vault">
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-border">
                <AvatarImage src={user?.profileImageUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-muted text-muted-foreground font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
        )}

        <div className="px-5 mb-4">
          <div className="flex items-center justify-center">
            <div className="inline-flex bg-muted dark:bg-muted rounded-full p-1 border border-border" data-testid="mode-toggle">
              <button
                onClick={() => setDashboardMode("chakra")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  dashboardMode === "chakra"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                data-testid="button-mode-chakra"
                aria-label="Switch to Chakra view"
                aria-pressed={dashboardMode === "chakra"}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Chakra
              </button>
              <button
                onClick={() => setDashboardMode("shorts")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  dashboardMode === "shorts"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                data-testid="button-mode-shorts"
                aria-label="Switch to Shorts view"
                aria-pressed={dashboardMode === "shorts"}
              >
                <Film className="w-3.5 h-3.5" aria-hidden="true" />
                Shorts
              </button>
            </div>
          </div>
        </div>

        {dashboardMode === "chakra" ? (
          <div className="px-5 pb-6" data-testid="section-energy-map">
            <div className="flex justify-center">
              <ChakraAvatar
                activeChakra={activeChakra}
                onChakraSelect={setActiveChakra}
                progress={chakraProgressData ?? undefined}
                size="md"
              />
            </div>
          </div>
        ) : (
          <div className="px-5 pb-6" data-testid="section-reels-feed">
            {publishedShorts && publishedShorts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {publishedShorts.slice(0, 6).map((short, i) => (
                  <button
                    key={short.id}
                    onClick={() => {
                      setShortsPlayerIndex(i);
                      setShortsPlayerOpen(true);
                    }}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden group"
                    data-testid={`reel-${short.id}`}
                    aria-label={`Watch: ${short.title}`}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: short.backgroundGradient || "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
                      }}
                    />
                    {(() => {
                      const thumbUrl = resolveMediaUrl(short.thumbnailUrl);
                      const imageMediaUrl = short.mediaType === "image" ? resolveMediaUrl(short.mediaUrl) : null;
                      const previewUrl = thumbUrl || imageMediaUrl;
                      if (!previewUrl) return null;
                      return (
                        <img
                          src={previewUrl}
                          alt={short.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] text-white font-semibold line-clamp-2 leading-tight">{short.title}</p>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Film className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/50">No reels yet — check back soon</p>
              </div>
            )}
            {publishedShorts && publishedShorts.length > 6 && (
              <button
                onClick={() => navigate("/shorts")}
                className="mt-3 w-full py-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold transition-colors"
                data-testid="button-see-all-shorts"
              >
                See All Shorts
              </button>
            )}
          </div>
        )}
      </div>

      {shareTrigger && (
        <div className="px-5 mb-4 mt-4">
          <ShareMilestonePrompt trigger={shareTrigger} onDismiss={dismissShareTrigger} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeChakra && (
          <motion.section
            key={activeChakra}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8 px-5"
            data-testid="section-chakra-filtered"
          >
            <div
              className="rounded-2xl p-4 border"
              style={{
                borderColor: `${CHAKRA_MAP[activeChakra].color}30`,
                background: `linear-gradient(135deg, ${CHAKRA_MAP[activeChakra].color}08 0%, transparent 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHAKRA_MAP[activeChakra].color }}
                  />
                  <span className="text-sm font-bold">
                    {CHAKRA_MAP[activeChakra].name} Chakra
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {CHAKRA_MAP[activeChakra].sanskrit}
                  </span>
                </div>
                <button
                  onClick={() => setActiveChakra(null)}
                  className="p-1.5 rounded-full bg-muted/50 transition-colors"
                  data-testid="button-close-chakra-filter"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{CHAKRA_MAP[activeChakra].theme}</p>

              {chakraFilteredBooks.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {chakraFilteredBooks.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`}>
                      {(() => {
                        const coverUrl = resolveMediaUrl(book.coverImage);
                        return (
                      <div
                        className="flex-shrink-0 w-32 cursor-pointer active:scale-95 transition-transform"
                        data-testid={`chakra-book-${book.id}`}
                      >
                        <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 ring-1 ring-border">
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${CHAKRA_MAP[activeChakra].color}33, ${CHAKRA_MAP[activeChakra].color}11)` }}
                          >
                            <span className="text-lg font-bold text-muted-foreground/30">{book.title[0]}</span>
                          </div>
                          {coverUrl && (
                            <img
                              src={coverUrl}
                              alt={book.title}
                              className="relative z-10 w-full h-full object-cover"
                              loading="lazy"
                              width={128}
                              height={160}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{book.title}</p>
                        <p className="text-[10px] text-muted-foreground">{book.author}</p>
                      </div>
                        );
                      })()}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full animate-pulse flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${CHAKRA_MAP[activeChakra].color}30 0%, transparent 70%)`,
                    }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: CHAKRA_MAP[activeChakra].color, opacity: 0.6 }} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No {CHAKRA_MAP[activeChakra].name} books yet — content coming soon
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {publishedShorts && publishedShorts.length > 0 && (
        <HorizontalScroll title="Quick Bites" accentLabel="Bite-sized insights" actionHref="/shorts" actionLabel="Watch All" testId="section-quick-bites">
          {publishedShorts.map((short, i) => (
            <ShortCard
              key={short.id}
              short={short}
              onClick={() => {
                setShortsPlayerIndex(i);
                setShortsPlayerOpen(true);
              }}
            />
          ))}
        </HorizontalScroll>
      )}
      {shortsLoading && (
        <section className="mb-10" data-testid="section-quick-bites-skeleton">
          <div className="px-5 mb-4">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-4 px-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-[120px] h-[180px] rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {allBooks.filter(b => b.audioUrl && b.audioUrl !== "placeholder" && !b.audioUrl.includes("placeholder")).length > 0 && (
        <section className="mb-10" data-testid="section-continue-listening">
          <div className="flex items-center justify-between gap-2 px-5 mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Continue listening</p>
              <h2 className="text-xl font-bold text-foreground">Pick Up Where You Left Off</h2>
            </div>
            <Link href="/audio">
              <button className="text-xs text-primary font-medium flex items-center gap-0.5" data-testid="link-continue-listening-action">
                All Audio
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="px-5 space-y-2">
            {allBooks
              .filter(b => b.audioUrl && b.audioUrl !== "placeholder" && !b.audioUrl.includes("placeholder"))
              .slice(0, 3)
              .map((book) => {
                const coverUrl = resolveMediaUrl(book.coverImage);
                return (
                  <button
                    key={book.id}
                    onClick={() => play(book)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-card-border hover-elevate transition-all text-left"
                    data-testid={`continue-listening-${book.id}`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-primary/30" />
                      </div>
                      {coverUrl && (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="relative z-10 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{book.title}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {book.audioDuration
                          ? `${Math.floor(book.audioDuration / 60)}:${String(book.audioDuration % 60).padStart(2, '0')}`
                          : `${book.listenTime} min`}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                  </button>
                );
              })}
          </div>
        </section>
      )}

      {inProgressBooks.length > 0 && (
        <HorizontalScroll title="Jump Back In" accentLabel="Based on your activity" testId="section-resume">
          {inProgressBooks.map((prog) => {
            const book = allBooks.find(b => b.id === prog.bookId);
            if (!book) return null;
            const coverUrl = resolveMediaUrl(book.coverImage);
            const pct = prog.totalCards ? Math.round((prog.currentCardIndex! / prog.totalCards) * 100) : 0;
            return (
              <Link key={prog.id} href={`/book/${book.id}/journey`}>
                <div className="flex-shrink-0 w-40 cursor-pointer" data-testid={`resume-book-${book.id}`}>
                  <div className="relative w-40 h-48 rounded-xl overflow-hidden mb-2 ring-1 ring-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary/30">{book.title[0]}</span>
                    </div>
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="relative z-10 w-full h-full object-cover"
                        loading="lazy"
                        width={160}
                        height={192}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200/40">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-semibold truncate mt-1">{book.title}</p>
                  <p className="text-[10px] text-muted-foreground">{pct}% complete</p>
                </div>
              </Link>
            );
          })}
        </HorizontalScroll>
      )}

      {recommendedBooks && recommendedBooks.length > 0 && (
        <HorizontalScroll title="Recommended For You" accentLabel="Based on your interests" actionHref="/discover" actionLabel="See All" testId="section-recommended">
          {recommendedBooks.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-44" data-testid={`recommended-book-${book.id}`}>
              <BookCard book={book} compact />
            </div>
          ))}
        </HorizontalScroll>
      )}

      {becauseYouRead && becauseYouRead.sourceBook && becauseYouRead.books && becauseYouRead.books.length > 0 && (
        <HorizontalScroll
          title={`Because You Read "${becauseYouRead.sourceBook.title}"`}
          accentLabel="Readers also enjoyed"
          actionHref="/discover"
          actionLabel="More"
          testId="section-because-you-read"
        >
          {becauseYouRead.books.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-44" data-testid={`because-you-read-book-${book.id}`}>
              <BookCard book={book} compact />
            </div>
          ))}
        </HorizontalScroll>
      )}

      {booksLoading && (
        <section className="mb-10" data-testid="section-all-books-skeleton">
          <div className="px-5 mb-4">
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="flex gap-4 px-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px] space-y-2">
                <Skeleton className="aspect-[3/4] rounded-md" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      )}
      {allBooks.length > 0 && (
        <BookSlider books={allBooks} title="All Books" testId="section-all-books" />
      )}

      {categories && categories.length > 0 && (
        <section className="mb-10 px-5" data-testid="section-categories">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Explore topics</p>
          <h2 className="text-xl font-bold text-foreground mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/discover?category=${cat.slug}`}>
                <div
                  className="p-4 rounded-2xl bg-card border border-card-border hover-elevate cursor-pointer transition-colors flex items-center gap-3"
                  data-testid={`card-category-${cat.slug}`}
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon name={cat.icon} className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm leading-tight line-clamp-2">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(streak?.currentStreak ?? 0) > 0 && (
        <section className="mb-10 px-5" data-testid="section-streak-milestones">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Your Journey</p>
          <h2 className="text-xl font-bold mb-4">Streak Milestones</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {STREAK_MILESTONES.map((ms) => {
              const achieved = (streak?.currentStreak ?? 0) >= ms.days;
              const Icon = ms.icon;
              return (
                <div
                  key={ms.days}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    achieved ? "border-transparent" : "border-border opacity-40"
                  }`}
                  style={achieved ? { background: `linear-gradient(135deg, ${ms.color}15, ${ms.color}05)`, borderColor: `${ms.color}30` } : {}}
                  data-testid={`milestone-${ms.days}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={achieved ? { backgroundColor: `${ms.color}20` } : { backgroundColor: "var(--muted)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: achieved ? ms.color : "var(--muted-foreground)" }} />
                  </div>
                  <span className="text-[10px] font-semibold whitespace-nowrap">{ms.label}</span>
                  <span className="text-[9px] text-muted-foreground">{ms.days}d</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {shortsPlayerOpen && publishedShorts && (
        <ShortsPlayer
          shorts={publishedShorts}
          initialIndex={shortsPlayerIndex}
          onClose={() => setShortsPlayerOpen(false)}
        />
      )}

      <CelebrationModal
        milestone={celebrationMilestone}
        open={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
      />
    </div>
  );

}
