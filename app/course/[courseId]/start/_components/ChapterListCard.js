import React from 'react'
import { HiOutlineClock, HiOutlinePlayCircle } from "react-icons/hi2";

function ChapterListCard({chapter, index, isSelected}) {
  return (
    <div className={`flex gap-3 p-4 border-b items-start transition-all ${isSelected ? 'bg-purple-50 border-l-4 border-l-primary' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
        {index + 1}
      </div>
      <div className='flex-1 min-w-0'>
        <h2 className={`font-medium text-sm leading-snug ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
          {chapter?.name}
        </h2>
        {chapter?.duration && (
          <p className='flex items-center gap-1 text-xs text-gray-400 mt-1'>
            <HiOutlineClock className="flex-shrink-0" />
            {chapter?.duration}
          </p>
        )}
      </div>
      {isSelected && <HiOutlinePlayCircle className="flex-shrink-0 text-primary text-lg mt-0.5" />}
    </div>
  )
}

export default ChapterListCard
