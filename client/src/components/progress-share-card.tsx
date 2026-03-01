import { useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Download, BookOpen, Flame, Brain, Trophy, Check, Copy, X, Award, Zap } from "lucide-react";
import { SiX, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import featherLogoPath from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

interface UserStats {
  booksStarted: number;
  booksCompleted: number;
  categoriesExplored: number;
  totalTimeInvested: number;
  avgTimePerBook: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutesListened: number;
  journalEntries: number;
  weeklyActivity: { day: string; date: string; activities: number }[];
}

type ShareTrigger = 
  | { type: "progress" }
  | { type: "book-completion"; bookId: string; bookTitle: string }
  | { type: "streak-milestone"; milestone: number };

const STREAK_MILESTONES = [7, 30, 100];

function getShareText(trigger: ShareTrigger, stats: UserStats): string {
  switch (trigger.type) {
    case "book-completion":
      return `I just finished "${trigger.bookTitle}" on MindPrism! ${stats.booksCompleted} books completed so far.`;
    case "streak-milestone":
      return `${trigger.milestone}-day learning streak on MindPrism! Consistency is key.`;
    case "progress":
    default:
      return `My MindPrism journey: ${stats.booksStarted} books explored, ${stats.currentStreak}-day streak!`;
  }
}

function getCardTitle(trigger: ShareTrigger): string {
  switch (trigger.type) {
    case "book-completion":
      return "Book Completed!";
    case "streak-milestone":
      return `${trigger.milestone}-Day Streak!`;
    case "progress":
    default:
      return "My Learning Journey";
  }
}

export function ProgressShareCard({ trigger }: { trigger?: ShareTrigger }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const activeTrigger: ShareTrigger = trigger ?? { type: "progress" };

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const generateCard = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || !stats) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const w = 600;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1E40AF");
    grad.addColorStop(0.4, "#2563EB");
    grad.addColorStop(0.7, "#1D4ED8");
    grad.addColorStop(1, "#1E3A5F");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(212, 184, 214, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    const cornerSize = 24;
    ctx.strokeStyle = "rgba(212, 184, 214, 0.5)";
    ctx.lineWidth = 2;
    ([[20, 20, 1, 1], [w - 20, 20, -1, 1], [20, h - 20, 1, -1], [w - 20, h - 20, -1, -1]] as [number, number, number, number][]).forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cornerSize, y);
      ctx.stroke();
    });

    try {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = reject;
        logo.src = featherLogoPath;
      });
      ctx.globalAlpha = 0.9;
      ctx.drawImage(logo, 40, 34, 32, 32);
      ctx.globalAlpha = 1;
    } catch {}

    ctx.fillStyle = "#D4B8D6";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText("MindPrism", 80, 56);

    const cardTitle = getCardTitle(activeTrigger);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.fillText(cardTitle, 40, 105);

    if (activeTrigger.type === "book-completion") {
      ctx.fillStyle = "rgba(212, 184, 214, 0.7)";
      ctx.font = "14px Inter, sans-serif";
      const titleText = `"${activeTrigger.bookTitle}"`;
      ctx.fillText(titleText.length > 50 ? titleText.substring(0, 47) + "..." : titleText, 40, 128);
    }

    const userName = user?.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : "Explorer";
    ctx.fillStyle = "rgba(212, 184, 214, 0.5)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(`@${userName}`, w - 40 - ctx.measureText(`@${userName}`).width, 56);

    const accentGrad = ctx.createLinearGradient(40, 135, 200, 135);
    accentGrad.addColorStop(0, "#D4B8D6");
    accentGrad.addColorStop(1, "rgba(212, 184, 214, 0)");
    ctx.fillStyle = accentGrad;
    ctx.fillRect(40, activeTrigger.type === "book-completion" ? 140 : 118, 160, 2);

    const statItems = [
      { label: "Books Read", value: stats.booksStarted.toString(), icon: "book" },
      { label: "Day Streak", value: stats.currentStreak.toString(), icon: "flame" },
      { label: "Domains", value: stats.categoriesExplored.toString(), icon: "brain" },
      { label: "Minutes", value: stats.totalTimeInvested.toString(), icon: "time" },
    ];

    const startY = activeTrigger.type === "book-completion" ? 165 : 148;

    statItems.forEach((stat, i) => {
      const x = 40 + (i % 2) * 270;
      const y = startY + Math.floor(i / 2) * 85;

      const cardGrad = ctx.createLinearGradient(x, y, x + 245, y + 70);
      cardGrad.addColorStop(0, "rgba(212, 184, 214, 0.12)");
      cardGrad.addColorStop(1, "rgba(212, 184, 214, 0.04)");
      ctx.fillStyle = cardGrad;
      roundRect(ctx, x, y, 245, 70, 10);
      ctx.fill();

      ctx.strokeStyle = "rgba(212, 184, 214, 0.15)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 245, 70, 10);
      ctx.stroke();

      ctx.fillStyle = "#D4B8D6";
      ctx.font = "18px sans-serif";
      const icons: Record<string, string> = { book: "\u{1F4DA}", flame: "\u{1F525}", brain: "\u{1F9E0}", time: "\u{23F1}" };
      ctx.fillText(icons[stat.icon] || "", x + 16, y + 40);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText(stat.value, x + 50, y + 36);

      ctx.fillStyle = "rgba(212, 184, 214, 0.6)";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText(stat.label, x + 50, y + 56);
    });

    ctx.fillStyle = "rgba(212, 184, 214, 0.3)";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("mindprism.io", w - 100, h - 32);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, [stats, user, activeTrigger]);

  const handleGenerateAndShare = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generateCard();
      if (!blob) return;

      setGeneratedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      const file = new File([blob], "mindprism-progress.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: "My MindPrism Journey",
            text: getShareText(activeTrigger, stats!),
            files: [file],
          });
          return;
        } catch {}
      }

      setShowShareDialog(true);
    } finally {
      setGenerating(false);
    }
  }, [generateCard, activeTrigger, stats]);

  const handleDownload = useCallback(() => {
    if (!generatedBlob) return;
    const url = URL.createObjectURL(generatedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindprism-progress.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Image saved", description: "Share card downloaded successfully." });
  }, [generatedBlob, toast]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = "https://mindprism.io";
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    }
  }, [toast]);

  const handleSocialShare = useCallback((platform: string) => {
    if (!stats) return;
    const text = encodeURIComponent(getShareText(activeTrigger, stats));
    const url = encodeURIComponent("https://mindprism.io");

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%0A${url}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  }, [activeTrigger, stats]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!stats) return null;

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        variant="outline"
        className="w-full gap-2 border-primary/30 text-primary mt-4"
        onClick={handleGenerateAndShare}
        disabled={generating}
        data-testid="button-share-progress"
      >
        {generating ? (
          <>
            <Share2 className="w-4 h-4 animate-pulse" />
            Generating...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Share My Progress
          </>
        )}
      </Button>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm" data-testid="share-dialog">
          <DialogHeader>
            <DialogTitle>Share Your Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && (
              <div className="rounded-md overflow-hidden border border-border">
                <img
                  src={previewUrl}
                  alt="Share card preview"
                  className="w-full"
                  data-testid="img-share-preview"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDownload}
                data-testid="button-download-card"
              >
                <Download className="w-4 h-4" />
                Save Image
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCopyLink}
                data-testid="button-copy-share-link"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Share on</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("twitter")}
                  aria-label="Share on Twitter"
                  data-testid="button-share-twitter"
                >
                  <SiX className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("linkedin")}
                  aria-label="Share on LinkedIn"
                  data-testid="button-share-linkedin"
                >
                  <SiLinkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare("whatsapp")}
                  aria-label="Share on WhatsApp"
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ShareMilestonePrompt({ trigger, onDismiss }: { trigger: ShareTrigger; onDismiss: () => void }) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const handleShare = useCallback(async () => {
    if (!stats) return;
    setGenerating(true);
    try {
      const shareText = getShareText(trigger, stats);

      if (navigator.share) {
        try {
          await navigator.share({
            title: "My MindPrism Achievement",
            text: shareText,
            url: "https://mindprism.io",
          });
          onDismiss();
          return;
        } catch {}
      }

      try {
        await navigator.clipboard.writeText(`${shareText}\nhttps://mindprism.io`);
        toast({ title: "Copied to clipboard", description: "Share text copied!" });
      } catch {
        toast({ title: "Share text", description: shareText });
      }
      onDismiss();
    } finally {
      setGenerating(false);
    }
  }, [stats, trigger, onDismiss, toast]);

  if (!stats) return null;

  const icon = trigger.type === "book-completion" ? (
    <BookOpen className="w-5 h-5" />
  ) : (
    <Flame className="w-5 h-5" />
  );

  const title = trigger.type === "book-completion"
    ? "Book Completed!"
    : `${(trigger as any).milestone}-Day Streak!`;

  const description = trigger.type === "book-completion"
    ? `You finished "${(trigger as any).bookTitle}". Share your achievement!`
    : `You've maintained a ${(trigger as any).milestone}-day learning streak. Amazing!`;

  return (
    <Card className="p-4 border-primary/20" data-testid="card-milestone-prompt">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm" data-testid="text-milestone-title">{title}</h3>
            <Badge variant="secondary" className="text-[10px]">
              <Award className="w-3 h-3 mr-1" />
              Achievement
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-milestone-description">{description}</p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="gap-1"
              onClick={handleShare}
              disabled={generating}
              data-testid="button-share-milestone"
            >
              <Share2 className="w-3.5 h-3.5" />
              {generating ? "Sharing..." : "Share"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              data-testid="button-dismiss-milestone"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function useShareTriggers(stats: UserStats | undefined, streakData: { currentStreak: number } | undefined) {
  const [pendingTrigger, setPendingTrigger] = useState<ShareTrigger | null>(null);
  const [dismissedMilestones, setDismissedMilestones] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("mindprism-dismissed-milestones");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!streakData) return;

    const currentStreak = streakData.currentStreak;
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone) {
        const key = `streak-${milestone}`;
        if (!dismissedMilestones.has(key)) {
          setPendingTrigger({ type: "streak-milestone", milestone });
          break;
        }
      }
    }
  }, [streakData, dismissedMilestones]);

  const triggerBookCompletion = useCallback((bookId: string, bookTitle: string) => {
    const key = `book-${bookId}`;
    if (!dismissedMilestones.has(key)) {
      setPendingTrigger({ type: "book-completion", bookId, bookTitle });
    }
  }, [dismissedMilestones]);

  const dismissTrigger = useCallback(() => {
    if (!pendingTrigger) return;
    const key = pendingTrigger.type === "book-completion"
      ? `book-${(pendingTrigger as any).bookId}`
      : pendingTrigger.type === "streak-milestone"
      ? `streak-${(pendingTrigger as any).milestone}`
      : "progress";

    const updated = new Set(dismissedMilestones);
    updated.add(key);
    setDismissedMilestones(updated);
    try {
      localStorage.setItem("mindprism-dismissed-milestones", JSON.stringify(Array.from(updated)));
    } catch {}
    setPendingTrigger(null);
  }, [pendingTrigger, dismissedMilestones]);

  return { pendingTrigger, triggerBookCompletion, dismissTrigger };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
