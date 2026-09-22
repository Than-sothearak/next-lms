import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { TelegramAllowlist } from "@/models/TelegramAllowlist";
import { clerkClient } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { userId } = await auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { status } = await request.json();
  if (status !== "approved" && status !== "disabled") return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { entryId } = await params;
  if (!Types.ObjectId.isValid(entryId)) return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  await mongooseConnect();
  const entry = await TelegramAllowlist.findByIdAndUpdate(entryId, {
    $set: { status, active: status === "approved" },
  }, { new: true });
  if (!entry) return NextResponse.json({ error: "Allowlist entry not found" }, { status: 404 });
  if (status === "disabled" && entry.clerkUserId) {
    const client = await clerkClient();
    const sessions = await client.sessions.getSessionList({ userId: entry.clerkUserId, status: "active", limit: 100 });
    await Promise.all(sessions.data.map((session) => client.sessions.revokeSession(session.id)));
  }
  return NextResponse.json({ entry });
}
