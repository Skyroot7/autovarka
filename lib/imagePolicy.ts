import 'server-only';

import sharp from 'sharp';
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, MAX_ANIMATION_FRAMES } from './imageLimits';

export class ImageValidationError extends Error {}

const formats = {
  jpeg: { contentType: 'image/jpeg', extension: 'jpg' },
  png: { contentType: 'image/png', extension: 'png' },
  webp: { contentType: 'image/webp', extension: 'webp' },
  gif: { contentType: 'image/gif', extension: 'gif' },
} as const;

function hasCompleteContainer(bytes: Buffer, format: keyof typeof formats): boolean {
  // Reject disguised files and trailing payloads as well as truncated containers.
  // The decoder additionally checks the complete raster, not just its headers.
  if (format === 'jpeg') return bytes.length >= 4
    && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
    && bytes.subarray(-2).equals(Buffer.from([0xff, 0xd9]));
  if (format === 'png') return bytes.length >= 20
    && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && bytes.subarray(-12).equals(Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]));
  if (format === 'gif') return bytes.length >= 14
    && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))
    && bytes[bytes.length - 1] === 0x3b;
  return bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    && bytes.readUInt32LE(4) + 8 === bytes.length;
}

export async function validateUploadedImage(formData: FormData) {
  if (!(formData instanceof FormData)) throw new ImageValidationError('Некоректні дані завантаження');
  const file = formData.get('file');
  if (!(file instanceof File)) throw new ImageValidationError('Файл не знайдено');
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError('Розмір зображення має бути від 1 байта до 4 MB');
  }
  const declaredType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (!Object.values(formats).some(format => format.contentType === declaredType)) {
    throw new ImageValidationError('Недопустимий тип файлу. Використовуйте JPG, PNG, WEBP або GIF');
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length !== file.size || bytes.length > MAX_IMAGE_BYTES) {
    throw new ImageValidationError('Некоректний розмір файлу');
  }
  try {
    const decoder = sharp(bytes, { animated: true, failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS });
    const metadata = await decoder.metadata();
    if (!metadata.format || !Object.hasOwn(formats, metadata.format)) throw new Error('Unsupported raster format');
    const format = metadata.format as keyof typeof formats;
    if (formats[format].contentType !== declaredType || !hasCompleteContainer(bytes, format)) {
      throw new Error('Content does not match its declared image type');
    }
    const frames = metadata.pages ?? 1;
    const frameHeight = metadata.pageHeight ?? metadata.height;
    if (!metadata.width || !frameHeight || !Number.isInteger(frames) || frames < 1
      || metadata.width * frameHeight * frames > MAX_IMAGE_PIXELS
      || frames > MAX_ANIMATION_FRAMES) throw new Error('Image dimensions exceed limits');
    // Forces decoding all configured pages, catching corrupt data after valid headers.
    // Upload original bytes: no lossy re-encoding or removal of animation.
    await decoder.timeout({ seconds: 5 }).stats();
    return { bytes, ...formats[format] };
  } catch {
    throw new ImageValidationError('Файл пошкоджений або не є підтримуваним зображенням (до 40 Мп та 100 кадрів)');
  }
}

export function getProductBlobPath(imageUrl: string): string {
  if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
    throw new ImageValidationError('Некоректна адреса зображення');
  }
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'https:' || url.port || url.username || url.password || url.search || url.hash
      || !/^[a-z0-9]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname)
      || !/^\/products\/[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(url.pathname)
      || url.pathname.split('/').some(segment => segment === '.' || segment === '..')
      || url.href !== imageUrl) throw new Error('Not a canonical product Blob URL');
    return url.pathname.slice(1);
  } catch {
    throw new ImageValidationError('Дозволено видаляти лише зображення товарів зі сховища магазину');
  }
}
