import { mongooseConnect } from '@/lib/mongoose'
import { Course } from '@/models/Course'
import React from 'react'
import { CourseNavbar } from '../_components/course.navbar'
import { CourseSidebar } from '../_components/course-sidebar'
import { Chapter } from '@/models/Chapter'

const CourseLayout = async ({
    children, params}: {
        children: React.ReactNode
        params: { courseId: string}
    }) => {
    await mongooseConnect();
    const courseId = params.courseId;

    const course = JSON.parse(JSON.stringify(await Course.findById({_id: courseId})))
    const chapters = JSON.parse(JSON.stringify(await Chapter.find({courseId: courseId, isPublished: true})))
 
  return (
    <div className="h-full">
      {/* <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
      
        <CourseNavbar
          course={course}
          chapters={chapters}
          
        />
      </div> */}
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          chapters={chapters}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout