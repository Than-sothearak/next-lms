"use client";

import axios from "axios";
import { SyntheticEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import type { StudentTranslations } from "@/lib/student-translations";

interface VideoPlayerProps {

  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  isCompleted: boolean;
  title: string;
  url: string
  labels: StudentTranslations;
};

export const VideoPlayer = ({

  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  isCompleted,
  title,
  url,
  labels,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(true);
  const router = useRouter();
  const confetti = useConfettiStore();
  const maxWatchedTime = useRef(0);
  const hasAdvanced = useRef(false);

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!isCompleted) maxWatchedTime.current = Math.max(maxWatchedTime.current, event.currentTarget.currentTime);
  };

  const onSeeking = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!isCompleted && event.currentTarget.currentTime > maxWatchedTime.current + 0.5) {
      event.currentTarget.currentTime = maxWatchedTime.current;
    }
  };

  const onEnd = async () => {
    if (hasAdvanced.current) return;
    hasAdvanced.current = true;
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

      }
    } catch {
      hasAdvanced.current = false;
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">{labels.lockedChapter}</p>
        </div>
      )}
      {!isLocked && (
         <video
         onCanPlay={() => setIsReady(true)}
         onEnded={onEnd}
         onTimeUpdate={onTimeUpdate}
         onSeeking={onSeeking}
         src={url}
         controls
         controlsList="nodownload"
         className="h-full w-full bg-black object-contain"
       />
      )}
    </div>
  )
}
