import { Product } from './products';

// Организация (автоматически добавляется на всех страницах)
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Автоварка',
    url: 'https://autovarka.com.ua',
    logo: 'https://autovarka.com.ua/logo.png',
    description: 'Професійні автомобільні мультиварки 12-24V для вантажівок, фур та легкових автомобілів. Доставка по всій Україні.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+380636815090',
      contactType: 'Customer Service',
      availableLanguage: ['Ukrainian', 'Russian', 'English', 'Polish', 'German'],
    },
    sameAs: [
      'https://t.me/autovarka',
      'viber://chat?number=%2B380636815090',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UA',
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
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://autovarka.com.ua/products?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Товар (для страниц товаров)
export function getProductSchema(product: Product, locale: string = 'uk') {
  const getName = () => {
    switch (locale) {
      case 'en': return product.nameEn;
      case 'ru': return product.nameRu;
      case 'pl': return product.namePl;
      case 'de': return product.nameDe;
      default: return product.name;
    }
  };

  const getDescription = () => {
    switch (locale) {
      case 'en': return product.descriptionEn;
      case 'ru': return product.descriptionRu;
      case 'pl': return product.descriptionPl;
      case 'de': return product.descriptionDe;
      default: return product.description;
    }
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: getName(),
    description: getDescription(),
    image: product.images.map(img => `https://autovarka.com.ua${img}`),
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Автоварка',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://autovarka.com.ua/products/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: 'Автоварка',
      },
    },
    aggregateRating: product.featured
      ? {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '127',
        }
      : undefined,
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
      const getName = () => {
        switch (locale) {
          case 'en': return product.nameEn;
          case 'ru': return product.nameRu;
          case 'pl': return product.namePl;
          case 'de': return product.nameDe;
          default: return product.name;
        }
      };

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: getName(),
          image: `https://autovarka.com.ua${product.images[0]}`,
          url: `https://autovarka.com.ua/products/${product.id}`,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'UAH',
          },
        },
      };
    }),
  };
}

// Вопрос-Ответ (FAQ) для страницы "О нас"
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Які є варіанти доставки?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Доставка по всій Україні службами Нова Пошта, УкрПошта. Самовивіз з Києва.',
        },
      },
      {
        '@type': 'Question',
        name: 'Яка гарантія на товар?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'На всі товари надається офіційна гарантія виробника 6 місяців.',
        },
      },
      {
        '@type': 'Question',
        name: 'Чи можна оплатити при отриманні?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Так, доступна оплата при отриманні (накладений платіж).',
        },
      },
    ],
  };
}
