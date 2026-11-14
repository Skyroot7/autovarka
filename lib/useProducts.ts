'use client';

import { useState, useEffect } from 'react';
import type { Product } from './products';

/** Server-rendered pages keep their initial data; header search loads on demand. */
export function useProducts(initialProducts?: Product[], enabled = true) {
  const [loadedProducts, setLoadedProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(!initialProducts && enabled);

  useEffect(() => {
    if (initialProducts !== undefined || !enabled) return;
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) throw new Error('Catalog temporarily unavailable');
        const data: Product[] = await response.json();
        setLoadedProducts(data);
      } catch (error) {
        if (!controller.signal.aborted) console.error('Error loading products:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, [initialProducts, enabled]);

  return { products: initialProducts ?? loadedProducts ?? [], loading };
}

export function useProduct(id: string) {
  const { products, loading } = useProducts();
  return { product: products.find(product => product.id === id), loading };
}
