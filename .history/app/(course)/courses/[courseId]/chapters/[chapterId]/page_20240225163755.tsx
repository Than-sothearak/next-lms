import { mongooseConnect } from '@/lib/mongoose';
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

  if(!userId) {
    return redirect("/")
  }
  
  return (
    <div>ChapterPage</div>
  )
}

export default ChapterPage