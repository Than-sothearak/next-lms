import { mongooseConnect } from "@/lib/mongoose"
import { Category, Course } from "@/models/Course";
import { Chapter } from "@/models/Chapter";
import { Purchase } from "@/models/Purchase";
import { UserProgress } from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import { InfoCard } from "./_components/info-card";
import { BookOpen, CheckCircle, Clock, ListPlus, Library } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CoursesList } from "../search/_components/courses-list";
import { getProgress } from "@/actions/get-progress";
import { cookies } from "next/headers";
import { getStudentLanguage, getStudentTranslations } from "@/lib/student-translations";
import { TelegramRootGate } from "./_components/telegram-root-gate";

export default async function Dashboard() {
  const {userId} = await auth();
  if (!userId) return <TelegramRootGate />;

  await mongooseConnect();
  const language = getStudentLanguage((await cookies()).get("student-language")?.value);
  const labels = getStudentTranslations(language);


  const findPurchasedCourses = await Purchase.find({
    userId,  
  }, { courseId: 1})
  
  const PurchasedCourses = JSON.parse(JSON.stringify(await Course.find({_id: { $in: findPurchasedCourses.map(c => c.courseId)}, isPublished: true })))
  const totalPublishedCourses = await Course.countDocuments({ isPublished: true });
  const coursesToEnroll = Math.max(0, totalPublishedCourses - PurchasedCourses.length);

  const fullCourses = []
        for (let course of PurchasedCourses) {
           let category = await Category.find({_id: course.categoryId})
            
          let chapter = await Chapter.find({courseId: course._id, isPublished: true,})

            fullCourses.push(JSON.parse(JSON.stringify({course, category, chapter})))
        }
  
  const publishedChapters = JSON.parse(JSON.stringify(await Chapter.find({useId: userId, isPublished: true})));
  
  const purchase = JSON.parse(JSON.stringify(await Purchase.find({userId: userId,})))

  const validCompletedChapters = JSON.parse(JSON.stringify(await UserProgress.find({userId: userId, isCompleted: true})));
  

  for (let course of PurchasedCourses) {
    const progress = await getProgress(userId, course._id);
    course["progress"] = progress;
  }

  const completedCourses = PurchasedCourses.filter((course:{progress: number}) => course.progress === 100);
  const coursesInProgress = PurchasedCourses.filter((course:{progress: number}) => (course.progress ?? 0) < 100);
  const overallProgress = totalPublishedCourses
    ? Math.round((completedCourses.length / totalPublishedCourses) * 100)
    : 0;
 
  return (

    <div className="p-6 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

     <InfoCard
        icon={Library}
        label={labels.publishedCourses}
        courseLabel={labels.course}
        coursesLabel={labels.courses}
        numberOfItems={totalPublishedCourses}
     />
     <InfoCard
        icon={BookOpen}
        label={labels.enrolledCourses}
        courseLabel={labels.course}
        coursesLabel={labels.courses}
        numberOfItems={PurchasedCourses.length}
     />
     <InfoCard
        icon={ListPlus}
        label={labels.needToEnroll}
        courseLabel={labels.course}
        coursesLabel={labels.courses}
        numberOfItems={coursesToEnroll}
     />

     <InfoCard
        icon={Clock}
        label={labels.inProgress}
        courseLabel={labels.course}
        coursesLabel={labels.courses}
        numberOfItems={coursesInProgress.length}
     />
     <InfoCard
        icon={CheckCircle}
        label={labels.completed}
        courseLabel={labels.course}
        coursesLabel={labels.courses}
        numberOfItems={completedCourses?.length}
        variant="success"
     />
    </div>
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-4 font-medium">
        <h2>{labels.overallCompletion}</h2>
        <span>{overallProgress}%</span>
      </div>
      <Progress value={overallProgress} variant="success" className="h-2" aria-label={labels.overallCompletion} />
      <p className="text-sm text-gray-500">
        {labels.completedPublishedCourses}: {completedCourses.length} / {totalPublishedCourses}
      </p>
    </div>
    <CoursesList
      items={fullCourses}
      publishedChapterIds={publishedChapters}
      validCompletedChapters={validCompletedChapters}
      purchase={purchase}
      labels={labels}
    />
  </div>
 
  )
}
