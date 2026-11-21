'use server';

import { put, del, head, list } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { isAdminAuthenticated } from './adminAuth';
import { ImageValidationError, getProductBlobPath, validateUploadedImage } from './imagePolicy';

const unauthorized = { success: false, error: 'Необхідна авторизація адміністратора' } as const;

/**
 * Upload an image to Vercel Blob storage.
 * Requires BLOB_READ_WRITE_TOKEN environment variable.
 */
export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!await isAdminAuthenticated()) return unauthorized;
    const image = await validateUploadedImage(formData);
    const blob = await put(`products/product-${randomUUID()}.${image.extension}`, image.bytes, {
      access: 'public',
      contentType: image.contentType,
      allowOverwrite: false,
    });

    return { success: true, url: blob.url };
  } catch (error) {
    if (error instanceof ImageValidationError) return { success: false, error: error.message };
    // SDK errors can contain request details; do not expose them to the client/logs.
    console.error('Authenticated image upload failed.');
    return { success: false, error: 'Помилка завантаження зображення' };
  }
}

/**
 * Delete an image from Vercel Blob storage or local /images/ path.
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!await isAdminAuthenticated()) return unauthorized;
    // Checked-in images are immutable deployment assets, never Blob deletion targets.
    if (typeof imageUrl === 'string' && (
      imageUrl === '/placeholder.jpg' || imageUrl === '/placeholder.svg'
      || /^\/images\/[A-Za-z0-9_./-]+$/.test(imageUrl)
    )) return { success: true };

    const pathname = getProductBlobPath(imageUrl);
    // Resolve a pathname in OUR authenticated store, not a caller-selected URL.
    // Comparing the provider's URL rejects another store with the same path.
    const blob = await head(pathname);
    if (blob.pathname !== pathname || blob.url !== imageUrl || !blob.etag) {
      return { success: false, error: 'Зображення не належить сховищу цього магазину' };
    }
    // Never delete a replacement uploaded between the ownership check and delete.
    await del(blob.url, { ifMatch: blob.etag });
    return { success: true };
  } catch (error) {
    if (error instanceof ImageValidationError) return { success: false, error: error.message };
    console.error('Authenticated image deletion failed.');
    return { success: false, error: 'Помилка видалення зображення' };
  }
}

/**
 * List all uploaded product images in Vercel Blob.
 */
export async function listImages(): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    if (!await isAdminAuthenticated()) return unauthorized;
    const { blobs } = await list({ prefix: 'products/' });
    return { success: true, urls: blobs.filter(blob => blob.pathname.startsWith('products/')).map(blob => blob.url) };
  } catch {
    console.error('Authenticated image listing failed.');
    return { success: false, error: 'Помилка отримання списку зображень' };
  }
}
