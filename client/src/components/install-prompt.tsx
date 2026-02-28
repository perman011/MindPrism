import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mindprism-install-dismissed";
const VISIT_KEY = "mindprism-visit-count";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const visits = parseInt(sessionStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    sessionStorage.setItem(VISIT_KEY, String(visits));

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissDate = new Date(dismissed);
      const thirtyDaysLater = new Date(dismissDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (new Date() < thirtyDaysLater) return;
    }

    if (visits < 2) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimating(true));
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center p-4 pb-20 transition-opacity duration-300 ${animating ? "opacity-100" : "opacity-0"}`}
      data-testid="install-prompt-overlay"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleDismiss} />
      <div
        className={`relative w-full max-w-sm bg-white border border-border rounded-2xl p-5 shadow-lg transition-all duration-300 ${animating ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
        data-testid="install-prompt-modal"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          data-testid="button-dismiss-install"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={logoImage} alt="MindPrism" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Install MindPrism</h3>
            <p className="text-[11px] text-muted-foreground">For a better experience</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Add MindPrism to your home screen for quick access, offline reading, and push notifications.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-primary text-black font-semibold rounded-full h-10"
            data-testid="button-install-app"
          >
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="rounded-full h-10 px-4"
            data-testid="button-not-now-install"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
