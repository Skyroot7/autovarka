/** Internal request context; middleware overwrites any incoming client value. */
export const CATALOG_REQUEST_HEADER = 'x-autovarka-catalog-page';

export function isCatalogPage(pathname: string): boolean {
  const path = pathname.replace(/^\/(uk|ru|en|pl|de)(?=\/|$)/, '').replace(/\/$/, '');
  return path === '' || path === '/products' || path.startsWith('/products/');
}
