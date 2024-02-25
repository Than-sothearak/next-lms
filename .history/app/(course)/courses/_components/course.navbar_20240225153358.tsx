
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";


interface CourseNavbarProps {
  course: [],
  chapters: {}
};

export const CourseNavbar = ({
  course,
  chapters,

}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar
        course={course}
 
      />
      <NavbarRoutes />      
    </div>
  )
}