"use client";

import { Button } from "@/components/ui/button";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return <div className="space-y-3 p-6"><h1 className="text-xl font-semibold">Analytics unavailable</h1><p className="text-sm text-slate-500">We couldn’t load the latest analytics. Please try again.</p><Button onClick={reset}>Try again</Button></div>;
}
