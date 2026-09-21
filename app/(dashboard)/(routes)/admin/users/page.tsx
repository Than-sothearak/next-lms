import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserDataTable } from "./_components/user-data-table";

export default function AdminUsersPage() {
  return <div className="space-y-6 p-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Users</h1><p className="mt-1 text-sm text-slate-500">Manage student and teacher accounts.</p></div><Link href="/admin/create"><Button>Add user</Button></Link></div><UserDataTable /></div>;
}
