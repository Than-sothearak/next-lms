import React from 'react'

const ChapterPage = ({params} :{params : {chapterId: string}}) => {
  const chapterId  = params.chapterId;
    return (
    <div>EditChapterPage:{chapterId}</div>
  )
}

export default ChapterPage