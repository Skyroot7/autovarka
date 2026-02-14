'use server';

import { Product } from './products';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'productsData.json');

// Загрузка товаров из файла (без кеширования)
export async function getProductsFromFile(): Promise<Product[]> {
  try {
    // Читаем файл напрямую без кеширования
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    console.log(`✅ Загружено ${products.length} товаров из файла`);
    return products;
  } catch (error) {
    console.error('❌ Ошибка чтения товаров:', error);
    // Если файл не существует, возвращаем пустой массив
    return [];
  }
}

// Сохранение товаров в файл
async function saveProductsToFile(products: Product[]): Promise<void> {
  try {
    // Проверяем, что данные валидны
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array');
    }
    
    // Форматируем JSON с правильными отступами
    const jsonData = JSON.stringify(products, null, 2);
    
    // Сохраняем файл
    await fs.writeFile(PRODUCTS_FILE, jsonData, 'utf-8');
    console.log(`✅ Файл успешно сохранен: ${PRODUCTS_FILE}`);
  } catch (error) {
    console.error('❌ Ошибка сохранения файла:', error);
    throw error;
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
    const products = await getProductsFromFile();
    
    // Генерация ID на основе названия
    let baseSlug = generateSlug(productData.name);
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
    await saveProductsToFile(products);
    
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
    console.log('📦 Данные для обновления:', productData);
    
    const products = await getProductsFromFile();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error('❌ Товар не найден:', id);
      return { success: false, error: 'Товар не знайдено' };
    }
    
    // Объединяем существующие данные с новыми
    const updatedProduct = { ...products[index], ...productData, id };
    products[index] = updatedProduct;
    
    console.log('💾 Сохранение обновленного товара...');
    await saveProductsToFile(products);
    
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
    const products = await getProductsFromFile();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      return { success: false, error: 'Товар не знайдено' };
    }
    
    await saveProductsToFile(filteredProducts);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Помилка при видаленні товару' };
  }
}

