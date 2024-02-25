import { mongooseConnect } from "@/lib/mongoose"
import { Chapter } from "@/models/Chapter";
import { Course, Category} from "@/models/Course";
import { UserProgress } from "@/models/UserProgress";

import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = typeof Course & {
    category: typeof Category | null;
    chapters: { id: string }[];
    progress: number | null;
  };

  type GetCourses = {
    userId: string | null;
    title?: string;
    searchParams?: string,
    categoryId?: string;
    category?: string[];
    chapter?:  string[];
  };
export const getCourses = async ({
    userId,
    title,
    searchParams,
    categoryId,
    category,
    chapter,
}: GetCourses) => {
    await mongooseConnect()
    try {

        const courses = await Course.find(
            {isPublished: true, 
                // searchParams,
            //  title: {$regex: title, $option: 'i'}
            }).sort({ createdAt: -1})
   
        const fullCourses = []
        for (let course of courses) {
            category = await Category.find({_id: course.categoryId})
            
            chapter = await Chapter.find({courseId: course._id, isPublished: true,})

            fullCourses.push({course, category, chapter})
        }
        
       return   JSON.parse(JSON.stringify(fullCourses));
       

    } catch (error) {
        console.log("[GET_COURSES]", error);
        return [];
      }
}