import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center gap-2 py-2 px-4 bg-white/95 border-b border-primary/20"
      data-testid="offline-banner"
    >
      <WifiOff className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs text-primary font-medium">You're offline</span>
    </div>
  );
}
