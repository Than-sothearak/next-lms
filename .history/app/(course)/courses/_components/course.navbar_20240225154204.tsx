
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";


interface CourseNavbarProps {
  course: {
    _id: string
  },
  chapters: {
    _id: number;
    title: string;
    isCompleted: boolean, 
    courseId: string, 
    isLocked: boolean,
  }[];
};

export const CourseNavbar = ({
  course,
  chapters,

}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar
        course={course}
        chapters={chapters}
 
      />
      <NavbarRoutes />      
    </div>
  )
}