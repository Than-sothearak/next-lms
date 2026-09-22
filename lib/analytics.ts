export type AnalyticsStudent = { id: string; name: string; createdAt: number; lastSignInAt: number | null };
type AnalyticsInput = {
  students: AnalyticsStudent[];
  courses: { id: string; title: string }[];
  chapters: { id: string; title: string; courseId: string }[];
  enrollments: { userId: string; courseId: string; createdAt: number }[];
  completions: { userId: string; chapterId: string }[];
};

export function summarizeAnalytics(data: AnalyticsInput, now: number) {
  const studentIds = new Set(data.students.map((student) => student.id));
  const courseIds = new Set(data.courses.map((course) => course.id));
  const chapters = data.chapters.filter((chapter) => courseIds.has(chapter.courseId));
  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  const uniqueEnrollments = new Map<string, AnalyticsInput["enrollments"][number]>();

  for (const enrollment of data.enrollments) {
    if (!studentIds.has(enrollment.userId) || !courseIds.has(enrollment.courseId)) continue;
    const key = `${enrollment.userId}:${enrollment.courseId}`;
    const previous = uniqueEnrollments.get(key);
    if (!previous || enrollment.createdAt < previous.createdAt) uniqueEnrollments.set(key, enrollment);
  }

  const enrollments = [...uniqueEnrollments.values()];
  const completedByStudent = new Map<string, Set<string>>();

  for (const completion of data.completions) {
    if (!studentIds.has(completion.userId) || !chapterIds.has(completion.chapterId)) continue;
    const completed = completedByStudent.get(completion.userId) ?? new Set<string>();
    completed.add(completion.chapterId);
    completedByStudent.set(completion.userId, completed);
  }

  const chaptersByCourse = new Map<string, string[]>();

  for (const chapter of chapters) {
    const ids = chaptersByCourse.get(chapter.courseId) ?? [];
    ids.push(chapter.id);
    chaptersByCourse.set(chapter.courseId, ids);
  }

  const topStudents = data.students.map((student) => {
    const completed = completedByStudent.get(student.id) ?? new Set<string>();
    const studentEnrollments = enrollments.filter((item) => item.userId === student.id);
    const completedCourses = studentEnrollments.filter((item) => {
      const ids = chaptersByCourse.get(item.courseId) ?? [];
      return ids.length > 0 && ids.every((id) => completed.has(id));
    }).length;
    return { ...student, enrolledCourses: studentEnrollments.length, completedCourses, completedChapters: completed.size };
  }).filter((student) => student.completedChapters > 0)
    .sort((a, b) => b.completedCourses - a.completedCourses || b.completedChapters - a.completedChapters || a.name.localeCompare(b.name)).slice(0, 10);

  const popularCourses = data.courses.map((course) => ({ ...course, enrollments: enrollments.filter((item) => item.courseId === course.id).length }))
    .filter((course) => course.enrollments > 0).sort((a, b) => b.enrollments - a.enrollments || a.title.localeCompare(b.title)).slice(0, 5);
  const current = new Date(now);
  const completionCounts = new Map<string, number>();
  for (const completed of completedByStudent.values()) {
    for (const chapterId of completed) completionCounts.set(chapterId, (completionCounts.get(chapterId) ?? 0) + 1);
  }
  const courseTitles = new Map(data.courses.map((course) => [course.id, course.title]));
  const popularLessons = chapters.map((chapter) => ({
    ...chapter,
    courseTitle: courseTitles.get(chapter.courseId) ?? "",
    completions: completionCounts.get(chapter.id) ?? 0,
  })).filter((chapter) => chapter.completions > 0)
    .sort((a, b) => b.completions - a.completions || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)).slice(0, 5);
  const months = Array.from({ length: 6 }, (_, index) => {
    const start = Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 5 + index, 1);
    const end = Math.min(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 4 + index, 1), now + 1);
    return {
      label: new Date(start).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" }),
      students: data.students.filter((student) => student.createdAt >= start && student.createdAt < end).length,
      enrollments: enrollments.filter((item) => item.createdAt >= start && item.createdAt < end).length,
    };
  });
  const since = now - 30 * 24 * 60 * 60 * 1000;
  return {
    totalStudents: data.students.length,
    newStudents: data.students.filter((student) => student.createdAt >= since && student.createdAt <= now).length,
    signedInStudents: data.students.filter((student) => student.lastSignInAt !== null && student.lastSignInAt >= since && student.lastSignInAt <= now).length,
    publishedCourses: data.courses.length, publishedChapters: chapters.length, totalEnrollments: enrollments.length,
    popularCourses, popularLessons, topStudents, months,
  };
}
