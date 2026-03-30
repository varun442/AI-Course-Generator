import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const resp = await axios.get(YOUTUBE_BASE_URL + '/search', {
      params: {
        part: 'snippet',
        q: query,
        maxResults: 2,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    return NextResponse.json(resp.data.items);
  } catch (error) {
    console.error('[YouTube API]', error?.response?.data || error.message);
    return NextResponse.json(
      { error: 'YouTube API request failed' },
      { status: error?.response?.status || 500 }
    );
  }
}
