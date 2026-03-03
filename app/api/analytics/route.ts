import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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
  try {
    const body = await request.json();
    let { googleAnalyticsId, googleTagManagerId } = body;

    // Извлекаем ID из полного кода Google Analytics, если пользователь вставил весь код
    if (googleAnalyticsId && googleAnalyticsId.includes('gtag')) {
      const match = googleAnalyticsId.match(/G-[A-Z0-9]+|UA-[0-9]+-[0-9]+/);
      if (match) {
        googleAnalyticsId = match[0];
      }
    }

    // Извлекаем ID из полного кода GTM, если пользователь вставил весь код
    if (googleTagManagerId && googleTagManagerId.includes('googletagmanager')) {
      const match = googleTagManagerId.match(/GTM-[A-Z0-9]+/);
      if (match) {
        googleTagManagerId = match[0];
      }
    }

    const settings = {
      googleAnalyticsId: googleAnalyticsId?.trim() || '',
      googleTagManagerId: googleTagManagerId?.trim() || '',
    };

    await kv.set(KV_ANALYTICS_KEY, settings);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to save analytics settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}

