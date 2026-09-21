import { Course } from '@/models/Course';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

const CategoryPage = async ({params}: {params: Promise<{categoryId: string}>}) => {
    const {userId} =  await auth();
    const  categoryId = (await params).categoryId;
   
    if(!userId) {
      return redirect("/")
    }

    const getCourse = await Course.find({categoryId: categoryId})
    const courses = JSON.parse(JSON.stringify(getCourse))
    
  return (
   <>
    <div>CategoryPage: {categoryId}</div>
    {courses.map((c: {_id: string, title: string}) => (
      <div key={c._id}>
        {c.title}
      </div>
    ))}
   </>
  )
}

export default CategoryPage