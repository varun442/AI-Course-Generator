import React from 'react'
import YouTube from 'react-youtube'
import ReactMarkdown from 'react-markdown';
import { HiOutlineBookOpen, HiOutlineCodeBracket, HiOutlinePlayCircle, HiOutlineUser } from 'react-icons/hi2';
import ChapterQuiz from './ChapterQuiz';

const opts = {
  height: '100%',
  width: '100%',
  playerVars: { autoplay: 0 },
};

function VideoDescription({ snippet }) {
  if (!snippet) return null;

  const formatViews = (count) => {
    if (!count) return null;
    const n = parseInt(count);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K views';
    return n.toLocaleString() + ' views';
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className='mt-6 mb-2 bg-gray-100 rounded-xl p-5'>
      {/* Title row */}
      <div className='flex items-start justify-between gap-4 mb-3'>
        <h3 className='font-semibold text-gray-900 text-base leading-snug'>{snippet.title}</h3>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(snippet.title)}`}
          target='_blank'
          rel='noopener noreferrer'
          className='flex-shrink-0 text-xs font-medium text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary hover:text-white transition-colors'
        >
          Watch on YouTube
        </a>
      </div>

      {/* Meta row */}
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-4'>
        <span className='flex items-center gap-1 font-medium text-gray-700'>
          <HiOutlineUser className='text-sm' />
          {snippet.channelTitle}
        </span>
        {formatViews(snippet.viewCount) && (
          <span>{formatViews(snippet.viewCount)}</span>
        )}
        {formatDate(snippet.publishedAt) && (
          <span>{formatDate(snippet.publishedAt)}</span>
        )}
      </div>

      {/* Description */}
      {snippet.description && (
        <div className='space-y-2'>
          {snippet.description.split('\n').filter(line => line.trim()).map((line, i) => (
            <p key={i} className='text-sm text-gray-600 leading-7'>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterContent({chapter, content}) {
  console.log("[ChapterContent] content structure:", JSON.stringify(content?.content, null, 2));
  if (!chapter || typeof chapter !== 'object' || !chapter.name) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-400 gap-4'>
        <HiOutlineBookOpen className='text-6xl text-gray-200' />
        <div className='text-center'>
          <p className='text-lg font-medium text-gray-500'>Select a chapter to begin</p>
          <p className='text-sm text-gray-400 mt-1'>Choose a chapter from the sidebar to start learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 md:p-10 max-w-4xl mx-auto'>
      {/* Chapter Header */}
      <div className='mb-8'>
        <h1 className='font-bold text-2xl md:text-3xl text-gray-900 leading-tight'>{chapter?.name}</h1>
        {chapter?.about && (
          <p className='text-gray-500 mt-2 text-base leading-relaxed'>{chapter?.about}</p>
        )}
        <div className='h-1 w-16 bg-primary rounded-full mt-4' />
      </div>

      {/* Video */}
      {content?.videoId && (
        <div className='mb-12'>
          <div className='rounded-xl overflow-hidden shadow-lg bg-black aspect-video'>
            <YouTube
              videoId={content?.videoId}
              opts={opts}
              className='w-full h-full'
              iframeClassName='w-full h-full'
            />
          </div>

          {/* Video description — YouTube style */}
          <VideoDescription snippet={content?.videoSnippet} />
        </div>
      )}

      {/* Content Sections */}
      {content?.content && (
        <div className='space-y-6'>
          {(Array.isArray(content.content) ? content.content : Object.values(content.content))
          .filter(item => item && typeof item === 'object' && item.title)
          .map((item, index) => (
            <div key={index} className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
              <div className='p-6'>
                <h2 className='font-semibold text-lg text-gray-900 mb-3'>{item.title}</h2>
                <div className='text-gray-600 text-sm leading-relaxed'>
                  <ReactMarkdown>{item?.description}</ReactMarkdown>
                </div>
              </div>
              {item.codeExample && (
                <div className='border-t border-gray-100'>
                  <div className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-gray-400 text-xs'>
                    <HiOutlineCodeBracket />
                    <span>Code Example</span>
                  </div>
                  <pre className='p-4 bg-gray-950 text-green-400 text-sm overflow-x-auto leading-relaxed'>
                    <code>
                      {item.codeExample.replace('<precode>', '').replace('</precode>', '')}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz Section */}
      <ChapterQuiz chapter={chapter} content={content} />
    </div>
  )
}

export default ChapterContent
