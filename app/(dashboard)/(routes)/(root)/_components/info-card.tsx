import { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/ui/icon.badge"

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
  courseLabel: string;
  coursesLabel: string;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
  courseLabel,
  coursesLabel,
}: InfoCardProps) => {
  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3">
      <IconBadge
        variant={variant}
        icon={Icon}
      />
      <div>
        <p className="font-medium">
          {label}
        </p>
        <p className="text-gray-500 text-sm">
          {numberOfItems} {numberOfItems === 1 ? courseLabel : coursesLabel}
        </p>
      </div>
    </div>
  )
}