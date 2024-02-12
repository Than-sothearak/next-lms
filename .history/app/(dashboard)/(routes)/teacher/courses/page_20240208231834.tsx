import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const CoursesPage = () => {
  return (
    <div>
      <Link href="/teacher/courses/create">
      <Button>Create courses</Button>
      </Link>
    </div>
  )
}

export default CoursesPage