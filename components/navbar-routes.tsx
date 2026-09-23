"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { SearchInput } from './search-input';

export const NavbarRoutes = () => {
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const pathname = usePathname();

    const isTeacherPage = pathname?.startsWith("/teacher");
    const isAdminPage = pathname === "/admin" || pathname?.startsWith("/admin/");
    const isPlayerPage = pathname?.startsWith("/chapter");
    const isSearchPage = pathname === "/search";
    const role = user?.publicMetadata?.role;
    const canTeach = role === "admin" || role === "teacher";
  return (
    <>
    {isSearchPage && (
      <div className='hidden md:block'>
        <SearchInput />
      </div>
    )}
    <div className='flex items-center gap-x-2 ml-auto'>
        {isTeacherPage || isAdminPage || isPlayerPage ? (
          <Link href="/">
           <Button size="sm" variant="ghost">
             <LogOut className='h-4 w-4 mr-2' />
             Exit
           </Button></Link>
        ): canTeach && !isAdminPage ? (
            <Link href="/teacher/courses">
                <Button size="sm" variant="ghost">
                    Teacher mode
                </Button>
            </Link>
        ) : null
    }
        {user && (
          <span className="max-w-[42vw] truncate text-xs font-medium text-slate-700 sm:max-w-none sm:text-sm">
            {user.fullName || user.username || user.primaryEmailAddress?.emailAddress}
          </span>
        )}
        {isMounted ? (
          <UserButton afterSignOutUrl='/' />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-200" aria-hidden="true" />
        )}
       
        </div>
    </>
  )
}
