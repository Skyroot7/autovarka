'use server';

import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Upload an image to the public/images directory
 */
export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'Файл не знайдено' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Недопустимий тип файлу. Використовуйте JPG, PNG, WEBP або GIF' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Файл занадто великий. Максимальний розмір: 5MB' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `product-${timestamp}-${randomStr}${ext}`;

    // Ensure images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(imagesDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/images/${filename}`;
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Помилка завантаження зображення' };
  }
}

/**
 * Delete an image from the public/images directory
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    
    if (!filename) {
      return { success: false, error: 'Невірний URL зображення' };
    }

    // Don't delete placeholder image
    if (filename === 'placeholder.jpg') {
      return { success: true };
    }

    // Only delete images from /images/ directory
    if (!imageUrl.startsWith('/images/')) {
      return { success: false, error: 'Можна видаляти тільки зображення з /images/' };
    }

    const filepath = path.join(process.cwd(), 'public', 'images', filename);
    
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Помилка видалення зображення' };
  }
}

