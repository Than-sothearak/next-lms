import { redirect } from "next/navigation";
import { requireRole } from "@/lib/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole(["admin"]);
  if (!access) redirect("/");
  return children;
}
