import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  try {
    const settings = await kv.get('videoSettings') || { 
      homePageVideoUrl: '', 
      homePageVideoTitle: '' 
    };
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ 
      homePageVideoUrl: '', 
      homePageVideoTitle: '' 
    });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid video settings' }, { status: 400 });
    }
    const { homePageVideoUrl = '', homePageVideoTitle = '' } = body;
    if (typeof homePageVideoUrl !== 'string' || homePageVideoUrl.length > 2048 ||
        typeof homePageVideoTitle !== 'string' || homePageVideoTitle.length > 200) {
      return NextResponse.json({ error: 'Invalid video settings' }, { status: 400 });
    }
    let url = homePageVideoUrl.trim();
    if (url) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' ||
            !['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(parsed.hostname)) {
          return NextResponse.json({ error: 'Only HTTPS YouTube video URLs are supported' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 });
      }
    }
    const settings = { homePageVideoUrl: url, homePageVideoTitle: homePageVideoTitle.trim() };

    await kv.set('videoSettings', settings);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save video settings' }, { status: 500 });
  }
}

