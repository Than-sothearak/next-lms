import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { UserProgress } from "@/models/UserProgress";
import { Category, Course } from "@/models/Course";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, emailAddress, password, role } = body;
    if (!username || !password || !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Invalid account details" }, { status: 400 });
    }

    const user = await clerkClient.users.createUser({
      username,
      ...(emailAddress ? { emailAddress: [emailAddress] } : {}),
      password,
      skipPasswordChecks: true,
      publicMetadata: { role },
    });

    return NextResponse.json({ user: { id: user.id, username, role } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.errors?.[0]?.longMessage || "Unable to create Clerk user" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("query") || undefined;
  const categoryId = url.searchParams.get("categoryId") || undefined;
  const offset = Number(url.searchParams.get("offset") || 0);
  const users = await clerkClient.users.getUserList({ limit: 10, offset, query, orderBy: "-created_at" });
  await mongooseConnect();
  const publishedChapterCount = await Chapter.countDocuments({ isPublished: true });
  const courses = await Course.find({ isPublished: true, ...(categoryId ? { categoryId } : {}) }, { _id: 1, title: 1, categoryId: 1 }).lean();
  const categories = await Category.find({}, { _id: 1, name: 1 }).lean();
  const results = await Promise.all(users.map(async (user) => {
    const completed = publishedChapterCount === 0 ? 0 : await UserProgress.countDocuments({ userId: user.id, isCompleted: true });
    const courseProgress = await Promise.all(courses.map(async (course) => {
      const courseChapterCount = await Chapter.countDocuments({ courseId: course._id, isPublished: true });
      const courseCompleted = await UserProgress.countDocuments({ userId: user.id, courseId: course._id, isCompleted: true });
      const category = categories.find((item) => String(item._id) === String(course.categoryId));
      return { id: String(course._id), title: course.title, category: category?.name || "Uncategorized", progress: courseChapterCount ? Math.min(100, Math.round((courseCompleted / courseChapterCount) * 100)) : 0 };
    }));
    return {
    id: user.id,
    username: user.username,
    email: user.emailAddresses[0]?.emailAddress || "",
    role: user.publicMetadata?.role || "student",
    progress: Math.min(100, Math.round((completed / publishedChapterCount) * 100)),
    courseProgress,
    };
  }));
  return NextResponse.json({ users: results, categories });
}
