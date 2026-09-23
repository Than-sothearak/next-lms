import { CourseSidebarItem } from "./course-sidebar-item";
import { Purchase } from "@/models/Purchase";
import { CourseProgressPopup } from "@/components/course-progress-popup";
import { UserProgress } from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import type { StudentTranslations } from "@/lib/student-translations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface CourseSidebarProps {
  course: {
    _id: string;
    userId: string;
    title: string;
  };
  chapters: {
    _id: string;
    title: string;
    courseId: string;
    isFree: boolean;
    updatedAt?: string;
    createdAt?: string;
  }[];

  progressCount: number;
  labels: StudentTranslations;

}

export const CourseSidebar = async ({
  chapters,
  course,
  progressCount,
  labels,

}: CourseSidebarProps) => {

  const { userId } = await auth()

  
  const purchase = await Purchase.findOne({
    userId: userId,
    courseId: course._id,
  });

  const userProgress = JSON.parse(JSON.stringify(await UserProgress.find({
    userId: userId,
  })));

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
            <Link href="/search" className="p-4">
              <Button variant="ghost" size="sm"><Home className="mr-2 h-4 w-4" />{labels.allLessons}</Button>
            </Link>
      <div className="p-8 flex flex-col border-b">
          
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgressPopup value={progressCount} labels={labels} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {chapters?.map((chapter) => (
          <CourseSidebarItem
            key={chapter._id}
            _id={chapter._id}
            label={chapter.title}
            isCompleted={!!userProgress?.filter((c: {chapterId: string}) => c.chapterId === chapter._id)[0]?.isCompleted}
            courseId={course._id}
            isLocked={!chapter.isFree && !purchase}
            updatedAt={chapter.updatedAt}
            createdAt={chapter.createdAt}
            newLabel={labels.newLesson}
            updatedLabel={labels.updated}
          />
        ))}
      </div>
    </div>
  );
};
