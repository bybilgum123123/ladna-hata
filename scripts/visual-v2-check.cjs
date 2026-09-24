const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const output = path.resolve('artifacts/progress');
fs.mkdirSync(output, { recursive: true });
const base = 'http://localhost:3000/';
const widths = [360, 390, 430, 768, 1024, 1440, 1920];

async function visit(page) {
  await page.evaluate(async () => {
    for (const image of [...document.images].filter((item) => !item.closest('dialog'))) {
      image.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => {
        if (image.complete && image.naturalWidth) return resolve();
        const timer = setTimeout(resolve, 4000);
        image.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
        image.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  const results = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width <= 430 ? 844 : 900 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base, { waitUntil: 'networkidle' });
      await visit(page);
      const checks = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        faq: document.querySelectorAll('.faq-item').length,
        failedImages: [...document.images].filter((image) => !image.closest('dialog') && (!image.complete || !image.naturalWidth)).map((image) => image.src),
        links: {
          viber: [...document.querySelectorAll('a[href^="viber:"]')].map((a) => a.getAttribute('href')),
          whatsapp: [...document.querySelectorAll('a[href^="https://wa.me/"]')].map((a) => a.getAttribute('href')),
          phone: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
        },
        noTelegram: !document.body.innerText.toLowerCase().includes('telegram') && document.querySelectorAll('a[href*="t.me/"]').length === 0,
        uah: /\bгрн\b|₴/.test(document.body.innerText),
      }));
      checks.errors = errors;
      if (width === 1440) {
        await page.screenshot({ path: path.join(output, 'visual-v2-hero-desktop.png') });
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1400);
        await page.locator('#services').screenshot({ path: path.join(output, 'visual-v2-services-desktop.png') });
        await page.locator('#works').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1100);
        await page.locator('#works').screenshot({ path: path.join(output, 'visual-v2-portfolio-desktop.png') });
        await page.locator('#faq').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        await page.locator('#faq').screenshot({ path: path.join(output, 'visual-v2-faq-desktop.png') });
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        await page.locator('#contact').screenshot({ path: path.join(output, 'visual-v2-contact-desktop.png') });
        await page.getByRole('button', { name: 'РУС' }).click();
        checks.ru = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, hero: document.querySelector('h1')?.innerText, faq: document.querySelector('.faq-section h2')?.innerText }));
        await page.reload({ waitUntil: 'networkidle' });
        checks.ruPersisted = await page.evaluate(() => document.documentElement.lang === 'ru');
        await page.getByRole('button', { name: 'УКР' }).click();
        const photo = page.getByRole('button', { name: /Відкрити фото:/ }).first();
        await photo.click();
        checks.galleryOpen = await page.locator('dialog.gallery-dialog').evaluate((dialog) => dialog.open);
        await page.keyboard.press('ArrowRight');
        checks.galleryNext = await page.locator('.gallery-dialog__topline').innerText();
        await page.keyboard.press('Escape');
        checks.galleryClosed = await page.locator('dialog.gallery-dialog').evaluate((dialog) => !dialog.open);
      }
      if (width === 390) {
        await page.screenshot({ path: path.join(output, 'visual-v2-hero-mobile.png') });
        await page.evaluate(() => window.scrollTo(0, document.querySelector('#services').offsetTop));
        await page.waitForTimeout(450);
        await page.screenshot({ path: path.join(output, 'visual-v2-services-mobile.png') });
        await page.evaluate(() => window.scrollTo(0, document.querySelector('#contact').offsetTop));
        await page.waitForTimeout(650);
        await page.screenshot({ path: path.join(output, 'visual-v2-contact-mobile.png') });
        await page.getByRole('button', { name: /Меню/ }).click();
        checks.menuOpen = await page.locator('#mobile-menu').evaluate((dialog) => dialog.open);
        await page.screenshot({ path: path.join(output, 'visual-v2-menu-mobile.png') });
        await page.keyboard.press('Escape');
        checks.menuClosed = await page.locator('#mobile-menu').evaluate((dialog) => !dialog.open);
      }
      if (width === 390 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);
        await page.locator('.contact-dock__links a[href^="viber:"]').click();
        checks.viberFallback = await page.locator('.contact-dock__fallback').getByText('+380988610017').isVisible();
        checks.viberCopy = await page.locator('.contact-dock__fallback button').isVisible();
        await page.getByRole('radio', { name: /Зворотний дзвінок/ }).check();
        await page.locator('.contact-form button[value="copy"]').click();
        checks.callbackError = await page.locator('#phone-error').isVisible();
      }
      results.push(checks);
      await page.close();
    }
    console.log(JSON.stringify(results, null, 2));
    const bad = results.some((item) => item.scrollWidth > item.width || item.h1 !== 1 || item.faq !== 9 || item.uah || item.failedImages.length || item.errors.length
      || !item.noTelegram
      || item.links.viber.some((href) => href !== 'viber://chat?number=%2B380988610017')
      || item.links.whatsapp.some((href) => href !== 'https://wa.me/380988610017')
      || item.links.phone.some((href) => href !== 'tel:+380988610017')
      || (item.width === 1440 && (!item.ruPersisted || !item.galleryOpen || !item.galleryNext.startsWith('02 /') || !item.galleryClosed))
      || (item.width === 390 && (!item.menuOpen || !item.menuClosed))
      || ([390, 1440].includes(item.width) && (!item.viberFallback || !item.viberCopy || !item.callbackError)));
    if (bad) process.exitCode = 1;
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
