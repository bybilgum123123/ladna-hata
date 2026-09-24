const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const baseUrl = 'http://localhost:3000/';
const progress = path.resolve('artifacts/progress');
const widths = [360, 390, 430, 768, 1024, 1440, 1920];

async function visitWholePage(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.round(window.innerHeight * 0.72));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    for (const image of [...document.images].filter((item) => !item.closest('dialog'))) {
      image.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => {
        if (image.complete && image.naturalWidth > 0) return resolve();
        const timer = setTimeout(resolve, 2500);
        image.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
        image.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(850);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}),
  });
  const checks = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await visitWholePage(page);

      const result = await page.evaluate(() => {
        const visibleImages = [...document.images].filter((image) => !image.closest('dialog'));
        return {
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          telegramVisible: document.body.innerText.includes('Telegram'),
          failedImages: visibleImages.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc),
          viber: [...document.querySelectorAll('a[href^="viber:"]')].map((anchor) => anchor.getAttribute('href')),
          whatsapp: [...document.querySelectorAll('a[href^="https://wa.me/"]')].map((anchor) => anchor.getAttribute('href')),
          phone: [...document.querySelectorAll('a[href^="tel:"]')].map((anchor) => anchor.getAttribute('href')),
        };
      });
      result.errors = errors;
      checks.push(result);
      const exactLinks = result.viber.every((href) => href === 'viber://chat?number=%2B380988610017')
        && result.whatsapp.every((href) => href === 'https://wa.me/380988610017')
        && result.phone.every((href) => href === 'tel:+380988610017')
        && result.viber.length > 0 && result.whatsapp.length > 0 && result.phone.length > 0;
      result.exactLinks = exactLinks;

      if (width === 1440) {
        await page.screenshot({ path: path.join(progress, 'visual-polish-desktop.png') });
        await page.evaluate(() => window.scrollTo(0, document.querySelector('#works').offsetTop - 90));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(progress, 'visual-polish-portfolio.png') });
        await page.evaluate(() => window.scrollTo(0, document.querySelector('#faq').offsetTop - 70));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(progress, 'visual-polish-faq.png') });
      }
      if (width === 390) {
        await page.screenshot({ path: path.join(progress, 'visual-polish-mobile.png'), fullPage: true });
        const firstQuestion = page.getByRole('button', { name: 'Де ви працюєте?' });
        await firstQuestion.click();
        const priceQuestion = page.getByRole('button', { name: 'Скільки коштує ремонт під ключ?' });
        await priceQuestion.click();
        result.faqExpanded = await priceQuestion.getAttribute('aria-expanded');
        const photo = page.getByRole('button', { name: 'Відкрити фото: Спальня' });
        await photo.click();
        result.galleryOpen = await page.locator('dialog.gallery-dialog').evaluate((dialog) => dialog.open);
        await page.keyboard.press('Escape');
        result.galleryClosed = await page.locator('dialog.gallery-dialog').evaluate((dialog) => !dialog.open);
        result.focusRestored = await photo.evaluate((button) => document.activeElement === button);
      }
      if (width === 390 || width === 1440) {
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });
        await page.evaluate(() => {
          const section = document.querySelector('#process');
          window.scrollTo(0, section.offsetTop + section.offsetHeight - window.innerHeight);
        });
        await page.waitForTimeout(150);
        const dockViber = page.getByRole('navigation', { name: 'Швидкий зв’язок' }).getByRole('link', { name: 'Написати у Viber' });
        await dockViber.click();
        if (width === 1440) {
          result.viberFallbackVisible = await page.locator('.contact-dock__fallback').getByText('+380988610017').isVisible();
          result.viberCopyAvailable = await page.locator('.contact-dock__fallback').getByRole('button', { name: 'Скопіювати номер' }).isVisible();
          await page.locator('.contact-dock__fallback').getByRole('button', { name: 'Скопіювати номер' }).click();
        }
        await page.locator('#contact').scrollIntoViewIfNeeded();
        if (width === 390) {
          await page.locator('.contact-channels a[href^="viber:"]').click();
          result.viberFallbackVisible = await page.locator('.contact-channels__notice').getByText('Якщо Viber не відкрився').isVisible();
          result.viberCopyAvailable = await page.locator('.contact-channels').getByRole('button', { name: 'Скопіювати +380988610017' }).isVisible();
          await page.locator('.contact-channels').getByRole('button', { name: 'Скопіювати +380988610017' }).click();
        }
        result.viberCopied = await page.waitForFunction(async () => (await navigator.clipboard.readText()) === '+380988610017', null, { timeout: 2500 }).then(() => true, () => false);
        const phoneLink = page.locator('.contact-channels a[href^="tel:"]');
        await phoneLink.click();
        result.phoneClickable = true;
        const whatsappLink = page.locator('.contact-channels a[href^="https://wa.me/"]');
        let whatsappRequested = false;
        await page.route('https://wa.me/**', async (route) => {
          whatsappRequested = true;
          await route.abort();
        });
        try { await whatsappLink.click({ timeout: 5000 }); } catch { /* Aborted test navigation is expected. */ }
        result.whatsappRequested = whatsappRequested;
      }
      await page.close();
    }
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(baseUrl, { waitUntil: 'networkidle' });
    const reducedResult = await reduced.evaluate(() => ({
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      splitWords: document.querySelectorAll('.split-heading__word').length,
      expandableTransform: getComputedStyle(document.querySelector('.scroll-expand__frame')).transform,
    }));
    checks.push(reducedResult);
    await reduced.close();
    console.log(JSON.stringify(checks, null, 2));
    if (checks.some((item) => item.errors?.length || item.scrollWidth > item.width + 1 || item.failedImages?.length || item.telegramVisible || item.exactLinks === false || item.viberFallbackVisible === false || item.viberCopyAvailable === false || item.viberCopied === false || item.phoneClickable === false || item.whatsappRequested === false)) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
