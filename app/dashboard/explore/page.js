"use client"
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schema'
import React, { useEffect, useState } from 'react'
import CourseCard from '../_components/CourseCard';
import { Button } from '@/components/ui/button';
import CourseCardSkeleton from '@/app/_components/CourseCardSkeleton';

function Explore() {

  const [courseList,setCourseList]=useState([]);
  const [pageIndex,setPageIndex]=useState(0);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    GetAllCourse();
  },[pageIndex])

  const GetAllCourse=async()=>{
    setLoading(true);
    const result=await db.select().from(CourseList)
    .limit(9)
    .offset(pageIndex*9);
    setCourseList(result);
    setLoading(false);
  }

  return (
    <div>
      <h2 className='font-bold text-3xl'>Explore More Projects</h2>
      <p>Explore more projects built with AI by other users</p>

      <div className='grid grid-cols-2 lg:grid-cols-3 gap-5'>
        {loading
          ? [1,2,3,4,5,6].map((item) => <CourseCardSkeleton key={item} />)
          : courseList?.map((course,index)=>(
              <CourseCard key={course?.courseId || index} course={course} />
            ))
        }
      </div>

      <div className='flex justify-between mt-5'>
        {pageIndex !== 0 && (
          <Button onClick={()=>setPageIndex(pageIndex-1)}>Previous Page</Button>
        )}
        <Button className="ml-auto" onClick={()=>setPageIndex(pageIndex+1)}>Next Page</Button>
      </div>
    </div>
  )
}

export default Explore