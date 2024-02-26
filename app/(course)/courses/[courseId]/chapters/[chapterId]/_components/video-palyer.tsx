"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {

  courseId: string;
  chapterId: string;
  nextChapterId?: object;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  url: string
};

export const VideoPlayer = ({

  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  url,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(true);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/course/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
          router.refresh();
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">
            This chapter is locked
          </p>
        </div>
      )}
      {!isLocked && (
         <video
         onCanPlay={() => setIsReady(true)}
         onEnded={onEnd}
         src={url}
         width="1000"
         height="400"
         controls
         className="object-cover rounded-md"
       />
      )}
    </div>
  )
}