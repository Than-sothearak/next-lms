import { CourseSidebarItem } from "./course-sidebar-item";
import { Purchase } from "@/models/Purchase";
import { CourseProgress } from "@/components/course-progress";
import { UserProgress } from "@/models/UserProgress";

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

}

export const CourseSidebar = async ({
  chapters,
  course,
  progressCount,

}: CourseSidebarProps) => {
  const purchase = await Purchase.findOne({
    userId: course.userId,
    courseId: course._id,
  });

  const userProgress = JSON.parse(JSON.stringify(await UserProgress.find({
    userId: course.userId,
  })));


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
            isCompleted={!!userProgress?.filter((c: {chapterId: string}) => c.chapterId === chapter._id)[0]?.isCompleted}
            courseId={course._id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};
