"use client";

import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import type { StudentTranslations } from "@/lib/student-translations";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted: boolean;
  nextChapterId?: string;
  labels: StudentTranslations;
};

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
  labels
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);



  const onClick = async () => {
    try {
      setIsLoading(true);

      await axios.put(`/api/course/${courseId}/chapters/${chapterId}/progress`, {
        isCompleted: !isCompleted
      });

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }

      toast.success(labels.progressUpdated);
      router.refresh();
    } catch {
      toast.error(labels.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  }

  const Icon = isCompleted ? XCircle : CheckCircle

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      type="button"
      variant={isCompleted ? "outline" : "success"}
      className="w-full md:w-auto"
    >
      {isCompleted ? labels.markIncomplete : labels.markComplete}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  )
}