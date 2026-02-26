import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Shield, ArrowLeft, Search, Star, StarOff } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  super_admin: { label: "Super Admin", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  admin: { label: "Admin", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  editor: { label: "Editor", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  writer: { label: "Writer", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  user: { label: "Customer", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: allUsers, isLoading } = useQuery<User[]>({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8" data-testid="admin-users-page">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-serif font-bold">Team & Users</h1>
          <Badge variant="secondary" className="ml-2">{allUsers?.length || 0} users</Badge>
        </div>

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

        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-1 text-primary" />
            Share this app link with new team members. They sign up via Replit Auth, then you assign their role here.
          </p>
        </Card>

        <div className="space-y-2">
          {filtered.map((u) => {
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
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                          <Crown className="w-3 h-3 mr-0.5" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">ID: {u.id}</p>
                  </div>

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
      </div>
    </div>
  );
}
