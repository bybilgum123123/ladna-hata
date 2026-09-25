const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VISUAL_REFACTOR_URL || 'http://localhost:3001';
const output = path.resolve('artifacts/progress');
const revision = process.env.SCREENSHOT_REVISION || 'r5';
const prices = ['від 130 $/м²', 'від 180 $/м²', 'від 20 $/м²', 'від 10 $/м²', 'від 5 000 грн', 'від 500 $/м² по площі підлоги', 'від 250 $/м²'];
const selectors = { hero: '.hero', services: '.intro-band', plan: '.architecture-section', gallery: '.work-section' };
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.querySelectorAll('main img:not(.gallery-dialog__image)')) {
      image.scrollIntoView({ block: 'center', behavior: 'instant' });
      await Promise.race([image.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 4000))]);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}
async function geometry(page) {
  return page.evaluate(() => ({
    styles: {
      background: getComputedStyle(document.body).backgroundColor,
      font: getComputedStyle(document.body).fontFamily,
      services: getComputedStyle(document.querySelector('.service-bento')).display,
      hero: getComputedStyle(document.querySelector('.hero')).backgroundColor,
      material: getComputedStyle(document.querySelector('.service-bento__slot--materials .service-bento__card')).backgroundColor,
    },
    overflow: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.querySelectorAll('main img:not(.gallery-dialog__image)')].filter(x => !x.complete || !x.naturalWidth).map(x => x.currentSrc),
    priceOverflow: [...document.querySelectorAll('.service-bento__price strong')].filter(x => {
      const r = x.getBoundingClientRect(), parent=x.parentElement.getBoundingClientRect();
      return r.right>innerWidth+1 || r.right>parent.right+1;
    }).map(x=>x.textContent),
    badAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(x=>!document.getElementById(x.hash.slice(1))).map(x=>x.hash),
    prices: [...document.querySelectorAll('.service-bento__price strong')].map(x=>x.textContent),
    heroImage: getComputedStyle(document.querySelector('.hero__image')).objectFit,
    heroHeading: getComputedStyle(document.querySelector('.hero h1')).color,
    horizontalPlanOverflow: document.querySelector('.apartment-model svg').getBoundingClientRect().right>innerWidth,
  }));
}
async function main() {
  fs.mkdirSync(output, { recursive:true });
  const browser=await chromium.launch({ headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM });
  const report=[];
  try {
    for(const width of [360,390,430,768,1024,1280,1440,1920]) {
      const context=await browser.newContext({ viewport:{width,height:width<761?844:1000}, isMobile:width<=430, hasTouch:width<=430, reducedMotion:'reduce' });
      const page=await context.newPage(); const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response', r => { if (r.request().resourceType() === 'stylesheet' && r.status() >= 400) errors.push(`CSS ${r.status()}: ${r.url()}`); });
      await page.goto(base,{waitUntil:'networkidle'});
      await settle(page);
      const uk=await geometry(page);
      assert.equal(uk.styles.background, 'rgb(246, 245, 239)', `${width}: global background`);
      assert.match(uk.styles.font, /system-ui/, `${width}: body typography`);
      assert.equal(uk.styles.services, 'grid', `${width}: services grid`);
      assert.equal(uk.styles.hero, 'rgb(32, 56, 45)', `${width}: photo hero fallback`);
      assert.equal(uk.styles.material, 'rgb(53, 75, 56)', `${width}: dark service card`);
      assert.equal(await page.locator('.service-bento__card').evaluateAll(cards => cards.every(card => {
        const color = getComputedStyle(card).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
        return Math.max(...color) < 90;
      })), true, `${width}: all service cards use dark surfaces`);
      assert.equal(uk.heroImage,'cover',`${width}: photo cover`);
      assert.equal(uk.heroHeading,'rgb(251, 248, 237)',`${width}: hero contrast`);
      assert.equal(uk.overflow,false,`${width}: overflow`);
      assert.deepEqual(uk.brokenImages,[],`${width}: images`);
      assert.deepEqual(uk.priceOverflow,[],`${width}: prices`);
      assert.deepEqual(uk.badAnchors,[]);
      assert.equal(uk.horizontalPlanOverflow,false);
      assert.deepEqual(uk.prices,prices);
      assert.equal(await page.locator('.price-section, .price-grid').count(),0,`${width}: duplicate pricing removed`);
      assert.equal(await page.locator('.service-bento__slot').count(),7);
      assert.equal(await page.locator('.iridescence-container canvas').count(),0,`${width}: reduced-motion fallback`);
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.locator('.service-bento__index, .service-bento__arrow, .scroll-expand').count(),0);
      assert.equal(await page.locator('.work-card').count(),6);
      assert.equal(await page.locator('#prices').count(),1,`${width}: one pricing anchor`);
      assert.equal(await page.locator('.work-card__label span:first-child').count(),6,`${width}: gallery numbers`);
      assert.equal(await page.locator('.work-card__label span:last-child').count(),6,`${width}: gallery arrows`);
      const canonical=await page.locator('link[rel="canonical"]').first().getAttribute('href',{timeout:1000}).catch(()=>null);
      if(canonical) assert.equal(canonical,'https://www.ladnahata.com.ua');
      assert.equal(await page.locator('meta[name="google-site-verification"]').getAttribute('content'),'1wNQtBHRgzpoya1nLbjCIZOQAokauZ63jaWszWAU6mI');
      for(const href of ['https://t.me/LadnaHata','https://wa.me/380988610017','viber://chat?number=%2B380988610017','tel:+380988610017']) assert.ok(await page.locator(`a[href="${href}"]`).count());
      const first=page.locator('.work-card__button').first();
      await page.locator('.work-card__button').nth(1).focus();
      assert.equal(await page.locator('.work-card').nth(1).getAttribute('class'),'work-card work-card--active',`${width}: active gallery animation state`);
      await first.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('.gallery-dialog').evaluate(x=>x.open),true);
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#gallery-title').textContent(),'Ванна кімната');
      if(width<=430) {
        const image=page.locator('.gallery-dialog__image');
        await image.evaluate(el => {
          const touch = clientX => new Touch({identifier:1,target:el,clientX,clientY:200});
          el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(250)]}));
          el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch(100)]}));
        });
        assert.equal(await page.locator('#gallery-title').textContent(),'Акцентна стіна');
      }
      await page.keyboard.press('Escape');
      assert.equal(await first.evaluate(x=>x===document.activeElement),true);
      await page.getByRole('button',{name:'РУС',exact:true}).click();
      assert.equal(await page.locator('html').getAttribute('lang'),'ru');
      assert.match(await page.locator('.apartment-model figcaption').textContent(),/Концептуальная/);
      const ru=await geometry(page); assert.equal(ru.overflow,false); assert.deepEqual(ru.priceOverflow,[]); assert.equal(ru.prices.length,7);
      await page.getByRole('button',{name:'УКР',exact:true}).click();
      if(width===390 || width===1440) {
        const device=width===390?'mobile':'desktop';
        for(const [name,selector] of Object.entries(selectors)) {
          await page.locator(selector).screenshot({path:path.join(output,`redesign-${name}-${device}.png`),animations:'disabled'});
        }
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        await page.screenshot({path:path.join(output,`stage-12-${device}-${revision}.png`),fullPage:true,animations:'disabled'});
      }
      assert.deepEqual(errors,[]);
      report.push({width,uk,ru,errors});
      await context.close();
    }
    const motionContext=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    const motionPage=await motionContext.newPage(); const motionErrors=[];
    motionPage.on('pageerror',e=>motionErrors.push(e.message));
    await motionPage.goto(base,{waitUntil:'networkidle'});
    await motionPage.locator('.architecture-section').scrollIntoViewIfNeeded();
    await motionPage.waitForTimeout(400);
    const webglCanvases=await motionPage.locator('.iridescence-container canvas').count();
    assert.ok(webglCanvases<=1,'single WebGL instance');
    await motionPage.locator('.architecture-section').screenshot({path:path.join(output,'redesign-plan-motion-desktop.png')});
    assert.deepEqual(motionErrors,[],'WebGL runtime errors');
    await motionContext.close();
    fs.writeFileSync(path.join(output,'redesign-qa.json'),JSON.stringify({viewports:report,webglCanvases},null,2));
    console.log(`PASS: 8 widths, UK/RU, single services/pricing block, keyboard gallery, images, SEO and contacts. WebGL canvas: ${webglCanvases}. Screenshots saved.`);
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

