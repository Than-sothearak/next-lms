import { mongooseConnect } from '@/lib/mongoose'
import { Chapter } from '@/models/Chapter';
import { Course } from '@/models/Course';
import React from 'react'

const CourseIdPage = async ({
  params
}:{
  params:{ courseId: string}
}) => {
  await mongooseConnect();
  const courseId = params.courseId
  await Course.findById({_id: courseId,})
  await Chapter.find({courseId: courseId, isPublished: true})

  return (
    <div>CourseIdPage</div>
  )
}

export default CourseIdPage