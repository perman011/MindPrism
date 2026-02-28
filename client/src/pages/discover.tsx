import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Film, Play } from "lucide-react";
import { useSearch, useLocation, Link } from "wouter";
import { useState, useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import type { Short } from "@shared/schema";

export default function Discover() {
  const searchParams = new URLSearchParams(useSearch());
  const categorySlug = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(categorySlug);
  const [, navigate] = useLocation();

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: publishedShorts } = useQuery<Short[]>({
    queryKey: ["/api/shorts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const filteredBooks = useMemo(() => {
    let result = books ?? [];
    if (activeCategory) {
      const cat = categories?.find((c) => c.slug === activeCategory);
      if (cat) result = result.filter((b) => b.categoryId === cat.id);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, categories, activeCategory, searchQuery]);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (books ?? [])
      .filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      .slice(0, 4);
  }, [books, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Discover"
        description="Browse psychology and self-help book summaries. Find insights on habits, mindset, relationships, and personal growth."
        noIndex
      />
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-serif text-2xl font-bold mb-1" data-testid="text-discover-title">Discover</h1>
        <p className="text-sm text-muted-foreground mb-5">Find your next great read</p>

        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder="Search books, authors, principles..."
            className="w-full pl-10 pr-4 bg-muted/50 border-transparent focus:border-border rounded-full text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
          {suggestions.length > 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-10 overflow-hidden" data-testid="search-suggestions">
              {suggestions.map((book) => (
                <a
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover-elevate transition-colors"
                  data-testid={`suggestion-${book.id}`}
                >
                  <div className="w-8 h-11 rounded-md overflow-hidden flex-shrink-0">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary/40">{book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {publishedShorts && publishedShorts.length > 0 && (
        <div className="px-5 mb-6" data-testid="banner-trending-shorts">
          <div
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            style={{ height: "160px", background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 40%, #1a1000 100%)" }}
            onClick={() => navigate("/shorts")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/5" />
            <div className="absolute top-3 right-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl" />
            <div className="relative flex flex-col justify-center h-full px-6">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Trending</p>
              </div>
              <h3 className="text-[22px] font-bold text-white mb-1">Story Shorts</h3>
              <p className="text-[14px] text-white/60 mb-4">Bite-sized insights in seconds</p>
              <button
                className="self-start px-5 py-2 rounded-full bg-primary text-black text-xs font-bold flex items-center gap-1.5"
                data-testid="button-watch-shorts"
              >
                <Play className="w-3 h-3" />
                Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="flex items-center gap-2.5 px-5 mb-6 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-pills">
          <button
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 text-muted-foreground"
            }`}
            onClick={() => setActiveCategory(null)}
            data-testid="filter-all"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground"
              }`}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
              data-testid={`filter-${cat.slug}`}
            >
              <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pb-8">
        {activeCategory && (
          <p className="text-xs text-muted-foreground mb-3" data-testid="text-filter-label">
            Showing {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
            {categories?.find(c => c.slug === activeCategory)
              ? ` in ${categories.find(c => c.slug === activeCategory)!.name}`
              : ""}
          </p>
        )}
        {booksLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
                <Skeleton className="h-2.5 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">No books found</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4" data-testid="book-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
