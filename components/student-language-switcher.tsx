"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { StudentLanguage } from "@/lib/student-translations";

export function StudentLanguageSwitcher({
  language,
  labels,
}: {
  language: StudentLanguage;
  labels: { english: string; khmer: string };
}) {
  const router = useRouter();

  const changeLanguage = (nextLanguage: StudentLanguage) => {
    document.cookie = `student-language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event("student-language-change"));
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 rounded-md border p-1 mr-4">
      <Button
        type="button"
        size="sm"
        variant={language === "en" ? "secondary" : "ghost"}
        onClick={() => changeLanguage("en")}
        aria-pressed={language === "en"}
      >
        {labels.english}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === "km" ? "secondary" : "ghost"}
        onClick={() => changeLanguage("km")}
        aria-pressed={language === "km"}
      >
        {labels.khmer}
      </Button>
    </div>
  );
}
