import { hasMinRole, type UserRole } from "./models/auth";

export function getAdminRouteMinRole(pathname: string): UserRole {
  if (pathname.startsWith("/admin/users")) return "admin";
  if (pathname.startsWith("/admin/analytics")) return "admin";
  return "writer";
}

export function canAccessAdminRoute(userRole: string | null | undefined, pathname: string): boolean {
  const requiredRole = getAdminRouteMinRole(pathname);
  return hasMinRole(userRole, requiredRole);
}
