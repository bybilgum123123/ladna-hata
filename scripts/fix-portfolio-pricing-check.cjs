const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const output = path.resolve('artifacts/progress');
fs.mkdirSync(output, { recursive: true });
const widths = [1440, 1024, 768, 390];

async function state(page) {
  return page.evaluate(() => {
    const groups = [...document.querySelectorAll('.price-amount')];
    const prices = groups.map((group) => {
      const parts = ['prefix', 'number', 'currency', 'unit'].map((name) => {
        const node = group.querySelector('.price-amount__' + name);
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return { name, text: node.textContent.trim(), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }).filter(Boolean);
      return { text: group.textContent.trim(), width: group.getBoundingClientRect().width, parts };
    });
    return {
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      cards: document.querySelectorAll('.work-accordion .work-card').length,
      extra: document.querySelectorAll('.work-extra, .work-extra__item').length,
      galleryHeight: document.querySelector('.work-accordion').getBoundingClientRect().height,
      workToProofGap: Math.round(document.querySelector('.proof-section').getBoundingClientRect().top - document.querySelector('.work-accordion').getBoundingClientRect().bottom),
      cardsHeight: [...document.querySelectorAll('.price-card')].map((node) => node.getBoundingClientRect().height),
      prices,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  const report = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      const before = await state(page);
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#prices').offsetTop - 130, behavior: 'instant' }));
      await page.waitForTimeout(300);
      const during = await state(page);
      await page.waitForTimeout(1000);
      const after = await state(page);
      if (width === 1440) {
        await page.locator('#prices').screenshot({ path: path.join(output, 'fix-pricing.png') });
      }
      if (width === 390) await page.screenshot({ path: path.join(output, 'fix-pricing-mobile-check.png') });
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#works').offsetTop - 30, behavior: 'instant' }));
      await page.waitForTimeout(1000);
      for (const image of await page.locator('#works .work-accordion img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((node) => new Promise((resolve) => {
          if (node.complete && node.naturalWidth) return resolve();
          const timer = setTimeout(resolve, 3500);
          node.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
        }));
      }
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#works').offsetTop - 30, behavior: 'instant' }));
      await page.waitForTimeout(250);
      if (width === 1440) await page.locator('#works').screenshot({ path: path.join(output, 'fix-portfolio.png') });
      if (width === 390) await page.screenshot({ path: path.join(output, 'fix-portfolio-mobile-check.png') });
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#prices').offsetTop - 130, behavior: 'instant' }));
      await page.waitForTimeout(200);
      const repeat = await state(page);
      await page.reload({ waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#prices').offsetTop - 130, behavior: 'instant' }));
      await page.waitForTimeout(1300);
      const reload = await state(page);
      const result = { width, before: before.prices.map((p) => p.parts.find((part) => part.name === 'number').text), during: during.prices.map((p) => p.parts.find((part) => part.name === 'number').text), after: after.prices.map((p) => p.parts.find((part) => part.name === 'number').text), repeat: repeat.prices.map((p) => p.parts.find((part) => part.name === 'number').text), reload: reload.prices.map((p) => p.parts.find((part) => part.name === 'number').text), cardHeightsStable: before.cardsHeight.every((height, index) => Math.abs(height - after.cardsHeight[index]) < 1), galleryCards: after.cards, extraCards: after.extra, workToProofGap: after.workToProofGap, scrollWidth: after.scrollWidth, errors };
      const expected = ['130', '500', '180', '250', '20', '5 000', '10'];
      const aligned = after.prices.every((price) => price.parts.every((part, index) => index === 0 || part.left >= price.parts[index - 1].right - 1));
      result.passed = result.galleryCards === 6 && result.extraCards === 0 && result.workToProofGap >= 40 && result.scrollWidth <= width && result.cardHeightsStable && aligned && errors.length === 0 && result.after.join('|') === expected.join('|') && result.repeat.join('|') === expected.join('|') && result.reload.join('|') === expected.join('|');
      report.push(result);
      await page.close();
    }
    const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await reducedPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const reduced = await state(reducedPage);
    report.push({ reducedMotion: reduced.prices.map((p) => p.parts.find((part) => part.name === 'number').text) });
    if (report.some((item) => item.passed === false) || report.at(-1).reducedMotion.join('|') !== '130|500|180|250|20|5 000|10') process.exitCode = 1;
    console.log(JSON.stringify(report, null, 2));
    await reducedPage.close();
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
