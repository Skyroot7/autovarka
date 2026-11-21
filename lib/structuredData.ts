import type { Product } from './products';
import { getAbsoluteImageUrl, getLocalizedUrl, getProductText } from './seo';

// Организация (автоматически добавляется на всех страницах)
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Автоварка',
    alternateName: 'Autovarka',
    url: 'https://autovarka.com.ua',
    logo: {
      '@type': 'ImageObject',
      url: 'https://autovarka.com.ua/images/hero-banner.jpg',
      width: 1200,
      height: 400,
    },
    description: 'Інтернет-магазин автомобільних мультиварок 12/24/220V для далекобійників, вантажівок та фур.',
    slogan: 'Автомобільні мультиварки для далекобійників',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+380636815090',
      contactType: 'Customer Service',
      availableLanguage: ['Ukrainian', 'Russian', 'English', 'Polish', 'German'],
      areaServed: 'UA',
    },
    sameAs: [
      'https://t.me/autovarka',
      'viber://chat?number=%2B380636815090',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UA',
      addressLocality: 'Київ',
    },
  };
}

// Интернет-магазин
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Автоварка',
    url: 'https://autovarka.com.ua',
  };
}

// Товар (для страниц товаров)
export function getProductSchema(product: Product, locale: string = 'uk') {
  const { name, description } = getProductText(product, locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.images.map(getAbsoluteImageUrl),
    url: getLocalizedUrl(locale, `/products/${product.id}`),
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: getLocalizedUrl(locale, `/products/${product.id}`),
      seller: {
        '@type': 'Organization',
        name: 'Автоварка',
      },
    },
  };
}

// Хлебные крошки (Breadcrumbs)
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://autovarka.com.ua${item.url}`,
    })),
  };
}

// Список товаров (для страницы каталога)
export function getItemListSchema(products: Product[], locale: string = 'uk') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => {
      const { name } = getProductText(product, locale);

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name,
          image: product.images[0] ? getAbsoluteImageUrl(product.images[0]) : undefined,
          url: getLocalizedUrl(locale, `/products/${product.id}`),
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'UAH',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        },
      };
    }),
  };
}
