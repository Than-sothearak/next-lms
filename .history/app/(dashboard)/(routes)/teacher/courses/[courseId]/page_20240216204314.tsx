import { IconBadge } from "@/components/ui/icon.badge";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import {
  CircleDollarSign,
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
import { PriceForm } from "./_components/price-from";
import { AttactmentForm } from "./_components/attactment-form";
import { Attachment } from "@/models/Attachment";
import { ChapterForm } from "./_components/chapter-form";
import { Chapter } from "../../../../../../models/Chapter"
mongooseConnect();

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  const id = params.courseId;

  const courses = await Course.findById({ _id: id });
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
    course.price,
    course.categoryId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `(${completedFields}/${totalFields})`;
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-start-700">
            Complete all fields {completedText}
          </span>
        </div>
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
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h1 className="text-xl">Sell your course</h1>
            </div>
            <PriceForm initialData={course} courseId={course._id} />
          </div>

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
  );
};

export default CourseIdPage;
