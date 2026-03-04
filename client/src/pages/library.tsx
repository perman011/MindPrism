import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, LogOut, Home, ArrowLeft } from "lucide-react";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { Link, useSearch } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";

export default function Library() {
  const { user, logout } = useAuth();
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
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, categories, activeCategory, searchQuery]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center cursor-pointer mix-blend-screen" data-testid="link-home">
              <div className="flex flex-col items-center">
                <img src={mindprismLogo} alt="MindPrism" className="h-16 object-contain" style={{ aspectRatio: '1.618' }} />
                <span className="text-[10px] font-semibold tracking-[0.15em] text-foreground/80 -mt-0.5 font-serif">Mind Prism</span>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-dashboard">
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </Button>
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-library-title">
              Book Library
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-library-search"
            />
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 flex-wrap" data-testid="category-filters">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              data-testid="filter-all"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                data-testid={`filter-${cat.slug}`}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        )}

        {booksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search or clearing the filter."
                : "No books in this category yet."}
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory(null); }}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
