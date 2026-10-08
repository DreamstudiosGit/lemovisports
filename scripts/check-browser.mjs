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
    // Images hidden by design at this breakpoint (e.g. the hero card) are skipped.
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async element => { try { await element.decode(); } catch { /* asserted below */ } });
  }
}
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let top = 0; top < height; top += 400) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top);
    await page.waitForTimeout(60);
  }
}

try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await check(`Layout and media at ${width}px`, async () => {
      const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 1000 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      const failedRequests = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('response', response => { if (response.status() >= 400) failedRequests.push({ url: response.url(), status: response.status() }); });
      page.on('request', request => requests.push(request.url()));
      await page.goto(base, { waitUntil: 'networkidle' });
      await loadImages(page);
      const layout = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        brokenImages: [...document.images].filter(image => image.checkVisibility() && (!image.complete || image.naturalWidth === 0)).map(image => image.currentSrc || image.src),
        emptyLinks: [...document.querySelectorAll('a')].filter(link => !link.getAttribute('href') || link.getAttribute('href') === '#').map(link => link.textContent),
        // Inline links inside sentences are exempt from WCAG 2.5.8.
        smallTargets: [...document.querySelectorAll('main a, main button, header a, header button')].filter(element => element.checkVisibility({ checkVisibilityCSS: true }) && !element.closest('p')).filter(element => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && (box.width < 24 || box.height < 24);
        }).map(element => element.textContent?.trim()),
      }));
      expect(layout.documentWidth).toBeLessThanOrEqual(width);
      expect(layout.brokenImages).toEqual([]);
      expect(layout.emptyLinks).toEqual([]);
      expect(layout.smallTargets).toEqual([]);
      expect(errors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(requests.filter(url => url.endsWith('.mp4'))).toEqual([]);
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
    const box = await toggle.boundingBox();
    expect(box.x + box.width).toBeGreaterThan(330);
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
    await page.locator('#mobile-menu a[href="#angebote"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(new URL(page.url()).hash).toBe('#angebote');
    expect(await page.locator('body').evaluate(body => body.classList.contains('menu-open'))).toBe(false);
    expect(await page.locator('main').evaluate(main => main.inert)).toBe(false);
    await page.close();
  });

  await check('Desktop navigation highlights the current section', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('#studio').scrollIntoViewIfNeeded();
    await page.evaluate(() => { const studio = document.querySelector('#studio'); scrollTo({ top: studio.offsetTop + 200, behavior: 'instant' }); });
    await expect(page.locator('.nav a[href="#studio"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('.nav-indicator')).toHaveClass(/is-on/);
    await expect(page.locator('[data-header]')).toHaveClass(/is-scrolled/);
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

  await check('Request planner builds a complete e-mail and is keyboard operable', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const send = page.locator('[data-planner-send]');
    expect(await send.getAttribute('href')).toBe('mailto:hallo@lemovisports.de?subject=Probetraining%20bei%20Lemovi%20Sports&body=' + encodeURIComponent('Hallo Lemovi-Team,\r\n\r\nich möchte gern ein Probetraining machen.\r\n\r\nBitte meldet euch bei mir, damit wir einen Termin abstimmen können.\r\n\r\nViele Grüße'));
    await page.getByRole('checkbox', { name: 'Reformer Pilates' }).focus();
    await page.keyboard.press('Space');
    await page.getByLabel('Kurse', { exact: true }).check();
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

  await check('Reduced-motion video is opt-in and remains controllable', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const videoRequests = [];
    page.on('request', request => { if (request.url().endsWith('.mp4')) videoRequests.push(request.url()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    const video = page.locator('#hero-video');
    expect(await video.evaluate(element => element.getAttribute('src'))).toBe(null);
    expect(videoRequests).toEqual([]);
    await page.getByRole('button', { name: 'Video abspielen' }).click();
    await page.waitForFunction(() => { const element = document.querySelector('video'); return element && !element.paused && element.readyState >= 3; });
    await expect(page.getByRole('button', { name: 'Video pausieren' })).toHaveAttribute('aria-pressed', 'true');
    await video.screenshot({ path: `${output}/generated-video-frame.png` });
    await page.getByRole('button', { name: 'Video pausieren' }).click();
    expect(await video.evaluate(element => element.paused)).toBe(true);
    await page.getByRole('button', { name: 'Video abspielen' }).click();
    await page.locator('#kontakt').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('video').paused);
    expect(await video.evaluate(element => element.muted && element.playsInline && element.loop)).toBe(true);
    await page.close();
    return { videoRequests: videoRequests.length };
  });

  await check('Motion: reveals, scenes and autoplay behave while scrolling', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => { const element = document.querySelector('video'); return element && !element.paused; }, null, { timeout: 8000 });
    await scrollThrough(page);
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll('[data-reveal]')].filter(element => !element.classList.contains('is-in')).length,
      litWords: document.querySelectorAll('[data-words] .w.is-lit').length,
      words: document.querySelectorAll('[data-words] .w').length,
      unveil: getComputedStyle(document.querySelector('[data-unveil]')).getPropertyValue('--u').trim(),
      videoPaused: document.querySelector('video').paused,
    }));
    expect(state.hidden).toBe(0);
    expect(state.words).toBeGreaterThan(10);
    expect(state.litWords).toBe(state.words);
    expect(Number(state.unveil)).toBe(1);
    expect(state.videoPaused).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
    return state;
  });

  await check('Carousel buttons move the motifs', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const track = page.locator('[data-pace]');
    await track.scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Vorheriges Motiv' })).toHaveAttribute('aria-disabled', 'true');
    await page.getByRole('button', { name: 'Nächstes Motiv' }).click();
    await page.waitForFunction(() => document.querySelector('[data-pace]').scrollLeft > 100);
    await expect(page.getByRole('button', { name: 'Vorheriges Motiv' })).toHaveAttribute('aria-disabled', 'false');
    await page.close();
  });

  await check('Sticky mobile call to action appears after the hero and yields to the contact section', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    const sticky = page.locator('.sticky-cta');
    await expect(sticky).toBeHidden();
    await page.evaluate(() => scrollTo({ top: innerHeight * 1.6, behavior: 'instant' }));
    await expect(sticky).toBeVisible();
    await expect(sticky.getByRole('link', { name: 'Probetraining anfragen' })).toHaveAttribute('href', '#kontakt');
    await page.locator('#anfrage').scrollIntoViewIfNeeded();
    await expect(sticky).toBeHidden();
    await page.close();
  });

  await check('No-JavaScript content and navigation', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await page.goto(base, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.nav a[href="#angebote"]')).toBeVisible();
    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.locator('.video-toggle')).toBeHidden();
    await expect(page.locator('.planner-fields')).toBeHidden();
    await expect(page.locator('[data-planner-send]')).toHaveAttribute('href', /^mailto:hallo@lemovisports\.de/);
    await page.locator('details summary').first().click();
    await expect(page.locator('details').first().locator('.answer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.close();
  });

  await check('Reduced motion disables automatic decorative motion', async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    expect(await page.locator('h1 .line > span').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none');
    expect(await page.locator('[data-hero-media]').evaluate(element => getComputedStyle(element).transform)).toBe('none');
    expect(await page.locator('video').evaluate(element => element.paused)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.classList.contains('reveal-on'))).toBe(false);
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
