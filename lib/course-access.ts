import { getCurrentUserRole } from "@/lib/roles";

// Admins manage every course without changing its original creator.
export async function courseOwnerFilter(userId: string) {
  return (await getCurrentUserRole()) === "admin" ? {} : { userId };
}
