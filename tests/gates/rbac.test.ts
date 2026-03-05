import test from "node:test";
import assert from "node:assert/strict";
import { canAccessAdminRoute, getAdminRouteMinRole } from "../../shared/admin-rbac";

test("admin route minimum role mapping is correct", () => {
  assert.equal(getAdminRouteMinRole("/admin"), "writer");
  assert.equal(getAdminRouteMinRole("/admin/books/123"), "writer");
  assert.equal(getAdminRouteMinRole("/admin/media"), "writer");
  assert.equal(getAdminRouteMinRole("/admin/users"), "admin");
  assert.equal(getAdminRouteMinRole("/admin/analytics"), "admin");
});

test("restricted-side access is denied for non-admin users", () => {
  assert.equal(canAccessAdminRoute("writer", "/admin/users"), false);
  assert.equal(canAccessAdminRoute("writer", "/admin/analytics"), false);
  assert.equal(canAccessAdminRoute("editor", "/admin/users"), false);
  assert.equal(canAccessAdminRoute("user", "/admin"), false);
});

test("admin and super admin can access restricted admin routes", () => {
  assert.equal(canAccessAdminRoute("admin", "/admin/users"), true);
  assert.equal(canAccessAdminRoute("admin", "/admin/analytics"), true);
  assert.equal(canAccessAdminRoute("super_admin", "/admin/users"), true);
});
