"use client";

import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseSidebarItemProps {
  label: string;
  _id: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
  updatedAt?: string;
  createdAt?: string;
  newLabel: string;
  updatedLabel: string;
};

export const CourseSidebarItem = ({
  label,
  _id,
  isCompleted,
  courseId,
  isLocked,
  updatedAt,
  createdAt,
  newLabel,
  updatedLabel,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle);

  const isActive = pathname?.includes(_id);
  const isRecent = (date?: string) => {
    const timestamp = date ? new Date(date).getTime() : Number.NaN;
    const age = Date.now() - timestamp;
    return Number.isFinite(timestamp) && age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
  };
  const isNew = isRecent(createdAt);
  const isRecentlyUpdated = !isNew && isRecent(updatedAt);

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${_id}`);
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full flex items-center gap-x-2 text-left text-slate-500 text-sm font-[500] pl-6 pr-4 transition-all md:hover:text-slate-600 md:hover:bg-slate-300/20",
        isActive && "text-slate-700 bg-slate-200/20 md:hover:bg-slate-200/20 md:hover:text-slate-700",
        isCompleted && "text-emerald-700 md:hover:text-emerald-700",
        isCompleted && isActive && "bg-emerald-200/20",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-700",
            isCompleted && "text-emerald-700"
          )}
        />
        <span className="min-w-0 whitespace-normal break-words">{label}</span>
      </div>
      {(isNew || isRecentlyUpdated) && (
        <span className={cn(
          "mr-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          isNew ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
        )}>
          {isNew ? newLabel : updatedLabel}
        </span>
      )}
      <div className={cn(
        "ml-auto opacity-0 border-2 border-slate-700 h-full transition-all",
        isActive && "opacity-100",
        isCompleted && "border-emerald-700"
      )} />
    </button>
  )
}
