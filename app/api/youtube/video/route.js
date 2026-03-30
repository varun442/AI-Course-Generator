import { NextResponse } from 'next/server';

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing video id' }, { status: 400 });
  }

  try {
    const resp = await fetch(
      `${YOUTUBE_BASE_URL}/videos?part=snippet,statistics&id=${id}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[YouTube Video API]', error.message);
    return NextResponse.json(
      { error: 'YouTube API request failed' },
      { status: 500 }
    );
  }
}
