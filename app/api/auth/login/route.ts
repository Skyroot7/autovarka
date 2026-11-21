import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { randomBytes, pbkdf2, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const deriveKey = promisify(pbkdf2);
const headers = { 'Cache-Control': 'no-store' };
const unavailable = () => NextResponse.json({ success: false, message: 'Авторизация временно недоступна' }, { status: 503, headers });

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Некорректные данные' }, { status: 400, headers });
    }
    const { username, password } = body as Record<string, unknown>;
    if (typeof username !== 'string' || !username || username.length > 128
      || typeof password !== 'string' || !password || password.length > 1024) {
      return NextResponse.json({ success: false, message: 'Некорректные данные' }, { status: 400, headers });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const hash = process.env.ADMIN_PASSWORD_HASH;
    const salt = process.env.ADMIN_PASSWORD_SALT;
    if (!adminUsername || !adminUsername.trim()) return unavailable();

    let authenticated = false;
    if (hash || salt) {
      // Never fall back to a plain/default password when hashed configuration is partial.
      if (!hash || !/^[a-fA-F0-9]{128}$/.test(hash) || !salt) return unavailable();
      const candidate = await deriveKey(password, salt, 100000, 64, 'sha512');
      authenticated = username === adminUsername && timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
    } else if (process.env.NODE_ENV === 'development' && process.env.ADMIN_PASSWORD) {
      const expected = Buffer.from(process.env.ADMIN_PASSWORD);
      const candidate = Buffer.from(password);
      authenticated = username === adminUsername && candidate.length === expected.length && timingSafeEqual(candidate, expected);
    } else {
      // Production/preview must explicitly configure the existing PBKDF2 hash and salt.
      return unavailable();
    }

    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'Неверное имя пользователя или пароль' }, { status: 401, headers });
    }

    const sessionToken = randomBytes(32).toString('hex');
    await kv.set(`session:${sessionToken}`, JSON.stringify({ username, createdAt: Date.now() }), { ex: 86400 });
    const response = NextResponse.json({ success: true, message: 'Авторизация успешна' }, { headers });
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: 'Некорректные данные' }, { status: 400, headers });
    }
    console.error('Admin login is temporarily unavailable.');
    return unavailable();
  }
}
