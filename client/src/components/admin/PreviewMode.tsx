import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Tablet, Smartphone, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Book } from "@shared/schema";

interface PreviewModeProps {
  book: Book;
  onClose: () => void;
}

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1440 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 375 },
] as const;

function PreviewBookDetail({ book }: { book: Book }) {
  return (
    <div className="min-h-full bg-[#F5F0EB] dark:bg-[#0F0A14]">
      <div className="relative">
        <div className="h-56 bg-gradient-to-b from-[#341539] via-[#2A1130] to-transparent" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="flex gap-4 items-end">
            {book.coverImage && (
              <div className="w-28 h-40 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-muted">
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-white pb-2">
              <h1 className="text-2xl font-serif font-bold">{book.title}</h1>
              <p className="text-sm opacity-80">by {book.author}</p>
              <div className="flex gap-2 mt-2">
                {book.readTime && (
                  <Badge className="bg-white/20 text-white text-xs">{book.readTime} min read</Badge>
                )}
                {book.listenTime && (
                  <Badge className="bg-white/20 text-white text-xs">{book.listenTime} min listen</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {book.coreThesis && (
          <div className="bg-white dark:bg-[#1A1225] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-primary-lighter mb-2">Core Thesis</h3>
            <p className="text-sm leading-relaxed">{book.coreThesis}</p>
          </div>
        )}

        {book.description && (
          <div className="bg-white dark:bg-[#1A1225] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About This Book</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{book.description}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button className="flex-1 bg-[#341539] text-white rounded-full py-3 text-sm font-semibold">
            Start Interactive Journey
          </button>
          <button className="flex-1 border border-[#341539] text-[#341539] dark:text-primary-lighter dark:border-primary-lighter rounded-full py-3 text-sm font-semibold">
            Play Audio Summary
          </button>
        </div>

        {book.affiliateUrl && (
          <button className="w-full bg-[#C4A35A] text-white rounded-full py-3 text-sm font-semibold">
            Buy This Book
          </button>
        )}

        <div className="bg-white dark:bg-[#1A1225] rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">What You'll Learn</h3>
          <div className="grid grid-cols-2 gap-3">
            {["Chapters", "Mental Models", "Principles", "Exercises", "Mistakes", "Actions"].map((section) => (
              <div key={section} className="bg-muted/50 dark:bg-[#261530] rounded-lg p-3 text-center">
                <p className="text-xs font-medium">{section}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewMode({ book, onClose }: PreviewModeProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("mobile");
  const currentViewport = VIEWPORTS.find(v => v.id === viewport)!;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" data-testid="preview-mode">
      <div className="h-12 border-b bg-card dark:bg-[#1A1225] dark:border-[#2A1E35] flex items-center px-4 gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="gap-1.5"
          data-testid="button-exit-preview"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Editor
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-muted dark:bg-[#261530] rounded-lg p-0.5">
          {VIEWPORTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewport(id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewport === id
                  ? "bg-background dark:bg-[#1A1225] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`viewport-${id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            book.status === "published" ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"
          )}
        >
          {book.status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-xs text-amber-700 dark:text-amber-400">
          You are viewing a preview. This content is {book.status === "published" ? "live" : "not live yet"}.
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-muted/30 dark:bg-[#0A0510] flex justify-center py-8">
        <div
          className={cn(
            "bg-background shadow-2xl overflow-auto transition-all duration-300",
            viewport === "mobile" && "rounded-[2rem] border-[6px] border-gray-800 dark:border-gray-600 max-h-[812px]",
            viewport === "tablet" && "rounded-xl border-2 border-gray-300 dark:border-gray-700 max-h-[1024px]",
            viewport === "desktop" && "rounded-lg border border-gray-200 dark:border-gray-800 min-h-[600px]"
          )}
          style={{ width: `${currentViewport.width}px` }}
          data-testid="preview-viewport"
        >
          <PreviewBookDetail book={book} />
        </div>
      </div>
    </div>
  );
}
