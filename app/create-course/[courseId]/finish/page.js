"use client"
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';

import React, { useEffect, useState } from 'react'
import CourseBasicInfo from '../_components/CourseBasicInfo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiOutlineClipboardDocumentCheck, HiCheck } from "react-icons/hi2";
import { Button } from '@/components/ui/button';

function FinishScreen({params: paramsPromise}) {
    const params = React.use(paramsPromise);
    const { user } = useUser();
    const [course,setCourse]=useState([]);
    const [copied,setCopied]=useState(false);
    const router=useRouter();
    useEffect(() => {
      params && GetCourse();
    }, [params,user])

    const GetCourse = async () => {
      const result = await db.select().from(CourseList)
        .where(and(eq(CourseList.courseId, params?.courseId),
          eq(CourseList?.createdBy, user?.primaryEmailAddress?.emailAddress)))
          setCourse(result[0]);
          console.log(result);
    }
  return (
    <div className='px-10 md:px-20 lg:px-44 my-7'>
        <h2 className='text-center font-bold text-2xl my-3 text-primary'>Congrats! Your course is Ready</h2>
       
       
        <CourseBasicInfo course={course} refreshData={()=>console.log()} />
       <h2 className='mt-3'>Course URL:</h2>
       <div className='text-center text-gray-400
       border p-2 rounded flex gap-3 items-center'>
        <a href={process.env.NEXT_PUBLIC_HOST_NAME+"/course/"+course?.courseId}
          target='_blank' rel='noopener noreferrer'
          className='flex-1 text-left hover:text-primary hover:underline transition-colors truncate'>
          {process.env.NEXT_PUBLIC_HOST_NAME}/course/{course?.courseId}
        </a>
        {copied ? (
          <span className='flex items-center gap-1 text-green-500 text-sm'>
            <HiCheck className='h-5 w-5' /> Copied!
          </span>
        ) : (
          <HiOutlineClipboardDocumentCheck
            className='h-5 w-5 cursor-pointer hover:text-primary transition-colors flex-shrink-0'
            onClick={async()=>{
              await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_HOST_NAME+"/course/"+course?.courseId);
              setCopied(true);
              setTimeout(()=>setCopied(false), 2000);
            }} />
        )}
       </div>

       <div className='flex flex-wrap gap-3 mt-5 justify-center'>
        <Link href={'/course/'+course?.courseId+'/start'}>
          <Button>View Course</Button>
        </Link>
        <Link href='/dashboard'>
          <Button variant='outline'>Go to Dashboard</Button>
        </Link>
        <Link href='/create-course'>
          <Button variant='outline'>Create Another</Button>
        </Link>
       </div>

    </div>
  )
}

export default FinishScreen