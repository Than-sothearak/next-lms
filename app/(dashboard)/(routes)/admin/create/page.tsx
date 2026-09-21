import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserCreateForm } from "./_components/user-create-form";

export default function CreateUserPage() {
  return <div className="p-6"><Link href="/admin/users" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="mr-2 h-4 w-4" />Back to users</Link><h1 className="text-2xl font-semibold">Add user</h1><p className="mt-2 mb-6 text-sm text-slate-500">Create a student or teacher account in Clerk.</p><UserCreateForm /></div>;
}
