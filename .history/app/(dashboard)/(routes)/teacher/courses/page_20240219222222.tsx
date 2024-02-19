import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Course } from '@/models/Course'


async function getData(): Promise<any[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}
 
const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/")
  }

  const courses = await Course.find()
  return (
    <div className="p-6">
          <DataTable columns={columns} data={courses} />
    </div>
  )
}

export default CoursesPage