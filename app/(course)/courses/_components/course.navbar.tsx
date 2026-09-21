
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./mobile-course-sidebar";

import { StudentLanguageSwitcher } from "@/components/student-language-switcher";
import type { StudentLanguage, StudentTranslations } from "@/lib/student-translations";


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
  progressCount: number;
  language: StudentLanguage;
  labels: StudentTranslations;
};

export const CourseNavbar = ({
  course,
  chapters,
  progressCount,
  language,
  labels

}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar
        course={course}
        chapters={chapters}
        progressCount={progressCount}
        labels={labels}
 
      />
    
      <StudentLanguageSwitcher language={language} labels={labels} />
      <NavbarRoutes />      
    </div>
  )
}
