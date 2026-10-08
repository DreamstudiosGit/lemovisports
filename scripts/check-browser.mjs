import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5173';
const output = fileURLToPath(new URL('../.local/browser/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const problems = [];

async function check(name, task) {
  try { const evidence = await task(); results.push({ name, status: 'passed', evidence }); console.log(`PASS ${name}`); }
  catch (error) { const message = String(error.message).slice(0, 1800); problems.push({ name, message }); console.error(`FAIL ${name}: ${message}`); }
}
async function loadImages(page) {
  for (const image of await page.locator('img').all()) {
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async element => { try { await element.decode(); } catch { /* asserted below */ } });
  }
}
async function scrollThrough(page, step = 300) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let top = 0; top < height; top += step) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top);
    await page.waitForTimeout(60);
  }
}
const scrollToSelector = (page, selector, offset = 0) => page.evaluate(([s, o]) => {
  const element = document.querySelector(s);
  scrollTo({ top: element.getBoundingClientRect().top + scrollY + o, behavior: 'instant' });
}, [selector, offset]);

try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await check(`Layout and media at ${width}px`, async () => {
      const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      const failedRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('response', response => { if (response.status() >= 400) failedRequests.push({ url: response.url(), status: response.status() }); });
      await page.goto(base, { waitUntil: 'networkidle' });
      await loadImages(page);
      const layout = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        brokenImages: [...document.images].filter(image => image.checkVisibility() && (!image.complete || image.naturalWidth === 0)).map(image => image.currentSrc || image.src),
        emptyLinks: [...document.querySelectorAll('a')].filter(link => !link.getAttribute('href') || link.getAttribute('href') === '#').map(link => link.textContent),
        // Inline links inside sentences are exempt from WCAG 2.5.8.
        smallTargets: [...document.querySelectorAll('main a, main button, header a, header button, footer a')].filter(element => element.checkVisibility({ checkVisibilityCSS: true }) && !element.closest('p')).filter(element => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && (box.width < 24 || box.height < 24);
        }).map(element => element.textContent?.trim()),
        heroTitleOverflow: (() => { const line = document.querySelector('.ht-move'); return line ? Math.round(line.getBoundingClientRect().right - innerWidth) : 0; })(),
      }));
      expect(layout.documentWidth).toBeLessThanOrEqual(width);
      expect(layout.heroTitleOverflow).toBeLessThanOrEqual(0);
      expect(layout.brokenImages).toEqual([]);
      expect(layout.emptyLinks).toEqual([]);
      expect(layout.smallTargets).toEqual([]);
      expect(errors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(await page.locator('h1').count()).toBe(1);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `${output}/${width}-full.png`, fullPage: true });
      await page.screenshot({ path: `${output}/${width}-hero.png` });
      if (width === 390 || width === 1440) {
        const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const violations = accessibility.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
        await writeFile(`${output}/${width}-accessibility.json`, JSON.stringify(violations, null, 2));
        expect(violations).toEqual([]);
      }
      await context.close();
      return layout;
    });
  }

  await check('Mobile menu, keyboard focus and same-page navigation', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: 'Menü öffnen' });
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Menü schließen' })).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('main').evaluate(main => main.inert)).toBe(true);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#mobile-menu a').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Menü schließen' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await toggle.click();
    await page.locator('#mobile-menu a[href="#studien"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(new URL(page.url()).hash).toBe('#studien');
    expect(await page.locator('main').evaluate(main => main.inert)).toBe(false);
    await page.close();
  });

  await check('Desktop navigation marks the current section', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    await scrollToSelector(page, '#ort', 300);
    await expect(page.locator('.nav a[href="#ort"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('[data-header]')).toHaveClass(/is-scrolled/);
    await page.close();
  });

  await check('Choosing a movement isolates its frames and carries into the request', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const reformer = page.locator('.pick-chip[data-world="reformer"]');
    await reformer.click();
    await expect(reformer).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-strip]')).toHaveClass(/is-filtering/);
    expect(await page.locator('.strip .frame.is-on').count()).toBe(4);
    await expect(page.locator('[data-pick-status]')).toContainText('Reformer Pilates');
    await expect(page.getByRole('checkbox', { name: 'Reformer Pilates' })).toBeChecked();
    expect(decodeURIComponent(await page.locator('[data-planner-send]').getAttribute('href'))).toContain('subject=Probetraining: Reformer Pilates');
    // Unticking in the record releases the choice on the first plate too.
    await page.getByRole('checkbox', { name: 'Reformer Pilates' }).uncheck();
    await expect(reformer).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-strip]')).not.toHaveClass(/is-filtering/);
    // A plate's action preselects its world and leads to the request.
    // The last plate is never covered by another one.
    await scrollToSelector(page, '#kurse', -100);
    await page.locator('#kurse [data-pick]').click();
    await expect(page.getByRole('checkbox', { name: 'Kurse', exact: true })).toBeChecked();
    expect(new URL(page.url()).hash).toBe('#anfrage');
    await page.close();
  });

  await check('FAQ keyboard interaction', async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto(base);
    const summary = page.locator('details summary').first();
    await summary.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('details').first()).toHaveAttribute('open', '');
    await expect(page.locator('details').first().locator('.answer')).toBeVisible();
    await page.keyboard.press('Space');
    expect(await page.locator('details').first().evaluate(element => element.open)).toBe(false);
    await page.close();
  });

  await check('Request record builds a complete e-mail and is keyboard operable', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const send = page.locator('[data-planner-send]');
    expect(await send.getAttribute('href')).toBe('mailto:hallo@lemovisports.de?subject=Probetraining%20bei%20Lemovi%20Sports&body=' + encodeURIComponent('Hallo Lemovi-Team,\r\n\r\nich möchte gern ein Probetraining machen.\r\n\r\nBitte meldet euch bei mir, damit wir einen Termin abstimmen können.\r\n\r\nViele Grüße'));
    await page.getByRole('checkbox', { name: 'Reformer Pilates' }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('checkbox', { name: 'Kurse', exact: true }).check();
    await page.getByRole('radio', { name: 'Abends' }).check();
    await page.getByLabel(/Dein Vorname/).fill('Maria');
    const href = decodeURIComponent(await send.getAttribute('href'));
    expect(href).toContain('subject=Probetraining: Reformer Pilates, Kurse');
    expect(href).toContain('interessiere mich für Reformer Pilates und Kurse.');
    expect(href).toContain('Am besten passt es mir abends.');
    expect(href).toMatch(/Viele Grüße\r\nMaria$/);
    await expect(page.locator('[data-planner-preview]')).toContainText('Reformer Pilates und Kurse');
    await page.close();
    return { href };
  });

  await check('Motion: exposure, developing frames, stacked plates and traces', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-exposure]')).toHaveClass(/is-exposed/);
    await expect(page.locator('[data-strip]')).toHaveClass(/is-developed/);
    // Plates stick one bar lower than the one before.
    const tops = await page.locator('.plate').evaluateAll(plates => plates.map(plate => [getComputedStyle(plate).position, parseFloat(getComputedStyle(plate).top)]));
    expect(tops.every(([position]) => position === 'sticky')).toBe(true);
    expect(tops[1][1]).toBeGreaterThan(tops[0][1]);
    expect(tops[2][1]).toBeGreaterThan(tops[1][1]);
    await scrollToSelector(page, '#kurse', -120);
    await page.mouse.wheel(0, 2);
    await page.waitForTimeout(500);
    const stack = await page.locator('.plate').evaluateAll(plates => plates.map(plate => ({ cover: Number(plate.style.getPropertyValue('--cover')), covered: plate.classList.contains('is-covered') })));
    expect(stack[0].covered).toBe(true);
    expect(stack[0].cover).toBeGreaterThan(0.9);
    expect(stack[2].covered).toBe(false);
    await page.screenshot({ path: `${output}/motion-stack.png` });
    await scrollThrough(page);
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => ({
      sheetMarked: document.querySelector('[data-sheet]').classList.contains('is-marked'),
      undeveloped: [...document.querySelectorAll('.tframe[data-develop], .plate-main[data-develop]')].filter(element => !element.classList.contains('is-developed')).length,
      weeksProgress: Number(document.querySelector('.weeks-plate').style.getPropertyValue('--p')),
      weeksReached: document.querySelectorAll('.weeks-frames li.is-reached').length,
    }));
    expect(state.sheetMarked).toBe(true);
    expect(state.undeveloped).toBe(0);
    expect(state.weeksProgress).toBe(1);
    expect(state.weeksReached).toBe(12);
    expect(errors).toEqual([]);
    await page.close();
    return state;
  });

  await check('Phones stack the plates without hiding the end of a plate', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const plates = page.locator('.plate');
    for (let index = 0; index < 2; index++) {
      // Scroll until the next plate is about to cover this one: the end of this plate must be on screen.
      await page.evaluate(i => {
        const next = document.querySelectorAll('.plate')[i + 1];
        scrollTo({ top: next.getBoundingClientRect().top + scrollY - innerHeight + 4, behavior: 'instant' });
      }, index);
      await page.waitForTimeout(150);
      const box = await plates.nth(index).boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      expect(box.y).toBeGreaterThan(0);
    }
    await page.close();
  });

  await check('Sticky mobile call to action appears after the hero and yields to the request', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const sticky = page.locator('.sticky-cta');
    await expect(sticky).toBeHidden();
    await page.evaluate(() => scrollTo({ top: innerHeight * 1.6, behavior: 'instant' }));
    await expect(sticky).toBeVisible();
    await expect(sticky.getByRole('link', { name: 'Probetraining anfragen' })).toHaveAttribute('href', '#anfrage');
    await page.locator('#anfrage').scrollIntoViewIfNeeded();
    await expect(sticky).toBeHidden();
    await page.close();
  });

  await check('No-JavaScript content and navigation', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await page.goto(base, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.nav a[href="#studien"]')).toBeVisible();
    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.locator('.record-fields')).toBeHidden();
    await expect(page.locator('[data-planner-send]')).toHaveAttribute('href', /^mailto:hallo@lemovisports\.de/);
    expect(await page.locator('.strip .frame img').first().evaluate(image => getComputedStyle(image).filter)).toBe('none');
    expect(await page.locator('.ht-ghost').first().evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
    await page.locator('details summary').first().click();
    await expect(page.locator('details').first().locator('.answer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.close();
  });

  await check('Reduced motion keeps everything still and complete', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.documentElement.classList.contains('motion-ok'))).toBe(false);
    expect(await page.locator('.strip .frame img').first().evaluate(image => getComputedStyle(image).filter)).toBe('none');
    expect(await page.locator('.ht-word').evaluate(element => getComputedStyle(element).transform)).toBe('none');
    await scrollToSelector(page, '#kurse', -120);
    await page.waitForTimeout(200);
    expect(await page.locator('.plate-inner').first().evaluate(element => getComputedStyle(element).transform)).toBe('none');
    expect(await page.locator('.weeks-trace path').evaluate(path => getComputedStyle(path).strokeDashoffset)).toBe('0px');
    await page.close();
  });

  await check('Server files and credentials stay outside the frontend', async () => {
    const page = await browser.newPage();
    const project = fileURLToPath(new URL('../', import.meta.url)).replaceAll('\\', '/');
    // The dev server refuses these paths; the static preview answers with the page itself.
    for (const [file, marker] of [['.env.local', 'HF_CREDENTIALS'], ['index.ts', '@higgsfield/client'], ['scripts/generate-media.ts', '@higgsfield/client']]) {
      const response = await page.request.get(`${base}/@fs/${project}${file}`);
      const leaked = response.ok() && (await response.text()).includes(marker);
      expect(leaked).toBe(false);
    }
    await page.close();
  });
} finally {
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ url: base, results, problems }, null, 2));
  if (problems.length) process.exitCode = 1;
}
