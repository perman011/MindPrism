import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category, DailySpark, UserStreak, UserProgress, ChakraProgress, ChakraType } from "@shared/schema";
import { CHAKRA_MAP } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Flame, ArrowRight, Sparkles, BookOpen, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { useAudio } from "@/lib/audio-context";
import { ChakraAvatar } from "@/components/chakra-avatar";
import { AnimatePresence, motion } from "framer-motion";

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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">{accentLabel}</p>
          )}
          <h2 className="font-serif text-xl font-bold">{title}</h2>
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
        <h2 className="font-serif text-xl font-bold">{title}</h2>
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
      <div className="px-5 pt-8 pb-5 flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{greeting()}</p>
          <h1 className="font-serif text-2xl font-bold tracking-tight" data-testid="text-welcome">
            {user?.firstName ?? "Explorer"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full" data-testid="badge-streak">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">{streak?.currentStreak ?? 0}</span>
          </div>
          <Link href="/vault">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <section className="mb-8 px-5" data-testid="section-energy-map">
        <div className="relative rounded-2xl bg-black p-5 pb-3">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-4 left-8 w-1 h-1 rounded-full bg-amber-200 animate-pulse" />
            <div className="absolute top-12 right-12 w-0.5 h-0.5 rounded-full bg-amber-300 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-20 left-20 w-0.5 h-0.5 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-16 right-8 w-1 h-1 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute bottom-24 left-16 w-0.5 h-0.5 rounded-full bg-yellow-200 animate-pulse" style={{ animationDelay: "0.8s" }} />
          </div>

          <p className="text-center text-xs font-medium text-amber-300/80 uppercase tracking-widest mb-2">
            My Energy Map
          </p>
          <h3 className="text-center font-serif text-sm text-white/70 mb-3">
            Tap a chakra to explore
          </h3>

          <div className="flex justify-center relative" style={{ zIndex: 10 }}>
            <ChakraAvatar
              activeChakra={activeChakra}
              onChakraSelect={setActiveChakra}
              progress={chakraProgressData ?? undefined}
              size="md"
            />
          </div>
        </div>
      </section>

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
                      <div
                        className="flex-shrink-0 w-32 cursor-pointer active:scale-95 transition-transform"
                        data-testid={`chakra-book-${book.id}`}
                      >
                        <div className="w-32 h-40 rounded-xl overflow-hidden mb-2 ring-1 ring-border">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${CHAKRA_MAP[activeChakra].color}33, ${CHAKRA_MAP[activeChakra].color}11)` }}
                            >
                              <span className="font-serif text-lg font-bold text-muted-foreground/30">{book.title[0]}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{book.title}</p>
                        <p className="text-[10px] text-muted-foreground">{book.author}</p>
                      </div>
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

      {dailySpark && (
        <div className="px-5 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/8 via-primary/4 to-accent/8 border-primary/15" data-testid="card-daily-spark">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Daily Spark</p>
                <p className="font-serif text-lg leading-relaxed mb-3" data-testid="text-spark-quote">
                  "{dailySpark.quote}"
                </p>
                <p className="text-xs text-muted-foreground font-medium">— {dailySpark.author}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {inProgressBooks.length > 0 && (
        <HorizontalScroll title="Jump Back In" accentLabel="Based on your activity" testId="section-resume">
          {inProgressBooks.map((prog) => {
            const book = allBooks.find(b => b.id === prog.bookId);
            if (!book) return null;
            const pct = prog.totalCards ? Math.round((prog.currentCardIndex! / prog.totalCards) * 100) : 0;
            return (
              <Link key={prog.id} href={`/book/${book.id}/journey`}>
                <div className="flex-shrink-0 w-40 cursor-pointer" data-testid={`resume-book-${book.id}`}>
                  <div className="relative w-40 h-48 rounded-xl overflow-hidden mb-2 ring-1 ring-border">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="font-serif text-xl font-bold text-primary/30">{book.title[0]}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
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

      {allBooks.length > 0 && (
        <BookSlider books={allBooks} title="All Books" testId="section-all-books" />
      )}

      {featuredBooks.length > 0 && (
        <HorizontalScroll title="Based on Your Goals" accentLabel="Recommended for you" actionHref="/discover" actionLabel="See All" testId="section-featured">
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

      <HorizontalScroll title="Trending Audio Summaries" accentLabel="Popular this week" actionHref="/audio" actionLabel="Listen" testId="section-trending">
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
        <section className="mb-10 px-5" data-testid="section-categories">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">Explore topics</p>
          <h2 className="font-serif text-xl font-bold mb-4">Browse by Topic</h2>
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
                  <span className="font-semibold text-sm truncate">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );

}
