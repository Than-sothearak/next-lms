import { IconBadge } from "@/components/ui/icon.badge";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import {
  // CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DesciptionForm } from "./_components/description-from";
import { ImageForm } from "./_components/image-form";
import { Category } from "@/models/Course";
import { CategoryForm } from "./_components/category-from";
// import { PriceForm } from "./_components/price-from";
import { AttactmentForm } from "./_components/attactment-form";
import { Attachment } from "@/models/Attachment";
import { ChapterForm } from "./chapters/[chapterId]/_components/chapter-form";
import { courseOwnerFilter } from "@/lib/course-access";
import { Chapter } from "../../../../../../models/Chapter"
import { Banner } from "@/components/banner";
import Actions from "./_components/actions";

const CourseIdPage = async ({ params }: { params: Promise<{ courseId: string }> }) => {
  const { userId } = await auth();
  const id = (await params).courseId;

  if (!userId) redirect("/");
  await mongooseConnect();
  const courses = await Course.findOne({ _id: id, ...await courseOwnerFilter(userId) });
  if (!courses) redirect("/teacher/courses");
  const category = await Category.find();
  const course = JSON.parse(JSON.stringify(courses));
  const getAttachments = await Attachment.find({ courses: id }).populate("courses");
  const attachments = JSON.parse(JSON.stringify(getAttachments));
  
  const getChapters = await Chapter.find({ courseId: id}).sort({position: 1})
  const chapters = JSON.parse(JSON.stringify(getChapters));

  if (!userId) {
    redirect("/");
  }

  if (!course) {
    return redirect("/");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    getChapters.some(chapter => chapter.isPublished)
  ];
  

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean)

  return (
   <>
   {!course.isPublished && (
    <Banner
    variant="warning"
    label="This course is unpublished. it will not be visible to students."
  />
   )}
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-start-700">
            Complete all fields {completedText}
          </span>
        </div>
        <Actions
            disabled={!isComplete}
            courseId={course._id}
            chapterId={chapters?._id}
            isPublished={course?.isPublished}
          />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h1 className="text-xl">Customize your course</h1>
          </div>
          <TitleForm initialData={course} courseId={course._id} />

          <DesciptionForm initialData={course} courseId={course._id} />

          <ImageForm initialData={course} courseId={course._id} />

          <CategoryForm
            initialData={course}
            courseId={course._id}
            options={category.map((category) => ({
              label: JSON.parse(JSON.stringify(category.name)),
              value: JSON.parse(JSON.stringify(category._id)),
            }))}
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Course chapter</h2>
            </div>
            <div>
              <ChapterForm 
              initialData={chapters} 
              chapters={chapters}
              courseId={course._id} />
            </div>
          </div>
          {/* Price setting is paused; restore this section when course pricing is needed.
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h1 className="text-xl">Sell your course</h1>
            </div>
            <PriceForm initialData={course} courseId={course._id} />
          </div>
          */}
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h1 className="text-xl">Resourse & Attactment</h1>
            </div>
            <AttactmentForm
              attachmentsProps={attachments}
              attachments={attachments}
              course={course}
              courseId={course._id}
            />
          </div>
        </div>
      </div>
    </div>
   </>
  );
};

export default CourseIdPage;
