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

export const CourseProgressPopup = ({ value }: { value: number }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        <span>Course progress</span>
        <span>{Math.round(value)}%</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Course progress</DialogTitle>
      </DialogHeader>
      <CourseProgress variant="success" value={value} />
    </DialogContent>
  </Dialog>
);
