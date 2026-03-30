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

    // Process all chapters in parallel
    const chapterPromises = chapters.map(async (chapter, index) => {
      console.log(`[GenerateChapterContent] Processing chapter ${index + 1}/${chapters.length}:`, chapter?.name);

      const PROMPT='Explain the concept in Detail on Topic:'+course?.name+', Chapter:'+chapter?.name+', in JSON Format with list of array with field as title, description in detail, Code Example(Code field in <precode> format) if applicable';

      // Run YouTube fetch and AI generation in parallel
      const [videoResult, aiResult] = await Promise.allSettled([
        service.getVideos(course?.name+':'+chapter?.name).catch(err => {
          console.warn(`[GenerateChapterContent] Video fetch failed for chapter ${index + 1}:`, err?.message);
          return [];
        }),
        GenerateChapterContent_AI.sendMessage(PROMPT),
      ]);

      const videoResp = videoResult.status === 'fulfilled' ? videoResult.value : [];
      const videoId = videoResp[0]?.id?.videoId || '';
      const videoSnippet = videoResp[0]?.snippet ?? null;

      const result = aiResult.status === 'fulfilled' ? aiResult.value : null;
      if (!result) {
        console.error(`[GenerateChapterContent] AI failed for chapter ${index + 1}`);
        return;
      }

      const rawText = result?.response?.text();
      const content = JSON.parse(rawText);
      console.log(`[GenerateChapterContent] Chapter ${index + 1} content ready, saving to DB...`);

      await db.insert(Chapters).values({
        chapterId: index,
        courseId: course?.courseId,
        content: { ...content, videoSnippet },
        videoId: videoId
      }).returning({id: Chapters.id});
      console.log(`[GenerateChapterContent] Chapter ${index + 1} saved.`);
    });

    try {
      await Promise.all(chapterPromises);
      console.log("[GenerateChapterContent] All chapters done. Updating course publish status...");
      await db.update(CourseList).set({ publish: true });
      setLoading(false);
      router.replace('/create-course/'+course?.courseId+"/finish");
    } catch(e) {
      console.error(`[GenerateChapterContent] Error:`, e?.message || e);
      setLoading(false);
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