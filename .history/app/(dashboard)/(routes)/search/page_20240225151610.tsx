import { mongooseConnect } from '@/lib/mongoose'
import { Category, Course } from '@/models/Course'
import React from 'react'
import { Categories } from './_components/categories'
import { SearchInput } from '@/components/search-input'
import { CoursesList } from './_components/courses-list'
import { getCourses } from '@/actions/get-courses'
import { auth } from '@clerk/nextjs'
import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  }
}


const SearchPage = async ({searchParams}: SearchPageProps) => {
  await mongooseConnect()
  const {userId} = auth();

  if (!userId) {
    return redirect("/");
  }
  
  const courses = await getCourses({
    userId,
    ...searchParams
  })


  const categories = JSON.parse(JSON.stringify(await Category.find().sort({name: 1})))

  // const courses =JSON.parse(JSON.stringify(await Course.find(
  //   {isPublished: true,}).sort({ createdAt: -1}))) 
  return (
    <>
    <div className='px-6 pt-6 md:hidden md:mb-0 block'>
      <SearchInput />
    </div>
    <div className='p-6'>
      <Categories 
      items={categories}
      />
      <CoursesList 
      items={courses}
      />
    </div>
    </>
  )
}

export default SearchPage