import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { TelegramAllowlist } from "@/models/TelegramAllowlist";
import { TelegramInitDataNonce } from "@/models/TelegramInitDataNonce";

type TelegramMiniAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

const MAX_TELEGRAM_PHOTO_BYTES = 5 * 1024 * 1024;

async function downloadTelegramPhoto(photoUrl: string): Promise<File | null> {
  const url = new URL(photoUrl);
  if (url.protocol !== "https:") return null;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5_000),
    redirect: "follow",
  });
  if (!response.ok || !response.body) return null;
  if (new URL(response.url).protocol !== "https:") return null;

  const mimeType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const extension = mimeType ? extensions[mimeType] : undefined;
  if (!mimeType || !extension) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_TELEGRAM_PHOTO_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new File([bytes], `telegram-profile.${extension}`, { type: mimeType });
}

function validateInitData(initData: string, botToken: string): TelegramMiniAppUser | null {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  if (!receivedHash || !/^[a-f\d]{64}$/i.test(receivedHash) || !Number.isInteger(authDate)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 30 || now - authDate > 5 * 60) return null;

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secretKey).update(dataCheckString).digest();
  const actualHash = Buffer.from(receivedHash, "hex");
  if (actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) return null;

  try {
    const user = JSON.parse(params.get("user") || "null") as TelegramMiniAppUser | null;
    if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) return null;
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "Telegram sign-in is not configured" }, { status: 503 });

  let stage = "reading Telegram sign-in data";
  try {
    const { initData } = await request.json();
    if (typeof initData !== "string" || initData.length > 8192) {
      return NextResponse.json({ error: "Invalid Telegram sign-in data" }, { status: 400 });
    }

    stage = "validating Telegram identity";
    const telegramUser = validateInitData(initData, botToken);
    if (!telegramUser) return NextResponse.json({ error: "Telegram sign-in data is invalid or expired" }, { status: 401 });

    stage = "connecting to the user database";
    await mongooseConnect();
    const telegramId = String(telegramUser.id);
    const profileFields: Record<string, string> = {};
    if (typeof telegramUser.first_name === "string" && telegramUser.first_name.trim()) {
      profileFields.firstName = telegramUser.first_name.trim().slice(0, 128);
    }
    if (typeof telegramUser.last_name === "string" && telegramUser.last_name.trim()) {
      profileFields.lastName = telegramUser.last_name.trim().slice(0, 128);
    }
    if (typeof telegramUser.username === "string" && telegramUser.username.trim()) {
      profileFields.username = telegramUser.username.trim().replace(/^@/, "").slice(0, 64);
    }
    if (typeof telegramUser.photo_url === "string" && telegramUser.photo_url.startsWith("https://")) {
      profileFields.photoUrl = telegramUser.photo_url.slice(0, 2048);
    }
    const approval = await TelegramAllowlist.findOneAndUpdate(
      { telegramId },
      {
        $set: profileFields,
        $setOnInsert: { status: "pending", addedBy: "telegram-mini-app" },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    // Missing status is never consent to sign in; require an explicit approval.
    const approvalStatus = approval.status ?? "pending";
    if (approvalStatus === "disabled") {
      return NextResponse.json({ error: "Telegram access is disabled for this account" }, { status: 403 });
    }
    if (approvalStatus === "pending") {
      return NextResponse.json({ status: "pending" }, { status: 202 });
    }

    const digest = createHash("sha256").update(initData).digest("hex");
    try {
      await TelegramInitDataNonce.create({ digest, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        return NextResponse.json({ error: "This Telegram sign-in request has already been used. Reopen the Mini App and try again." }, { status: 401 });
      }
      throw error;
    }

    stage = "looking up the approved Clerk account";
    const client = await clerkClient();
    const externalId = `telegram:${telegramId}`;
    const clerkUsername = `tg_${telegramId}`;
    let clerkUser = (await client.users.getUserList({ externalId: [externalId], limit: 1 })).data[0];

    if (!clerkUser) {
      try {
        stage = "creating the Clerk account";
        clerkUser = await client.users.createUser({
          externalId,
          username: clerkUsername,
          // Clerk requires a password for account creation in this instance.
          // Telegram users normally sign in through short-lived tickets.
          password: `${clerkUsername}_student`,
          ...(telegramUser.first_name ? { firstName: telegramUser.first_name.slice(0, 128) } : {}),
          ...(telegramUser.last_name ? { lastName: telegramUser.last_name.slice(0, 128) } : {}),
          publicMetadata: { role: "student" },
          privateMetadata: { telegramId },
        });
      } catch (createError) {
        // Recover safely if two valid first sign-ins arrive at the same time.
        clerkUser = (await client.users.getUserList({ externalId: [externalId], limit: 1 })).data[0];
        if (!clerkUser) throw createError;
      }
    }

    const linkedRole = clerkUser.publicMetadata?.role;
    if (linkedRole === "admin" || linkedRole === "teacher") {
      return NextResponse.json({ error: "This Telegram account is not approved for student access" }, { status: 403 });
    }

    if (
      telegramUser.photo_url &&
      clerkUser.privateMetadata?.telegramProfilePhotoUrl !== telegramUser.photo_url
    ) {
      try {
        const profilePhoto = await downloadTelegramPhoto(telegramUser.photo_url);
        if (profilePhoto) {
          await client.users.updateUserProfileImage(clerkUser.id, { file: profilePhoto });
          await client.users.updateUserMetadata(clerkUser.id, {
            privateMetadata: { telegramProfilePhotoUrl: telegramUser.photo_url },
          });
        } else {
          console.warn("[TELEGRAM_MINI_APP_AUTH] Telegram profile photo was unavailable or unsupported");
        }
      } catch (error) {
        // Profile photos are optional; keep sign-in working if Telegram or Clerk image upload fails.
        console.warn("[TELEGRAM_MINI_APP_AUTH] Unable to sync Telegram profile photo to Clerk", error);
      }
    }

    await TelegramAllowlist.updateOne(
      { _id: approval._id, status: "approved" },
      { $set: { clerkUserId: clerkUser.id } }
    );
    const stillApproved = await TelegramAllowlist.exists({
      _id: approval._id,
      status: "approved",
    });
    if (!stillApproved) return NextResponse.json({ error: "Telegram access has been disabled" }, { status: 403 });
    stage = "creating the Clerk sign-in session";
    const signInToken = await client.signInTokens.createSignInToken({ userId: clerkUser.id, expiresInSeconds: 90 });
    return NextResponse.json({ ticket: signInToken.token });
  } catch (error) {
    console.error(`[TELEGRAM_MINI_APP_AUTH] Failed while ${stage}`, error);
    const clerkMessages = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors
      ?.map((item) => item.longMessage || item.message)
      .filter((message): message is string => Boolean(message))
      .slice(0, 3);
    const detail = clerkMessages?.length ? ` Clerk says: ${clerkMessages.join("; ")}` : "";
    return NextResponse.json(
      { error: `Telegram sign-in failed while ${stage}.${detail} Check the server logs for [TELEGRAM_MINI_APP_AUTH].` },
      { status: 500 }
    );
  }
}
