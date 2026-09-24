import { siteBase, siteIndexable } from './site-config';

export default function sitemap() {
  if (!siteIndexable) return [];

  return [{
    url: new URL('/', siteBase).toString(),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
  }];
}
