import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'lib', 'videoSettings.json');

export async function GET() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
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

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save video settings' }, { status: 500 });
  }
}

