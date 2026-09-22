"use client";

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { Copy } from "lucide-react";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

interface ChapterActionsProps {
    disabled: boolean,
    isPublished: boolean,
    courseId: string,
    chapterId: string,
    isAdmin?: boolean,
}
const ChapterActions = ({
    disabled,
    isPublished,
    courseId,
    chapterId,
    isAdmin = false,
}: ChapterActionsProps) => {

    const [isLoading,setIsLoading] = useState(false)
    const [courses, setCourses] = useState<{ _id: string; title: string }[]>([]);
    const [destinationCourseId, setDestinationCourseId] = useState("");
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
    const onCopy = async () => {
      if (!destinationCourseId) return;
      try {
        setIsLoading(true);
        await axios.post("/api/admin/copy-chapter", {
          chapterId,
          destinationCourseId,
        });
        toast.success("Chapter copied");
        setDestinationCourseId("");
      } catch {
        toast.error("Could not copy chapter");
      } finally {
        setIsLoading(false);
      }
    };
    const loadCourses = async () => {
      if (courses.length) return;
      try {
        const { data } = await axios.get("/api/admin/copy-chapter");
        setCourses(data.filter((course: { _id: string }) => course._id !== courseId));
      } catch {
        toast.error("Could not load courses");
      }
    };
  return (
    <div className='flex flex-wrap items-center gap-2'>
        {isAdmin && (
          <>
            <select
              value={destinationCourseId}
              onChange={(event) => setDestinationCourseId(event.target.value)}
              onFocus={loadCourses}
              disabled={isLoading}
              className="h-9 max-w-48 rounded-md border bg-white px-2 text-sm"
              aria-label="Destination course"
            >
              <option value="">Copy to course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
            <Button onClick={onCopy} disabled={!destinationCourseId || isLoading} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </>
        )}
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