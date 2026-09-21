"use client";

import { BarChart, Compass, Layout, List, ListCollapse, ShieldCheck } from "lucide-react";
import { SideBarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getStudentLanguage, getStudentTranslations } from "@/lib/student-translations";
import { useSyncExternalStore } from "react";

const guestRoutes = (labels: ReturnType<typeof getStudentTranslations>) => [

  {
    icon: Compass,
    label: labels.allCourses,
    href: "/search",
  },

    {
    icon: Layout,
    label: labels.myCourses,
    href: "/",
  },

];
const teacherRoutes = (labels: ReturnType<typeof getStudentTranslations>) => [
  {
    icon: List,
    label: labels.courses,
    href: "/teacher/courses",
  },

  {
    icon: ListCollapse,
    label: labels.category,
    href: "/teacher/category",
  },

  {
    icon: BarChart,
    label: labels.analytics,
    href: "/teacher/analytics",
  },
]
export const SideBarRoute = () => {
  const { user } = useUser();
  const pathnam = usePathname();
  const language = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("student-language-change", onStoreChange);
      return () => window.removeEventListener("student-language-change", onStoreChange);
    },
    () =>
      getStudentLanguage(
        document.cookie.match(/(?:^|;\s*)student-language=([^;]+)/)?.[1]
      ),
    () => "en"
  );

  const labels = getStudentTranslations(language);

  const role = user?.publicMetadata?.role;
  const canTeach = role === "admin" || role === "teacher";
  const isTeacherPage = canTeach && pathnam?.includes("/teacher");
  
  const isAdminPage = pathnam === "/admin" || pathnam?.startsWith("/admin/");
  const isManagementPage = isAdminPage || isTeacherPage;
  const routes = canTeach && isManagementPage ? teacherRoutes(labels) : guestRoutes(labels);
  const adminRoutes = role === "admin" && isManagementPage ? [
    { icon: ShieldCheck, label: labels.users, href: "/admin/users" },
    { icon: List, label: labels.manageCourses, href: "/admin/courses" },
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
