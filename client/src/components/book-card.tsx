import type { Book } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Headphones } from "lucide-react";
import { Link } from "wouter";

interface BookCardProps {
  book: Book;
  compact?: boolean;
  audioMode?: boolean;
}

export function BookCard({ book, compact, audioMode }: BookCardProps) {
  const content = (
    <Card
      className="group cursor-pointer hover-elevate overflow-hidden"
      data-testid={`card-book-${book.id}`}
    >
      <div className={`relative ${compact ? "aspect-[3/4]" : "aspect-[4/3]"} overflow-hidden rounded-t-md`}>
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
        {book.featured && !compact && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="text-[10px]">Featured</Badge>
          </div>
        )}
        {audioMode && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className={compact ? "p-2.5" : "p-4"}>
        <h3 className={`font-semibold line-clamp-1 ${compact ? "text-xs mb-0.5" : "text-base mb-1"}`} data-testid={`text-book-title-${book.id}`}>
          {book.title}
        </h3>
        <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-sm mb-3"}`}>{book.author}</p>
        {!compact && (
          <>
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
          </>
        )}
      </div>
    </Card>
  );

  if (audioMode) return content;

  return <Link href={`/book/${book.id}`}>{content}</Link>;
}
