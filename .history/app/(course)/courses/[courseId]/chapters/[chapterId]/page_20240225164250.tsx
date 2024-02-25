import { mongooseConnect } from '@/lib/mongoose';
import { Chapter } from '@/models/Chapter';
import { Purchase } from '@/models/Purchase';
import { auth } from '@clerk/nextjs'
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

  if(!userId) {
    return redirect("/")
  }
  
  const chpater = JSON.parse(JSON.stringify(await Chapter.find({_id: chapterId, isPublished: true})))
  const purchase = await Purchase.find({userId: userId, courses: courseId})

  return (
    <div>ChapterPage</div>
  )
}

export default ChapterPage