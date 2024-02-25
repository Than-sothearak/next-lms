"use client"

import CoursesCard from "../courses-card";

interface CoursesProps {
    items: {
        course: {
            _id: number;
            title: string;
            categoryId: string;
            imageUrl: string;
            chapter: string[]
            price: number;
        }
        category: [
            {
                name: string;
                _id: string;
            }
        ]
        chapter: [
            {
                _id: number;
                courseId: number;
                isFree: boolean;
            }
        ]
    }[];

    publishedChapterIds: {};
    validCompletedChapters: {}
    purchase:{}
}

export const CoursesList = ({items}: CoursesProps) => {
 const courses = items.map((c) => {
    return c.course
 })
 const category = items.map((c) => {
    return c.category
 })
 const chapter = items.map((c) => {
    return c.chapter
 })

 const chapters = chapter.map(c => c[0])
 const categories = category.map(c => c[0])

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {courses.map((course) => (
          
            <CoursesCard 
            category={categories.filter(c => c._id === course.categoryId)[0]}
            key={course._id}
            chapters={chapters.filter(c => c.courseId === course._id)[0]}
            {...course }
          
            />
            
          
        ))}
    </div>
  )
}
