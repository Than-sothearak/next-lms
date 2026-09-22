import { Menu } from 'lucide-react'
import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import SideBar from './sidebar';
export const MobileSideBar = () => {
  return (
    <Sheet>
        <SheetTrigger className='md:hidden pr-4 hover:opacity-75 transition-all'>
            <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-[90vw] max-w-none p-0">
         <SideBar />
        </SheetContent>
        </Sheet>
  )
}
