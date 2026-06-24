'use server';

import { put, del, list } from '@vercel/blob';
import path from 'path';

/**
 * Upload an image to Vercel Blob storage.
 * Requires BLOB_READ_WRITE_TOKEN environment variable.
 */
export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: 'Файл не знайдено' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Недопустимий тип файлу. Використовуйте JPG, PNG, WEBP або GIF' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Файл занадто великий. Максимальний розмір: 5MB' };
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `products/product-${timestamp}-${randomStr}${ext}`;

    // Convert File to Buffer — more reliable in Next.js Server Actions
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    return { success: false, error: 'Помилка завантаження зображення' };
  }
}

/**
 * Delete an image from Vercel Blob storage or local /images/ path.
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!imageUrl || imageUrl === '/placeholder.jpg') {
      return { success: true };
    }

    // Vercel Blob URLs look like: https://*.public.blob.vercel-storage.com/...
    if (imageUrl.startsWith('https://') && imageUrl.includes('blob.vercel-storage.com')) {
      await del(imageUrl);
      return { success: true };
    }

    // Legacy local images — cannot delete from Vercel filesystem at runtime, just skip
    return { success: true };
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error);
    return { success: false, error: 'Помилка видалення зображення' };
  }
}

/**
 * List all uploaded product images in Vercel Blob.
 */
export async function listImages(): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const { blobs } = await list({ prefix: 'products/' });
    return { success: true, urls: blobs.map(b => b.url) };
  } catch (error) {
    console.error('Error listing images from Vercel Blob:', error);
    return { success: false, error: 'Помилка отримання списку зображень' };
  }
}
