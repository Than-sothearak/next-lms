"use client";

import { BarChart, Compass, Layout, List, ListCollapse, ShieldCheck } from "lucide-react";
import { SideBarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const guestRoutes = [
  {
    icon: Layout,
    label: "My courses",
    href: "/",
  },

  {
    icon: Compass,
    label: "All courses",
    href: "/search",
  },
];
const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },

  {
    icon: ListCollapse,
    label: "Category",
    href: "/teacher/category",
  },

  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
]
export const SideBarRoute = () => {
  const { user } = useUser();
  const pathnam = usePathname();

  const role = user?.publicMetadata?.role;
  const canTeach = role === "admin" || role === "teacher";
  const isTeacherPage = canTeach && pathnam?.includes("/teacher");
  
  const isAdminPage = pathnam === "/admin" || pathnam?.startsWith("/admin/");
  const isManagementPage = isAdminPage || isTeacherPage;
  const routes = canTeach && isManagementPage ? teacherRoutes : guestRoutes;
  const adminRoutes = role === "admin" && isManagementPage ? [
    { icon: ShieldCheck, label: "Users", href: "/admin/users" },
    { icon: List, label: "Manage courses", href: "/admin/courses" },
  ] : [];
  return (
    <div className="flex flex-col w-full">
      {routes.map((r) => (
        <SideBarItem 
        key={r.href} 
        label={r.label} 
        href={r.href} 
        icon={r.icon}
        />
      ))}
      {adminRoutes.map((r) => <SideBarItem key={r.href} label={r.label} href={r.href} icon={r.icon} />)}
    </div>
  );
};
