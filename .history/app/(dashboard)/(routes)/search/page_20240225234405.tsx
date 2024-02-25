import { mongooseConnect } from '@/lib/mongoose'
import { Category, Course } from '@/models/Course'
import React from 'react'
import { Categories } from './_components/categories'
import { SearchInput } from '@/components/search-input'
import { CoursesList } from './_components/courses-list'
import { getCourses } from '@/actions/get-courses'
import { auth } from '@clerk/nextjs'
import { redirect } from "next/navigation";
import { Chapter } from '@/models/Chapter'
import { UserProgress } from '@/models/UserProgress'
import { Purchase } from '@/models/Purchase'

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

  const publishedChapters = JSON.parse(JSON.stringify(await Chapter.find({isPublished: true})));
  
  const purchase = JSON.parse(JSON.stringify(await Purchase.find({userId: userId})))

  const validCompletedChapters = JSON.parse(JSON.stringify(await UserProgress.find({})));
  // const progressPercentage =(validCompletedChapters / publishedChapterIds.length) * 100;

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
      publishedChapterIds={publishedChapters}
      validCompletedChapters={validCompletedChapters}
      />
    </div>
    </>
  )
}

export default SearchPage