import './globals.css';
import './polish.css';
import './visual-v2.css';
import { LocaleProvider } from './locale';
import { siteBase, siteIndexable } from './site-config';

const siteName = 'Ладна Хата';
const title = 'Ладна Хата — ремонт квартир та котеджів в Ужгороді';
const description = 'Ремонт квартир та котеджів під ключ в Ужгороді й передмісті. Орієнтири вартості та фото робіт.';
const shareImage = siteBase ? new URL('/images/site/bedroom.png', siteBase).toString() : undefined;

export const metadata = {
  metadataBase: siteBase,
  title,
  description,
  alternates: siteBase ? { canonical: new URL('/', siteBase).toString() } : undefined,
  openGraph: {
    title,
    description,
    siteName,
    locale: 'uk_UA',
    type: 'website',
    ...(siteBase ? { url: new URL('/', siteBase).toString() } : {}),
    ...(shareImage ? { images: [{ url: shareImage, alt: 'Спальня з наданих матеріалів' }] } : {}),
  },
  twitter: {
    card: shareImage ? 'summary_large_image' : 'summary',
    title,
    description,
    ...(shareImage ? { images: [shareImage] } : {}),
  },
  robots: {
    index: siteIndexable,
    follow: siteIndexable,
    googleBot: { index: siteIndexable, follow: siteIndexable },
  },
};

const organizationData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  description,
  telephone: '+380988610017',
  areaServed: 'Ужгород та передмістя',
  ...(siteBase ? { url: new URL('/', siteBase).toString() } : {}),
}).replace(/</g, '\\u003c');

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationData }} />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
