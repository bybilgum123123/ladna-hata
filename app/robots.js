import { siteBase, siteIndexable } from './site-config';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(siteIndexable ? { sitemap: new URL('/sitemap.xml', siteBase).toString() } : {}),
  };
}
