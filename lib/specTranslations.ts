/**
 * Helper functions to translate specification values with units
 */

export function translateSpecValue(value: string | undefined, locale: string): string {
  if (!value) return '';
  
  // Translation maps for units
  const translations: Record<string, Record<string, string>> = {
    // Volume units
    'л': {
      'uk': 'л',
      'en': 'L',
      'ru': 'л',
      'pl': 'l',
      'de': 'L'
    },
    'літр': {
      'uk': 'літр',
      'en': 'liter',
      'ru': 'литр',
      'pl': 'litr',
      'de': 'Liter'
    },
    'літри': {
      'uk': 'літри',
      'en': 'liters',
      'ru': 'литра',
      'pl': 'litry',
      'de': 'Liter'
    },
    
    // Weight units
    'кг': {
      'uk': 'кг',
      'en': 'kg',
      'ru': 'кг',
      'pl': 'kg',
      'de': 'kg'
    },
    
    // Time units
    'місяць': {
      'uk': 'місяць',
      'en': 'month',
      'ru': 'месяц',
      'pl': 'miesiąc',
      'de': 'Monat'
    },
    'місяці': {
      'uk': 'місяці',
      'en': 'months',
      'ru': 'месяца',
      'pl': 'miesiące',
      'de': 'Monate'
    },
    'місяців': {
      'uk': 'місяців',
      'en': 'months',
      'ru': 'месяцев',
      'pl': 'miesięcy',
      'de': 'Monate'
    },
    'рік': {
      'uk': 'рік',
      'en': 'year',
      'ru': 'год',
      'pl': 'rok',
      'de': 'Jahr'
    },
    'роки': {
      'uk': 'роки',
      'en': 'years',
      'ru': 'года',
      'pl': 'lata',
      'de': 'Jahre'
    },
    'років': {
      'uk': 'років',
      'en': 'years',
      'ru': 'лет',
      'pl': 'lat',
      'de': 'Jahre'
    }
  };

  let result = value;
  
  // Sort keys by length in descending order to replace longest matches first
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  // Replace each unit with its translation (handle with and without spaces)
  sortedKeys.forEach(unit => {
    // Try with space
    const withSpace = ` ${unit}`;
    if (result.includes(withSpace)) {
      const translation = translations[unit][locale] || unit;
      result = result.replace(withSpace, ` ${translation}`);
    }
    // Try without space at the end
    else if (result.endsWith(unit)) {
      const translation = translations[unit][locale] || unit;
      result = result.replace(new RegExp(`${unit}$`), translation);
    }
  });

  return result;
}

