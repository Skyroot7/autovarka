'use server';

import type { Product } from './products';
import { kv } from '@vercel/kv';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getPublicCatalog, readFreshCatalog } from './catalog';
import { CATALOG_CACHE_TAG, validateCatalog } from './catalogPolicy';
import { isAdminAuthenticated } from './adminAuth';

// Keep the existing public read API; editing uses an authenticated live action.
export async function getProductsFromFile(): Promise<Product[]> {
  return (await getPublicCatalog()).products;
}

export async function getAdminProducts(): Promise<Product[]> {
  return readProductsForMutation();
}

async function readProductsForMutation(): Promise<Product[]> {
  if (!await isAdminAuthenticated()) throw new Error('Необхідна авторизація адміністратора');
  // Never write an old cached/backup catalog over current KV contents.
  return (await readFreshCatalog()).products;
}

async function saveProductsToKV(products: Product[]): Promise<void> {
  const validated = validateCatalog(products);
  await kv.set('products', validated);
  // Expire immediately, including other instances that share the Next cache.
  // These operations concern only public catalog data, never orders or sessions.
  for (const invalidate of [
    () => revalidateTag(CATALOG_CACHE_TAG, { expire: 0 }),
    () => revalidatePath('/sitemap.xml'),
    () => revalidatePath('/[locale]', 'layout'),
  ]) {
    try {
      invalidate();
    } catch {
      // The write is already committed. Reporting failure here can cause an
      // administrator to retry a successful create and duplicate the product.
      // Public reads still enforce the independent 60-second freshness limit.
      console.error('Product saved, but public catalog cache invalidation failed.');
    }
  }
}

// Функция для генерации slug из названия
function generateSlug(name: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
    'я': 'ya'
  };

  return name
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Создание нового товара
export async function createProduct(productData: Omit<Product, 'id'>): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const products = await readProductsForMutation();
    
    // Генерация ID на основе названия
    const baseSlug = generateSlug(productData.name);
    let newId = baseSlug;
    let counter = 1;
    
    // Проверяем уникальность ID
    while (products.some(p => p.id === newId)) {
      newId = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    
    products.push(newProduct);
    await saveProductsToKV(products);
    
    return { success: true, product: newProduct };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Помилка при створенні товару' };
  }
}

// Обновление товара
export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    console.log('🔄 Обновление товара:', id);
    
    const products = await readProductsForMutation();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error('❌ Товар не найден:', id);
      return { success: false, error: 'Товар не знайдено' };
    }
    
    // Объединяем существующие данные с новыми
    const updatedProduct = { ...products[index], ...productData, id };
    products[index] = updatedProduct;
    
    console.log('💾 Сохранение обновленного товара в KV...');
    await saveProductsToKV(products);
    
    console.log('✅ Товар успешно обновлен:', id);
    return { success: true, product: products[index] };
  } catch (error) {
    console.error('❌ Ошибка при обновлении товара:', error);
    const errorMessage = error instanceof Error ? error.message : 'Помилка при оновленні товару';
    return { success: false, error: errorMessage };
  }
}

// Удаление товара
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const products = await readProductsForMutation();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      return { success: false, error: 'Товар не знайдено' };
    }
    
    await saveProductsToKV(filteredProducts);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Помилка при видаленні товару' };
  }
}

