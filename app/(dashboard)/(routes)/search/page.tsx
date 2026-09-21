import { mongooseConnect } from '@/lib/mongoose'
import { Category, Course } from '@/models/Course'
import React from 'react'
import { Categories } from './_components/categories'
import { SearchInput } from '@/components/search-input'
import { CoursesList } from './_components/courses-list'
import { getCourses } from '@/actions/get-courses'
import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
import { Chapter } from '@/models/Chapter'
import { UserProgress } from '@/models/UserProgress'
import { Purchase } from '@/models/Purchase'
import { cookies } from "next/headers";
import { getStudentLanguage, getStudentTranslations } from "@/lib/student-translations";

interface SearchPageProps {
  searchParams: Promise<{
    title: string;
    categoryId: string;
  }>
}


const SearchPage = async ({searchParams}: SearchPageProps) => {
  await mongooseConnect()
  const {userId} = await auth();
  const labels = getStudentTranslations(
    getStudentLanguage((await cookies()).get("student-language")?.value)
  );

  if (!userId) {
    return redirect("/");
  }
  
  const courses = await getCourses({
    userId,
    ...await searchParams
  })


  const categories = JSON.parse(JSON.stringify(await Category.find().sort({name: 1})))

  const publishedChapters = JSON.parse(JSON.stringify(await Chapter.find({useId: userId, isPublished: true})));
  
  const purchase = JSON.parse(JSON.stringify(await Purchase.find({userId: userId})))

  const validCompletedChapters = JSON.parse(JSON.stringify(await UserProgress.find({userId: userId})));


  return (
    <>
  
    <div className='p-6'>
      <Categories 
      items={categories}
      />
      <CoursesList 
      items={courses}
      publishedChapterIds={publishedChapters}
      validCompletedChapters={validCompletedChapters}
      purchase={purchase}
      labels={labels}
      />
    </div>
    </>
  )
}

export default SearchPage