// Lemovi Sports – interaction layer. Progressive enhancement only: every
// section, link and call to action also works without this script.
const root = document.documentElement;
root.classList.add('js');

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = matchMedia('(max-width: 700px)');
const wideNavQuery = matchMedia('(min-width: 1081px)');
const stackQuery = matchMedia('(min-width: 901px)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = (): boolean => motionQuery.matches;
const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null => scope.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] => [...scope.querySelectorAll<T>(selector)];

const header = $('[data-header]');
const hero = $('[data-hero]');
const heroMedia = $('[data-hero-media]');
const heroCopy = $('[data-hero-copy]');
const contact = $('#kontakt');
const sticky = $('.sticky-cta');
let heroVisible = true;
let heroCtaGone = false;
let contactVisible = false;

/* ---------- Navigation: scroll state and active-section indicator ---------- */
const indicator = $('.nav-indicator');
const navLinks = $$<HTMLAnchorElement>('.nav a[href^="#"]');
let activeLink: HTMLAnchorElement | null = null;

function placeIndicator(): void {
  if (!indicator) return;
  if (!activeLink || !wideNavQuery.matches) { indicator.classList.remove('is-on'); return; }
  indicator.style.setProperty('--x', `${activeLink.offsetLeft}px`);
  indicator.style.setProperty('--w', `${activeLink.offsetWidth}px`);
  indicator.classList.add('is-on');
}
function setActive(id: string | null): void {
  const next = navLinks.find(link => link.hash === `#${id}`) ?? null;
  if (next === activeLink) return;
  activeLink?.removeAttribute('aria-current');
  activeLink = next;
  activeLink?.setAttribute('aria-current', 'true');
  placeIndicator();
}
if ('IntersectionObserver' in window) {
  const watched = $$('main > section');
  const current = new Set<Element>();
  const spy = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? current.add(entry.target) : current.delete(entry.target);
    const last = watched.filter(section => current.has(section)).at(-1);
    setActive(last?.id || null);
  }, { rootMargin: '-45% 0px -54% 0px' });
  watched.forEach(section => spy.observe(section));
}

/* ---------- Mobile menu ---------- */
const menuButton = $<HTMLButtonElement>('.menu-toggle');
const menu = $('#mobile-menu');
const pageRegions = $$('main, .site-footer');
let menuTimer = 0;

function menuOpen(): boolean { return menuButton?.getAttribute('aria-expanded') === 'true'; }
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
    menuTimer = window.setTimeout(() => { menu.hidden = true; }, reduced() ? 0 : 320);
    if (returnFocus) menuButton.focus({ preventScroll: true });
  }
  updateSticky();
}
menuButton?.addEventListener('click', () => setMenu(!menuOpen()));
menu?.addEventListener('click', event => {
  if ((event.target as Element).closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (!menuOpen() || !menu || !menuButton) return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key !== 'Tab') return;
  const items = $$<HTMLElement>('a, button', menu);
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
});
wideNavQuery.addEventListener('change', event => { if (event.matches) setMenu(false); placeIndicator(); });

/* ---------- Hero video (muted, pausable, never on save-data or reduced motion) ---------- */
const video = $<HTMLVideoElement>('#hero-video');
const videoButton = $<HTMLButtonElement>('.video-toggle');
const videoLabel = $('[data-video-label]');
const videoStatus = $('#video-status');
const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
let userPaused = false;
let explicitlyStarted = false;
let videoFailed = false;
let playPending = false;
let pageLoaded = false;

if (videoButton) videoButton.hidden = false;
function updateVideoState(): void {
  const playing = Boolean(video && !video.paused);
  videoButton?.setAttribute('aria-pressed', String(playing));
  if (videoLabel) videoLabel.textContent = playing ? 'Video pausieren' : 'Video abspielen';
  videoButton?.querySelector('use')?.setAttribute('href', playing ? '#i-pause' : '#i-play');
}
function selectVideoSource(): void {
  if (!video) return;
  const source = mobileQuery.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
  if (!source || video.getAttribute('src') === source) return;
  video.pause();
  hero?.classList.remove('has-video');
  videoFailed = false;
  video.src = source;
}
async function playHero(explicit = false): Promise<void> {
  if (!video || playPending || videoFailed || document.hidden || !heroVisible) return;
  if (!explicit && (!pageLoaded || userPaused || reduced() || (connection?.saveData && !explicitlyStarted))) return;
  playPending = true;
  selectVideoSource();
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  try {
    await video.play();
    // A play that resolves late must not resume a video the visitor has left or paused.
    if (!heroVisible || document.hidden || userPaused) video.pause();
    if (explicit && videoStatus) videoStatus.textContent = 'Das Video läuft stumm. Du kannst es jederzeit pausieren.';
  } catch {
    updateVideoState();
    if (explicit && videoStatus) videoStatus.textContent = 'Das Video kann gerade nicht abgespielt werden. Bild und Inhalte bleiben verfügbar.';
  } finally {
    playPending = false;
  }
}
videoButton?.addEventListener('click', () => {
  if (!video) return;
  if (!video.paused) { userPaused = true; video.pause(); return; }
  userPaused = false;
  explicitlyStarted = true;
  videoFailed = false;
  if (video.error) video.load();
  void playHero(true);
});
video?.addEventListener('playing', () => { hero?.classList.add('has-video'); updateVideoState(); });
video?.addEventListener('pause', updateVideoState);
video?.addEventListener('error', () => {
  videoFailed = true;
  hero?.classList.remove('has-video');
  updateVideoState();
  if (videoStatus) videoStatus.textContent = 'Das Video ist gerade nicht verfügbar. Bild und Inhalte bleiben verfügbar.';
});
document.addEventListener('visibilitychange', () => { if (document.hidden) video?.pause(); else void playHero(); });
mobileQuery.addEventListener('change', () => {
  if (video?.getAttribute('src')) { selectVideoSource(); void playHero(); }
  clearLayers();
  updateSticky();
});
// Start the film only once the page itself has finished loading.
addEventListener('load', () => {
  pageLoaded = true;
  const start = (): void => { void playHero(); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 600);
}, { once: true });

/* ---------- Visibility observers ---------- */
if ('IntersectionObserver' in window) {
  if (hero) new IntersectionObserver(entries => {
    heroVisible = Boolean(entries[0]?.isIntersecting);
    if (heroVisible) void playHero(); else video?.pause();
  }, { threshold: 0 }).observe(hero);
  if (contact) new IntersectionObserver(entries => {
    contactVisible = Boolean(entries[0]?.isIntersecting);
    updateSticky();
  }, { threshold: 0 }).observe(contact);
  const program = $('.program');
  if (program) new IntersectionObserver(entries => {
    program.classList.toggle('is-active', Boolean(entries[0]?.isIntersecting));
  }).observe(program);
}

/* ---------- Sticky call to action (phones only) ---------- */
function updateSticky(): void {
  if (!sticky) return;
  const active = document.activeElement;
  const editing = active instanceof HTMLElement && active.matches('input, textarea, select');
  const show = mobileQuery.matches && heroCtaGone && !contactVisible && !menuOpen() && !editing;
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

/* ---------- Scroll reveals ---------- */
const reveals = $$('[data-reveal]');
$$('[data-stagger]').forEach(group => $$('[data-reveal]', group).forEach((element, index) => element.style.setProperty('--d', String(index * 90))));
if (!reduced() && 'IntersectionObserver' in window) {
  const revealer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  // Whatever is already on screen stays visible; only content below the fold animates in.
  reveals.forEach(element => {
    if (element.getBoundingClientRect().top < innerHeight * 0.9) element.classList.add('is-in');
    else revealer.observe(element);
  });
  root.classList.add('reveal-on');
}

/* ---------- Manifesto: words light up as the sentence is read ---------- */
const wordsHost = $('[data-words]');
let words: HTMLElement[] = [];
let litCount = -1;
if (wordsHost && !reduced()) {
  const walker = document.createTreeWalker(wordsHost, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const text of texts) {
    if (!text.textContent?.trim()) continue;
    const fragment = document.createDocumentFragment();
    for (const part of text.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { fragment.append(part); continue; }
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = part;
      fragment.append(span);
    }
    text.replaceWith(fragment);
  }
  words = $$('.w, .pill', wordsHost);
  root.classList.add('words-on');
}

/* ---------- Scroll-linked scenes ---------- */
type Layer = { host: HTMLElement; target: HTMLElement; speed: number; float: boolean; visible: boolean };
const layers: Layer[] = [
  ...$$('[data-parallax]').flatMap(host => {
    const target = host.querySelector<HTMLElement>(':scope > img, :scope > div > img');
    return target ? [{ host, target, speed: Number(host.dataset.parallax) || 0.06, float: false, visible: false }] : [];
  }),
  ...$$('[data-float]').map(host => ({ host, target: host, speed: Number(host.dataset.float) || -0.05, float: true, visible: false })),
];
if ('IntersectionObserver' in window) {
  const layerWatch = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const layer = layers.find(item => item.host === entry.target);
      if (layer) layer.visible = entry.isIntersecting;
    }
    requestFrame();
  }, { rootMargin: '15% 0px' });
  layers.forEach(layer => layerWatch.observe(layer.host));
}
function clearLayers(): void {
  layers.forEach(layer => layer.target.style.removeProperty('transform'));
}

const stackInners = $$('[data-stack]');
const stackOffers = stackInners.map(inner => inner.parentElement as HTMLElement);
let stickTops: number[] = [];
const cacheStickTops = (): void => { stickTops = stackOffers.map(offer => parseFloat(getComputedStyle(offer).top) || 0); };
cacheStickTops();

const band = $('[data-band]');
const seal = $('[data-seal]');
const unveil = $('[data-unveil]');
const steps = $('[data-steps]');

function updateHero(h: number): void {
  if (!hero) return;
  const box = hero.getBoundingClientRect();
  const gone = box.bottom < h * 0.35;
  if (gone !== heroCtaGone) { heroCtaGone = gone; updateSticky(); }
  if (reduced() || box.bottom <= 0) return;
  const progress = clamp(-box.top / box.height);
  if (heroMedia) heroMedia.style.transform = `translate3d(0, ${(progress * 16).toFixed(2)}%, 0) scale(${(1 + progress * 0.07).toFixed(4)})`;
  if (heroCopy) heroCopy.style.transform = `translate3d(0, ${(-progress * 90).toFixed(1)}px, 0)`;
}
function updateLayers(h: number): void {
  if (reduced() || mobileQuery.matches) return;
  // Read every box first, then write, so the browser lays out only once.
  const measured = layers.filter(layer => layer.visible).map(layer => ({ layer, box: (layer.float ? layer.host.parentElement ?? layer.host : layer.host).getBoundingClientRect() }));
  for (const { layer, box } of measured) {
    const offset = box.top + box.height / 2 - h / 2;
    const limit = layer.float ? 90 : box.height * 0.075;
    const y = clamp(-offset * layer.speed, -limit, limit);
    layer.target.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }
}
function updateStack(h: number): void {
  if (reduced() || !stackQuery.matches) return;
  const boxes = stackOffers.map(offer => offer.getBoundingClientRect());
  for (let index = 0; index < stackInners.length - 1; index++) {
    const nextTop = boxes[index + 1].top;
    const stick = stickTops[index + 1] ?? 0;
    const progress = clamp((h - nextTop) / Math.max(1, h - stick));
    const inner = stackInners[index];
    inner.style.transform = progress > 0 ? `scale(${(1 - progress * 0.06).toFixed(4)})` : '';
    inner.style.setProperty('--dim', (progress * 0.5).toFixed(3));
  }
}
function updateBand(h: number): void {
  if (!band || reduced()) return;
  const box = band.parentElement?.getBoundingClientRect();
  if (!box || box.bottom < -200 || box.top > h + 200) return;
  const half = band.scrollWidth / 2;
  const x = ((h - box.top) * 0.45) % half;
  band.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;
}
function updateSeal(h: number): void {
  if (!seal || reduced()) return;
  const box = seal.getBoundingClientRect();
  if (box.bottom < 0 || box.top > h) return;
  seal.style.setProperty('--r', `${((h - box.top) * 0.25).toFixed(1)}deg`);
}
function updateWords(h: number): void {
  if (!wordsHost || !words.length) return;
  const box = wordsHost.getBoundingClientRect();
  const progress = clamp((h * 0.88 - box.top) / (box.height + h * 0.3));
  const lit = Math.round(progress * words.length);
  if (lit === litCount) return;
  litCount = lit;
  words.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
}
function updateUnveil(h: number): void {
  if (!unveil || reduced()) return;
  const box = unveil.getBoundingClientRect();
  if (box.top > h || box.bottom < 0) return;
  unveil.style.setProperty('--u', clamp((h - box.top) / (h * 0.7)).toFixed(3));
}
function updateSteps(h: number): void {
  if (!steps || reduced()) return;
  const box = steps.getBoundingClientRect();
  steps.style.setProperty('--line-p', clamp((h * 0.8 - box.top) / (box.height * 0.85)).toFixed(3));
}

let ticking = false;
function frame(): void {
  ticking = false;
  const h = innerHeight;
  header?.classList.toggle('is-scrolled', scrollY > 40);
  updateHero(h);
  updateLayers(h);
  updateStack(h);
  updateBand(h);
  updateSeal(h);
  updateWords(h);
  updateUnveil(h);
  updateSteps(h);
}
function requestFrame(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(frame);
}
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => { cacheStickTops(); placeIndicator(); requestFrame(); updateSticky(); }, { passive: true });
void document.fonts?.ready.then(placeIndicator);

motionQuery.addEventListener('change', () => {
  if (!reduced()) { requestFrame(); return; }
  video?.pause();
  clearLayers();
  [heroMedia, heroCopy, band, ...stackInners].forEach(element => element?.style.removeProperty('transform'));
  stackInners.forEach(inner => inner.style.removeProperty('--dim'));
  unveil?.style.removeProperty('--u');
  seal?.style.removeProperty('--r');
  steps?.style.removeProperty('--line-p');
  root.classList.remove('words-on', 'reveal-on');
  reveals.forEach(element => element.classList.add('is-in'));
});

/* ---------- "Dein Tempo" carousel: buttons, progress, drag on desktop ---------- */
const track = $('[data-pace]');
const prevButton = $<HTMLButtonElement>('[data-pace-prev]');
const nextButton = $<HTMLButtonElement>('[data-pace-next]');
const paceBar = $('[data-pace-bar]');
if (track) {
  const step = (): number => {
    const slide = $('.pace-slide', track);
    return slide ? slide.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : 320;
  };
  const updatePace = (): void => {
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? track.scrollLeft / max : 1;
    paceBar?.style.setProperty('--p', (0.12 + progress * 0.88).toFixed(3));
    prevButton?.setAttribute('aria-disabled', String(progress <= 0.01));
    nextButton?.setAttribute('aria-disabled', String(progress >= 0.99));
  };
  const go = (direction: number): void => track.scrollBy({ left: direction * step(), behavior: reduced() ? 'auto' : 'smooth' });
  prevButton?.addEventListener('click', () => go(-1));
  nextButton?.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(updatePace), { passive: true });
  addEventListener('resize', updatePace, { passive: true });
  updatePace();

  let drag: { x: number; left: number; id: number } | null = null;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: track.scrollLeft, id: event.pointerId };
  });
  track.addEventListener('pointermove', event => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (!track.classList.contains('is-dragging') && Math.abs(distance) > 5) {
      track.classList.add('is-dragging');
      track.setPointerCapture(drag.id);
    }
    if (track.classList.contains('is-dragging')) track.scrollLeft = drag.left - distance;
  });
  const endDrag = (): void => {
    if (!drag) return;
    const moved = track.scrollLeft - drag.left;
    drag = null;
    if (!track.classList.contains('is-dragging')) return;
    track.classList.remove('is-dragging');
    // Settle on the nearest motif in the direction of travel.
    const width = step();
    const target = Math.round((track.scrollLeft + Math.sign(moved) * width * 0.25) / width) * width;
    track.scrollTo({ left: target, behavior: reduced() ? 'auto' : 'smooth' });
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('dragstart', event => event.preventDefault());
}

/* ---------- Request planner: builds a ready-to-send e-mail ---------- */
const planner = $<HTMLFormElement>('[data-planner]');
const sendLink = $<HTMLAnchorElement>('[data-planner-send]');
const preview = $('[data-planner-preview]');
const joinList = (items: string[]): string => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`;
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
planner?.addEventListener('input', buildRequest);
planner?.addEventListener('change', buildRequest);
planner?.addEventListener('submit', event => { event.preventDefault(); sendLink?.click(); });
buildRequest();

/* ---------- Glass highlight that follows a fine pointer ---------- */
if (finePointer.matches && !reduced()) {
  for (const element of $$('[data-sheen]')) {
    element.addEventListener('pointerenter', () => element.classList.add('is-lit'));
    element.addEventListener('pointerleave', () => element.classList.remove('is-lit'));
    element.addEventListener('pointermove', event => {
      const box = element.getBoundingClientRect();
      element.style.setProperty('--mx', `${(event.clientX - box.left).toFixed(0)}px`);
      element.style.setProperty('--my', `${(event.clientY - box.top).toFixed(0)}px`);
    }, { passive: true });
  }
}

const year = $('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
frame();
updateSticky();
