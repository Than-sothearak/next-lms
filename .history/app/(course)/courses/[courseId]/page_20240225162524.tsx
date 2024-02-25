import { mongooseConnect } from '@/lib/mongoose'
import { Course } from '@/models/Course';
import React from 'react'

const CourseIdPage = async ({
  params
}:{
  params:{ courseId: string}
}) => {
  await mongooseConnect();
  const courseId = params.courseId
  await Course.findById({_id: courseId})

  return (
    <div>CourseIdPage</div>
  )
}

export default CourseIdPage