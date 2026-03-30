"use client"
import { db } from '@/configs/db'
import { Chapters, CourseList } from '@/configs/schema'
import { useUser } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import CourseBasicInfo from './_components/CourseBasicInfo'
import CourseDetails from './_components/CourseDetails'
import ChapterList from './_components/ChapterList'
import { Button } from '@/components/ui/button'
import { GenerateChapterContent_AI } from '@/configs/AiModel'
import LoadingDialog from '../_components/LoadingDialog'
import service from '@/configs/service'
import { useRouter } from 'next/navigation'

function CourseLayout({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const { user } = useUser();
  const [course,setCourse]=useState([]);
  const [loading,setLoading]=useState(false);
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

  const GenerateChapterContent=async()=>{
    console.log("[GenerateChapterContent] Starting...");
    console.log("[GenerateChapterContent] Course:", course);
    console.log("[GenerateChapterContent] courseOutput:", course?.courseOutput);

    setLoading(true);
    const chapters=course?.courseOutput?.course?.chapters;

    console.log("[GenerateChapterContent] Chapters found:", chapters?.length, chapters);

    if (!chapters || chapters.length === 0) {
      console.error("[GenerateChapterContent] No chapters found. courseOutput structure:", JSON.stringify(course?.courseOutput, null, 2));
      setLoading(false);
      return;
    }

    for (const [index, chapter] of chapters.entries()) {
      console.log(`[GenerateChapterContent] Processing chapter ${index + 1}/${chapters.length}:`, chapter?.name);

      const PROMPT='Explain the concept in Detail on Topic:'+course?.name+', Chapter:'+chapter?.name+', in JSON Format with list of array with field as title, description in detail, Code Example(Code field in <precode> format) if applicable';
      console.log(`[GenerateChapterContent] Prompt for chapter ${index + 1}:`, PROMPT);

      try {
        let videoId='';

        console.log(`[GenerateChapterContent] Fetching video for: ${course?.name}:${chapter?.name}`);
        let videoSnippet = null;
        try {
          const videoResp = await service.getVideos(course?.name+':'+chapter?.name);
          videoId = videoResp[0]?.id?.videoId;
          videoSnippet = videoResp[0]?.snippet ?? null;
          console.log(`[GenerateChapterContent] Video ID: ${videoId}`);
        } catch (videoErr) {
          console.warn(`[GenerateChapterContent] Video fetch failed for chapter ${index + 1}:`, videoErr?.message || videoErr);
        }

        console.log(`[GenerateChapterContent] Sending AI request for chapter ${index + 1}...`);
        const result = await GenerateChapterContent_AI.sendMessage(PROMPT);
        const rawText = result?.response?.text();
        console.log(`[GenerateChapterContent] AI raw response for chapter ${index + 1}:`, rawText);

        const content = JSON.parse(rawText);
        console.log(`[GenerateChapterContent] Parsed content for chapter ${index + 1}:`, content);

        console.log(`[GenerateChapterContent] Saving chapter ${index + 1} to DB...`);
        const resp = await db.insert(Chapters).values({
          chapterId: index,
          courseId: course?.courseId,
          content: { ...content, videoSnippet },
          videoId: videoId
        }).returning({id: Chapters.id});
        console.log(`[GenerateChapterContent] Chapter ${index + 1} saved. DB response:`, resp);

      } catch(e) {
        console.error(`[GenerateChapterContent] Error on chapter ${index + 1}:`, e?.message || e);
        console.error(`[GenerateChapterContent] Error details:`, e);
      }

      if (index === chapters.length - 1) {
        console.log("[GenerateChapterContent] All chapters done. Updating course publish status...");
        await db.update(CourseList).set({ publish: true });
        console.log("[GenerateChapterContent] Redirecting to finish page...");
        setLoading(false);
        router.replace('/create-course/'+course?.courseId+"/finish");
      }
    }
  }
  return (
    <div className='mt-10 px-7 md:px-20 lg:px-44'>
      <h2 className='font-bold text-center text-2xl'>Course Layout</h2>

      <LoadingDialog loading={loading} />
      {/* Basic Info  */}
        <CourseBasicInfo course={course} refreshData={()=>GetCourse()} />
      {/* Course Detail  */}
        <CourseDetails course={course} />
      {/* List of Lesson  */}
        <ChapterList course={course} refreshData={()=>GetCourse()}/>

      <Button onClick={GenerateChapterContent} className="my-10">Generate Course Content</Button>
    </div>
  )
}

export default CourseLayout