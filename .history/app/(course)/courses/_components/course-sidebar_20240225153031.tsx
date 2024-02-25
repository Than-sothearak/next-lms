"use client";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
  course: {};
  chapters: {
    _id: number;
    title: string;
  }[];
}

export const CourseSidebar = async ({
  chapters,
}: CourseSidebarProps) => {
  //   const purchase = await db.purchase.findUnique({
  //     where: {
  //       userId_courseId: {
  //         userId,
  //         courseId: course.id,
  //       }
  //     }
  //   });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">sdsd</h1>
        {/* {purchase && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )} */}
      </div>
      <div className="flex flex-col w-full">
        {chapters?.map((chapter) => (
          <CourseSidebarItem
            key={chapter._id}
            _id={chapter._id}
            label={chapter.title}
            // isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
          />
        ))}
      </div>
    </div>
  );
};
