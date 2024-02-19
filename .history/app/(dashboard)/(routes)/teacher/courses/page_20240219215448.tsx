import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

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
 
const CoursesPage = () => {
  return (
    <div className="p-6">
      <Link href="/teacher/create">
      <Button>Create courses</Button>
      </Link>
    </div>
  )
}

export default CoursesPage