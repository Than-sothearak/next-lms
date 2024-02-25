import { mongooseConnect } from '@/lib/mongoose'
import { Chapter } from '@/models/Chapter';
import { Course } from '@/models/Course';
import { redirect } from 'next/navigation';
import React from 'react'

const CourseIdPage = async ({
  params
}:{
  params:{ courseId: string}
}) => {
  await mongooseConnect();
  const courseId = params.courseId
  const course = await Course.findById({_id: courseId,})
  const chapter = await Chapter.find({courseId: courseId, isPublished: true})

  if (!course && !chapter) {
    return redirect("/");
  }


  return redirect(`/courses/${course.id}/chapters/${course.chapter[0]._id}`);
}

export default CourseIdPage