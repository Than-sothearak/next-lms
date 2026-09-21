import { clerkClient } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { mongooseConnect } from "@/lib/mongoose";
import { requireRole } from "@/lib/roles";
import { Course } from "@/models/Course";

export default async function AdminCoursesPage() {
  if (!(await requireRole(["admin"]))) redirect("/");

  await mongooseConnect();
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
  const creatorIds = Array.from(new Set(courses.map((course) => course.userId).filter(Boolean)));
  const creators = new Map<string, { name: string; email: string }>();

  for (let offset = 0; offset < creatorIds.length; offset += 100) {
    const users = await clerkClient.users.getUserList({
      userId: creatorIds.slice(offset, offset + 100),
      limit: 100,
    });
    for (const user of users) {
      const email = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress || "";
      creators.set(user.id, {
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || email || user.id,
        email,
      });
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">All courses</h1>
        <p className="text-sm text-slate-500">Published and draft courses from all creators.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Created by</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const creator = creators.get(course.userId);
              return (
                <tr key={String(course._id)} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="max-w-sm break-words px-5 py-4 font-medium">{course.title}</td>
                  <td className="max-w-sm break-words px-5 py-4">
                    <p>{creator?.name || "Unknown or deleted user"}</p>
                    <p className="text-xs text-slate-500">{creator?.email || course.userId || "No creator recorded"}</p>
                  </td>
                  <td className="px-5 py-4">{course.isPublished ? "Published" : "Draft"}</td>
                  <td className="px-5 py-4"><Link className="text-blue-600 hover:underline" href={`/teacher/courses/${course._id}`}>Edit course</Link></td>
                </tr>
              );
            })}
            {!courses.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No courses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
