"use client";

import { CourseProgress } from "@/components/course-progress";
import { formatPrice } from "@/lib/format";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CoursesCardProps {
    _id: number;
  title: string;
  categoryId: string;
  imageUrl: string;
  chapter: string[];
  price: number;

  category: {
    name: string;
  };
  chapters: {
    isFree: boolean;
  };

  validCompletedChapters: string[]
}
export default function CoursesCard({
    _id,
  title,
  category,
  chapter,
  imageUrl,
  chapters,
  price,
  validCompletedChapters,
}: CoursesCardProps) {

const progressPercentage = (validCompletedChapters.length / chapter.length) * 100;
  return (
    <Link href={`/courses/${_id}`} className="p-4 border border-slate-200 rounded-md flex flex-col justify-between ite">
      <div className="relative aspect-video">
        <Image
          alt="Uplaod"
          fill
          className="object-cover rounded-md"
          src={imageUrl}
        />
      </div>

      <div className="mt-2">
        <h1 className="text-md">{title}</h1>
        <p className="text-sm text-slate-500 mt-2">{category.name}</p>
        <div className="flex items-center gap-x-2 mt-4 mb-4">
          <BookOpen className="w-4 h-4" />
          <p className="text-sm text-slate-500">{chapter.length} Chapters</p>
        </div>
      </div>
      {/* {!chapters.isFree ? <p className="text-slate-700">Not free</p> : <p>Free</p>} */}
      {progressPercentage}

      {progressPercentage !== null ? (
            <CourseProgress
              variant={progressPercentage === 100 ? "success" : "default"}
              size="sm"
              value={progressPercentage}
            />
          ) : (
            <p className="text-md md:text-sm font-medium text-slate-700">
              {formatPrice(price)}
            </p>
          )}
      <p className="text-md">
       
        {price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </p>
    </Link>
  );
}
