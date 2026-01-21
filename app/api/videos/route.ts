import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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
  try {
    const body = await request.json();
    const { homePageVideoUrl, homePageVideoTitle } = body;

    const settings = {
      homePageVideoUrl: homePageVideoUrl || '',
      homePageVideoTitle: homePageVideoTitle || '',
    };

    await kv.set('videoSettings', settings);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save video settings' }, { status: 500 });
  }
}

