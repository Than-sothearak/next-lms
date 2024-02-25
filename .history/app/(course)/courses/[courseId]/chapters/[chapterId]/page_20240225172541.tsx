import { Banner } from '@/components/banner';
import { Preview } from '@/components/preview';
import { mongooseConnect } from '@/lib/mongoose';
import { Attachment } from '@/models/Attachment';
import { Chapter } from '@/models/Chapter';
import { Purchase } from '@/models/Purchase';
import { UserProgress } from '@/models/UserProgress';
import { auth } from '@clerk/nextjs'
import { Separator } from '@radix-ui/react-dropdown-menu';
import { File } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'

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

  
  const chapter = JSON.parse(JSON.stringify(await Chapter.find({_id: chapterId, isPublished: true})))
  const purchase = await Purchase.find({userId: userId, courses: courseId})
  const userProgress = await UserProgress.find({userId: userId, chapterId: chapterId})

  const isLocked = !chapter.isFree && !purchase;

  if (purchase) {
    attachments = await Attachment.find({course: courseId})
  }


  console.log(chapter)
  const completeOnEnd = !!purchase;

  return (
    <div>
      heloo word
    </div>
  )
}

export default ChapterPage