import { Banner } from "@/components/banner";
import { Preview } from "@/components/preview";
import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { Chapter } from "@/models/Chapter";
import { Purchase } from "@/models/Purchase";
import { UserProgress } from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import { Separator } from "@/components/ui/separator";
import { File } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { VideoPlayer } from "./_components/video-palyer";
import { CourseProgressButton } from "./_components/course-progress-button";
import { CourseEnrollButton } from "./_components/course-entroll-button";
import { Course } from "@/models/Course";
import { BackButton } from "./_components/back-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { getStudentLanguage, getStudentTranslations } from "@/lib/student-translations";

const ChapterPage = async ({
  params,
}: {
  params: Promise<{ chapterId: string; courseId: string }>;
}) => {
  await mongooseConnect();
  const { userId } = await auth();

  const chapterId = (await params).chapterId;
  const courseId = (await params).courseId;
  const labels = getStudentTranslations(
    getStudentLanguage((await cookies()).get("student-language")?.value)
  );

  if (!userId) {
    return redirect("/");
  }

  const course = JSON.parse(
    JSON.stringify(await Course.findById({ _id: courseId, userId: userId }))
  );
  const chapter = JSON.parse(
    JSON.stringify(
      await Chapter.findById({ _id: chapterId, isPublished: true })
    )
  );
  const purchase = await Purchase.findOne({
    userId: userId,
    courseId: courseId,
  });

  const userProgress = await UserProgress.findOne({
    userId: userId,
    chapterId: chapterId,
  });

  const orderedChapters = await Chapter.find({
    courseId,
    isPublished: true,
  }).sort({ position: 1, createdAt: 1 });
  const currentChapterIndex = orderedChapters.findIndex(
    (item) => String(item._id) === String(chapterId)
  );
  const nextChapter = JSON.parse(
    JSON.stringify(orderedChapters[currentChapterIndex + 1] || null)
  );

  const isLocked = !chapter.isFree && !purchase;

  let attachments: {
    _id: string;
    name: string;
    url: string;
  }[] = [];

  if (purchase != null) {
    attachments = await Attachment.find({ courses: courseId });
  }

  const completeOnEnd = !!purchase;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant="success" label={labels.alreadyCompleted} />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label={labels.purchaseRequired}
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <BackButton label={labels.back} />
          <VideoPlayer
            chapterId={(await params).chapterId}
            title={chapter.title}
            url={chapter.videoUrl}
            imageUrl={chapter.imageUrl}
            courseId={(await params).courseId}
            nextChapterId={nextChapter?._id}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
            isCompleted={!!userProgress?.isCompleted}
            labels={labels}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
            {/* {!purchase ? (
              <CourseEnrollButton
                courseId={(await params).courseId}
                price={course.price!}
              />
            ) : (
              <CourseProgressButton
                chapterId={(await params).chapterId}
                courseId={(await params).courseId}
                nextChapterId={nextChapter?._id}
                isCompleted={!!userProgress?.isCompleted}
                labels={labels}
              />
            )} */}
            {userProgress?.isCompleted ? <CourseProgressButton
              chapterId={(await params).chapterId}
              courseId={(await params).courseId}
              nextChapterId={nextChapter?._id}
              isCompleted={!!userProgress?.isCompleted}
              labels={labels}
            /> : <span className="rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-600">{labels.watchToComplete}</span>}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {nextChapter?._id && userProgress?.isCompleted && (
            <div className="flex justify-end p-4">
              <Link href={`/courses/${courseId}/chapters/${nextChapter._id}`}>
                <Button type="button">{labels.nextLesson}</Button>
              </Link>
            </div>
          )}
          {!nextChapter?._id && userProgress?.isCompleted && (
            <div className="flex flex-wrap justify-end gap-2 p-4">
              <Link href="/">
                <Button type="button" variant="outline">{labels.nextCourse}</Button>
              </Link>
              <Link href="/search">
                <Button type="button">{labels.backToCourse}</Button>
              </Link>
            </div>
          )}
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    key={attachment._id}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;
