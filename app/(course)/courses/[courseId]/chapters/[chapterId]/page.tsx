import { Banner } from "@/components/banner";
import { Preview } from "@/components/preview";
import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { Chapter } from "@/models/Chapter";
import { Purchase } from "@/models/Purchase";
import { UserProgress } from "@/models/UserProgress";
import { auth } from "@clerk/nextjs";
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

const ChapterPage = async ({
  params,
}: {
  params: { chapterId: string; courseId: string };
}) => {
  await mongooseConnect();
  const { userId } = auth();

  const chapterId = params.chapterId;
  const courseId = params.courseId;

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
        <Banner variant="success" label="You already completed this chapter." />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <BackButton />
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            url={chapter.videoUrl}
            courseId={params.courseId}
            nextChapterId={nextChapter?._id}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
            isCompleted={!!userProgress?.isCompleted}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
            {/* {!purchase ? (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            ) : (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?._id}
                isCompleted={!!userProgress?.isCompleted}
              />
            )} */}
            {userProgress?.isCompleted ? <CourseProgressButton
              chapterId={params.chapterId}
              courseId={params.courseId}
              nextChapterId={nextChapter?._id}
              isCompleted={!!userProgress?.isCompleted}
            /> : <span className="rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-600">Watch the full video to complete</span>}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {nextChapter?._id && (
            <div className="flex justify-end p-4">
              <Link href={`/courses/${courseId}/chapters/${nextChapter._id}`}>
                <Button type="button">Next lesson</Button>
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
