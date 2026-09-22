import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, Library, LogIn, UserPlus, Users } from "lucide-react";
import { requireRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { summarizeAnalytics } from "@/lib/analytics";
import { Course } from "@/models/Course";
import { Chapter } from "@/models/Chapter";
import { Purchase } from "@/models/Purchase";
import { UserProgress } from "@/models/UserProgress";
import { ActivityChart } from "./_components/activity-chart";

export default async function AnalyticPage() {
  const access = await requireRole(["admin", "teacher"]);
  if (!access) redirect("/");
  const isTeacher = access.role === "teacher";
  await mongooseConnect();
  const courses = await Course.find({ isPublished: true, ...(isTeacher ? { userId: access.user.id } : {}) }, { _id: 1, title: 1 }).lean();
  const courseIds = courses.map((course) => course._id);
  const enrolledUserIds: string[] = isTeacher
    ? await Purchase.distinct("userId", { courseId: { $in: courseIds } })
    : [];
  const enrolledUserIdSet = new Set(enrolledUserIds);
  const client = await clerkClient();
  const firstPage = await client.users.getUserList({ limit: 500, offset: 0, orderBy: "-created_at" });
  const users = [...firstPage.data];
  for (let offset = users.length; offset < firstPage.totalCount;) {
    const page = await client.users.getUserList({ limit: 500, offset, orderBy: "-created_at" });
    if (!page.data.length) throw new Error("Unable to load all analytics accounts");
    users.push(...page.data);
    offset += page.data.length;
  }
  const students = users.filter((user) =>
    user.publicMetadata.role !== "admin" && user.publicMetadata.role !== "teacher"
    && (!isTeacher || enrolledUserIdSet.has(user.id))
  );
  const studentIds = students.map((student) => student.id);
  const [chapters, enrollments] = await Promise.all([
    Chapter.find({ isPublished: true, courseId: { $in: courseIds } }, { _id: 1, title: 1, courseId: 1 }).lean(),
    Purchase.find({ courseId: { $in: courseIds }, userId: { $in: studentIds } }, { userId: 1, courseId: 1, createdAt: 1 }).lean(),
  ]);
  const completions = await UserProgress.find({
    isCompleted: true, userId: { $in: studentIds }, chapterId: { $in: chapters.map((chapter) => chapter._id) },
  }, { userId: 1, chapterId: 1 }).lean();
  // This authenticated server page calculates rolling time windows for each request.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const analytics = summarizeAnalytics({
    students: students.map((student) => ({ id: student.id, name: student.fullName || student.username || "Student", createdAt: student.createdAt, lastSignInAt: student.lastSignInAt })),
    courses: courses.map((course) => ({ id: String(course._id), title: course.title })),
    chapters: chapters.map((chapter) => ({ id: String(chapter._id), title: chapter.title, courseId: String(chapter.courseId) })),
    enrollments: enrollments.map((item) => ({ userId: item.userId, courseId: String(item.courseId), createdAt: new Date(item.createdAt).getTime() })),
    completions: completions.map((item) => ({ userId: item.userId, chapterId: String(item.chapterId) })),
  }, now);
  const cards = [
    { label: "Total students", value: analytics.totalStudents, detail: isTeacher ? "Students enrolled in your published courses" : "Student accounts", icon: Users },
    { label: "New students", value: analytics.newStudents, detail: isTeacher ? "Enrolled students with accounts created in the last 30 days" : "Joined in the last 30 days", icon: UserPlus },
    { label: "Students signed in", value: analytics.signedInStudents, detail: "Unique students · last 30 days", icon: LogIn },
    { label: "Published courses", value: analytics.publishedCourses, detail: "Available to students", icon: Library },
    { label: "Published lessons", value: analytics.publishedChapters, detail: "Chapters in published courses", icon: BookOpen },
    { label: "Course enrollments", value: analytics.totalEnrollments, detail: "Student enrollments in published courses", icon: GraduationCap },
  ];
  const mostEnrollments = Math.max(1, ...analytics.popularCourses.map((course) => course.enrollments));
  const mostCompletions = Math.max(1, ...analytics.popularLessons.map((lesson) => lesson.completions));
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div><h1 className="text-2xl font-semibold text-slate-900">Analytics</h1><p className="mt-1 text-sm text-slate-500">{isTeacher ? "Your published courses and their enrolled students. Sign-ins refer to these students signing into the platform." : "School-wide student activity and learning progress. Course metrics cover currently published courses."}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, detail, icon: Icon }) => <div key={label} className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-600">{label}</p><Icon className="h-5 w-5 text-blue-600" aria-hidden="true" /></div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{value.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityChart months={analytics.months} />
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Popular courses</h2><p className="mt-1 text-sm text-slate-500">Top five by unique student enrollments</p>
          <div className="mt-6 space-y-5">{analytics.popularCourses.length ? analytics.popularCourses.map((course, index) => <div key={course.id}>
            <div className="mb-2 flex justify-between gap-4 text-sm"><span className="min-w-0 break-words"><span className="mr-2 text-slate-400">{index + 1}.</span>{course.title}</span><span className="shrink-0 font-semibold">{course.enrollments} enrolled</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${course.enrollments / mostEnrollments * 100}%` }} /></div>
          </div>) : <p className="py-8 text-sm text-slate-500">No student enrollments yet.</p>}</div>
        </section>
      </div>
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="p-5">
          <h2 className="font-semibold text-slate-900">Popular lessons</h2>
          <p className="mt-1 text-sm text-slate-500">Top five published lessons by unique students who completed them</p>
          <div className="mt-6 space-y-5">
            {analytics.popularLessons.length ? analytics.popularLessons.map((lesson, index) => <div key={lesson.id}>
              <div className="mb-2 flex justify-between gap-4 text-sm">
                <div className="min-w-0 break-words">
                  <p><span className="mr-2 text-slate-400">{index + 1}.</span>{lesson.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{lesson.courseTitle}</p>
                </div>
                <span className="shrink-0 font-semibold">{lesson.completions} {lesson.completions === 1 ? "student" : "students"}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${lesson.completions / mostCompletions * 100}%` }} /></div>
            </div>) : <p className="py-8 text-sm text-slate-500">No completed lessons yet.</p>}
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="p-5"><h2 className="font-semibold text-slate-900">Top student accounts</h2><p className="mt-1 text-sm text-slate-500">Top ten by completed courses, then completed lessons</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm">
          <thead className="border-y bg-slate-50 text-slate-500"><tr>{['Rank', 'Student', 'Enrolled courses', 'Completed courses', 'Completed lessons'].map((label) => <th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>)}</tr></thead>
          <tbody>{analytics.topStudents.length ? analytics.topStudents.map((student, index) => <tr key={student.id} className="border-b last:border-0">
            <td className="px-5 py-4 font-semibold text-blue-600">{index + 1}</td><td className="max-w-xs break-words px-5 py-4 font-medium">{student.name}</td><td className="px-5 py-4">{student.enrolledCourses}</td><td className="px-5 py-4">{student.completedCourses}</td><td className="px-5 py-4">{student.completedChapters}</td>
          </tr>) : <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Students will appear here after completing lessons.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}
