import { redirect } from "next/navigation";
import { requireRole } from "@/lib/roles";

export default async function AdminLayout({ children }: { children: JSX.Element }) {
  const access = await requireRole(["admin"]);
  if (!access) redirect("/");
  return children;
}
