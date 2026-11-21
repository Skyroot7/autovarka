import type { Metadata } from 'next';
import { getPageMetadata, type Locale } from './seo';

type PublicPage = 'home' | 'products' | 'about' | 'contacts';
type PageCopy = { title: string; description: string };

// These descriptions express each page's purpose without inventing a minimum
// price, manufacturer, delivery promise or warranty that can drift from KV.
const copy: Record<Locale, Record<PublicPage, PageCopy>> = {
  uk: {
    home: { title: 'Автомобільні мультиварки 12/24/220В для водіїв', description: 'Автомобільні мультиварки для водіїв, далекобійників, вантажівок і автобусів. Як обрати живлення 12/24/220В, об’єм і модель для приготування їжі в дорозі.' },
    products: { title: 'Каталог і ціни на автомобільні мультиварки', description: 'Порівняйте ціни, наявність і характеристики автомобільних мультиварок та іншої техніки для приготування їжі. Обирайте модель за напругою живлення й об’ємом.' },
    about: { title: 'Про магазин і допомогу з вибором', description: 'Дізнайтеся про спеціалізацію магазину: автомобільні мультиварки та техніка для приготування їжі в дорозі. Ознайомтеся з підходом до вибору моделі.' },
    contacts: { title: 'Контакти та консультація щодо товарів', description: 'Зв’яжіться з магазином щодо характеристик товарів, вибору моделі й умов замовлення. Телефон +380 63 681 50 90, Viber та контактна форма.' },
  },
  ru: {
    home: { title: 'Автомобильные мультиварки 12/24/220В для водителей', description: 'Автомобильные мультиварки для водителей, дальнобойщиков, грузовиков и автобусов. Как выбрать питание 12/24/220В, объём и модель для приготовления еды в дороге.' },
    products: { title: 'Каталог и цены на автомобильные мультиварки', description: 'Сравните цены, наличие и характеристики автомобильных мультиварок и другой техники для приготовления еды. Выбирайте модель по напряжению питания и объёму.' },
    about: { title: 'О магазине и помощи с выбором', description: 'Узнайте о специализации магазина: автомобильные мультиварки и техника для приготовления еды в дороге. Ознакомьтесь с подходом к выбору модели.' },
    contacts: { title: 'Контакты и консультация по товарам', description: 'Свяжитесь с магазином по вопросам характеристик товаров, выбора модели и условий заказа. Телефон +380 63 681 50 90, Viber и контактная форма.' },
  },
  en: {
    home: { title: '12/24/220V Vehicle Multicookers for Drivers', description: 'Vehicle multicookers for drivers, truckers, trucks and buses. Explore how to choose a 12/24/220V power option, capacity and model for cooking on the road.' },
    products: { title: 'Vehicle Multicookers: Catalog and Prices', description: 'Compare prices, availability and specifications of vehicle multicookers and other cooking appliances. Choose a model by its supply voltage and capacity.' },
    about: { title: 'About Our Store and Product Advice', description: 'Learn about our store’s focus on vehicle multicookers and appliances for cooking on the road, and our approach to helping you choose a suitable model.' },
    contacts: { title: 'Contact Us for Product Advice', description: 'Contact the store about product specifications, choosing a model and order terms. Call +380 63 681 50 90, use Viber or send a message through the contact form.' },
  },
  pl: {
    home: { title: 'Multicookery samochodowe 12/24/220V dla kierowców', description: 'Multicookery samochodowe dla kierowców ciężarówek i autobusów. Sprawdź, jak wybrać zasilanie 12/24/220V, pojemność i model do gotowania w trasie.' },
    products: { title: 'Multicookery samochodowe: katalog i ceny', description: 'Porównaj ceny, dostępność i parametry multicookerów samochodowych oraz innych urządzeń do gotowania. Wybierz model według napięcia zasilania i pojemności.' },
    about: { title: 'O sklepie i pomocy w wyborze', description: 'Poznaj specjalizację sklepu: multicookery samochodowe i urządzenia do gotowania w trasie. Dowiedz się, jak podchodzimy do wyboru odpowiedniego modelu.' },
    contacts: { title: 'Kontakt i porady dotyczące produktów', description: 'Skontaktuj się ze sklepem w sprawie parametrów produktów, wyboru modelu i warunków zamówienia. Telefon +380 63 681 50 90, Viber i formularz kontaktowy.' },
  },
  de: {
    home: { title: '12/24/220V Auto-Multikocher für Fahrer', description: 'Auto-Multikocher für Fahrer, Fernfahrer, LKW und Busse. Erfahren Sie, wie Sie Spannung, Fassungsvermögen und Modell zum Kochen unterwegs auswählen.' },
    products: { title: 'Auto-Multikocher: Katalog und Preise', description: 'Vergleichen Sie Preise, Verfügbarkeit und technische Daten von Auto-Multikochern und weiteren Kochgeräten. Wählen Sie nach Spannung und Fassungsvermögen.' },
    about: { title: 'Über den Shop und unsere Produktauswahl', description: 'Erfahren Sie mehr über unseren Schwerpunkt: Auto-Multikocher und Geräte zum Kochen unterwegs. Lernen Sie unseren Ansatz zur Auswahl eines passenden Modells kennen.' },
    contacts: { title: 'Kontakt und Produktberatung', description: 'Kontaktieren Sie den Shop zu Produkteigenschaften, Modellauswahl und Bestellbedingungen. Telefon +380 63 681 50 90, Viber und Kontaktformular.' },
  },
};

export function getPublicPageMetadata(locale: string, page: PublicPage): Metadata {
  const localized = copy[locale as Locale] || copy.uk;
  return getPageMetadata({ locale, path: page === 'home' ? '/' : `/${page}`, ...localized[page] });
}

export function getBreadcrumbLabels(locale: string): { home: string; catalog: string } {
  const labels: Record<string, { home: string; catalog: string }> = {
    uk: { home: 'Головна', catalog: 'Каталог' },
    ru: { home: 'Главная', catalog: 'Каталог' },
    en: { home: 'Home', catalog: 'Catalog' },
    pl: { home: 'Strona główna', catalog: 'Katalog' },
    de: { home: 'Startseite', catalog: 'Katalog' },
  };
  return labels[locale] || labels.uk;
}
