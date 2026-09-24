const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const baseUrl = process.env.SITE_URL || 'http://localhost:3001/';
const output = path.resolve('artifacts/progress');

async function revealServices(page) {
  for (const slot of await page.locator('.service-bento__slot').all()) {
    await slot.scrollIntoViewIfNeeded();
    await page.waitForTimeout(130);
  }
  await page.locator('#services').evaluate((section) => window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(900);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}),
  });
  const results = [];
  try {
    for (const width of [360, 390, 430, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await revealServices(page);
      const result = await page.evaluate(() => {
        const section = document.querySelector('#services');
        const cards = [...section.querySelectorAll('.service-bento__card')];
        return {
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          cardCount: cards.length,
          cardOverflow: cards.flatMap((card, index) => {
            const cardBox = card.getBoundingClientRect();
            return [...card.querySelectorAll('.service-bento__title, .service-bento__detail, .service-bento__price')]
              .filter((item) => {
                const box = item.getBoundingClientRect();
                return box.left < cardBox.left - 1 || box.right > cardBox.right + 1 || box.bottom > cardBox.bottom + 1;
              })
              .map((item) => `${index + 1}:${item.className}`);
          }),
          unrevealed: section.querySelectorAll('.service-bento__slot[data-reveal-ready]').length,
          links: cards.map((card) => card.getAttribute('href')),
        };
      });
      result.errors = errors;
      if (width === 1440) {
        await page.locator('#services').screenshot({ path: path.join(output, 'services-redesign-desktop.png') });
        await page.locator('.service-bento__slot--featured .service-bento__card').hover();
        await page.waitForTimeout(450);
        await page.screenshot({ path: path.join(output, 'services-redesign-desktop-hover.png') });
      }
      if (width === 390) {
        await page.locator('#services').screenshot({ path: path.join(output, 'services-redesign-mobile.png') });
      }
      results.push(result);
      await page.close();
    }
    const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await reduced.goto(baseUrl, { waitUntil: 'networkidle' });
    results.push(await reduced.evaluate(() => ({
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      cardTransition: getComputedStyle(document.querySelector('.service-bento__card')).transitionDuration,
    })));
    await reduced.close();
    console.log(JSON.stringify(results, null, 2));
    if (results.some((result) => result.errors?.length || result.scrollWidth > result.width + 1 || result.cardCount !== undefined && result.cardCount !== 6 || result.cardOverflow?.length || result.unrevealed || result.links?.some((href) => href !== '#contact'))) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
