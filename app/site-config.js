const vercelProduction = process.env.VERCEL_ENV === 'production';
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || (vercelProduction ? 'https://www.ladnahata.com.ua' : undefined);

if (configuredSiteUrl) {
  const parsedSiteUrl = new URL(configuredSiteUrl);
  if (parsedSiteUrl.protocol !== 'https:' || parsedSiteUrl.pathname !== '/' || parsedSiteUrl.search || parsedSiteUrl.hash || parsedSiteUrl.username || parsedSiteUrl.password) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTPS origin without a path, query, or credentials.');
  }
}

export const siteBase = configuredSiteUrl ? new URL(configuredSiteUrl) : undefined;
export const siteIndexable = process.env.SITE_INDEXABLE === 'true'
  || (process.env.SITE_INDEXABLE !== 'false' && vercelProduction);

if (siteIndexable && !siteBase) {
  throw new Error('Set NEXT_PUBLIC_SITE_URL before enabling SITE_INDEXABLE.');
}
