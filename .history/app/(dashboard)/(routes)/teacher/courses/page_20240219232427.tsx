import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Course } from '@/models/Course'


const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/")
  }

  const course = await Course.find({userId: userId}).sort({createdAt: -1})
  const courses = JSON.parse(JSON.stringify(course))
  return (
    <>
    <div className='p-6'>
      <Link href="/teacher/create">
      <Button>
        Create new course
      </Button>
      </Link>
    </div>
     {/* <div className="p-6">
          <DataTable columns={columns} data={courses} />
    </div> */}
    </>
   
  )
}

export default CoursesPage