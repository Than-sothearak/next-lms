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
  const chpater = await Chapter.find({courseId: courseId, isPublished: true})

  if (!course) {
    return redirect("/");
  }


  return (
    <div>CourseIdPage</div>
  )
}

export default CourseIdPage