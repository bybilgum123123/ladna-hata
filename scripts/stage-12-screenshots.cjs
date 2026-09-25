const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const shouldIndex = process.env.EXPECT_INDEXABLE === 'true';

async function capture(browser, width, height, filename) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visibleImages = [...document.images].filter((image) => {
      const bounds = image.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < innerHeight;
    });
    await Promise.all(visibleImages.map((image) => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(400);
  assert.equal(await page.locator('html').getAttribute('lang'), 'uk');
  assert.equal(await page.locator('h1').count(), 1);
  assert.match(await page.locator('link[rel="icon"]').getAttribute('href'), /icon\.svg/);
  const robotsContent = await page.locator('meta[name="robots"]').getAttribute('content');
  if (shouldIndex) {
    assert.match(robotsContent, /index, follow/);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.ladnahata.com.ua');
  } else {
    assert.match(robotsContent, /noindex, nofollow/);
  }
  assert.equal(await page.locator('meta[name="google-site-verification"]').getAttribute('content'), '1wNQtBHRgzpoya1nLbjCIZOQAokauZ63jaWszWAU6mI');
  assert.equal(await page.locator('a[href="https://t.me/LadnaHata"]').count() > 0, true);
  assert.equal(await page.locator('a[href="https://wa.me/380988610017"]').count() > 0, true);
  assert.equal(await page.locator('a[href="viber://chat?number=%2B380988610017"]').count() > 0, true);
  assert.equal(await page.locator('a[href="tel:+380988610017"]').count() > 0, true);
  assert.deepEqual(errors, []);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  await page.screenshot({ path: filename, fullPage: false, animations: 'disabled' });
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  try {
    await capture(browser, 1440, 900, path.resolve('artifacts/progress/stage-12-desktop-r4.png'));
    await capture(browser, 390, 844, path.resolve('artifacts/progress/stage-12-mobile-r4.png'));
    console.log(`Captured ${shouldIndex ? 'production' : 'preview'} screenshots at 1440×900 and 390×844.`);
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
