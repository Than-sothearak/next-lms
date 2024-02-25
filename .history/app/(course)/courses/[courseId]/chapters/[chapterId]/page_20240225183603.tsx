import { Banner } from '@/components/banner';
import { Preview } from '@/components/preview';
import { mongooseConnect } from '@/lib/mongoose';
import { Attachment } from '@/models/Attachment';
import { Chapter } from '@/models/Chapter';
import { Purchase } from '@/models/Purchase';
import { UserProgress } from '@/models/UserProgress';
import { auth } from '@clerk/nextjs'
import { Separator } from "@/components/ui/separator";
import { File } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import { VideoPlayer } from './_components/video-palyer';
import { CourseProgressButton } from './_components/course-progress-button';
import { CourseEnrollButton } from './_components/course-entroll-button';
import { Course } from '@/models/Course';

const ChapterPage = async ({
  params
}:{
  params: {chapterId: string, courseId: string}
}) => {
  await mongooseConnect();
  const { userId } = auth();

  const chapterId = params.chapterId;
  const courseId = params.courseId;

  // const {
  //   chapter,
  //   course,
  //   attachments,
  //   nextChapter,
  //   userProgress,
  //   purchase,
  // } = await getChapter({
  //   userId,
  //   chapterId: chapterId,
  //   courseId: courseId,
  // });


  if(!userId) {
    return redirect("/")
  }

  let attachments: typeof Attachment[] = [];

  const course = JSON.parse(JSON.stringify(await Course.findById({_id: courseId, userId: userId})))
  const chapter = JSON.parse(JSON.stringify(await Chapter.findById({_id: chapterId, isPublished: true})))
  const purchase = await Purchase.find({userId: userId, courses: courseId})
  
  const userProgress =await UserProgress.find({userId: userId, chapterId: chapterId})
  const nextChapter = await Chapter.find({courseId: courseId, isPublished: true}).sort({position: -1})
  
  const isLocked = !chapter.isFree ;

  if (purchase) {
    attachments = await Attachment.find({course: courseId})
  }
  
 
  console.log(purchase &&)
  const completeOnEnd = !!purchase;

  return (
    <div>
       {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="You already completed this chapter."
        />
      )} 
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )} 
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            url={chapter.videoUrl}
            courseId={params.courseId}
            nextChapterId={nextChapter?._id}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {chapter.title}
            </h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?._id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
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
                    <p className="line-clamp-1">
                      {attachment.name}
                    </p>
                  </a>
                ))}
              </div> 
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChapterPage