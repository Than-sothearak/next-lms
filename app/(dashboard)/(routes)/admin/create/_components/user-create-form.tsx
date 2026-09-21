"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UserCreateForm() {
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return toast.error(data.error || "Could not create user");
    toast.success("User has been created");
  }
  return <form onSubmit={submit} className="max-w-xl space-y-5 rounded-xl border bg-white p-6 shadow-sm">
    <div><Label htmlFor="username">Username</Label><Input id="username" name="username" required /></div>
    <div><Label htmlFor="emailAddress">Email (optional)</Label><Input id="emailAddress" name="emailAddress" type="email" /></div>
    <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
    <div><Label htmlFor="role">Role</Label><select id="role" name="role" defaultValue="student" className="mt-2 flex h-10 w-full rounded-md border px-3 text-sm"><option value="student">Student</option><option value="teacher">Teacher</option></select></div>
    <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
  </form>;
}
