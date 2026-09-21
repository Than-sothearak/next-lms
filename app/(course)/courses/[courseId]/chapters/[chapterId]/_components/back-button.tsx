"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StudentTranslations } from "@/lib/student-translations";

export function BackButton({ label }: { label: StudentTranslations["back"] }) {
  const router = useRouter();
  return <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="mr-2 h-4 w-4" /> {label}</button>;
}
