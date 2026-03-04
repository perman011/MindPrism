import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { hasMinRole } from "@shared/models/auth";
import {
  BookOpen,
  Film,
  Users,
  BarChart3,
  ExternalLink,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/admin", label: "Books", icon: BookOpen, exactMatch: true, minRole: "writer" as const },
  { path: "/admin/shorts", label: "Shorts", icon: Film, exactMatch: false, minRole: "writer" as const },
  { path: "/admin/users", label: "Users", icon: Users, exactMatch: false, minRole: "admin" as const },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3, exactMatch: false, minRole: "admin" as const },
  { path: "/admin/media", label: "Media", icon: Upload, exactMatch: false, minRole: "writer" as const },
];

function NavItem({ path, label, icon: Icon, isActive, collapsed }: {
  path: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={path}>
      <button
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary-lighter/15 dark:text-primary-lighter"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
        data-testid={`nav-${label.toLowerCase()}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </button>
    </Link>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const userRole = user?.role || "user";

  const [isAdminRoot] = useRoute("/admin");
  const [isBooks] = useRoute("/admin/books/:id");
  const [isShorts] = useRoute("/admin/shorts");
  const [isShortsEdit] = useRoute("/admin/shorts/:rest*");
  const [isUsers] = useRoute("/admin/users");
  const [isAnalytics] = useRoute("/admin/analytics");
  const [isMedia] = useRoute("/admin/media");

  function isActiveRoute(item: typeof NAV_ITEMS[0]) {
    switch (item.path) {
      case "/admin": return isAdminRoot || isBooks;
      case "/admin/shorts": return isShorts || isShortsEdit;
      case "/admin/users": return isUsers;
      case "/admin/analytics": return isAnalytics;
      case "/admin/media": return isMedia;
      default: return false;
    }
  }

  const filteredNav = NAV_ITEMS.filter(item => hasMinRole(userRole, item.minRole));

  return (
    <div className="min-h-screen flex bg-background" data-testid="admin-layout">
      <aside
        className={cn(
          "sticky top-0 h-screen flex flex-col border-r border-border dark:border-[#2A1E35] bg-card dark:bg-[#1A1225] transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
        data-testid="admin-sidebar"
      >
        <div className={cn(
          "flex items-center h-14 border-b border-border dark:border-[#2A1E35] px-3",
          collapsed ? "justify-center" : "gap-2"
        )}>
          {!collapsed && (
            <Link href="/admin">
              <span className="font-serif text-lg font-bold text-primary dark:text-primary-lighter tracking-tight cursor-pointer">
                mindprism
              </span>
            </Link>
          )}
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted dark:bg-[#2A1E35] px-1.5 py-0.5 rounded">
              Admin
            </span>
          )}
          {collapsed && (
            <Link href="/admin">
              <span className="font-serif text-lg font-bold text-primary dark:text-primary-lighter cursor-pointer">m</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1" data-testid="admin-nav">
          {filteredNav.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isActive={isActiveRoute(item)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-border dark:border-[#2A1E35] space-y-1">
          <Link href="/">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              data-testid="nav-view-app"
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>View App</span>}
            </button>
          </Link>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            data-testid="button-theme-toggle"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!collapsed && <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            data-testid="button-collapse-sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
