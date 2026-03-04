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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0F0A14] border-t border-[#E5E7EB] dark:border-[#2A1E35] safe-area-bottom" data-testid="bottom-nav" aria-label="Main navigation">
      <div className="flex items-center justify-around h-14 max-w-2xl mx-auto px-4" role="tablist">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              role="tab"
              aria-selected={active}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[2.75rem] rounded-md transition-all duration-150 active:scale-95 touch-manipulation ${
                active ? "text-[#3B82F6]" : "text-[#9CA3AF]"
              }`}
              data-testid={item.testId}
            >
              <item.icon className={`w-6 h-6 transition-all ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} aria-hidden="true" />
              <span className={`text-[10px] leading-tight transition-all ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
