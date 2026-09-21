import React from "react";
import SideBar from "./_components/sidebar";
import { Navbar } from "./_components/navbar";
import { ensureUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Clerk users created without metadata become students automatically.
  // Admins can later promote them by changing publicMetadata.role in Clerk.
  await ensureUserRole();
  return (
    <div className="h-full">

      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
       <SideBar />
      </div>
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
    <main className="md:pl-56 pt-[80px] h-full">
    {children}
    </main>
    </div>
  );
};

export default DashboardLayout;
