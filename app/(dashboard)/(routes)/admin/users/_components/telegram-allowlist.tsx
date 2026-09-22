"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
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
  const [telegramId, setTelegramId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const loadEntries = useCallback(async (query = search, currentPage = page) => {
    const params = new URLSearchParams({ query, offset: String(currentPage * 10) });
    const response = await fetch(`/api/admin/telegram-allowlist?${params}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setEntries(data.entries);
    setTotal(data.total);
  }, [search, page]);

  useEffect(() => {
    void loadEntries();
    const timer = window.setInterval(() => void loadEntries(), 10_000);
    return () => window.clearInterval(timer);
  }, [loadEntries]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(0);
    void loadEntries(search, 0);
  }

  async function addEntry(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/telegram-allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: telegramId.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to approve account");
      setTelegramId("");
      toast.success("Telegram account approved");
      await loadEntries(search, page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to approve account");
    } finally {
      setIsSaving(false);
    }
  }

  async function setStatus(entry: Entry, status: "approved" | "disabled") {
    const response = await fetch(`/api/admin/telegram-allowlist/${entry._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      toast.error("Unable to update approval");
      return;
    }
    toast.success(status === "approved" ? "Telegram access approved" : "Telegram access disabled");
    await loadEntries(search, page);
  }

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Telegram Mini App access</h2>
        <p className="mt-1 text-sm text-slate-500">Verified Telegram sign-in requests appear here. Approve a request to let that user sign in as a student.</p>
      </div>
      <form onSubmit={addEntry} className="flex max-w-lg gap-2">
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          value={telegramId}
          onChange={(event) => setTelegramId(event.target.value)}
          placeholder="Telegram numeric user ID"
          aria-label="Telegram numeric user ID"
          required
        />
        <Button type="submit" disabled={isSaving}>{isSaving ? "Approving…" : "Approve ID"}</Button>
      </form>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="flex max-w-md flex-1 gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or Telegram ID"
            aria-label="Search pending Telegram requests by name or ID"
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <p className="text-sm text-slate-500">{total} pending request{total === 1 ? "" : "s"}</p>
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
              {(entry.status ?? "pending") === "pending" && <Button type="button" size="sm" onClick={() => setStatus(entry, "approved")}>Approve</Button>}
              {entry.status === "approved" && <Button type="button" size="sm" variant="outline" onClick={() => setStatus(entry, "disabled")}>Disable</Button>}
              {entry.status === "disabled" && <Button type="button" size="sm" onClick={() => setStatus(entry, "approved")}>Reapprove</Button>}
            </div>
          </div>
        ))}
        {!entries.length && <p className="px-4 py-6 text-center text-sm text-slate-500">{search ? "No pending requests match this search." : "No Telegram requests are waiting for approval."}</p>}
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
