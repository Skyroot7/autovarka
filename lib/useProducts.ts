'use client';

import { useState, useEffect } from 'react';
import { Product, products as staticProducts } from './products';

/**
 * Hook to load products from the server
 * Falls back to static products if API fails
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Use static products as fallback
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return { products, loading };
}

/**
 * Hook to get a single product by ID
 */
export function useProduct(id: string) {
  const { products, loading } = useProducts();
  const product = products.find(p => p.id === id);
  
  return { product, loading };
}

