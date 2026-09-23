import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Course } from '@/models/Course'
import { Chapter } from '@/models/Chapter'
import { courseOwnerFilter } from '@/lib/course-access'

import { mongooseConnect } from '@/lib/mongoose'
const CoursesPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/")
  }

  await mongooseConnect();
  const course = await Course.find(await courseOwnerFilter(userId)).sort({ position: 1, createdAt: -1 }).lean()
  const courseIds = course.map((item) => item._id)
  const lessonCounts = await Chapter.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ])
  const lessonCountByCourse = new Map(
    lessonCounts.map((item) => [String(item._id), item.count])
  )
  const courseRows = course.map((item) => ({
    ...item,
    lessonCount: lessonCountByCourse.get(String(item._id)) ?? 0,
  }))
  const courses = JSON.parse(JSON.stringify(courseRows))
  return (
    <>
   
     <div className="p-6">
          <DataTable columns={columns} data={courses} />
    </div>
    </>
   
  )
}

export default CoursesPage
