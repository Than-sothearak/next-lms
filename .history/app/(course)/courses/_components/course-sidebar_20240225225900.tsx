import { CourseSidebarItem } from "./course-sidebar-item";
import { Purchase } from "@/models/Purchase";
import { CourseProgress } from "@/components/course-progress";

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
  }[];

  progressCount: number;

  userProgress: boolean;
}

export const CourseSidebar = async ({
  chapters,
  course,
  progressCount,
  userProgress,
}: CourseSidebarProps) => {
  const purchase = await Purchase.findOne({
    userId: course.userId,
    courseId: course._id,
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {chapters?.map((chapter) => (
          <CourseSidebarItem
            key={chapter._id}
            _id={chapter._id}
            label={chapter.title}
            isCompleted={!!userProgress}
            courseId={course._id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};
