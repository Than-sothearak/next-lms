import { IconBadge } from "@/components/ui/icon.badge";
import { mongooseConnect } from "@/lib/mongoose";
import { auth } from "@clerk/nextjs";
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "../../_components/title-form";
import { DesciptionForm } from "../../_components/description-from";
import { ImageForm } from "../../_components/image-form";
import { CategoryForm } from "../../_components/category-from";
import { PriceForm } from "../../_components/price-from";
import { AttactmentForm } from "../../_components/attactment-form";
import { Attachment } from "@/models/Attachment";
import { ChapterForm } from "../../_components/chapter-form";
import { Chapter } from "@/models/Chapter"
mongooseConnect();

const courseIdPage = async ({ params }: { params: { courseId: string, chapterId: string} }) => {
  const { userId } = auth();
  const id = params.courseId;
  const chapterId = params.chapterId;

  const chapters = await Chapter.findById({ _id: id });


  const getChapters = JSON.parse(JSON.stringify(await Chapter.findById({_id: chapterId})));

  if (!userId) {
    redirect("/");
  }


  const requiredFields = [
    chapters.title,
    chapters.description,
    chapters.videoUrl,
    chapters.price,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `(${completedFields}/${totalFields})`;
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">chapter._id setup</h1>
          <span className="text-sm text-start-700">
            Complete all fields {completedText}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h1 className="text-xl">Customize your chapter._id</h1>
          </div>
          <TitleForm initialData={chapters._id} courseId={chapters._id._id} />

          <DesciptionForm initialData={chapters._id} courseId={chapters._id._id} />

          <ImageForm initialData={chapters._id} courseId={chapters._id._id} />

        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">chapter._id chapter</h2>
            </div>
            <div>
              <ChapterForm 
              initialData={chapters} 
              chapters={chapters}
              courseId={chapter._id._id} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h1 className="text-xl">Sell your chapter._id</h1>
            </div>
            <PriceForm initialData={chapter._id} courseId={chapter._id._id} />
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h1 className="text-xl">Resourse & Attactment</h1>
            </div>
      
          </div>
        </div>
      </div>
    </div>
  );
};

export default courseIdPage;
