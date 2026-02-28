import { Badge } from "@/components/ui/badge";
import { Smartphone } from "lucide-react";

interface MobilePreviewProps {
  bookTitle?: string;
  bookAuthor?: string;
  coreThesis?: string;
  activeSection: string;
  sectionData?: any;
}

export function MobilePreview({ bookTitle, bookAuthor, coreThesis, activeSection, sectionData }: MobilePreviewProps) {
  return (
    <div className="h-full flex flex-col bg-[#F5F0EB] border-l border-border" data-testid="mobile-preview">
      <div className="p-3 border-b border-border bg-[#F5F0EB]">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold">Live Preview</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
        <div className="w-[320px] bg-[#F5F0EB] rounded-[2rem] shadow-xl border-[6px] border-[#FFFFFF] overflow-hidden" data-testid="phone-frame">
          <div className="h-6 bg-[#FFFFFF] flex items-center justify-center">
            <div className="w-16 h-3 bg-white rounded-full" />
          </div>

          <div className="min-h-[560px] bg-background overflow-y-auto">
            {activeSection === "setup" || activeSection === "thesis" ? (
              <PreviewBookDetail title={bookTitle} author={bookAuthor} thesis={coreThesis} />
            ) : (
              <PreviewSection section={activeSection} data={sectionData} />
            )}
          </div>

          <div className="h-5 bg-[#FFFFFF] flex items-center justify-center">
            <div className="w-10 h-1 bg-[#333] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewBookDetail({ title, author, thesis }: { title?: string; author?: string; thesis?: string }) {
  return (
    <div className="p-4">
      <div className="h-32 bg-gradient-to-br from-primary/30 to-primary/5 rounded-xl mb-4" />
      <h2 className="font-serif text-lg font-bold mb-1">{title || "Book Title"}</h2>
      <p className="text-xs text-muted-foreground mb-3">by {author || "Author"}</p>
      {thesis && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
          <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Core Thesis</p>
          <p className="text-xs leading-relaxed">{thesis}</p>
        </div>
      )}
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Blueprint</p>
      <div className="grid grid-cols-2 gap-2">
        {["Chapters", "Models", "Principles", "Mistakes", "Infographics", "Exercises", "Actions"].map((label) => (
          <div key={label} className="p-2 bg-muted/30 rounded-lg text-center">
            <p className="text-[10px] font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSection({ section, data }: { section: string; data?: any }) {
  const renderContent = (item: any) => {
    if (!item.content) return null;
    if (typeof item.content === "string") {
      return <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{item.content}</p>;
    }
    if (typeof item.content === "object") {
      const text = item.content.prompt || item.content.question || JSON.stringify(item.content).slice(0, 100);
      return <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{text}</p>;
    }
    return null;
  };

  return (
    <div className="p-4">
      <Badge variant="secondary" className="text-[10px] mb-3">{section}</Badge>
      <div className="space-y-3">
        {data && Array.isArray(data) ? (
          data.slice(0, 5).map((item: any, i: number) => (
            <div key={i} className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs font-medium">{item.title || item.chapterTitle || item.mistake || item.text || `Item ${i + 1}`}</p>
              {renderContent(item)}
              {item.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
              {item.correction && <p className="text-[10px] text-emerald-600 mt-1 line-clamp-2">Fix: {item.correction}</p>}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">Add content to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
