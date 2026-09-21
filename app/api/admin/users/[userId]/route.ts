import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";

async function ensureAdmin() {
  const { userId } = auth();
  return userId && (await getCurrentUserRole()) === "admin";
}

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { role } = await request.json();
  if (!["student", "teacher"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  await clerkClient.users.updateUser(params.userId, { publicMetadata: { role } });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: { userId: string } }) {
  const { userId } = auth();
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  if (userId === params.userId) return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  await clerkClient.users.deleteUser(params.userId);
  return NextResponse.json({ success: true });
}
