import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import type { StudentTranslations } from "@/lib/student-translations";

interface CourseMobileSidebarProps {
  course: {
    _id: string;
    userId: string;
    title: string;
  };
  chapters: {
    _id: string;
    title: string;
    courseId: string, 
    isFree: boolean,
  }[];
  progressCount: number;
  labels: StudentTranslations;
};

export const CourseMobileSidebar = ({ 
  course,
  chapters,
  progressCount,
  labels,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>

      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-72">
        <CourseSidebar
          course={course}
          chapters={chapters}
          progressCount={progressCount}
          labels={labels}
        />
      </SheetContent>
    </Sheet>
  )
}