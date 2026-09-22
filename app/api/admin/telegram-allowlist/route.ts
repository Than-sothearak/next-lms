import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { TelegramAllowlist } from "@/models/TelegramAllowlist";

const isAdmin = async () => {
  const { userId } = await auth();
  return userId && (await getCurrentUserRole()) === "admin" ? userId : null;
};

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  await mongooseConnect();
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").trim().slice(0, 100);
  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") || "0", 10) || 0);
  const pendingFilter = {
    $or: [{ status: "pending" }, { status: { $exists: false } }],
  };
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = query
    ? {
        $and: [
          pendingFilter,
          { $or: [
            { firstName: { $regex: escapedQuery, $options: "i" } },
            { lastName: { $regex: escapedQuery, $options: "i" } },
            { username: { $regex: escapedQuery, $options: "i" } },
            { telegramId: { $regex: escapedQuery, $options: "i" } },
          ] },
        ],
      }
    : pendingFilter;
  const [entries, total] = await Promise.all([
    TelegramAllowlist.find(filter).sort({ createdAt: -1 }).skip(offset).limit(10).lean(),
    TelegramAllowlist.countDocuments(filter),
  ]);
  return NextResponse.json({ entries, total, offset, limit: 10 });
}

export async function POST(request: Request) {
  const adminId = await isAdmin();
  if (!adminId) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { telegramId } = await request.json();
  if (typeof telegramId !== "string" || !/^\d{1,16}$/.test(telegramId)) {
    return NextResponse.json({ error: "Enter a valid numeric Telegram user ID" }, { status: 400 });
  }

  await mongooseConnect();
  try {
    const entry = await TelegramAllowlist.findOneAndUpdate(
      { telegramId },
      { $set: { status: "approved", active: true, addedBy: adminId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[TELEGRAM_ALLOWLIST_CREATE]", error);
    return NextResponse.json({ error: "Unable to approve Telegram account" }, { status: 500 });
  }
}
