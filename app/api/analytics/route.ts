import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { SettingsValidationError, validateAnalyticsSettings } from '@/lib/analyticsPolicy';
import { ANALYTICS_SETTINGS_KEY, ANALYTICS_SETTINGS_TAG, readFreshAnalyticsSettings } from '@/lib/analyticsSettings';
import { invalidatePublicSettings } from '@/lib/publicSettings';

const headers = { 'Cache-Control': 'no-store' };

// IDs are public, but the editor must receive a fresh value or an explicit error.
export async function GET() {
  try {
    return NextResponse.json(await readFreshAnalyticsSettings(), { headers });
  } catch {
    return NextResponse.json({ error: 'Analytics settings are unavailable.' }, { status: 503, headers });
  }
}

export async function POST(request: NextRequest) {
  // Authorize before parsing or writing. The admin UI is not an access boundary.
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers });
  }
  try {
    const settings = validateAnalyticsSettings(await request.json());
    await kv.set(ANALYTICS_SETTINGS_KEY, settings);
    invalidatePublicSettings(ANALYTICS_SETTINGS_TAG);
    return NextResponse.json({ success: true, settings }, { headers });
  } catch (error) {
    if (error instanceof SettingsValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Enter valid GA4 and GTM IDs, or empty strings to clear them.' }, { status: 400, headers });
    }
    console.error('Failed to save analytics settings.');
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 503, headers });
  }
}
