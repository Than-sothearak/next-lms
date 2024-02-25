
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";


interface CourseNavbarProps {
  course: [],

};

export const CourseNavbar = ({
  course,

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