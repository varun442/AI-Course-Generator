import { Button } from '@/components/ui/button';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { HiOutlineRectangleStack, HiOutlineSparkles, HiOutlineArrowUpTray } from "react-icons/hi2";
import EditCourseBasicInfo from './EditCourseBasicInfo';
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Spinner from '@/app/_components/Spinner';

function CourseBasicInfo({course,refreshData,edit=true}) {

  const [selectedFile,setSelectedFile]=useState();
  const [uploading,setUploading]=useState(false);
  const [generating,setGenerating]=useState(false);


  useEffect(()=>{
    if(course)
    {
      setSelectedFile(course?.courseBanner)
    }
  },[course])

  /**
   * Select file and UPload to Firebase Storage
   * @param {*} event 
   */
  const onFileSelected=async(event)=>{
    const file=event.target.files[0];
    setSelectedFile(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      // Ensure file is treated as image regardless of detected MIME type
      const renamedFile = new File([file], `${Date.now()}.jpg`, { type: 'image/jpeg' });
      formData.append('file', renamedFile);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'ai-course');
      formData.append('resource_type', 'image');

      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await resp.json();
      console.log('[CourseBasicInfo] Cloudinary response:', data);

      if (!data.secure_url) {
        console.error('[CourseBasicInfo] Upload failed:', data?.error?.message || data);
        setUploading(false);
        return;
      }

      // Force jpg format in URL regardless of what Cloudinary detected
      const imageUrl = data.secure_url.replace(/\.[^/.]+$/, '.jpg');

      setSelectedFile(imageUrl);
      await db.update(CourseList).set({
        courseBanner: imageUrl
      }).where(eq(CourseList.id, course?.id));

      refreshData(true);
    } catch(e) {
      console.error('[CourseBasicInfo] Upload error:', e?.message || e);
    }

    setUploading(false);
  }

  const generateWithAI = async () => {
    const name = course?.courseOutput?.course?.name;
    const description = course?.courseOutput?.course?.description;
    if (!name) return;

    setGenerating(true);
    const prompt = `Eye-catching course thumbnail for "${name}". Bold vibrant gradient background, geometric shapes and abstract tech elements, large clear title "${name}" in modern sans-serif font, professional and polished, educational content style, high quality, 4k render`;

    try {
      const resp = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await resp.json();
      console.log('[CourseBasicInfo] Generate response:', data);

      if (data.imageUrl) {
        setSelectedFile(data.imageUrl);
        await db.update(CourseList).set({ courseBanner: data.imageUrl }).where(eq(CourseList.id, course?.id));
        refreshData(true);
      } else {
        console.error('[CourseBasicInfo] Generate failed:', data.error);
      }
    } catch(e) {
      console.error('[CourseBasicInfo] AI generate error:', e?.message || e);
    }
    setGenerating(false);
  }

  return (
    <div className='p-10 border rounded-xl shadow-sm mt-5 relative'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div>
                <h2 className='font-bold text-3xl'>{course?.courseOutput?.course?.name} 
               {edit && <EditCourseBasicInfo course={course} refreshData={()=>refreshData(true)} />} </h2>
                <p className='text-sm text-gray-400 mt-3 '>{course?.courseOutput?.course?.description}</p>
                <h2 className='font-medium mt-2 flex gap-2 items-center text-primary'><HiOutlineRectangleStack />{course?.category}</h2>
                 {!edit &&<Link href={'/course/'+course?.courseId+"/start"}>

                   <Button className="w-full mt-5">Start</Button>
                 </Link>}
           
            </div>
            <div className="relative">
                <label htmlFor='upload-image'>
                  <Image alt="placeholder" src={selectedFile?selectedFile:'/placeholder.png'} width={300} height={300}
                  className={`w-full rounded-xl h-[250px] object-cover transition-opacity ${edit ? 'cursor-pointer' : ''} ${uploading || generating ? 'opacity-50' : 'opacity-100'}`}/>
                  {(uploading || generating) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded-full">
                        {generating ? 'Generating image...' : 'Uploading...'}
                      </span>
                    </div>
                  )}
                </label>
              {edit && <input type="file" id="upload-image" className='opacity-0 absolute' onChange={onFileSelected} />}

              {edit && (
                <div className="flex gap-2 mt-3">
                  <label htmlFor='upload-image' className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <HiOutlineArrowUpTray className="text-base" />
                      Upload Image
                    </div>
                  </label>
                  {process.env.NEXT_PUBLIC_HOST_NAME?.includes('localhost') && (
                  <button
                    onClick={generateWithAI}
                    disabled={generating || uploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <HiOutlineSparkles className="text-base" />
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                  )}
                </div>
              )}
            </div>
        </div>
    </div>
  )
}

export default CourseBasicInfo