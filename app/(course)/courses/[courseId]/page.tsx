import { mongooseConnect } from '@/lib/mongoose'
import { Chapter } from '@/models/Chapter';
import { Course } from '@/models/Course';
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

  if (!course && !chapter) {
    return redirect("/");
  }


  return redirect(`/courses/${course?._id}/chapters/${course?.chapter[0]._id}`);
}

export default CourseIdPage