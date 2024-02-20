import { mongooseConnect } from '@/lib/mongoose'
import { Category } from '@/models/Course'
import React from 'react'
import { Categories } from './_components/categories'
import { SearchInput } from '@/components/search-input'

const SearchPage = async () => {
  await mongooseConnect()

  const categories = JSON.parse(JSON.stringify(await Category.find().sort({name: 1})))
  return (
    <>
    <div className='px-6 pt-6 md:hidden md:mb-0 block'>
      <SearchInput />
    </div>
    <div className='p-6'>
      <Categories 
      items={categories}
      
      />
    </div>
    </>
  )
}

export default SearchPage