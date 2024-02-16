import { Button } from '@/components/ui/button'
import { mongooseConnect } from '@/lib/mongoose'
// import { Category } from '@/models/Category'
import { Category } from '@/models/Course'
import Link from 'next/link'
import React from 'react'


mongooseConnect();

const CategoryPage = async () => {

  const categories = await Category.find()
  
  return (
    <div className="p-6">
      <Link href="/teacher/createcat">
      <Button>Create category</Button>
      </Link>
      <div className="mt-10">
      {categories.map((cat) => (
      <p key={cat._id}>{cat.name}</p>
    ))}
      </div>
    </div>
  )
}

export default CategoryPage