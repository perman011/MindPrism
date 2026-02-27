import { Home, Search, Headphones, User } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { path: "/", icon: Home, label: "Home", testId: "nav-home" },
  { path: "/discover", icon: Search, label: "Discover", testId: "nav-discover" },
  { path: "/audio", icon: Headphones, label: "Audio", testId: "nav-audio" },
  { path: "/vault", icon: User, label: "My Vault", testId: "nav-vault" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/40 safe-area-bottom" data-testid="bottom-nav">
      <div className="flex items-center justify-around h-[4.25rem] max-w-2xl mx-auto px-4">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-md transition-colors ${
                active ? "text-primary" : "text-muted-foreground/60"
              }`}
              data-testid={item.testId}
            >
              <item.icon className={`w-[22px] h-[22px] transition-all ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[11px] leading-tight transition-all ${active ? "font-bold text-primary" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
