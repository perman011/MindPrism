import { SEOHead } from "@/components/SEOHead";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Crown, Shield, ArrowLeft, Search, Star, StarOff, Copy, Check, Link2, ExternalLink, Eye, EyeOff, BookOpen, Clock, TrendingUp, Sun, Moon } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

type EnrichedUser = User & {
  booksStarted: number;
  avgProgress: number;
  lastLogin: string | null;
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 3))}${local[local.length - 1]}@${domain}`;
}

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  super_admin: { label: "Super Admin", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  admin: { label: "Admin", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  editor: { label: "Editor", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-purple-600" },
  writer: { label: "Writer", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  user: { label: "Customer", className: "bg-gray-800 text-gray-400" },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full access. Manage users, roles, billing, and all content.",
  admin: "Manage content and delete books. Cannot manage users or roles.",
  editor: "Create, edit, and publish content. Cannot delete books.",
  writer: "Create and edit content only. Cannot publish or delete.",
  user: "Consumer. Can browse, read, and use exercises.",
};

function UserActivityDetails({ user }: { user: EnrichedUser }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap" data-testid={`activity-details-${user.id}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span data-testid={`text-last-login-${user.id}`}>{formatRelativeTime(user.lastLogin)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Last login</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span data-testid={`text-books-started-${user.id}`}>{user.booksStarted}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Books started</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 min-w-[80px]">
            <TrendingUp className="w-3.5 h-3.5" />
            <Progress value={user.avgProgress} className="h-1.5 w-12" />
            <span data-testid={`text-progress-${user.id}`}>{user.avgProgress}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Average progress</TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState("writer");
  const [revealedEmails, setRevealedEmails] = useState<Set<string>>(new Set());

  const toggleEmailVisibility = (userId: string) => {
    setRevealedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    document.title = "Users | MindPrism Admin";
  }, []);

  const { data: allUsers, isLoading } = useQuery<EnrichedUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Updated", description: "User role changed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update role", variant: "destructive" }),
  });

  const togglePremiumMutation = useMutation({
    mutationFn: async ({ id, isPremium }: { id: string; isPremium: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/premium`, { isPremium });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Updated", description: "Premium status changed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update premium", variant: "destructive" }),
  });

  const handleCopyInviteLink = () => {
    const roleLabel = ROLE_BADGES[inviteRole]?.label || inviteRole;
    const message = `You've been invited to join MindPrism as a ${roleLabel}. Sign in here: ${appUrl}`;
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: `Invite link copied for ${roleLabel} role` });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filtered = (allUsers || []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id.includes(q)
    );
  });

  const teamMembers = filtered.filter((u) => u.role && u.role !== "user");
  const customers = filtered.filter((u) => !u.role || u.role === "user");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <SEOHead title="Admin - Users" noIndex />
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8" data-testid="admin-users-page">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Team & Users</h1>
          <Badge variant="secondary" className="ml-2">{allUsers?.length || 0} users</Badge>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" data-testid="button-view-app-users">
              <ExternalLink className="w-3.5 h-3.5" />
              View App
            </Button>
          </Link>
        </div>

        <Card className="p-5 mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid="invite-section">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Invite Team Member</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Copy the invite link and share it with your team. Once they sign up via Replit Auth, come back here to assign their role.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-[160px] h-9 text-xs" data-testid="select-invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 min-w-[200px]">
              <Input
                readOnly
                value={appUrl}
                className="h-9 text-xs bg-muted/50 font-mono"
                data-testid="input-invite-link"
              />
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleCopyInviteLink}
              data-testid="button-copy-invite"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Invite"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            <Shield className="w-3 h-3 inline mr-0.5" />
            {ROLE_DESCRIPTIONS[inviteRole]}
          </p>
        </Card>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
          </div>
        </Card>

        {teamMembers.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Team Members</h2>
              <Badge variant="outline" className="text-[10px]">{teamMembers.length}</Badge>
            </div>
            <div className="space-y-2 mb-8">
              {teamMembers.map((u) => {
                const roleBadge = ROLE_BADGES[u.role || "user"] || ROLE_BADGES.user;
                return (
                  <Card key={u.id} className="p-4" data-testid={`user-row-${u.id}`}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">
                            {u.firstName || ""} {u.lastName || ""}
                          </p>
                          {u.isPremium && (
                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-purple-700 text-[10px]">
                              <Crown className="w-3 h-3 mr-0.5" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-muted-foreground" data-testid={`text-email-${u.id}`}>
                            {u.email ? (revealedEmails.has(u.id) ? u.email : maskEmail(u.email)) : "No email"}
                          </p>
                          {u.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => toggleEmailVisibility(u.id)}
                              data-testid={`button-toggle-email-${u.id}`}
                            >
                              {revealedEmails.has(u.id) ? (
                                <EyeOff className="w-3 h-3 text-muted-foreground" />
                              ) : (
                                <Eye className="w-3 h-3 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <UserActivityDetails user={u} />

                      <Badge className={`text-[10px] ${roleBadge.className}`}>
                        {roleBadge.label}
                      </Badge>

                      <Select
                        value={u.role || "user"}
                        onValueChange={(val) => updateRoleMutation.mutate({ id: u.id, role: val })}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs" data-testid={`select-role-${u.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Customer</SelectItem>
                          <SelectItem value="writer">Writer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant={u.isPremium ? "destructive" : "outline"}
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => togglePremiumMutation.mutate({ id: u.id, isPremium: !u.isPremium })}
                        data-testid={`button-premium-${u.id}`}
                      >
                        {u.isPremium ? (
                          <><StarOff className="w-3.5 h-3.5" />Revoke</>
                        ) : (
                          <><Star className="w-3.5 h-3.5" />Grant Premium</>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Customers</h2>
          <Badge variant="outline" className="text-[10px]">{customers.length}</Badge>
        </div>
        <div className="space-y-2">
          {customers.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No customers yet</p>
            </Card>
          ) : (
            customers.map((u) => {
              const roleBadge = ROLE_BADGES[u.role || "user"] || ROLE_BADGES.user;
              return (
                <Card key={u.id} className="p-4" data-testid={`user-row-${u.id}`}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {u.firstName || ""} {u.lastName || ""}
                        </p>
                        {u.isPremium && (
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-purple-700 text-[10px]">
                            <Crown className="w-3 h-3 mr-0.5" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground" data-testid={`text-email-${u.id}`}>
                          {u.email ? (revealedEmails.has(u.id) ? u.email : maskEmail(u.email)) : "No email"}
                        </p>
                        {u.email && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => toggleEmailVisibility(u.id)}
                            data-testid={`button-toggle-email-${u.id}`}
                          >
                            {revealedEmails.has(u.id) ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    <UserActivityDetails user={u} />

                    <Badge className={`text-[10px] ${roleBadge.className}`}>
                      {roleBadge.label}
                    </Badge>

                    <Select
                      value={u.role || "user"}
                      onValueChange={(val) => updateRoleMutation.mutate({ id: u.id, role: val })}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs" data-testid={`select-role-${u.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Customer</SelectItem>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={u.isPremium ? "destructive" : "outline"}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => togglePremiumMutation.mutate({ id: u.id, isPremium: !u.isPremium })}
                      data-testid={`button-premium-${u.id}`}
                    >
                      {u.isPremium ? (
                        <><StarOff className="w-3.5 h-3.5" />Revoke</>
                      ) : (
                        <><Star className="w-3.5 h-3.5" />Grant Premium</>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
