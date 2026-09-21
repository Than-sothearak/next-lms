import { redirect } from "next/navigation";
import { requireRole } from "@/lib/roles";

export default async function TeacherLayout({ children }: { children: JSX.Element }) {
  const access = await requireRole(["admin", "teacher"]);
  if (!access) redirect("/");
  return children;
}
