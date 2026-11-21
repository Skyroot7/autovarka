import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { SettingsValidationError } from '@/lib/analyticsPolicy';
import { validateVideoSettings } from '@/lib/videoPolicy';
import { VIDEO_SETTINGS_KEY, VIDEO_SETTINGS_TAG, readFreshVideoSettings } from '@/lib/videoSettings';
import { invalidatePublicSettings } from '@/lib/publicSettings';

const headers = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    return NextResponse.json(await readFreshVideoSettings(), { headers });
  } catch {
    return NextResponse.json({ error: 'Video settings are unavailable.' }, { status: 503, headers });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers });
  }
  try {
    const settings = validateVideoSettings(await request.json());
    await kv.set(VIDEO_SETTINGS_KEY, settings);
    invalidatePublicSettings(VIDEO_SETTINGS_TAG);
    return NextResponse.json({ success: true, settings }, { headers });
  } catch (error) {
    if (error instanceof SettingsValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Use a valid HTTPS YouTube video URL and a title of at most 200 characters.' }, { status: 400, headers });
    }
    console.error('Failed to save video settings.');
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 503, headers });
  }
}
