"use client"
import { db } from '@/configs/db'
import { Chapters, CourseList } from '@/configs/schema'
import { and, eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import ChapterListCard from './_components/ChapterListCard'
import ChapterContent from './_components/ChapterContent'
import Spinner from '@/app/_components/Spinner'
import Link from 'next/link'
import { HiArrowLeft, HiOutlineBookOpen } from 'react-icons/hi2'

function CourseStart({params: paramsPromise}) {
    const params = React.use(paramsPromise);
    const [course,setCourse]=useState();
    const [selectedChapter,setSelectedChapter]=useState(null);
    const [chapterContent,setChapterContent]=useState();
    const [courseLoading,setCourseLoading]=useState(true);
    const [contentLoading,setContentLoading]=useState(false);

    useEffect(()=>{
        params && GetCourse();
    },[params])

    const GetCourse=async()=>{
        setCourseLoading(true);
        const result=await db.select().from(CourseList)
        .where(eq(CourseList?.courseId,params?.courseId));
        setCourse(result[0]);
        setCourseLoading(false);
    }

    const GetSelectedChapterContent=async(chapterId)=>{
        setContentLoading(true);
        const result=await db.select().from(Chapters)
        .where(and(eq(Chapters.chapterId,chapterId),
        eq(Chapters.courseId,course?.courseId)));

        const chapter = result[0];

        // Fetch YouTube video details live
        if (chapter?.videoId) {
            try {
                const resp = await fetch(
                    `/api/youtube/video?id=${chapter.videoId}`
                );
                const data = await resp.json();
                const item = data?.items?.[0];
                if (item) {
                    chapter.videoSnippet = {
                        ...item.snippet,
                        viewCount: item.statistics?.viewCount,
                    };
                }
            } catch (e) {
                console.warn("[CourseStart] Failed to fetch video snippet:", e?.message);
            }
        }

        setChapterContent(chapter);
        setContentLoading(false);
    }

  if (courseLoading) {
    return <Spinner size="lg" className="h-screen" />;
  }

  const chapters = course?.courseOutput?.course?.chapters ?? [];

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
        {/* Sidebar */}
        <aside className='hidden md:flex flex-col w-72 flex-shrink-0 h-screen border-r bg-white shadow-sm'>
            {/* Sidebar Header */}
            <div className='bg-primary px-4 py-5 flex-shrink-0'>
                <Link href={'/course/'+params?.courseId} className='flex items-center gap-2 text-white/70 hover:text-white text-xs mb-3 transition-colors'>
                    <HiArrowLeft className='text-sm' /> Back to course
                </Link>
                <h2 className='font-bold text-white text-base leading-snug line-clamp-2'>
                    {course?.courseOutput?.course?.name}
                </h2>
                <div className='flex items-center gap-2 mt-2 text-white/70 text-xs'>
                    <HiOutlineBookOpen />
                    <span>{chapters.length} chapters</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className='px-4 py-3 border-b bg-gray-50 flex-shrink-0'>
                <div className='flex justify-between text-xs text-gray-500 mb-1'>
                    <span>Progress</span>
                    <span>{selectedChapter ? Math.round(((chapters.findIndex(c => c.name === selectedChapter?.name) + 1) / chapters.length) * 100) : 0}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1.5'>
                    <div
                        className='bg-primary h-1.5 rounded-full transition-all duration-500'
                        style={{width: selectedChapter ? `${((chapters.findIndex(c => c.name === selectedChapter?.name) + 1) / chapters.length) * 100}%` : '0%'}}
                    />
                </div>
            </div>

            {/* Chapter list */}
            <div className='overflow-y-auto flex-1'>
                {chapters.map((chapter, index) => (
                    <div key={index}
                        className='cursor-pointer'
                        onClick={()=>{setSelectedChapter(chapter); GetSelectedChapterContent(index)}}
                    >
                        <ChapterListCard
                            chapter={chapter}
                            index={index}
                            isSelected={selectedChapter?.name === chapter?.name}
                        />
                    </div>
                ))}
            </div>
        </aside>

        {/* Main content */}
        <main className='flex-1 overflow-y-auto'>
            {/* Top bar */}
            <div className='sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm'>
                <div className='flex items-center gap-3'>
                    <Link href={'/course/'+params?.courseId} className='md:hidden text-gray-500 hover:text-primary transition-colors'>
                        <HiArrowLeft className='text-xl' />
                    </Link>
                    <span className='text-sm text-gray-500 hidden md:block'>
                        {selectedChapter
                            ? `Chapter ${chapters.findIndex(c => c.name === selectedChapter?.name) + 1} of ${chapters.length}`
                            : course?.courseOutput?.course?.name
                        }
                    </span>
                </div>
                {selectedChapter && (
                    <div className='flex gap-2'>
                        {chapters.findIndex(c => c.name === selectedChapter?.name) > 0 && (
                            <button
                                className='text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors text-gray-600'
                                onClick={() => {
                                    const idx = chapters.findIndex(c => c.name === selectedChapter?.name) - 1;
                                    setSelectedChapter(chapters[idx]);
                                    GetSelectedChapterContent(idx);
                                }}
                            >← Prev</button>
                        )}
                        {chapters.findIndex(c => c.name === selectedChapter?.name) < chapters.length - 1 && (
                            <button
                                className='text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors'
                                onClick={() => {
                                    const idx = chapters.findIndex(c => c.name === selectedChapter?.name) + 1;
                                    setSelectedChapter(chapters[idx]);
                                    GetSelectedChapterContent(idx);
                                }}
                            >Next →</button>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className='min-h-[calc(100vh-57px)]'>
                {contentLoading
                    ? <Spinner size="lg" className="h-96" />
                    : <ChapterContent chapter={selectedChapter} content={chapterContent} />
                }
            </div>
        </main>
    </div>
  )
}

export default CourseStart
