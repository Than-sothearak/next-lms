"use client";

import { useState } from "react";

export function ActivityChart({ months }: { months: { label: string; students: number; enrollments: number }[] }) {
  const [metric, setMetric] = useState<"students" | "enrollments">("students");
  const maximum = Math.max(1, ...months.map((month) => month[metric]));
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="font-semibold text-slate-900">Growth over time</h2><p className="mt-1 text-sm text-slate-500">Last six months · current month to date · UTC</p></div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Chart metric">
          {([['students', 'New students'], ['enrollments', 'Enrollments']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={metric === value} onClick={() => setMetric(value)} className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-blue-600 ${metric === value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-4" role="img" aria-label={`${metric === 'students' ? 'New students' : 'Enrollments'} by month: ${months.map((month) => `${month.label}: ${month[metric]}`).join(', ')}`}>
        {months.map((month) => <div key={month.label} className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-slate-500">{month.label}</span>
          <div className="h-7 flex-1 overflow-hidden rounded bg-slate-100"><div className={`h-full rounded transition-all ${metric === 'students' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${month[metric] / maximum * 100}%` }} /></div>
          <span className="w-12 shrink-0 text-right font-semibold tabular-nums">{month[metric]}</span>
        </div>)}
      </div>
    </section>
  );
}
