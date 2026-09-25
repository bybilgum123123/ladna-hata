const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.SEO_AUDIT_URL || 'https://www.ladnahata.com.ua/';
const widths = [390, 1440];

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  const report = { url: base, viewports: [], errors: [], badResponses: [] };
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', (error) => report.errors.push(`${width}px: ${error.message}`));
      page.on('response', (response) => {
        if (response.url().startsWith(base) && response.status() >= 400) report.badResponses.push(`${response.status()} ${response.url()}`);
      });
      await page.addInitScript(() => {
        window.__seoVitals = { lcp: null, cls: 0 };
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.__seoVitals.lcp = Math.round(entries.at(-1).startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__seoVitals.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      const initial = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const allLinks = [...document.querySelectorAll('a[href]')];
        const brokenAnchors = allLinks.filter((link) => link.hash && new URL(link.href).origin === location.origin && !document.getElementById(decodeURIComponent(link.hash.slice(1))))
          .map((link) => link.getAttribute('href'));
        const schema = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => {
          try { return JSON.parse(node.textContent); } catch { return { parseError: true }; }
        });
        return {
          viewport: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          lang: document.documentElement.lang,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || null,
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          robots: document.querySelector('meta[name="robots"]')?.content || null,
          openGraph: Object.fromEntries(['og:title', 'og:description', 'og:url', 'og:site_name', 'og:locale', 'og:image', 'og:type'].map((key) => [key, document.querySelector(`meta[property="${key}"]`)?.content || null])),
          favicon: document.querySelector('link[rel="icon"]')?.href || null,
          googleVerification: document.querySelector('meta[name="google-site-verification"]')?.content || null,
          headings: [...document.querySelectorAll('h1,h2,h3')].map((node) => ({ level: Number(node.tagName.slice(1)), text: node.innerText.trim() })),
          imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
          internalAnchors: allLinks.filter((link) => link.hash && new URL(link.href).origin === location.origin).length,
          brokenAnchors,
          contactLinks: {
            telegram: allLinks.filter((link) => link.href === 'https://t.me/LadnaHata').length,
            whatsapp: allLinks.filter((link) => link.href === 'https://wa.me/380988610017').length,
            viber: allLinks.filter((link) => link.href === 'viber://chat?number=%2B380988610017').length,
            phone: allLinks.filter((link) => link.href === 'tel:+380988610017').length,
          },
          hrefs: allLinks.map((link) => link.href),
          schema,
          performance: { ttfb: Math.round(nav.responseStart), dcl: Math.round(nav.domContentLoadedEventEnd), ...window.__seoVitals },
        };
      });
      await page.evaluate(async () => {
        for (const image of [...document.images]) {
          if (image.closest('dialog:not([open])')) continue;
          image.scrollIntoView({ block: 'center', behavior: 'instant' });
          await Promise.race([
            image.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, 10000)),
          ]);
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      initial.imagesFailed = await page.locator('img').evaluateAll((images) => images.filter((image) => !image.closest('dialog:not([open])') && !image.naturalWidth).map((image) => image.currentSrc));
      initial.performance = await page.evaluate(() => ({ ...window.__seoVitals, ttfb: Math.round(performance.getEntriesByType('navigation')[0].responseStart), dcl: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd) }));
      if (width === 390) {
        await page.getByRole('button', { name: 'РУС' }).click();
        initial.ru = await page.evaluate(() => ({ lang: document.documentElement.lang, h1: document.querySelector('h1')?.innerText.trim(), title: document.title }));
      }
      report.viewports.push(initial);
      await context.close();
    }
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
