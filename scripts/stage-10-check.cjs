const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = 'http://localhost:3000/';
const output = path.resolve('artifacts/progress');
fs.mkdirSync(output, { recursive: true });
const widths = [360, 390, 430, 768, 1024, 1440, 1920];
const expectedLinks = {
  telegram: 'https://t.me/LadnaHata',
  viber: 'viber://chat?number=%2B380988610017',
  whatsapp: 'https://wa.me/380988610017',
  phone: 'tel:+380988610017',
};
const expectedPrices = ['130', '500', '180', '250', '20', '5 000', '10'];

async function loadImages(page) {
  await page.evaluate(async () => {
    for (const image of [...document.images].filter((node) => !node.closest('dialog'))) {
      image.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise((resolve) => {
        if (image.complete && image.naturalWidth) return resolve();
        const timer = setTimeout(resolve, 3500);
        image.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
        image.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(350);
}

async function inspectPage(page) {
  return page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelectorAll('h1').length,
    lang: document.documentElement.lang,
    prices: [...document.querySelectorAll('.price-amount__number')].map((node) => node.textContent.trim()),
    galleryCards: document.querySelectorAll('.work-accordion .work-card').length,
    faq: document.querySelectorAll('.faq-item').length,
    imagesFailed: [...document.images].filter((node) => !node.closest('dialog') && (!node.complete || !node.naturalWidth)).length,
    links: {
      telegram: [...document.querySelectorAll('a[href*="t.me/"]')].map((a) => a.getAttribute('href')),
      viber: [...document.querySelectorAll('a[href^="viber:"]')].map((a) => a.getAttribute('href')),
      whatsapp: [...document.querySelectorAll('a[href^="https://wa.me/"]')].map((a) => a.getAttribute('href')),
      phone: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    },
    hasTelegram: document.body.innerText.includes('Telegram') && document.querySelectorAll('a[href*="t.me/"]').length > 0,
  }));
}

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}) });
  const report = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width <= 430 ? 844 : 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      const badResponses = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('response', (response) => {
        if (response.url().startsWith(base) && response.status() >= 400) badResponses.push(response.status() + ' ' + response.url());
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await loadImages(page);
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#prices').offsetTop - 100, behavior: 'instant' }));
      await page.waitForTimeout(1250);
      const data = await inspectPage(page);
      assert.equal(data.scrollWidth, width, 'horizontal overflow at ' + width);
      assert.equal(data.h1, 1);
      assert.equal(data.lang, 'uk');
      assert.deepEqual(data.prices, expectedPrices);
      assert.equal(data.galleryCards, 6);
      assert.equal(data.faq, 9);
      assert.equal(data.imagesFailed, 0);
      assert.equal(data.hasTelegram, true);
      for (const [kind, href] of Object.entries(expectedLinks)) {
        assert.ok(data.links[kind].length >= 2, kind + ' missing at ' + width);
        assert.ok(data.links[kind].every((value) => value === href), kind + ' href mismatch');
      }
      if (width === 390) {
        await page.getByRole('button', { name: 'Меню' }).click();
        assert.equal(await page.locator('#mobile-menu').evaluate((dialog) => dialog.open), true);
        await page.locator('#mobile-menu').getByRole('link', { name: /Контакти/ }).click();
        assert.equal(await page.locator('#mobile-menu').evaluate((dialog) => dialog.open), false);
        assert.equal(new URL(page.url()).hash, '#contact');
        await page.waitForTimeout(1200);
        const mobilePosition = await page.locator('#contact').evaluate((node) => ({ top: node.getBoundingClientRect().top, y: scrollY, active: document.activeElement?.outerHTML.slice(0, 100) }));
        assert.ok(mobilePosition.top >= -30 && mobilePosition.top < 400, 'mobile menu did not scroll to contact: ' + JSON.stringify(mobilePosition));
        assert.equal(await page.locator('#contact').evaluate((node) => document.activeElement === node), true);
        await page.evaluate(() => {
          const target = document.querySelector('#contact');
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo(0, scrollY + target.getBoundingClientRect().top);
          document.documentElement.style.scrollBehavior = '';
        });
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(output, 'stage-10-mobile.png') });
      }
      if (width === 1440) {
        await page.locator('.main-nav a[href="#prices"]').click();
        assert.equal(new URL(page.url()).hash, '#prices');
        await page.getByRole('button', { name: 'РУС' }).click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'ru');
        assert.match(await page.locator('h1').innerText(), /Ремонт квартир и коттеджей/);
        assert.equal(await page.locator('.price-amount__number').nth(5).innerText(), '5 000');
        assert.equal(await page.locator('.price-amount__currency').nth(5).innerText(), 'грн');
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('html').getAttribute('lang'), 'ru');
        await page.getByRole('button', { name: 'УКР' }).click();
        await page.locator('#works').scrollIntoViewIfNeeded();
        const photo = page.getByRole('button', { name: /Відкрити фото:/ }).first();
        await photo.click();
        assert.equal(await page.locator('.gallery-dialog').evaluate((dialog) => dialog.open), true);
        await page.keyboard.press('ArrowRight');
        assert.match(await page.locator('.gallery-dialog__topline').innerText(), /^02 \/ 06/);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.gallery-dialog').evaluate((dialog) => dialog.open), false);
        assert.equal(await photo.evaluate((node) => document.activeElement === node), true);
        const question = page.getByRole('button', { name: /Яка вартість електромонтажних робіт/ });
        await question.click();
        assert.equal(await question.getAttribute('aria-expanded'), 'true');
        await page.locator('#faq-panel-7').getByText(/5 000 грн/).waitFor({ state: 'visible' });
        await page.evaluate(() => window.scrollTo({ top: document.querySelector('#contact').offsetTop - 30, behavior: 'instant' }));
        await page.waitForTimeout(850);
        await page.screenshot({ path: path.join(output, 'stage-10-desktop.png') });
      }
      assert.deepEqual(errors, [], 'console or runtime errors at ' + width);
      assert.deepEqual(badResponses, [], 'failed local requests at ' + width);
      report.push({ width, overflow: false, prices: true, gallery: true, links: true, images: true, consoleErrors: 0, failedRequests: 0 });
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.contact-form button[value="copy"]').click();
    assert.equal(await page.locator('#object-type-error').isVisible(), true);
    await page.locator('select[name="objectType"]').selectOption('apartment');
    await page.locator('input[name="area"]').fill('-2');
    await page.locator('.contact-form button[value="copy"]').click();
    assert.equal(await page.locator('#area-error').isVisible(), true);
    await page.locator('input[name="area"]').fill('75,5');
    await page.locator('input[name="name"]').fill('Іван');
    await page.locator('textarea[name="comment"]').fill('Тест ремонту');
    await page.locator('.contact-form button[value="copy"]').click();
    const estimateText = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(estimateText, /Площа: 75\.5 м²/);
    assert.match(estimateText, /Квартира/i);
    assert.match(estimateText, /Іван/);
    assert.match(await page.locator('.contact-form__notice').innerText(), /нікуди не надісланий/);
    await page.locator('.contact-form button[value="copy"]').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), estimateText);
    await page.getByRole('radio', { name: /Зворотний дзвінок/ }).check();
    await page.locator('.contact-form button[value="copy"]').click();
    assert.equal(await page.locator('#phone-error').isVisible(), true);
    await page.locator('input[name="phone"]').fill('0988610017');
    await page.locator('.contact-form button[value="copy"]').click();
    const callbackText = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(callbackText, /передзвонити/);
    assert.match(callbackText, /0988610017/);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(180);
    await page.locator('.contact-dock a[href^="viber:"]').click();
    assert.equal(await page.locator('.contact-dock__fallback').getByText('+380988610017').isVisible(), true);
    await page.locator('.contact-dock__fallback button').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '+380988610017');
    report.push({ formEstimate: true, formCallback: true, viberFallback: true, clipboard: true });
    await context.close();

    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const touchPage = await touchContext.newPage();
    await touchPage.goto(base, { waitUntil: 'networkidle' });
    await touchPage.getByRole('button', { name: /Відкрити фото:/ }).first().click();
    await touchPage.locator('.gallery-dialog__image').evaluate((image) => {
      const start = new Touch({ identifier: 1, target: image, clientX: 300, clientY: 300 });
      const end = new Touch({ identifier: 1, target: image, clientX: 100, clientY: 300 });
      image.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] }));
      image.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] }));
    });
    assert.match(await touchPage.locator('.gallery-dialog__topline').innerText(), /^02 \/ 06/);
    report.push({ mobileGallerySwipe: true });
    await touchContext.close();

    const linkContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const linkPage = await linkContext.newPage();
    await linkPage.goto(base, { waitUntil: 'networkidle' });
    await linkPage.locator('select[name="objectType"]').selectOption('cottage');
    await linkPage.locator('input[name="area"]').fill('82');
    await linkPage.route('https://wa.me/**', (route) => route.abort());
    const requestPromise = linkPage.waitForRequest((request) => request.url().startsWith('https://wa.me/'), { timeout: 8000 });
    await linkPage.locator('.contact-form button[value="whatsapp"]').click();
    const outgoing = new URL((await requestPromise).url());
    assert.equal(outgoing.pathname, '/380988610017');
    assert.match(outgoing.searchParams.get('text'), /Котедж/i);
    assert.match(outgoing.searchParams.get('text'), /82 м²/);
    report.push({ whatsappPreparedUrl: true, messageSent: false });
    await linkContext.close();
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
