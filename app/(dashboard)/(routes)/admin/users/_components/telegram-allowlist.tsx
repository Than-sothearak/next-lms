"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Entry = {
  _id: string;
  telegramId: string;
  status?: "pending" | "approved" | "disabled";
  active?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  clerkUserId?: string;
  createdAt: string;
};

export function TelegramAllowlist() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "disabled">("pending");
  const requestId = useRef(0);
  const savingIds = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState(new Set<string>());

  const loadEntries = useCallback(async (query = search, currentPage = page) => {
    const currentRequest = ++requestId.current;
    const params = new URLSearchParams({ query, status: statusFilter, offset: String(currentPage * 10) });
    const response = await fetch(`/api/admin/telegram-allowlist?${params}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (currentRequest !== requestId.current) return;
    if (currentPage > 0 && currentPage * 10 >= data.total) {
      setPage(Math.max(0, Math.ceil(data.total / 10) - 1));
      return;
    }
    setEntries(data.entries);
    setTotal(data.total);
  }, [search, page, statusFilter]);

  useEffect(() => {
    // State is updated after the asynchronous fetch completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEntries();
    const timer = window.setInterval(() => void loadEntries(), 10_000);
    return () => { window.clearInterval(timer); requestId.current += 1; };
  }, [loadEntries]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(0);
    void loadEntries(search, 0);
  }

  async function setStatus(entry: Entry, status: "approved" | "disabled") {
    if (savingIds.current.has(entry._id)) return;
    savingIds.current.add(entry._id);
    setPendingIds(new Set(savingIds.current));
    const currentRequest = requestId.current;
    try {
      const response = await fetch(`/api/admin/telegram-allowlist/${entry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Unable to update approval");
      toast.success(status === "approved" ? "Telegram access approved" : "Telegram access disabled");
      if (currentRequest === requestId.current) await loadEntries(search, page);
    } catch {
      toast.error("Unable to update approval");
    } finally {
      savingIds.current.delete(entry._id);
      setPendingIds(new Set(savingIds.current));
    }
  }

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Telegram Mini App access</h2>
        <p className="mt-1 text-sm text-slate-500">Approve pending requests, disable approved accounts, or reapprove disabled accounts.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter Telegram accounts by status">
        {(["pending", "approved", "disabled"] as const).map((status) => (
          <Button key={status} type="button" variant={statusFilter === status ? "default" : "outline"} aria-pressed={statusFilter === status} onClick={() => {
            if (status === statusFilter) return;
            requestId.current += 1;
            setStatusFilter(status);
            setPage(0);
            setEntries([]);
            setTotal(0);
          }}>
            {status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Disabled"}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="flex max-w-md flex-1 gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or Telegram ID"
            aria-label="Search Telegram accounts by name or ID"
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <p className="text-sm text-slate-500">{total} {statusFilter} account{total === 1 ? "" : "s"}</p>
      </div>
      <div className="divide-y rounded-md border">
        {entries.map((entry) => (
          <div key={entry._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              {entry.photoUrl ? (
                <Image
                  src={entry.photoUrl}
                  alt={`${entry.username ? `@${entry.username}` : "Telegram user"} profile photo`}
                  width={44}
                  height={44}
                  unoptimized
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                  {(entry.firstName || entry.username || "T").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{[entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Telegram user"}</p>
                <p className="truncate text-xs text-slate-500">
                  {entry.username ? `@${entry.username} · ` : ""}
                  ID {entry.telegramId}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.clerkUserId ? "Clerk account linked" : "Clerk account created after approval"}
                  {` · Added ${new Date(entry.createdAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${(entry.status ?? "pending") === "pending" ? "bg-amber-100 text-amber-800" : entry.status === "disabled" ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}>
                {entry.status ?? "pending"}
              </span>
              <Button
                type="button"
                size="sm"
                variant={entry.status === "approved" ? "outline" : "default"}
                disabled={pendingIds.has(entry._id)}
                aria-busy={pendingIds.has(entry._id)}
                onClick={() => setStatus(entry, entry.status === "approved" ? "disabled" : "approved")}
              >
                {pendingIds.has(entry._id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {entry.status === "approved"
                  ? pendingIds.has(entry._id) ? "Disabling…" : "Disable"
                  : entry.status === "disabled"
                    ? pendingIds.has(entry._id) ? "Reapproving…" : "Reapprove"
                    : pendingIds.has(entry._id) ? "Approving…" : "Approve"}
              </Button>
            </div>
          </div>
        ))}
        {!entries.length && <p className="px-4 py-6 text-center text-sm text-slate-500">{search ? `No ${statusFilter} accounts match this search.` : `No ${statusFilter} Telegram accounts.`}</p>}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Page {page + 1} · {total} matching requests</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={(page + 1) * 10 >= total} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </div>
      </div>
    </section>
  );
}
