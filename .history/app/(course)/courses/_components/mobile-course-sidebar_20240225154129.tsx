"use client";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";

interface CourseMobileSidebarProps {
  course: {
    _id: string;
  };
  chapters: {
    _id: number;
    title: string;
    isCompleted: boolean, 
    courseId: string, 
    isLocked: boolean,
  }[];
};

export const CourseMobileSidebar = ({ 
  course,
  chapters,
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
        />
      </SheetContent>
    </Sheet>
  )
}