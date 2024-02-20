import { mongooseConnect } from '@/lib/mongoose'
import { Category } from '@/models/Course'
import React from 'react'
import { Categories } from './_components/categories'

const SearchPage = async () => {
  await mongooseConnect()

  const categories = JSON.parse(JSON.stringify(await Category.find().sort({name: 1})))
  return (
    <div className='p-6'>
      <Categories 
      items={categories}
      
      />
    </div>
  )
}

export default SearchPage