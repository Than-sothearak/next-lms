import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { UserProgress } from "@/models/UserProgress";
import { Category, Course } from "@/models/Course";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, emailAddress, password, role } = body;
    if (!username || !password || !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Invalid account details" }, { status: 400 });
    }

    const user = await (await clerkClient()).users.createUser({
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
  const { userId } = await auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("query") || undefined;
  const categoryId = url.searchParams.get("categoryId") || undefined;
  const roleFilter = url.searchParams.get("role") || "student";
  const yearFilter = url.searchParams.get("year") || "";
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const client = await clerkClient();
  const fetchAllUsers = async () => {
    const firstPage = await client.users.getUserList({ limit: 500, offset: 0, orderBy: "-created_at" });
    const all = [...firstPage.data];
    for (let pageOffset = firstPage.data.length; pageOffset < firstPage.totalCount; pageOffset += 500) {
      const page = await client.users.getUserList({ limit: 500, offset: pageOffset, orderBy: "-created_at" });
      all.push(...page.data);
    }
    return all;
  };
  const allUsers = await fetchAllUsers();
  const counts = allUsers.reduce((result, user) => {
    const role = user.publicMetadata?.role === "admin" || user.publicMetadata?.role === "teacher"
      ? user.publicMetadata.role
      : "student";
    result[role] += 1;
    result.total += 1;
    return result;
  }, { student: 0, teacher: 0, admin: 0, total: 0 });
  const normalizedQuery = query?.trim().toLowerCase();
  const sourceUsers = normalizedQuery
    ? allUsers.filter((user) => {
        const searchableValues = [
          user.firstName,
          user.lastName,
          `${user.firstName || ""} ${user.lastName || ""}`,
          user.username,
          ...user.emailAddresses.map((email) => email.emailAddress),
        ];
        return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
    : allUsers;
  const filteredUsers = sourceUsers.filter((user) => {
    const role = user.publicMetadata?.role || "student";
    const matchesRole = roleFilter === "all" || role === roleFilter;
    const matchesYear = !yearFilter || new Date(user.createdAt).getFullYear() === Number(yearFilter);
    return matchesRole && matchesYear;
  });
  const years = Array.from(new Set(allUsers.map((user) => new Date(user.createdAt).getFullYear()).filter(Number.isFinite))).sort((a, b) => b - a);
  const pageUsers = filteredUsers.slice(offset, offset + 10);
  await mongooseConnect();
  const allPublicCourses = await Course.find({ isPublished: true }, { _id: 1, title: 1, categoryId: 1 }).lean();
  const courses = await Course.find({ isPublished: true, ...(categoryId ? { categoryId } : {}) }, { _id: 1, title: 1, categoryId: 1 }).lean();
  const categories = await Category.find({}, { _id: 1, name: 1 }).lean();
  const results = await Promise.all(pageUsers.map(async (user) => {
    const [allCourseProgress, sessionList] = await Promise.all([
      Promise.all(allPublicCourses.map(async (course) => {
        const courseChapterIds = await Chapter.distinct("_id", { courseId: course._id, isPublished: true });
        const courseCompletedIds = await UserProgress.distinct("chapterId", {
          userId: user.id,
          isCompleted: true,
          chapterId: { $in: courseChapterIds },
        });
        const category = categories.find((item) => String(item._id) === String(course.categoryId));
        return { id: String(course._id), title: course.title, category: category?.name || "Uncategorized", progress: courseChapterIds.length ? Math.min(100, Math.round((courseCompletedIds.length / courseChapterIds.length) * 100)) : 0 };
      })),
      client.sessions.getSessionList({ userId: user.id, limit: 1 }).catch((error) => {
        console.error(`[ADMIN_USER_SESSIONS] Unable to load sessions for ${user.id}`, error);
        return null;
      }),
    ]);
    const latestSession = sessionList?.data[0];
    const activity = latestSession?.latestActivity;
    const completedCourses = allCourseProgress.filter((course) => course.progress === 100).length;
    const progress = allPublicCourses.length ? Math.round((completedCourses / allPublicCourses.length) * 100) : 0;
    const visibleCourseIds = new Set(courses.map((course) => String(course._id)));
    const courseProgress = allCourseProgress.filter((course) => visibleCourseIds.has(course.id));
    return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    loginActivity: latestSession ? {
      lastLoginAt: latestSession.createdAt,
      lastActiveAt: latestSession.lastActiveAt,
      ipAddress: activity?.ipAddress || null,
      city: activity?.city || null,
      country: activity?.country || null,
      deviceType: activity?.deviceType || null,
      isMobile: activity?.isMobile ?? null,
      browserName: activity?.browserName || null,
      browserVersion: activity?.browserVersion || null,
    } : null,
    email: user.emailAddresses[0]?.emailAddress || "",
    createdAt: user.createdAt,
    role: user.publicMetadata?.role || "student",
    progress,
    completedCourses,
    totalCourses: allPublicCourses.length,
    courseProgress,
    };
  }));
  return NextResponse.json({ users: results, categories, counts, years, totalFiltered: filteredUsers.length });
}
