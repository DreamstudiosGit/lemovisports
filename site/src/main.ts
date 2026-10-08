// Lemovi Sports v2 – interaction layer. Progressive enhancement only: every
// section, link and call to action also works without this script. The
// inline head script adds `motion-ok`; it removes it again if this file
// never arrives, so no frame can stay undeveloped.
declare global { interface Window { __lemovi?: boolean } }
window.__lemovi = true;

const root = document.documentElement;
root.classList.add('js');

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const phoneQuery = matchMedia('(max-width: 760px)');
const wideNavQuery = matchMedia('(min-width: 1081px)');
const reduced = (): boolean => motionQuery.matches;
const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null => scope.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] => [...scope.querySelectorAll<T>(selector)];
const joinList = (items: string[]): string => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`;

const header = $('[data-header]');
const hero = $('[data-hero]');
const request = $('#anfrage');
const sticky = $('.sticky-cta');
let heroCtaGone = false;
let requestVisible = false;

/* ---------- Hero: the exposure ---------- */
const exposure = $('[data-exposure]');
const strip = $('[data-strip]');
const frames = $$('.frame', strip ?? document);
frames.forEach((frame, index) => frame.style.setProperty('--n', String(index)));
let exposed = false;
function expose(): void {
  if (exposed) return;
  exposed = true;
  exposure?.classList.add('is-exposed');
  strip?.classList.add('is-developed');
}
if (reduced()) expose();
else {
  // Fire once the display face is ready, so the exposure shows real letterforms.
  const fire = (): void => { requestAnimationFrame(() => requestAnimationFrame(expose)); };
  void document.fonts?.ready.then(fire);
  setTimeout(expose, 1400);
}

/* ---------- Hero: choose your movement ---------- */
const planner = $<HTMLFormElement>('[data-planner]');
const sendLink = $<HTMLAnchorElement>('[data-planner-send]');
const preview = $('[data-planner-preview]');
const chips = $$<HTMLButtonElement>('.pick-chip');
const pickStatus = $('[data-pick-status]');
const interestBox = (value: string): HTMLInputElement | null =>
  planner?.querySelector<HTMLInputElement>(`input[name="interest"][value="${CSS.escape(value)}"]`) ?? null;

function showPicks(): void {
  const chosen = chips.filter(chip => chip.getAttribute('aria-pressed') === 'true');
  const worlds = new Set(chosen.map(chip => chip.dataset.world));
  strip?.classList.toggle('is-filtering', worlds.size > 0);
  frames.forEach(frame => frame.classList.toggle('is-on', worlds.has(frame.dataset.world) || frame.dataset.world === 'all'));
  if (pickStatus) pickStatus.textContent = chosen.length ? `Gewählt: ${joinList(chosen.map(chip => chip.dataset.interest ?? ''))} – steht schon in deiner Anfrage.` : '';
}
function setPick(value: string, on: boolean): void {
  const chip = chips.find(item => item.dataset.interest === value);
  chip?.setAttribute('aria-pressed', String(on));
  const box = interestBox(value);
  if (box) box.checked = on;
}
chips.forEach(chip => chip.addEventListener('click', () => {
  setPick(chip.dataset.interest ?? '', chip.getAttribute('aria-pressed') !== 'true');
  showPicks();
  buildRequest();
}));
// The plate actions carry their world into the request, then the link scrolls there.
$$<HTMLAnchorElement>('[data-pick]').forEach(link => link.addEventListener('click', () => {
  setPick(link.dataset.pick ?? '', true);
  showPicks();
  buildRequest();
}));

/* ---------- Navigation: scroll state and current section ---------- */
const navLinks = $$<HTMLAnchorElement>('.nav a[href^="#"]');
let activeLink: HTMLAnchorElement | null = null;
function setActive(id: string | null): void {
  const next = navLinks.find(link => link.hash === `#${id}`) ?? null;
  if (next === activeLink) return;
  activeLink?.removeAttribute('aria-current');
  activeLink = next;
  activeLink?.setAttribute('aria-current', 'true');
}
if ('IntersectionObserver' in window) {
  const watched = $$('main > section[id]');
  const current = new Set<Element>();
  const spy = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? current.add(entry.target) : current.delete(entry.target);
    setActive(watched.filter(section => current.has(section)).at(-1)?.id ?? null);
  }, { rootMargin: '-45% 0px -54% 0px' });
  watched.forEach(section => spy.observe(section));
}

/* ---------- Mobile menu ---------- */
const menuButton = $<HTMLButtonElement>('.menu-toggle');
const menu = $('#mobile-menu');
const pageRegions = $$('main, .site-footer');
let menuTimer = 0;
const menuOpen = (): boolean => menuButton?.getAttribute('aria-expanded') === 'true';
function setMenu(open: boolean, returnFocus = false): void {
  if (!menu || !menuButton) return;
  window.clearTimeout(menuTimer);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  document.body.classList.toggle('menu-open', open);
  pageRegions.forEach(region => { region.inert = open; });
  if (open) {
    menu.hidden = false;
    menu.inert = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
  } else {
    menu.classList.remove('is-open');
    menu.inert = true;
    menuTimer = window.setTimeout(() => { menu.hidden = true; }, reduced() ? 0 : 300);
    if (returnFocus) menuButton.focus({ preventScroll: true });
  }
  updateSticky();
}
menuButton?.addEventListener('click', () => setMenu(!menuOpen()));
menu?.addEventListener('click', event => { if ((event.target as Element).closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (!menuOpen() || !menu || !menuButton) return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key !== 'Tab') return;
  const items = $$<HTMLElement>('a, button', menu);
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
});
wideNavQuery.addEventListener('change', event => { if (event.matches) setMenu(false); });

/* ---------- Sticky call to action (phones only) ---------- */
function updateSticky(): void {
  if (!sticky) return;
  const active = document.activeElement;
  const editing = active instanceof HTMLElement && active.matches('input, textarea, select');
  const show = phoneQuery.matches && heroCtaGone && !requestVisible && !menuOpen() && !editing;
  sticky.classList.toggle('is-hidden', !show);
  sticky.inert = !show;
}
if (sticky) {
  sticky.classList.add('is-hidden');
  sticky.inert = true;
  sticky.hidden = false;
}
document.addEventListener('focusin', updateSticky);
document.addEventListener('focusout', () => requestAnimationFrame(updateSticky));

/* ---------- Develop frames when they reach the moment ---------- */
if ('IntersectionObserver' in window) {
  const developer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-developed');
      developer.unobserve(entry.target);
    }
  }, { threshold: 0.35, rootMargin: '0px 0px -20% 0px' });
  $$('[data-develop]').forEach(element => developer.observe(element));

  const sheet = $('[data-sheet]');
  if (sheet) new IntersectionObserver((entries, observer) => {
    if (!entries[0]?.isIntersecting) return;
    sheet.classList.add('is-marked');
    observer.disconnect();
  }, { threshold: 0.45 }).observe(sheet);

  if (request) new IntersectionObserver(entries => {
    requestVisible = Boolean(entries[0]?.isIntersecting);
    updateSticky();
  }).observe(request);
} else {
  $$('[data-develop]').forEach(element => element.classList.add('is-developed'));
  $('[data-sheet]')?.classList.add('is-marked');
}

/* ---------- Stacked plates ---------- */
const plates = $$('.plate');
const barHeight = (): number => plates[0]?.querySelector('.plate-bar')?.getBoundingClientRect().height ?? 52;
// On phones a plate may be taller than the space under the header; lift it
// so its end stays reachable while the next plate slides over.
function placePlates(): void {
  const h = innerHeight;
  const headerHeight = header?.getBoundingClientRect().height ?? 60;
  plates.forEach((plate, index) => {
    if (!phoneQuery.matches) { plate.style.removeProperty('--stick'); return; }
    const desired = headerHeight + 8 + index * barHeight();
    const fit = h - plate.offsetHeight - 12;
    plate.style.setProperty('--stick', `${Math.round(Math.min(desired, fit))}px`);
  });
}
function updateStack(): void {
  if (reduced()) return;
  const boxes = plates.map(plate => plate.getBoundingClientRect());
  const bar = barHeight();
  plates.forEach((plate, index) => {
    const box = boxes[index];
    const next = boxes[index + 1];
    const cover = next ? clamp((box.bottom - next.top) / Math.max(1, box.height - bar)) : 0;
    plate.style.setProperty('--cover', cover.toFixed(3));
    plate.classList.toggle('is-covered', cover > 0.4);
  });
}

/* ---------- Traces draw with the scroll ---------- */
const traces = $$('[data-trace]');
function updateTraces(h: number): void {
  if (reduced()) return;
  for (const trace of traces) {
    const box = trace.getBoundingClientRect();
    if (box.bottom < -h * 0.2 || box.top > h * 1.2) continue;
    const progress = clamp((h * 0.86 - box.top) / (box.height + h * 0.3));
    trace.style.setProperty('--p', progress.toFixed(3));
    const steps = $$('.weeks-frames li, .phase-list li', trace);
    // Week markers sit on the line itself; phases start where their column starts.
    const span = trace.classList.contains('weeks-plate') ? Math.max(1, steps.length - 1) : steps.length;
    steps.forEach((step, index) => step.classList.toggle('is-reached', progress >= Math.min(1, index / span + 0.01)));
    trace.classList.toggle('is-done', progress >= 0.995);
  }
}

/* ---------- Trace geometry ----------
   The trace SVGs stretch to their boxes and keep a constant stroke width, so
   dash lengths are counted on screen. --k is the on-screen length per unit of
   pathLength; CSS multiplies every dash value by it. */
const tracePaths = $$<SVGPathElement>('.ht-trace path, .trace path, .grease path');
function measureTraces(): void {
  for (const path of tracePaths) {
    const matrix = path.getCTM();
    const length = path.getTotalLength();
    if (!matrix || !length) continue;
    let screen = 0;
    let last: DOMPoint | null = null;
    for (let index = 0; index <= 32; index++) {
      const point = path.getPointAtLength((length * index) / 32).matrixTransform(matrix);
      if (last) screen += Math.hypot(point.x - last.x, point.y - last.y);
      last = point;
    }
    path.style.setProperty('--k', (screen / length).toFixed(4));
  }
}

/* ---------- One frame loop for everything scroll-linked ---------- */
let ticking = false;
function frame(): void {
  ticking = false;
  const h = innerHeight;
  header?.classList.toggle('is-scrolled', scrollY > 24);
  if (hero) {
    const gone = hero.getBoundingClientRect().bottom < h * 0.35;
    if (gone !== heroCtaGone) { heroCtaGone = gone; updateSticky(); }
  }
  updateStack();
  updateTraces(h);
}
function requestFrame(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(frame);
}
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => { placePlates(); measureTraces(); requestFrame(); updateSticky(); }, { passive: true });
phoneQuery.addEventListener('change', () => { placePlates(); updateSticky(); });
addEventListener('load', () => { placePlates(); measureTraces(); requestFrame(); }, { once: true });

motionQuery.addEventListener('change', () => {
  root.classList.toggle('motion-ok', !reduced());
  if (!reduced()) { requestFrame(); return; }
  expose();
  plates.forEach(plate => { plate.style.removeProperty('--cover'); plate.classList.remove('is-covered'); });
  traces.forEach(trace => trace.style.removeProperty('--p'));
});

/* ---------- Request record: builds a ready-to-send e-mail ---------- */
function buildRequest(): void {
  if (!planner || !sendLink) return;
  const data = new FormData(planner);
  const chosen = data.getAll('interest').map(String);
  const unsure = chosen.includes('Beratung');
  const interests = chosen.filter(value => value !== 'Beratung');
  const time = String(data.get('time') ?? '');
  const name = String(data.get('name') ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const sentences = [interests.length
    ? `ich möchte gern ein Probetraining machen und interessiere mich für ${joinList(interests)}.`
    : 'ich möchte gern ein Probetraining machen.'];
  if (unsure) sentences.push(interests.length ? 'Ich bin noch unsicher und freue mich über eure Beratung.' : 'Ich weiß noch nicht genau, was zu mir passt, und freue mich über eure Beratung.');
  if (time) sentences.push(time === 'flexibel' ? 'Zeitlich bin ich flexibel.' : `Am besten passt es mir ${time}.`);
  const message = sentences.join(' ');
  const body = ['Hallo Lemovi-Team,', '', message, '', 'Bitte meldet euch bei mir, damit wir einen Termin abstimmen können.', '', 'Viele Grüße', name].join('\r\n').trimEnd();
  const subject = interests.length ? `Probetraining: ${interests.join(', ')}` : 'Probetraining bei Lemovi Sports';
  sendLink.href = `mailto:hallo@lemovisports.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (preview) preview.textContent = `„Hallo Lemovi-Team, ${message}${name ? ` – ${name}` : ''}“`;
}
planner?.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  // Ticking a world in the record also marks it on the first plate.
  if (input.name === 'interest' && chips.some(chip => chip.dataset.interest === input.value)) {
    setPick(input.value, input.checked);
    showPicks();
  }
  buildRequest();
});
planner?.addEventListener('input', buildRequest);
planner?.addEventListener('submit', event => { event.preventDefault(); sendLink?.click(); });
buildRequest();

const year = $('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
placePlates();
measureTraces();
frame();
updateSticky();

export {};
