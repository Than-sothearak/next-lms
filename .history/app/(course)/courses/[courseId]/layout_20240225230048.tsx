import { mongooseConnect } from '@/lib/mongoose'
import { Course } from '@/models/Course'
import React from 'react'
import { CourseNavbar } from '../_components/course.navbar'
import { CourseSidebar } from '../_components/course-sidebar'
import { Chapter } from '@/models/Chapter'
import { UserProgress } from '@/models/UserProgress'

const CourseLayout = async ({
    children, params}: {
        children: React.ReactNode
        params: { courseId: string}
    }) => {
    await mongooseConnect();
    const courseId = params.courseId;

    const course = JSON.parse(JSON.stringify(await Course.findById({_id: courseId})))
    const chapters = JSON.parse(JSON.stringify(await Chapter.find({courseId: courseId, isPublished: true})))

  
    const userProgress = JSON.parse(JSON.stringify(await UserProgress.findOne({
      userId: course.userId,
      chapterId: chapters.map((chapter: {_id: number}) => chapter._id),
    })));
  
    const publishedChapters = await Chapter.find({
      courseId: courseId,
      isPublished: true,
    });
  
    const publishedChapterIds = publishedChapters.map((c) => c._id);
  
    const validCompletedChapters = await UserProgress.countDocuments({
      userId: course.userId,
      chapterId: {
        $in: publishedChapterIds,
      },
      isCompleted: true,
    });
    const progressPercentage =
      (validCompletedChapters / publishedChapterIds.length) * 100;
  
 
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          chapters={chapters}
          
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          chapters={chapters}
          progressCount={progressPercentage}
          userProgress={userProgress}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout