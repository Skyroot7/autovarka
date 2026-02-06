import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'Нет активной сессии',
        },
        { status: 401 }
      );
    }

    // Проверяем сессию в KV
    const sessionData = await kv.get(`session:${sessionToken}`);

    if (!sessionData) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'Сессия истекла',
        },
        { status: 401 }
      );
    }

    // Парсим данные сессии
    const session = typeof sessionData === 'string' 
      ? JSON.parse(sessionData) 
      : sessionData;

    return NextResponse.json({
      authenticated: true,
      username: session.username,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        message: 'Ошибка проверки сессии',
      },
      { status: 500 }
    );
  }
}
