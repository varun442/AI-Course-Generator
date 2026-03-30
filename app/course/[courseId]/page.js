"use client"
import Header from '@/app/_components/Header'
import ChapterList from '@/app/create-course/[courseId]/_components/ChapterList'
import CourseBasicInfo from '@/app/create-course/[courseId]/_components/CourseBasicInfo'
import CourseDetails from '@/app/create-course/[courseId]/_components/CourseDetails'
import { db } from '@/configs/db'
import { CourseList } from '@/configs/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import Spinner from '@/app/_components/Spinner'

function Course({params: paramsPromise}) {
    const params = React.use(paramsPromise);
    const [course,setCourse]=useState();
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        params&&GetCourse();
    },[params])

    const GetCourse=async()=>{
        setLoading(true);
        const result=await db.select().from(CourseList)
        .where(eq(CourseList?.courseId,params?.courseId))
        setCourse(result[0]);
        setLoading(false);
    }

  if (loading) return (
    <div>
      <Header/>
      <Spinner size="lg" className="h-[60vh]" />
    </div>
  );

  return (
    <div>
        <Header/>
        <div className='px-10 p-10 md:px-20 lg:px-44'>
          <CourseBasicInfo course={course} edit={false} />
          <CourseDetails course={course} />
          <ChapterList course={course} edit={false}/>
        </div>
    </div>
  )
}

export default Course