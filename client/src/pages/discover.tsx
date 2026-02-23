import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search } from "lucide-react";
import { useSearch } from "wouter";
import { useState, useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";

export default function Discover() {
  const searchParams = new URLSearchParams(useSearch());
  const categorySlug = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(categorySlug);

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
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
      <div className="px-5 pt-6 pb-3">
        <h1 className="font-serif text-2xl font-bold mb-4" data-testid="text-discover-title">Discover</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search books, authors, principles..."
            className="pl-9 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
          {suggestions.length > 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden" data-testid="search-suggestions">
              {suggestions.map((book) => (
                <a
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  data-testid={`suggestion-${book.id}`}
                >
                  <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex items-center gap-2 px-5 mb-5 overflow-x-auto pb-1 scrollbar-hide" data-testid="category-pills">
          <button
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setActiveCategory(null)}
            data-testid="filter-all"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
              data-testid={`filter-${cat.slug}`}
            >
              <CategoryIcon name={cat.icon} className="w-3 h-3" />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pb-8">
        {booksLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" data-testid="book-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
