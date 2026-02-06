import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (sessionToken) {
      // Удаляем сессию из KV
      await kv.del(`session:${sessionToken}`);
    }

    // Удаляем cookie
    const response = NextResponse.json({
      success: true,
      message: 'Вы вышли из системы',
    });

    response.cookies.delete('admin_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при выходе',
      },
      { status: 500 }
    );
  }
}
