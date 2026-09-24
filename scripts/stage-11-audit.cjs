const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = 'http://localhost:3000';

async function inspect(page) {
  return page.evaluate(() => {
    const elements = [...document.querySelectorAll('a, button, input, select, textarea')];
    const unnamed = elements.filter((element) => {
      if (element.closest('dialog:not([open])') || element.closest('[inert]')) return false;
      if (element.matches('input[type="hidden"]')) return false;
      const label = element.getAttribute('aria-label') || element.labels?.[0]?.textContent || element.textContent || element.getAttribute('title');
      return !label?.trim();
    });
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return {
      lang: document.documentElement.lang,
      headings: [...document.querySelectorAll('h1,h2,h3')].map((node) => [node.tagName, node.textContent.trim().slice(0, 70)]),
      blankLinks: [...document.querySelectorAll('a')].filter((node) => !node.getAttribute('href') || node.getAttribute('href') === '#').length,
      unnamed: unnamed.map((node) => node.outerHTML.slice(0, 180)),
      imagesWithoutAlt: [...document.images].filter((node) => !node.hasAttribute('alt')).length,
      brokenImages: [...document.images].filter((node) => !node.closest('dialog') && (!node.complete || !node.naturalWidth)).length,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      robots: document.querySelector('meta[name="robots"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      jsonLd: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
      resourceCount: resources.length,
      resourceBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
      imageBytes: resources.filter((item) => item.initiatorType === 'img').reduce((sum, item) => sum + (item.transferSize || 0), 0),
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      prices: [...document.querySelectorAll('.price-amount')].map((node) => node.textContent.trim().replace(/\s+/g, ' ')),
      announcedPrices: [...document.querySelectorAll('.price-amount')].map((node) => node.getAttribute('aria-label')),
      inactiveLocaleColor: getComputedStyle(document.querySelector('.locale-switch button:not([aria-pressed="true"])')).color,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  try {
    const report = {};
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__auditVitals = { lcp: null, cls: 0 };
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.__auditVitals.lcp = Math.round(entries.at(-1).startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__auditVitals.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        for (const image of document.images) {
          if (image.closest('dialog')) continue;
          image.scrollIntoView({ behavior: 'instant', block: 'center' });
          await image.decode().catch(() => {});
        }
      });
      const data = await inspect(page);
      assert.equal(data.lang, 'uk');
      assert.equal(data.headings.filter(([tag]) => tag === 'H1').length, 1);
      assert.equal(data.blankLinks, 0);
      assert.deepEqual(data.unnamed, []);
      assert.equal(data.imagesWithoutAlt, 0);
      assert.equal(data.brokenImages, 0);
      assert.equal(data.scrollWidth, width);
      assert.deepEqual(data.announcedPrices, ['від 130 $/м²', 'від 500 $/м²', 'від 180 $/м²', 'від 250 $/м²', 'від 20 $/м²', 'від 5 000 грн', 'від 10 $/м²']);
      assert.equal(data.inactiveLocaleColor, 'rgb(82, 97, 89)');
      assert.deepEqual(errors, []);
      data.labVitals = await page.evaluate(() => window.__auditVitals);
      if (width === 390) {
        await page.locator('.contact-form button[value="copy"]').click();
        assert.equal(await page.locator('select[name="objectType"]').evaluate((node) => document.activeElement === node), true);
        await page.getByRole('radio', { name: /Зворотний дзвінок/ }).check();
        await page.locator('.contact-form button[value="copy"]').click();
        await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'phone', null, { timeout: 3000 });
        assert.equal(await page.locator('input[name="phone"]').evaluate((node) => document.activeElement === node), true);
      }
      report[width] = data;
      if (width === 1440) {
        await page.getByRole('button', { name: 'РУС' }).click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'ru');
        assert.equal(await page.locator('.price-amount').first().getAttribute('aria-label'), 'от 130 $/м²');
      }
      await context.close();
    }
    const plain = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await plain.newPage();
    await staticPage.goto(base);
    report.noJavaScript = {
      h1: await staticPage.locator('h1').count(),
      prices: await staticPage.locator('.price-amount').allTextContents(),
      contacts: await staticPage.locator('a[href^="tel:"]').count(),
    };
    await plain.close();
    const robotsResponse = await fetch(`${base}/robots.txt`);
    const sitemapResponse = await fetch(`${base}/sitemap.xml`);
    report.seoRoutes = { robotsStatus: robotsResponse.status, robots: (await robotsResponse.text()).trim(), sitemapStatus: sitemapResponse.status, sitemap: (await sitemapResponse.text()).trim() };
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
