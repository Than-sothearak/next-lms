import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import path from "node:path";

const region =
  process.env.AWS_REGION || process.env.S3_REGION || "ap-southeast-1";
const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
const maxVideoSize = 5 * 1024 * 1024 * 1024;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || "",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      process.env.S3_SECRET_ACCESS_KEY ||
      "",
  },
});

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: "AWS bucket is not configured." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "";
    const fileSize = Number(body.fileSize);

    if (
      !fileName ||
      (!contentType.startsWith("video/") && !contentType.startsWith("audio/")) ||
      !Number.isFinite(fileSize)
    ) {
      return NextResponse.json(
        { error: "A valid video or audio file is required." },
        { status: 400 },
      );
    }

    if (fileSize <= 0 || fileSize > maxVideoSize) {
      return NextResponse.json(
        { error: "Media file must be 5GB or smaller." },
        { status: 413 },
      );
    }

    const extension = path.extname(fileName).toLowerCase();
    const key = `Video/${crypto.randomUUID()}${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60,
    });
    const endpoint =
      region === "us-east-1"
        ? `https://${bucketName}.s3.amazonaws.com`
        : `https://${bucketName}.s3.${region}.amazonaws.com`;
    const link = `${endpoint}/${key}`;

    return NextResponse.json({ uploadUrl, link, contentType });
  } catch (error) {
    console.error("[VIDEO_UPLOAD_SIGN]", error);
    return NextResponse.json(
      { error: "Could not prepare video upload." },
      { status: 500 },
    );
  }
}
