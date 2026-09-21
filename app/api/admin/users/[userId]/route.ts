import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";

async function ensureAdmin() {
  const { userId } = await auth();
  return userId && (await getCurrentUserRole()) === "admin";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { role } = await request.json();
  if (!["student", "teacher"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  await (await clerkClient()).users.updateUser((await params).userId, { publicMetadata: { role } });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await auth();
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  if (userId === (await params).userId) return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  await (await clerkClient()).users.deleteUser((await params).userId);
  return NextResponse.json({ success: true });
}
