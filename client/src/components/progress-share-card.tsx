import { useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Share2, Download, BookOpen, Flame, Brain, Trophy, Check } from "lucide-react";
import featherLogoPath from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

interface UserStats {
  booksStarted: number;
  booksCompleted: number;
  principlesMastered: number;
  exercisesDone: number;
  categoriesExplored: number;
  totalTimeInvested: number;
  avgTimePerBook: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutesListened: number;
  totalExercisesCompleted: number;
  journalEntries: number;
  weeklyActivity: { day: string; date: string; activities: number }[];
}

export function ProgressShareCard() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);

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
    grad.addColorStop(0, "#0F0F1A");
    grad.addColorStop(0.5, "#1A1A2E");
    grad.addColorStop(1, "#0F0F1A");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(167, 139, 250, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    const cornerSize = 20;
    ctx.strokeStyle = "rgba(167, 139, 250, 0.6)";
    ctx.lineWidth = 2;
    [[16, 16, 1, 1], [w - 16, 16, -1, 1], [16, h - 16, 1, -1], [w - 16, h - 16, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x as number, (y as number) + (dy as number) * cornerSize);
      ctx.lineTo(x as number, y as number);
      ctx.lineTo((x as number) + (dx as number) * cornerSize, y as number);
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
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(logo, 40, 30, 36, 36);
      ctx.globalCompositeOperation = "source-over";
    } catch {}

    ctx.fillStyle = "#A78BFA";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText("MindPrism", 84, 56);

    const userName = user?.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : "Explorer";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Source Serif Pro', Georgia, serif";
    ctx.fillText(`${userName}'s Journey`, 40, 110);

    ctx.fillStyle = "rgba(167, 139, 250, 0.4)";
    ctx.fillRect(40, 125, 100, 2);

    const statItems = [
      { icon: "📚", label: "Books Read", value: stats.booksStarted.toString() },
      { icon: "🔥", label: "Day Streak", value: stats.currentStreak.toString() },
      { icon: "🧠", label: "Principles", value: stats.principlesMastered.toString() },
      { icon: "⏱️", label: "Minutes", value: stats.totalTimeInvested.toString() },
    ];

    statItems.forEach((stat, i) => {
      const x = 40 + (i % 2) * 270;
      const y = 160 + Math.floor(i / 2) * 90;

      const cardGrad = ctx.createLinearGradient(x, y, x + 240, y + 70);
      cardGrad.addColorStop(0, "rgba(167, 139, 250, 0.08)");
      cardGrad.addColorStop(1, "rgba(167, 139, 250, 0.02)");
      ctx.fillStyle = cardGrad;
      roundRect(ctx, x, y, 240, 70, 12);
      ctx.fill();

      ctx.strokeStyle = "rgba(167, 139, 250, 0.15)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 240, 70, 12);
      ctx.stroke();

      ctx.font = "24px sans-serif";
      ctx.fillText(stat.icon, x + 16, y + 38);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText(stat.value, x + 52, y + 34);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(stat.label, x + 52, y + 54);
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("mindprism.io", w - 110, h - 30);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, [stats, user]);

  const handleShareProgress = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generateCard();
      if (!blob) return;

      const file = new File([blob], "mindprism-progress.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: "My MindPrism Journey",
            text: "Check out my learning progress on MindPrism!",
            files: [file],
          });
          setShared(true);
          setTimeout(() => setShared(false), 2000);
          return;
        } catch {}
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mindprism-progress.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } finally {
      setGenerating(false);
    }
  }, [generateCard]);

  if (!stats) return null;

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        variant="outline"
        className="w-full gap-2 border-primary/30 text-primary mt-4"
        onClick={handleShareProgress}
        disabled={generating}
        data-testid="button-share-progress"
      >
        {shared ? (
          <>
            <Check className="w-4 h-4" />
            Saved!
          </>
        ) : generating ? (
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
    </>
  );
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
