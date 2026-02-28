import { SEOHead } from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Book, Category } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Film, Clock, X, Lightbulb } from "lucide-react";
import { useSearch, useLocation } from "wouter";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CategoryIcon } from "@/components/category-icon";
import type { Short } from "@shared/schema";
import { ShortsPlayer, ShortCard } from "@/components/shorts-player";

const RECENT_SEARCHES_KEY = "mindprism_recent_searches";
const MAX_RECENT_SEARCHES = 8;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const searches = getRecentSearches().filter(s => s !== query);
  searches.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
}

function removeRecentSearch(query: string) {
  const searches = getRecentSearches().filter(s => s !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

interface SearchResult {
  books: Array<{
    id: string;
    title: string;
    author: string;
    description: string;
    coverImage: string | null;
    categoryId: string | null;
    readTime: number;
    highlightedTitle: string;
    highlightedAuthor: string;
    highlightedDescription: string;
  }>;
  principles: Array<{
    id: string;
    title: string;
    content: string;
    bookId: string;
    bookTitle: string;
    highlightedTitle: string;
    highlightedContent: string;
  }>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Discover() {
  const searchParams = new URLSearchParams(useSearch());
  const categorySlug = searchParams.get("category");
  const initialTab = searchParams.get("tab") === "shorts" ? "shorts" : "books";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(categorySlug);
  const [activeTab, setActiveTab] = useState<"books" | "shorts">(initialTab);
  const [shortsBookFilter, setShortsBookFilter] = useState<string | null>(null);
  const [shortsPlayerOpen, setShortsPlayerOpen] = useState(false);
  const [shortsPlayerIndex, setShortsPlayerIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: publishedShorts, isLoading: shortsLoading } = useQuery<(Short & { bookTitle?: string })[]>({
    queryKey: ["/api/shorts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", `?q=${encodeURIComponent(debouncedQuery)}&type=all`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: debouncedQuery.length >= 2,
  });

  const isSearchActive = searchQuery.length >= 2;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim().length >= 2) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
      setShowSuggestions(false);
    }
  }, []);

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    handleSearchSubmit(query);
  }, [handleSearchSubmit]);

  const handleRemoveRecent = useCallback((e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  }, []);

  const filteredBooks = useMemo(() => {
    if (isSearchActive && searchResults) {
      let result = searchResults.books.map(sr => {
        const fullBook = books?.find(b => b.id === sr.id);
        return fullBook || sr as any;
      });
      if (activeCategory) {
        const cat = categories?.find((c) => c.slug === activeCategory);
        if (cat) result = result.filter((b: any) => b.categoryId === cat.id);
      }
      return result;
    }

    let result = books ?? [];
    if (activeCategory) {
      const cat = categories?.find((c) => c.slug === activeCategory);
      if (cat) result = result.filter((b) => b.categoryId === cat.id);
    }
    return result;
  }, [books, categories, activeCategory, isSearchActive, searchResults]);

  const filteredShorts = useMemo(() => {
    let result = publishedShorts ?? [];
    if (shortsBookFilter) {
      result = result.filter(s => s.bookId === shortsBookFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) ||
          (s.bookTitle ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [publishedShorts, shortsBookFilter, searchQuery]);

  const topSuggestions = useMemo(() => {
    if (!searchResults || debouncedQuery.length < 2) return [];
    return searchResults.books.slice(0, 5);
  }, [searchResults, debouncedQuery]);

  const booksWithShorts = useMemo(() => {
    if (!publishedShorts || !books) return [];
    const bookIds = Array.from(new Set(publishedShorts.map(s => s.bookId)));
    return books.filter(b => bookIds.includes(b.id));
  }, [publishedShorts, books]);

  const shortsCount = publishedShorts?.length ?? 0;

  const showRecentSearches = showSuggestions && searchQuery.length < 2 && recentSearches.length > 0;
  const showSearchSuggestions = showSuggestions && debouncedQuery.length >= 2 && (topSuggestions.length > 0 || (searchResults?.principles?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Discover"
        description="Browse psychology and self-help book summaries. Find insights on habits, mindset, relationships, and personal growth."
        noIndex
      />
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-discover-title">Discover</h1>
        <p className="text-sm text-muted-foreground mb-5">Find your next great read</p>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={activeTab === "books" ? "Search books, authors, principles..." : "Search shorts, topics..."}
            className="w-full pl-10 pr-10 bg-muted/50 border-transparent focus:border-border rounded-full text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit(searchQuery);
              }
              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            data-testid="input-search"
          />
          {searchQuery.length > 0 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground/60 hover:text-foreground transition-colors"
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showRecentSearches && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-10 overflow-hidden"
              data-testid="recent-searches"
            >
              <div className="px-4 py-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                <button
                  className="text-xs text-primary/70 hover:text-primary transition-colors"
                  onClick={() => {
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                    setRecentSearches([]);
                    setShowSuggestions(false);
                  }}
                  data-testid="button-clear-recent-searches"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((query) => (
                <button
                  key={query}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover-elevate transition-colors text-left"
                  onClick={() => handleRecentSearchClick(query)}
                  data-testid={`recent-search-${query}`}
                >
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{query}</span>
                  <button
                    className="p-1 rounded-full text-muted-foreground/40 hover-elevate"
                    onClick={(e) => handleRemoveRecent(e, query)}
                    aria-label={`Remove ${query} from recent searches`}
                    data-testid={`remove-recent-${query}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {showSearchSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-10 overflow-hidden max-h-80 overflow-y-auto"
              data-testid="search-suggestions"
            >
              {topSuggestions.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Books</span>
                  </div>
                  {topSuggestions.map((book) => (
                    <a
                      key={book.id}
                      href={`/book/${book.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover-elevate transition-colors"
                      onClick={() => handleSearchSubmit(searchQuery)}
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
                        <p className="text-sm font-medium truncate" dangerouslySetInnerHTML={{ __html: book.highlightedTitle }} />
                        <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: book.highlightedAuthor }} />
                      </div>
                    </a>
                  ))}
                </>
              )}

              {(searchResults?.principles?.length ?? 0) > 0 && (
                <>
                  <div className="px-4 py-2 border-t border-border">
                    <span className="text-xs font-medium text-muted-foreground">Principles</span>
                  </div>
                  {searchResults!.principles.slice(0, 5).map((principle) => (
                    <a
                      key={principle.id}
                      href={`/book/${principle.bookId}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover-elevate transition-colors"
                      onClick={() => handleSearchSubmit(searchQuery)}
                      data-testid={`suggestion-principle-${principle.id}`}
                    >
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-primary/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" dangerouslySetInnerHTML={{ __html: principle.highlightedTitle }} />
                        <p className="text-xs text-muted-foreground truncate">{principle.bookTitle}</p>
                      </div>
                    </a>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex rounded-xl bg-card p-1 mb-4" data-testid="discover-tabs" role="tablist" aria-label="Content type">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "books"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => { setActiveTab("books"); setSearchQuery(""); }}
            data-testid="tab-books"
            role="tab"
            aria-selected={activeTab === "books"}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Books
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "shorts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => { setActiveTab("shorts"); setSearchQuery(""); }}
            data-testid="tab-shorts"
            role="tab"
            aria-selected={activeTab === "shorts"}
          >
            <Film className="w-4 h-4" aria-hidden="true" />
            Shorts
            {shortsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "shorts" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary"
              }`}>
                {shortsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "books" && (
        <>
          {isSearchActive && searchResults && (
            <div className="px-5 pb-4">
              <p className="text-xs text-muted-foreground" data-testid="text-search-results-count">
                {searchResults.books.length} book{searchResults.books.length !== 1 ? "s" : ""}
                {searchResults.principles.length > 0 && ` and ${searchResults.principles.length} principle${searchResults.principles.length !== 1 ? "s" : ""}`}
                {" "}found for "{searchQuery}"
              </p>
            </div>
          )}

          {!isSearchActive && categories && categories.length > 0 && (
            <div className="flex items-center gap-2.5 px-5 mb-6 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-pills">
              <button
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-foreground border border-border"
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
                      : "bg-card text-foreground border border-border"
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
            {!isSearchActive && activeCategory && (
              <p className="text-xs text-muted-foreground mb-3" data-testid="text-filter-label">
                Showing {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
                {categories?.find(c => c.slug === activeCategory)
                  ? ` in ${categories.find(c => c.slug === activeCategory)!.name}`
                  : ""}
              </p>
            )}
            {booksLoading || (isSearchActive && searchLoading) ? (
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

            {isSearchActive && searchResults && searchResults.principles.length > 0 && (
              <div className="mt-8" data-testid="search-principles-results">
                <h2 className="text-lg font-semibold mb-4">Matching Principles</h2>
                <div className="space-y-3">
                  {searchResults.principles.map((principle) => (
                    <a
                      key={principle.id}
                      href={`/book/${principle.bookId}`}
                      className="block p-4 bg-card border border-border rounded-md hover-elevate transition-colors"
                      data-testid={`search-result-principle-${principle.id}`}
                    >
                      <p className="text-sm font-medium mb-1" dangerouslySetInnerHTML={{ __html: principle.highlightedTitle }} />
                      <p className="text-xs text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: principle.highlightedContent }} />
                      <p className="text-xs text-primary mt-2">{principle.bookTitle}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "shorts" && (
        <div className="px-5 pb-8" data-testid="section-shorts-tab">
          {booksWithShorts.length > 0 && (
            <div className="flex items-center gap-2.5 mb-5 overflow-x-auto pb-2 scrollbar-hide" data-testid="shorts-book-filter">
              <button
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  shortsBookFilter === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground"
                }`}
                onClick={() => setShortsBookFilter(null)}
                data-testid="shorts-filter-all"
              >
                All Books
              </button>
              {booksWithShorts.map((book) => (
                <button
                  key={book.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                    shortsBookFilter === book.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 text-muted-foreground"
                  }`}
                  onClick={() => setShortsBookFilter(shortsBookFilter === book.id ? null : book.id)}
                  data-testid={`shorts-filter-book-${book.id}`}
                >
                  {book.coverImage && (
                    <img src={book.coverImage} alt="" className="w-4 h-5 rounded-[2px] object-cover" />
                  )}
                  <span className="max-w-[120px] truncate">{book.title}</span>
                </button>
              ))}
            </div>
          )}

          {shortsBookFilter && (
            <p className="text-xs text-muted-foreground mb-3" data-testid="text-shorts-filter-label">
              Showing {filteredShorts.length} short{filteredShorts.length !== 1 ? "s" : ""}
              {booksWithShorts.find(b => b.id === shortsBookFilter)
                ? ` from ${booksWithShorts.find(b => b.id === shortsBookFilter)!.title}`
                : ""}
            </p>
          )}

          {shortsLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : filteredShorts.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-medium">No shorts yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                {shortsBookFilter ? "Try selecting a different book" : "Check back soon for bite-sized insights"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3" data-testid="shorts-grid">
              {filteredShorts.map((short, i) => (
                <ShortCard
                  key={short.id}
                  short={short}
                  fluid
                  onClick={() => {
                    setShortsPlayerIndex(i);
                    setShortsPlayerOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {shortsPlayerOpen && filteredShorts.length > 0 && (
        <ShortsPlayer
          shorts={filteredShorts}
          initialIndex={shortsPlayerIndex}
          onClose={() => setShortsPlayerOpen(false)}
        />
      )}
    </div>
  );
}
