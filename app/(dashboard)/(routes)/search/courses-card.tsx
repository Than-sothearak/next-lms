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

  validCompletedChapters: {
    isCompleted: boolean;
  }[];
  purchase: {};
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
  purchase,
}: CoursesCardProps) {
  const countCompleted = validCompletedChapters.map((f) => f.isCompleted);
  const count = countCompleted.filter(Boolean).length;
  const progressPercentage = (count / chapter.length) * 100;

  return (
    <Link
      href={`/courses/${_id}`}
      className="p-4 border border-slate-200 rounded-md flex flex-col justify-between ite"
    >
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

      {progressPercentage !== null ? (
        <div>
          {purchase && (
            <CourseProgress
              variant={progressPercentage === 100 ? "success" : "default"}
              size="sm"
              value={progressPercentage}
            />
          )}
        </div>
      ) : (
        <p className="text-md md:text-sm font-medium text-slate-700">
          {formatPrice(price)}
        </p>
      )}

      {!purchase ? (
        <div>
          <p className="text-md mt-4">
           {price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-slate-100 text-md mt-4 p-2 bg-blue-600 text-center rounded-md">
            Your course
          </p>
        </div>
      )}
    </Link>
  );
}
