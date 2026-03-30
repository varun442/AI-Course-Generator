"use client";
import { db } from "@/configs/db";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useContext, useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { CourseList } from '@/configs/schema'
import { UserCourseListContext } from "@/app/_context/UserCourseListContext";
import CourseCardSkeleton from "@/app/_components/CourseCardSkeleton";

const UserCourseList = () => {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const {userCourseList, setUserCourseList} = useContext(UserCourseListContext)
  const { user } = useUser();
  useEffect(() => {
    user && getUserCourses();
  }, [user]);

  const getUserCourses=async()=>{
    setLoading(true);
    const result=await db.select().from(CourseList)
    .where(eq(CourseList?.createdBy,user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(CourseList.id))
    setCourseList(result);
    setUserCourseList(result);
    setLoading(false);
  }

  return (
    <div className="mt-10">
      <h2 className="font-medium text-xl">My AI Courses</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? [1,2,3,4,5,6].map((item) => <CourseCardSkeleton key={item} />)
              : courseList?.map((course, index) => (
                  <CourseCard course={course} key={course?.courseId || index} refreshData={()=>getUserCourses()}/>
                ))
            }
        </div>
    </div>
  );
};

export default UserCourseList;
