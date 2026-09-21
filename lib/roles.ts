import { currentUser, clerkClient } from "@clerk/nextjs";

export type UserRole = "admin" | "teacher" | "student";

export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (role === "admin" || role === "teacher") return role;
  return "student";
}

/** Give new Clerk users the least-privileged role on their first app request. */
export async function ensureUserRole() {
  const user = await currentUser();
  if (!user) return null;

  const role = user.publicMetadata?.role;
  if (role !== "admin" && role !== "teacher" && role !== "student") {
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: { ...user.publicMetadata, role: "student" },
    });
    return "student" as UserRole;
  }

  return role;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await currentUser();
  if (!user) return null;
  const role = await getCurrentUserRole();
  return allowedRoles.includes(role) ? { user, role } : null;
}
