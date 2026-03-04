import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChapterSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, BookOpen, Clock, Music, Play, Pause, Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Minus, Highlighter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/admin/FileUpload";
import { normalizeMediaUrl } from "@/lib/media-url";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

function calculateReadTime(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractCardsFromHtml(html: string): { text: string }[] {
  if (!html) return [];
  const text = html.replace(/<[^>]*>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const paragraphs = text.split("\n\n").map(p => p.trim()).filter(p => p.length > 10);
  if (paragraphs.length === 0) return [{ text: text.substring(0, 200) || "..." }];
  return paragraphs.map(p => ({ text: p.substring(0, 300) }));
}

interface TipTapEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  chapterId: string;
}

function TipTapEditor({ content, onUpdate, chapterId }: TipTapEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isLocalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: "Start writing your chapter summary here...\n\nUse the toolbar to format text. Highlight key insights with the marker tool — they'll appear as styled cards in the reader.",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      isLocalUpdate.current = true;
      const html = editor.getHTML();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(html);
        isLocalUpdate.current = false;
      }, 800);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && !isLocalUpdate.current && !editor.isFocused) {
      const currentHtml = editor.getHTML();
      if (content && content !== currentHtml) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-[#1A1225] dark:border-[#2A1E35]" data-testid={`tiptap-editor-${chapterId}`}>
      <div className="flex items-center gap-0.5 p-2 border-b bg-muted/30 dark:bg-[#0F0A14] dark:border-[#2A1E35] flex-wrap">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-testid="toolbar-bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-testid="toolbar-italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-testid="toolbar-h2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          data-testid="toolbar-h3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-testid="toolbar-quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-testid="toolbar-ul"
        >
          <List className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-testid="toolbar-ol"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant={editor.isActive("highlight") ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Mark as Key Insight"
          data-testid="toolbar-highlight"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          data-testid="toolbar-hr"
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ChapterAudioPreview({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const normalizedAudioUrl = normalizeMediaUrl(audioUrl) ?? audioUrl;
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-muted/30 rounded-lg" data-testid="audio-preview">
      <audio
        ref={audioRef}
        src={normalizedAudioUrl}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(Math.round(audioRef.current.duration));
        }}
        onEnded={() => setPlaying(false)}
      />
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={togglePlay}>
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </Button>
      <span className="text-xs text-muted-foreground">
        {duration > 0 ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}` : "Loading..."}
      </span>
    </div>
  );
}

interface ChapterEditorProps {
  bookId: string;
  chapters: ChapterSummary[];
}

export function ChapterEditor({ bookId, chapters }: ChapterEditorProps) {
  const { toast } = useToast();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [chapterDrafts, setChapterDrafts] = useState<Record<string, Partial<ChapterSummary>>>({});
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const toggleExpanded = useCallback((id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/books/${bookId}/chapters`, {
        chapterNumber: chapters.length + 1,
        chapterTitle: `Chapter ${chapters.length + 1}`,
        cards: [{ text: "Enter the first insight..." }],
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
      if (data?.id) setExpandedChapters(prev => new Set(prev).add(data.id));
    },
    onError: () => toast({ title: "Error", description: "Failed to create chapter", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/chapters/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
    },
  });

  const queueChapterSave = useCallback((id: string, data: any, delay = 450) => {
    const existing = saveTimersRef.current[id];
    if (existing) clearTimeout(existing);
    saveTimersRef.current[id] = setTimeout(() => {
      updateMutation.mutate({ id, data });
    }, delay);
  }, [updateMutation]);

  useEffect(() => {
    setChapterDrafts((prev) => {
      const next = { ...prev };
      for (const chapter of chapters) {
        const draft = next[chapter.id] || {};
        next[chapter.id] = {
          chapterTitle: draft.chapterTitle ?? chapter.chapterTitle,
          subtitle: draft.subtitle ?? (chapter.subtitle || ""),
          audioUrl: draft.audioUrl ?? (chapter.audioUrl || ""),
          content: draft.content ?? (chapter.content || ""),
        };
      }
      return next;
    });
  }, [chapters]);

  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/chapters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "chapter-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "content-counts"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete chapter", variant: "destructive" }),
  });

  const handleContentUpdate = useCallback((chapterId: string, html: string) => {
    setChapterDrafts((prev) => ({ ...prev, [chapterId]: { ...prev[chapterId], content: html } }));
    const readTime = calculateReadTime(html);
    const cards = extractCardsFromHtml(html);
    updateMutation.mutate({
      id: chapterId,
      data: { content: html, estimatedReadTime: readTime, cards },
    });
  }, [updateMutation]);

  return (
    <section id="section-chapters" data-testid="editor-chapters">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-700" />
          Chapter Summaries
        </h2>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5" data-testid="button-add-chapter">
          <Plus className="w-3.5 h-3.5" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const readTime = chapter.estimatedReadTime || (chapter.content ? calculateReadTime(chapter.content) : 0);

          return (
            <Card key={chapter.id} className="p-4 group relative" data-testid={`chapter-block-${chapter.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Badge variant="secondary" className="text-[10px]">Ch. {chapter.chapterNumber}</Badge>
                <Input
                  value={chapterDrafts[chapter.id]?.chapterTitle ?? chapter.chapterTitle}
                  onChange={(e) => {
                    const value = e.target.value;
                    setChapterDrafts((prev) => ({ ...prev, [chapter.id]: { ...prev[chapter.id], chapterTitle: value } }));
                    queueChapterSave(chapter.id, { chapterTitle: value });
                  }}
                  className="flex-1 h-8 text-sm font-semibold"
                  data-testid={`input-chapter-title-${chapter.id}`}
                />
                {readTime > 0 && (
                  <Badge variant="outline" className="text-[9px] gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {readTime} min
                  </Badge>
                )}
                {chapter.audioUrl && (
                  <Badge variant="outline" className="text-[9px] gap-1 shrink-0 text-green-600 border-green-300">
                    <Music className="w-3 h-3" />
                    Audio
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2"
                  onClick={() => toggleExpanded(chapter.id)}
                  data-testid={`button-toggle-chapter-${chapter.id}`}
                >
                  {isExpanded ? "Collapse" : "Edit"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteMutation.mutate(chapter.id)}
                  data-testid={`button-delete-chapter-${chapter.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {!isExpanded && chapter.content && (
                <p className="text-xs text-muted-foreground line-clamp-2 ml-7">
                  {chapter.content.replace(/<[^>]*>/g, " ").substring(0, 150)}...
                </p>
              )}

              {isExpanded && (
                <div className="space-y-4 mt-4 ml-7">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Subtitle</label>
                    <Input
                      value={chapterDrafts[chapter.id]?.subtitle ?? (chapter.subtitle || "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setChapterDrafts((prev) => ({ ...prev, [chapter.id]: { ...prev[chapter.id], subtitle: value } }));
                        queueChapterSave(chapter.id, { subtitle: value });
                      }}
                      placeholder="Brief chapter description (1-2 sentences)"
                      className="h-8 text-sm"
                      data-testid={`input-chapter-subtitle-${chapter.id}`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Chapter Content</label>
                    <TipTapEditor
                      content={chapterDrafts[chapter.id]?.content ?? (chapter.content || "")}
                      onUpdate={(html) => handleContentUpdate(chapter.id, html)}
                      chapterId={chapter.id}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Chapter Audio (MP3)</label>
                    <FileUpload
                      accept="audio"
                      value={chapterDrafts[chapter.id]?.audioUrl ?? (chapter.audioUrl || "")}
                      onChange={(url) => {
                        setChapterDrafts((prev) => ({ ...prev, [chapter.id]: { ...prev[chapter.id], audioUrl: url } }));
                        updateMutation.mutate({ id: chapter.id, data: { audioUrl: url } });
                      }}
                      maxSize={50}
                      placeholder="Upload chapter narration MP3"
                    />
                    {(chapterDrafts[chapter.id]?.audioUrl ?? chapter.audioUrl) && (
                      <ChapterAudioPreview audioUrl={(chapterDrafts[chapter.id]?.audioUrl ?? chapter.audioUrl)!} />
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
