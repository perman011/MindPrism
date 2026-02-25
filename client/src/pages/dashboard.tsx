import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category, DailySpark, UserStreak, UserProgress, ChakraProgress, ChakraType } from "@shared/schema";
import { CHAKRA_MAP } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Flame, ArrowRight, Sparkles, BookOpen, ChevronRight, X } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { useAudio } from "@/lib/audio-context";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { AnimatePresence, motion } from "framer-motion";

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function HorizontalScroll({ children, title, actionHref, actionLabel, testId }: {
  children: React.ReactNode;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  testId?: string;
}) {
  return (
    <section className="mb-8" data-testid={testId}>
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-serif text-lg font-bold">{title}</h2>
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

export default function Dashboard() {
  const { user } = useAuth();
  const { play } = useAudio();
  const [activeChakra, setActiveChakra] = useState<ChakraType | null>(null);

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: dailySpark } = useQuery<DailySpark | null>({
    queryKey: ["/api/daily-spark"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: streak } = useQuery<UserStreak | null>({
    queryKey: ["/api/streak"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: allProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: chakraProgressData } = useQuery<ChakraProgress[]>({
    queryKey: ["/api/chakra-progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const featuredBooks = books?.filter((b) => b.featured) ?? [];
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
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="font-serif text-xl font-bold" data-testid="text-welcome">
            {user?.firstName ?? "Explorer"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full" data-testid="badge-streak">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500">{streak?.currentStreak ?? 0}</span>
          </div>
          <Link href="/vault">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <section className="mb-6 px-5" data-testid="section-energy-map">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f0a1e] via-[#1a1035] to-[#0d0820] p-5 pb-3">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-8 w-1 h-1 rounded-full bg-white animate-pulse" />
            <div className="absolute top-12 right-12 w-0.5 h-0.5 rounded-full bg-purple-300 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-20 left-20 w-0.5 h-0.5 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-16 right-8 w-1 h-1 rounded-full bg-violet-300 animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute bottom-24 left-16 w-0.5 h-0.5 rounded-full bg-blue-300 animate-pulse" style={{ animationDelay: "0.8s" }} />
          </div>

          <p className="text-center text-xs font-medium text-purple-300/80 uppercase tracking-widest mb-2">
            My Energy Map
          </p>
          <h3 className="text-center font-serif text-sm text-white/70 mb-3">
            Tap a chakra to explore
          </h3>

          <div className="flex justify-center">
            <ChakraAvatar
              activeChakra={activeChakra}
              onChakraSelect={setActiveChakra}
              progress={chakraProgressData ?? undefined}
              size="md"
            />
          </div>

          <AnimatePresence mode="wait">
            {activeChakra && (
              <motion.div
                key={activeChakra}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHAKRA_MAP[activeChakra].color }}
                    />
                    <span className="text-sm font-medium text-white">
                      {CHAKRA_MAP[activeChakra].name} Chakra
                    </span>
                    <span className="text-[10px] text-white/40">
                      {CHAKRA_MAP[activeChakra].sanskrit}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveChakra(null)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    data-testid="button-close-chakra-filter"
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
                <p className="text-xs text-white/50 mb-3">{CHAKRA_MAP[activeChakra].theme}</p>

                {chakraFilteredBooks.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {chakraFilteredBooks.map((book) => (
                      <Link key={book.id} href={`/book/${book.id}`}>
                        <div
                          className="flex-shrink-0 w-28 cursor-pointer"
                          data-testid={`chakra-book-${book.id}`}
                        >
                          <div className="w-28 h-36 rounded-lg overflow-hidden mb-1.5 ring-1 ring-white/10">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${CHAKRA_MAP[activeChakra].color}33, ${CHAKRA_MAP[activeChakra].color}11)` }}
                              >
                                <span className="font-serif text-lg font-bold text-white/30">{book.title[0]}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-white/80 truncate">{book.title}</p>
                          <p className="text-[9px] text-white/40">{book.author}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full animate-pulse flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle, ${CHAKRA_MAP[activeChakra].color}30 0%, transparent 70%)`,
                          boxShadow: `0 0 30px ${CHAKRA_MAP[activeChakra].color}15`,
                        }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: CHAKRA_MAP[activeChakra].color, opacity: 0.6 }} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white/50">Curating energy...</p>
                      <p className="text-[11px] text-white/25 mt-1">
                        {CHAKRA_MAP[activeChakra].name} content coming soon
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {dailySpark && (
        <div className="px-5 mb-6">
          <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20" data-testid="card-daily-spark">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary mb-1.5 uppercase tracking-wider">Daily Spark</p>
                <p className="font-serif text-base leading-relaxed mb-2" data-testid="text-spark-quote">
                  "{dailySpark.quote}"
                </p>
                <p className="text-xs text-muted-foreground">— {dailySpark.author}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {inProgressBooks.length > 0 && (
        <HorizontalScroll title="Jump Back In" testId="section-resume">
          {inProgressBooks.map((prog) => {
            const book = allBooks.find(b => b.id === prog.bookId);
            if (!book) return null;
            const pct = prog.totalCards ? Math.round((prog.currentCardIndex! / prog.totalCards) * 100) : 0;
            return (
              <Link key={prog.id} href={`/book/${book.id}/journey`}>
                <div className="flex-shrink-0 w-36 cursor-pointer" data-testid={`resume-book-${book.id}`}>
                  <div className="relative w-36 h-44 rounded-lg overflow-hidden mb-2">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="font-serif text-xl font-bold text-primary/30">{book.title[0]}</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <ProgressRing progress={pct} size={36} />
                    </div>
                  </div>
                  <p className="text-xs font-medium truncate">{book.title}</p>
                  <p className="text-[10px] text-muted-foreground">{pct}% complete</p>
                </div>
              </Link>
            );
          })}
        </HorizontalScroll>
      )}

      {featuredBooks.length > 0 && (
        <HorizontalScroll title="Based on Your Goals" actionHref="/discover" actionLabel="See All" testId="section-featured">
          {booksLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="flex-shrink-0 w-44 h-60 rounded-xl" />
              ))
            : featuredBooks.map((book) => (
                <div key={book.id} className="flex-shrink-0 w-44">
                  <BookCard book={book} compact />
                </div>
              ))}
        </HorizontalScroll>
      )}

      <HorizontalScroll title="Trending Audio Summaries" actionHref="/audio" actionLabel="Listen" testId="section-trending">
        {booksLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-44 h-60 rounded-xl" />
            ))
          : allBooks.filter(b => b.audioUrl).slice(0, 5).map((book) => (
              <div key={book.id} className="flex-shrink-0 w-44 cursor-pointer" onClick={() => play(book)}>
                <BookCard book={book} compact audioMode />
              </div>
            ))}
      </HorizontalScroll>

      {categories && categories.length > 0 && (
        <section className="mb-8 px-5" data-testid="section-categories">
          <h2 className="font-serif text-lg font-bold mb-3">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/discover?category=${cat.slug}`}>
                <div
                  className="p-3 rounded-xl bg-card border border-card-border hover-elevate cursor-pointer transition-colors flex items-center gap-2.5"
                  data-testid={`card-category-${cat.slug}`}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-xs truncate">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );

}
