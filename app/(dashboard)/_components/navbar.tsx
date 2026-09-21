import React from 'react'
import { MobileSideBar } from './mobile-sidebar'
import { NavbarRoutes } from '@/components/navbar-routes'
import { StudentLanguageSwitcher } from '@/components/student-language-switcher'
import { cookies } from 'next/headers'
import { getStudentLanguage, getStudentTranslations } from '@/lib/student-translations'

export const Navbar = async () => {
    const language = getStudentLanguage((await cookies()).get('student-language')?.value)
    const labels = getStudentTranslations(language)

  return (
    <div className='p-4 border-b h-full flex items-center bg-white shadow-sm'>
    <MobileSideBar />
    <StudentLanguageSwitcher language={language} labels={labels}/>
    <NavbarRoutes />
    </div>
  )
}
