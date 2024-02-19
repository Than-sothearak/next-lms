import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Category, Course } from '@/models/Course'


const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/")
  }

  const courses = await Category.find()
  console.log(courses)
  return (
    <>
    </>
    // <div className="p-6">
    //       <DataTable columns={columns} data={''} />
    // </div>
  )
}

export default CoursesPage