import { IconBadge } from "@/components/ui/icon.badge";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Courses";
import { auth } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DesciptionForm } from "./_components/description-from";

mongooseConnect();

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  const id = params.courseId;

  const courses= await Course.findById({ _id: id });
  const course = JSON.parse(JSON.stringify(courses));

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h1 className="text-xl">Customize your course</h1>
          </div>
          <TitleForm 
          initialData={course} 
          courseId={course._id} 
          />

          <DesciptionForm 
          initialData={course}
          courseId={course._id} 
           />
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
