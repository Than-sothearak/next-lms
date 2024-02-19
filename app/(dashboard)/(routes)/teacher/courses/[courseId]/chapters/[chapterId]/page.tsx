import { IconBadge } from "@/components/ui/icon.badge";
import { mongooseConnect } from "@/lib/mongoose";
import { auth } from "@clerk/nextjs";
import {
  ArrowLeft,
  CircleDollarSign,
  Eye,
  File,
  LayoutDashboard,
  ListChecks,
  Video,
} from "lucide-react";
import { redirect } from "next/navigation";

import { ImageForm } from "../../_components/image-form";
import { PriceForm } from "../../_components/price-from";
import { Chapter } from "@/models/Chapter";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import Link from "next/link";
import { Course } from "@/models/Course";
import { ChapterDesciptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterVideo } from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import ChapterActions from "./_components/chapter-actions";
mongooseConnect();

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();
  const id = params.courseId;
  const chapterId = params.chapterId;

  const courseId = JSON.parse(
    JSON.stringify(await Course.findById({ _id: id }))
  );

  const chapter = JSON.parse(
    JSON.stringify(await Chapter.findById({ _id: chapterId }))
  );

  if (!userId) {
    redirect("/");
  }

  const requiredFields = [
    chapter.title,
    chapter.description,
    chapter.videoUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completedText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);
  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter is unpublished. it will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex w-full items-center gap-x-2 mb-5 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          <Link href={`/teacher/courses/${id}`}>back to course setup</Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">chapter._id setup</h1>
            <span className="text-sm text-start-700">
              Complete all fields {completedText}
            </span>
          </div>
          <ChapterActions
            disabled={!isComplete}
            courseId={courseId._id}
            chapterId={chapter._id}
            isPublished={chapter.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h1 className="text-xl">Customize your chapter._id</h1>
            </div>
            <ChapterTitleForm
              initialData={chapter}
              chapterId={chapter._id}
              courseId={courseId._id}
            />

            <ChapterDesciptionForm
              initialData={chapter}
              chapterId={chapter._id}
              courseId={courseId._id}
            />
            <div className="flex items-center gap-x-2 mt-8">
              <IconBadge icon={Eye} />
              <h2 className="text-xl">Chapter access</h2>
            </div>
            <ChapterAccessForm
              initialData={chapter}
              chapterId={chapter._id}
              courseId={courseId._id}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Video} />
                <h1 className="text-xl">Resourse video</h1>
              </div>
              <ChapterVideo
                initialData={chapter}
                chapterId={chapter._id}
                courseId={courseId._id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
