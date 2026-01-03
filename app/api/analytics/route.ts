import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'lib', 'analyticsSettings.json');

export async function GET() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ googleAnalyticsId: '', googleTagManagerId: '' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleAnalyticsId, googleTagManagerId } = body;

    const settings = {
      googleAnalyticsId: googleAnalyticsId || '',
      googleTagManagerId: googleTagManagerId || '',
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}

