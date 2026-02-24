import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BookSetupEditorProps {
  title: string;
  author: string;
  description: string;
  coreThesis: string;
  coverImage: string;
  audioUrl: string;
  readTime: number;
  listenTime: number;
  onChange: (field: string, value: string | number) => void;
}

export function BookSetupEditor({
  title, author, description, coreThesis, coverImage, audioUrl,
  readTime, listenTime, onChange,
}: BookSetupEditorProps) {
  const thesisLength = coreThesis?.length || 0;
  const thesisMax = 200;

  return (
    <div className="space-y-8" data-testid="editor-book-setup">
      <section id="section-setup">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Book Setup</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" className="text-xs font-semibold">Book Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Enter book title..."
              data-testid="input-book-title"
            />
          </div>
          <div>
            <Label htmlFor="author" className="text-xs font-semibold">Author Name</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => onChange("author", e.target.value)}
              placeholder="Enter author name..."
              data-testid="input-book-author"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Brief book description..."
            rows={2}
            data-testid="input-book-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="coverImage" className="text-xs font-semibold">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => onChange("coverImage", e.target.value)}
              placeholder="https://..."
              data-testid="input-cover-image"
            />
          </div>
          <div>
            <Label htmlFor="audioUrl" className="text-xs font-semibold">Audio URL (MP3)</Label>
            <Input
              id="audioUrl"
              value={audioUrl}
              onChange={(e) => onChange("audioUrl", e.target.value)}
              placeholder="https://..."
              data-testid="input-audio-url"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="readTime" className="text-xs font-semibold">Read Time (min)</Label>
            <Input
              id="readTime"
              type="number"
              value={readTime}
              onChange={(e) => onChange("readTime", parseInt(e.target.value) || 0)}
              data-testid="input-read-time"
            />
          </div>
          <div>
            <Label htmlFor="listenTime" className="text-xs font-semibold">Listen Time (min)</Label>
            <Input
              id="listenTime"
              type="number"
              value={listenTime}
              onChange={(e) => onChange("listenTime", parseInt(e.target.value) || 0)}
              data-testid="input-listen-time"
            />
          </div>
        </div>
      </section>

      <section id="section-thesis">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Core Thesis</h2>
        <div className="relative">
          <Textarea
            value={coreThesis}
            onChange={(e) => {
              if (e.target.value.length <= thesisMax) {
                onChange("coreThesis", e.target.value);
              }
            }}
            placeholder="The single most important idea of this book in 1-2 sentences..."
            rows={3}
            className="pr-16"
            data-testid="input-core-thesis"
          />
          <span className={`absolute bottom-2 right-3 text-[10px] font-mono ${
            thesisLength >= thesisMax ? "text-destructive font-bold" : thesisLength > 160 ? "text-amber-500" : "text-muted-foreground"
          }`}>
            {thesisLength}/{thesisMax}
          </span>
        </div>
      </section>
    </div>
  );
}
