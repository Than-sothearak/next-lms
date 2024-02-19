"use client";

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

interface ChapterActionsProps {
    disabled: boolean,
    isPublished: boolean,
    courseId: string,
    chapterId: string,
}
const ChapterActions = ({
    disabled,
    isPublished,
    courseId,
    chapterId
}: ChapterActionsProps) => {

    const [isLoading,setIsLoading] = useState(false)
    const router = useRouter();
    const onDelete = async () => {
   
      try{
        setIsLoading(true)

        await axios.delete(`/api/course/${courseId}/chapters/${chapterId}`)
        toast.success("Chapter deleted")
       
        router.push(`/teacher/courses/${courseId}`)
        router.refresh()
        setIsLoading(false)
      } catch {
        toast.error("Someting went wrong")
      }
    }

    const onPublish = async () => {
      try {

        setIsLoading(true)
        if (isPublished) {
          await axios.patch(`/api/course/${courseId}/chapters/${chapterId}/unpublish`);
          toast.success("Chapter unpublished");
          setIsLoading(false)
          router.refresh()
        }else {
          await axios.patch(`/api/course/${courseId}/chapters/${chapterId}/publish`);
          toast.success("Chapter published");
          setIsLoading(false)
          router.refresh()
        }

      } catch {
        toast.error("Someting went wrong")
      }
    }
  return (
    <div className='flex items-center gap-x-2'>
        <Button onClick={onPublish}
        disabled={disabled}
        variant='outline'
        size='sm'
        >
            {isPublished ? "Unpublished" : "Publish"}
        </Button>
        <ConfirmModal onConfirm={onDelete}>
        <Button size='sm' disabled={isLoading}>
            <Trash className='h-4 w-4'/>
        </Button>
        </ConfirmModal>
        

    </div>
  )
}

export default ChapterActions