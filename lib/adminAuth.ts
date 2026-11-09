import 'server-only';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

// Authorize sensitive requests using the same server-side session as /api/auth/session.
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const token = (await cookies()).get('admin_session')?.value;
    if (!token) return false;
    const session = await kv.get(`session:${token}`);
    return Boolean(session);
  } catch (error) {
    console.error('Admin session validation failed:', error);
    return false;
  }
}
