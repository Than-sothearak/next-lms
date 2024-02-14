"use client";

import { BarChart, Compass, Layout, List, ListCollapse } from "lucide-react";
import { SideBarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashbaord",
    href: "/",
  },

  {
    icon: Compass,
    label: "Browse",
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
  
  const pathnam = usePathname();

  const isTeacherPage = pathnam?.includes("/teacher");
  
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;
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
    </div>
  );
};


