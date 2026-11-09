import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const KV_ANALYTICS_KEY = 'analytics_settings';

export async function GET() {
  try {
    const settings = await kv.get(KV_ANALYTICS_KEY);
    if (settings) {
      return NextResponse.json(settings);
    }
    return NextResponse.json({ googleAnalyticsId: '', googleTagManagerId: '' });
  } catch (error) {
    console.error('Failed to get analytics settings:', error);
    return NextResponse.json({ googleAnalyticsId: '', googleTagManagerId: '' });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }
    const parseId = (value: unknown, pattern: RegExp, extract: RegExp): string | null => {
      if (typeof value !== 'string' || value.length > 10000) return null;
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (pattern.test(trimmed)) return trimmed;
      const match = trimmed.match(extract);
      return match ? match[0] : null;
    };
    const googleAnalyticsId = parseId(body.googleAnalyticsId ?? '', /^G-[A-Z0-9]+$/, /G-[A-Z0-9]+/);
    const googleTagManagerId = parseId(body.googleTagManagerId ?? '', /^GTM-[A-Z0-9]+$/, /GTM-[A-Z0-9]+/);
    if (googleAnalyticsId === null || googleTagManagerId === null) {
      return NextResponse.json({ error: 'Invalid Google Analytics or Tag Manager ID' }, { status: 400 });
    }
    const settings = { googleAnalyticsId, googleTagManagerId };

    await kv.set(KV_ANALYTICS_KEY, settings);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to save analytics settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}

