
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";


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
      <Link href="/" className="ml-3">
        <Button variant="ghost" size="sm"><Home className="mr-2 h-4 w-4" />Home</Button>
      </Link>
      <NavbarRoutes />      
    </div>
  )
}
