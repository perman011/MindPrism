import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category, DailySpark, UserStreak, UserProgress } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Flame, ArrowRight, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { useAudio } from "@/lib/audio-context";

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

  const featuredBooks = books?.filter((b) => b.featured) ?? [];
  const allBooks = books ?? [];
  const inProgressBooks = allProgress?.filter(p => p.currentCardIndex && p.currentCardIndex > 0 && p.totalCards && p.currentCardIndex < p.totalCards) ?? [];

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
