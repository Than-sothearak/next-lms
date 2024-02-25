
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";


interface CourseNavbarProps {
  course: {
    _id: string;
    userId: string;
    title: string;
  },
  chapters: {
    _id: string;
    title: string;
    courseId: string, 
    isFree: boolean,
  }[];
  progressCount: number
};

export const CourseNavbar = ({
  course,
  chapters,
  progressCount

}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar
        course={course}
        chapters={chapters}
        progressCount={progressCount}
 
      />
      <NavbarRoutes />      
    </div>
  )
}