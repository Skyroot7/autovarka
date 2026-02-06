import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { randomBytes, pbkdf2Sync } from 'crypto';

// Функция для хеширования пароля
function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Функция для проверки пароля
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashVerify = hashPassword(password, salt);
  return hash === hashVerify;
}

// Функция для генерации токена сессии
function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Получаем данные администратора из переменных окружения
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT;

    // Если хеш не задан, используем плейн пароль (только для разработки!)
    if (!ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT) {
      const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD_PLAIN) {
        const sessionToken = generateSessionToken();
        const sessionData = {
          username,
          createdAt: Date.now(),
        };

        // Сохраняем сессию в KV на 24 часа
        await kv.set(`session:${sessionToken}`, JSON.stringify(sessionData), {
          ex: 86400, // 24 часа
        });

        // Возвращаем токен
        const response = NextResponse.json({
          success: true,
          message: 'Авторизация успешна',
        });

        // Устанавливаем cookie с токеном
        response.cookies.set('admin_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 86400, // 24 часа
          path: '/',
        });

        return response;
      }
    } else {
      // Проверяем с хешированным паролем
      if (
        username === ADMIN_USERNAME &&
        verifyPassword(password, ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT)
      ) {
        const sessionToken = generateSessionToken();
        const sessionData = {
          username,
          createdAt: Date.now(),
        };

        // Сохраняем сессию в KV на 24 часа
        await kv.set(`session:${sessionToken}`, JSON.stringify(sessionData), {
          ex: 86400,
        });

        const response = NextResponse.json({
          success: true,
          message: 'Авторизация успешна',
        });

        response.cookies.set('admin_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 86400,
          path: '/',
        });

        return response;
      }
    }

    // Неверные учетные данные
    return NextResponse.json(
      {
        success: false,
        message: 'Неверное имя пользователя или пароль',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}
