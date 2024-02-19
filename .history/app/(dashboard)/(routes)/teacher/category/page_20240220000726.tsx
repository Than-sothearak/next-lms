import { Button } from '@/components/ui/button'
import { mongooseConnect } from '@/lib/mongoose'

import { Category } from '@/models/Course'
import Link from 'next/link'
import React from 'react'
import { DataTable } from '../courses/_components/data-table'
import { columns } from '../courses/_components/columns'


mongooseConnect();

const CategoryPage = async () => {

  const categories = await Category.find()
  
  return (
    <div className="p-6">
      <Link href="/teacher/createcat">
      <Button>Create category</Button>
      </Link>
     
      <div className="p-6">
          <DataTable columns={columns} data={courses} />
    </div>
      
    </div>
  )
}

export default CategoryPage