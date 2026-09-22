"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type CourseProgress = { id: string; title: string; category: string; progress: number };
type User = { id: string; username: string | null; email: string; role: string; createdAt: number; progress: number; completedCourses: number; totalCourses: number; courseProgress: CourseProgress[] };
type UserCounts = { student: number; teacher: number; admin: number; total: number };

export function UserDataTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [role, setRole] = useState("student");
  const [year, setYear] = useState("");
  const [years, setYears] = useState<number[]>([]);
  const [counts, setCounts] = useState<UserCounts>({ student: 0, teacher: 0, admin: 0, total: 0 });
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const loadUsers = useCallback(async (query = search, currentPage = page) => {
    const params = new URLSearchParams({ query, categoryId, role, year, offset: String(currentPage * 10) });
    const response = await fetch(`/api/admin/users?${params}`);
    if (response.ok) { const data = await response.json(); setUsers(data.users); setCategories(data.categories); setCounts(data.counts); setYears(data.years); setTotalFiltered(data.totalFiltered); }
  }, [search, page, categoryId, role, year]);
  // loadUsers only updates state after its asynchronous network request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadUsers(); }, [loadUsers]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault(); setPage(0); loadUsers(search, 0);
  }

  async function updateRole(id: string, role: string) {
    const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    if (response.ok) { toast.success("User role updated"); loadUsers(); }
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Delete this Clerk user?")) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (response.ok) { toast.success("User deleted"); loadUsers(); }
  }

  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{([['Users', counts.total], ['Students', counts.student], ['Teachers', counts.teacher], ['Admins', counts.admin]] as const).map(([label, count]) => <div key={label} className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{count}</p></div>)}</div>
    <div className="flex flex-col gap-2 sm:flex-row"><form onSubmit={submitSearch} className="flex max-w-md gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" /><Button type="submit">Search</Button></form>
      <select aria-label="Filter by role" value={role} onChange={(event) => { setRole(event.target.value); setPage(0); }} className="h-10 rounded-md border px-3 text-sm"><option value="student">Students</option><option value="admin">Admins</option><option value="teacher">Teachers</option><option value="all">All roles</option></select>
      <select aria-label="Filter by account creation year" value={year} onChange={(event) => { setYear(event.target.value); setPage(0); }} className="h-10 rounded-md border px-3 text-sm"><option value="">All years</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select aria-label="Filter course details by category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(0); }} className="h-10 rounded-md border px-3 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
    </div><div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
    <table className="min-w-[1000px] w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Username</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Progress</th><th className="px-5 py-4">Role</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
      <tbody>{users.map((user) => <tr
        key={user.id}
        id={`user-row-${user.id}`}
        tabIndex={0}
        aria-label={`View course progress for ${user.username || user.email}`}
        aria-haspopup="dialog"
        className="cursor-pointer border-b last:border-0 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (!event.currentTarget.contains(target) || target.closest("button, a, select, [role='dialog']")) return;
          setSelectedUserId(user.id);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedUserId(user.id);
          }
        }}
      ><td className="px-5 py-4 font-medium">{user.username || "—"}</td><td className="px-5 py-4 text-slate-500">{user.email || "—"}</td><td className="px-5 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${user.progress}%` }} /></div><span className="text-xs text-slate-500">{user.progress}% ({user.completedCourses}/{user.totalCourses})</span></div><Dialog open={selectedUserId === user.id} onOpenChange={(open) => setSelectedUserId(open ? user.id : null)}><DialogTrigger asChild><Button variant="link" size="sm" className="h-auto p-0 text-xs">Course details</Button></DialogTrigger><DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); document.getElementById(`user-row-${user.id}`)?.focus(); }} className="w-[calc(100%-2rem)] max-w-2xl grid-cols-[minmax(0,1fr)]"><DialogHeader className="min-w-0 pr-6"><DialogTitle className="break-words">{user.username || user.email} — course progress</DialogTitle></DialogHeader><div className="min-w-0 max-h-[60vh] overflow-y-auto space-y-4">{user.courseProgress.length ? user.courseProgress.map((course) => <div key={course.id} className="min-w-0 w-full"><div className="flex min-w-0 justify-between gap-4 text-sm"><span className="min-w-0 flex-1 break-words">{course.title}<span className="ml-1 text-slate-400">({course.category})</span></span><span className="shrink-0">{course.progress}%</span></div><div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Number.isFinite(course.progress) ? Math.min(100, Math.max(0, course.progress)) : 0}%` }} /></div></div>) : <p className="text-sm text-slate-500">No course progress yet.</p>}</div></DialogContent></Dialog></td><td className="px-5 py-4"><select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)} className="rounded-md border px-2 py-1.5"><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></td><td className="px-5 py-4 text-right"><Button type="button" variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>Delete</Button></td></tr>)}</tbody>
    </table>
  </div><div className="flex items-center justify-between"><p className="text-sm text-slate-500">Page {page + 1} · {totalFiltered} matching users</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={(page + 1) * 10 >= totalFiltered} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></div>;
}
