import { mongooseConnect } from '@/lib/mongoose'
import { Chapter } from '@/models/Chapter';
import { Course } from '@/models/Course';
import { UserProgress } from '@/models/UserProgress';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const CourseIdPage = async ({
  params
}:{
  params: Promise<{ courseId: string}>
}) => {
  await mongooseConnect();
  const courseId = (await params).courseId
  const course = await Course.findById({_id: courseId})
  const chapter = await Chapter.find({courseId: courseId, isPublished: true}).sort({ position: 1 })

  if (!course || !chapter.length) {
    return redirect("/");
  }

  const { userId } = await auth();
  const completedChapterIds = userId
    ? await UserProgress.find({
        userId,
        courseId,
        isCompleted: true,
      }).distinct("chapterId")
    : [];
  const completedIds = new Set(
    completedChapterIds.map((chapterId) => String(chapterId)),
  );
  const nextChapter =
    chapter.find((item) => !completedIds.has(String(item._id))) || chapter[0];

  return redirect(`/courses/${course._id}/chapters/${nextChapter._id}`);
}

export default CourseIdPage