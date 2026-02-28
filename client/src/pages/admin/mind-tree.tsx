import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Target, BookOpen, Brain, Lightbulb, AlertTriangle,
  BarChart3, Dumbbell, ListChecks, ChevronDown, ChevronRight,
} from "lucide-react";

interface ContentCounts {
  chapterSummaries: number;
  mentalModels: number;
  principles: number;
  commonMistakes: number;
  exercises: number;
  actionItems: number;
  infographics: number;
}

interface TreeItem {
  id: string;
  label: string;
  icon: any;
  section: string;
  children?: { id: string; label: string }[];
}

interface MindTreeProps {
  counts: ContentCounts | undefined;
  activeSection: string;
  onSectionClick: (section: string) => void;
  bookTitle?: string;
}

export function MindTree({ counts, activeSection, onSectionClick, bookTitle }: MindTreeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["chapters", "principles"]));

  const toggleExpand = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  const sections: TreeItem[] = [
    { id: "setup", label: "Book Setup", icon: Target, section: "setup" },
    { id: "thesis", label: "Core Thesis", icon: Target, section: "thesis" },
    { id: "chapters", label: "Chapter Summaries", icon: BookOpen, section: "chapters" },
    { id: "mental-models", label: "Mental Models", icon: Brain, section: "mental-models" },
    { id: "principles", label: "Principles & Stories", icon: Lightbulb, section: "principles" },
    { id: "common-mistakes", label: "Common Mistakes", icon: AlertTriangle, section: "common-mistakes" },
    { id: "infographics", label: "Infographics", icon: BarChart3, section: "infographics" },
    { id: "exercises", label: "Exercises", icon: Dumbbell, section: "exercises" },
    { id: "action-items", label: "Action Items", icon: ListChecks, section: "action-items" },
  ];

  const getCount = (sectionId: string): number => {
    if (!counts) return 0;
    const map: Record<string, number> = {
      chapters: counts.chapterSummaries,
      "mental-models": counts.mentalModels,
      principles: counts.principles,
      "common-mistakes": counts.commonMistakes,
      infographics: counts.infographics,
      exercises: counts.exercises,
      "action-items": counts.actionItems,
    };
    return map[sectionId] ?? 0;
  };

  return (
    <div className="h-full flex flex-col bg-[#0F0F1A] border-r border-border" data-testid="mind-tree">
      <div className="p-4 border-b">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Mind Tree</p>
        {bookTitle && (
          <p className="text-sm font-semibold mt-1 truncate">{bookTitle}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((item) => {
          const Icon = item.icon;
          const count = getCount(item.id);
          const isActive = activeSection === item.section;
          const hasCount = count > 0;

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50 text-foreground"
                }`}
                onClick={() => onSectionClick(item.section)}
                data-testid={`tree-node-${item.id}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {hasCount && (
                  <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                    {count}
                  </Badge>
                )}
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
