import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CHAKRA_MAP, type ChakraType, type Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

const CHAKRA_OPTIONS: { value: ChakraType; label: string; color: string }[] = [
  { value: "crown", label: "Crown — Spiritual Connection", color: CHAKRA_MAP.crown.color },
  { value: "third_eye", label: "Third Eye — Intuition & Insight", color: CHAKRA_MAP.third_eye.color },
  { value: "throat", label: "Throat — Communication", color: CHAKRA_MAP.throat.color },
  { value: "heart", label: "Heart — Love & Compassion", color: CHAKRA_MAP.heart.color },
  { value: "solar_plexus", label: "Solar Plexus — Willpower", color: CHAKRA_MAP.solar_plexus.color },
  { value: "sacral", label: "Sacral — Creativity & Emotion", color: CHAKRA_MAP.sacral.color },
  { value: "root", label: "Root — Survival & Stability", color: CHAKRA_MAP.root.color },
];

interface BookSetupEditorProps {
  title: string;
  author: string;
  description: string;
  coreThesis: string;
  coverImage: string;
  audioUrl: string;
  readTime: number;
  listenTime: number;
  primaryChakra: string;
  secondaryChakra: string;
  categoryId: string;
  onChange: (field: string, value: string | number) => void;
}

export function BookSetupEditor({
  title, author, description, coreThesis, coverImage, audioUrl,
  readTime, listenTime, primaryChakra, secondaryChakra, categoryId, onChange,
}: BookSetupEditorProps) {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
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

        <div className="mt-4">
          <Label className="text-xs font-semibold">Category</Label>
          <Select
            value={categoryId || "none"}
            onValueChange={(val) => onChange("categoryId", val === "none" ? "" : val)}
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="text-xs font-semibold">Primary Chakra</Label>
            <Select
              value={primaryChakra || "none"}
              onValueChange={(val) => onChange("primaryChakra", val === "none" ? "" : val)}
            >
              <SelectTrigger data-testid="select-primary-chakra">
                <SelectValue placeholder="Select chakra..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Chakra</SelectItem>
                {CHAKRA_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold">Secondary Chakra</Label>
            <Select
              value={secondaryChakra || "none"}
              onValueChange={(val) => onChange("secondaryChakra", val === "none" ? "" : val)}
            >
              <SelectTrigger data-testid="select-secondary-chakra">
                <SelectValue placeholder="Select chakra..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {CHAKRA_OPTIONS.filter(opt => opt.value !== primaryChakra).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
