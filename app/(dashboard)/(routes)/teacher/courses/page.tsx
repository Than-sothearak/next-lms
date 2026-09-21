import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Course } from '@/models/Course'
import { courseOwnerFilter } from '@/lib/course-access'

import { mongooseConnect } from '@/lib/mongoose'
const CoursesPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/")
  }

  await mongooseConnect();
  const course = await Course.find(await courseOwnerFilter(userId)).sort({createdAt: -1})
  const courses = JSON.parse(JSON.stringify(course))
  return (
    <>
   
     <div className="p-6">
          <DataTable columns={columns} data={courses} />
    </div>
    </>
   
  )
}

export default CoursesPage
