import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, BookOpen, Sparkles, ArrowRight, LogOut, Search } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const featuredBooks = books?.filter((b) => b.featured) ?? [];
  const filteredBooks = books?.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">MindSpark</span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books, authors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/library">
              <Button variant="ghost" size="sm" data-testid="link-library">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Library
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12" data-testid="section-welcome">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-8">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" data-testid="text-welcome">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
                </h1>
                <p className="text-muted-foreground mb-4">
                  Continue your personal growth journey. Pick up where you left off or explore something new.
                </p>
                <Link href="/library">
                  <Button size="sm" className="gap-1.5" data-testid="button-explore">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explore Library
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {featuredBooks.length > 0 && (
          <section className="mb-12" data-testid="section-featured">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold">Featured Books</h2>
              <Link href="/library">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-xl" />
                  ))
                : featuredBooks.slice(0, 3).map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
            </div>
          </section>
        )}

        {categories && categories.length > 0 && (
          <section className="mb-12" data-testid="section-categories">
            <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6">Browse by Topic</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/library?category=${cat.slug}`}>
                  <div
                    className="p-4 rounded-xl bg-card border border-card-border hover-elevate cursor-pointer transition-colors"
                    data-testid={`card-category-${cat.slug}`}
                  >
                    <CategoryIcon name={cat.icon} className="w-6 h-6 text-primary mb-2" />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section data-testid="section-all-books">
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6">
            {searchQuery ? "Search Results" : "All Books"}
          </h2>
          {booksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No books found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
