"use client";

import { CourseProgress } from "@/components/course-progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StudentTranslations } from "@/lib/student-translations";

export const CourseProgressPopup = ({ value, labels }: { value: number; labels: StudentTranslations }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        <span>{labels.courseProgress}</span>
        <span>{Math.round(value)}%</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{labels.courseProgress}</DialogTitle>
      </DialogHeader>
      <CourseProgress variant="success" value={value} />
    </DialogContent>
  </Dialog>
);
