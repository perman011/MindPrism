import type { Book } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Headphones } from "lucide-react";
import { Link } from "wouter";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card
        className="group cursor-pointer hover-elevate"
        data-testid={`card-book-${book.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-md">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-primary/40">{book.title[0]}</span>
            </div>
          )}
          {book.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="text-xs">Featured</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-1" data-testid={`text-book-title-${book.id}`}>
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{book.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {book.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {book.listenTime} min listen
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
