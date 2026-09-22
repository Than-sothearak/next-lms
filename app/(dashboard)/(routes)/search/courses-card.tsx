"use client";

import { CourseProgress } from "@/components/course-progress";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StudentTranslations } from "@/lib/student-translations";

interface CoursesCardProps {
  _id: number | string;
  title: string;
  categoryId: string;
  imageUrl: string;
  chapter: { _id: string; updatedAt?: string | Date }[];
  price: number;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  chaptersForCourse: { updatedAt?: string | Date; createdAt?: string | Date }[];

  category: {
    name: string;
  };
  chapters?: {
    isFree: boolean;
  };

  validCompletedChapters: {
    isCompleted: boolean;
  }[];
  purchase?: {};
  labels: StudentTranslations;
}
export default function CoursesCard({
  _id,
  title,
  category,
  chapter,
  imageUrl,
  chapters,
  price,
  updatedAt,
  createdAt,
  chaptersForCourse,
  validCompletedChapters,
  purchase,
  labels,
}: CoursesCardProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(Boolean(purchase));
  const [isSubscribing, setIsSubscribing] = useState(false);

  const countCompleted = validCompletedChapters.map((f) => f.isCompleted);
  const count = countCompleted.filter(Boolean).length;
  const progressPercentage = chapter.length ? (count / chapter.length) * 100 : 0;
  const recentWindow = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const isRecent = (date?: string | Date) => {
    if (!date) return false;
    const timestamp = new Date(date).getTime();
    return Number.isFinite(timestamp) && timestamp <= now && now - timestamp < recentWindow;
  };
  const isNewCourse = isRecent(createdAt);
  const hasNewLesson = chaptersForCourse.some((chapter) => isRecent(chapter.createdAt));
  const hasLessonUpdate = chaptersForCourse.some((chapter) => !isRecent(chapter.createdAt) && isRecent(chapter.updatedAt));

  const subscribeToCourse = async () => {
    setIsSubscribing(true);

    try {
      const response = await fetch(`/api/course/${_id}/enroll`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(labels.unableToSubscribe);
      }

      setIsEnrolled(true);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : labels.unableToSubscribe);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div
      className="p-4 border border-slate-200 rounded-md flex flex-col justify-between ite"
    >
      <div className="relative aspect-video">
        <Image
          alt="Uplaod"
          fill
          className="object-cover rounded-md"
          src={imageUrl}
        />
        {(isNewCourse || hasNewLesson || hasLessonUpdate) && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {isNewCourse && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">{labels.newCourse}</span>}
            {hasNewLesson && <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">{labels.newLesson}</span>}
            {hasLessonUpdate && <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">{labels.lessonUpdate}</span>}
          </div>
        )}
      </div>

      <div className="mt-2">
        <Link href={`/courses/${_id}`} className="text-md hover:underline">
          {title}
        </Link>
        <p className="text-sm text-slate-500 mt-2">{category?.name}</p>
        <div className="flex items-center gap-x-2 mt-4 mb-4">
          <BookOpen className="w-4 h-4" />
          <p className="text-sm text-slate-500">{chapter.length} {labels.chapters}</p>
        </div>
      </div>
      {/* {!chapters.isFree ? <p className="text-slate-700">Not free</p> : <p>Free</p>} */}

      {isEnrolled ? (
        <div>
          <CourseProgress
            variant={progressPercentage === 100 ? "success" : "default"}
            size="sm"
            value={progressPercentage}
          />
        </div>
      ) : (
        <p className="text-md md:text-sm font-medium text-slate-700">{labels.freeToJoin}</p>
      )}

      {!isEnrolled ? (
        <button
          type="button"
          onClick={subscribeToCourse}
          disabled={isSubscribing}
          className="text-slate-100 text-md mt-4 p-2 bg-blue-600 text-center rounded-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubscribing ? labels.subscribing : labels.subscribe}
        </button>
      ) : (
        <Link
          href={`/courses/${_id}`}
          className="text-slate-100 text-md mt-4 p-2 bg-blue-600 text-center rounded-md"
        >
          {labels.startCourse}
        </Link>
      )}
    </div>
  );
}
