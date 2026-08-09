// Conectar｜AI活用 Web制作・LINE運用代行
// サイト共通スクリプト（マルチページ版）
(function () {
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const enhancedUX = motionOK && finePointer;

// header scroll state
const header = document.getElementById('siteHeader');
if (header) {
window.addEventListener('scroll', () => {
header.classList.toggle('scrolled', window.scrollY > 8);
});
}

// scroll progress bar
const progress = document.getElementById('scrollProgress');
function updateProgress() {
const el = document.documentElement;
const scrollable = el.scrollHeight - el.clientHeight;
const pct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0;
if (progress) progress.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// mobile nav
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (menuToggle && mobileNav) {
menuToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
}

// reveal on scroll — progressive enhancement.
// The page CSS keeps .reveal content VISIBLE by default. We only opt into the
// "start hidden, fade in on scroll" animation when JS is confirmed running and
// IntersectionObserver is available (by adding html.js-reveal). If anything here
// fails, the catch block guarantees content stays visible — the page is never blank.
try {
const revealEls = Array.from(document.querySelectorAll('.reveal'));
if (revealEls.length && 'IntersectionObserver' in window) {
const docEl = document.documentElement;
docEl.classList.add('js-reveal'); // from here, .reveal starts hidden (CSS)

// stagger by position within its own grid/row
const revealGroups = new Map();
revealEls.forEach(el => {
const group = el.parentElement;
if (!revealGroups.has(group)) revealGroups.set(group, []);
revealGroups.get(group).push(el);
});
revealGroups.forEach(list => {
list.forEach((el, i) => {
el.style.transitionDelay = (Math.min(i, 5) * 0.08) + 's';
});
});

const io = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('in');
io.unobserve(entry.target);
}
});
}, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
revealEls.forEach(el => io.observe(el));

// Fail-safe #1: on some mobile browsers the observer callback can be missed.
// A lightweight scroll/resize/load check reveals anything in view.
const revealFallback = () => {
const vh = window.innerHeight || document.documentElement.clientHeight;
for (let i = revealEls.length - 1; i >= 0; i--) {
const el = revealEls[i];
if (el.classList.contains('in')) continue;
const r = el.getBoundingClientRect();
if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add('in');
}
};
window.addEventListener('scroll', revealFallback, { passive: true });
window.addEventListener('resize', revealFallback, { passive: true });
window.addEventListener('load', revealFallback);
setTimeout(revealFallback, 250);

// Fail-safe #2: if scrolling never fires on some device, reveal everything
// after a few seconds so nothing can stay hidden.
setTimeout(() => {
revealEls.forEach(el => el.classList.add('in'));
}, 4000);
}
// else: no reveals or no IntersectionObserver — leave content visible (js-reveal not added).
} catch (err) {
// Any failure: make sure everything is visible.
document.documentElement.classList.remove('js-reveal');
document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

// accessibility: font-size toggle
const a11yButtons = document.querySelectorAll('.a11y-toggle button');
a11yButtons.forEach(btn => {
btn.addEventListener('click', () => {
document.documentElement.setAttribute('data-fontsize', btn.dataset.size === 'base' ? '' : btn.dataset.size);
a11yButtons.forEach(b => b.classList.toggle('active', b === btn));
setTimeout(() => window.dispatchEvent(new Event('resize')), 380);
});
});

// back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
window.addEventListener('scroll', () => {
backToTop.classList.toggle('show', window.scrollY > 640);
}, { passive: true });
backToTop.addEventListener('click', () => {
window.scrollTo({ top: 0, behavior: motionOK ? 'smooth' : 'auto' });
});
}

// hero: mouse-follow spotlight + gentle scroll parallax on aurora blobs
const heroEl = document.querySelector('.hero');
const heroSpotlight = document.getElementById('heroSpotlight');
const heroAurora = document.getElementById('heroAurora');
if (heroEl && heroSpotlight && enhancedUX) {
heroEl.addEventListener('mousemove', (e) => {
const r = heroEl.getBoundingClientRect();
heroSpotlight.style.setProperty('--sx', ((e.clientX - r.left) / r.width) * 100 + '%');
heroSpotlight.style.setProperty('--sy', ((e.clientY - r.top) / r.height) * 100 + '%');
heroSpotlight.classList.add('on');
});
heroEl.addEventListener('mouseleave', () => heroSpotlight.classList.remove('on'));
}
if (heroAurora && motionOK) {
window.addEventListener('scroll', () => {
const y = Math.min(window.scrollY, 900);
heroAurora.style.transform = `translateY(${y * 0.18}px)`;
}, { passive: true });
}

// hero background: real hand-typing video (assets/hero.mp4 / hero.webm)
(function heroVideoBackground() {
const video = document.getElementById('heroVideo');
if (!video || !heroEl) return;
if (!motionOK) {
// respect reduced-motion: keep the static poster frame, never autoplay
video.pause();
return;
}
const io = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
video.play().catch(() => {});
} else {
video.pause();
}
});
}, { threshold: 0 });
io.observe(heroEl);
document.addEventListener('visibilitychange', () => {
if (document.hidden) video.pause();
else if (heroEl.getBoundingClientRect().bottom > 0 && heroEl.getBoundingClientRect().top < window.innerHeight) {
video.play().catch(() => {});
}
});
})();

// hero title: reflect the same connecting-nodes animation inside the headline glyphs
(function heroTitleFillAnimation() {
const title = document.getElementById('heroTitle');
if (!title || !motionOK || !enhancedUX) return;
title.addEventListener('animationend', () => { measure(); paint(); });
const off = document.createElement('canvas');
const octx = off.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2);
let w = 0, h = 0, nodes = [], raf = null, running = false, visible = true, lastPaint = 0;
let lineEls = [];

function buildNodes() {
const area = w * h;
const count = Math.max(20, Math.min(60, Math.round(area / 2200)));
nodes = Array.from({ length: count }, () => ({
x: Math.random() * w, y: Math.random() * h,
vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
r: Math.random() * 1.4 + 0.9
}));
}

function measure() {
const r = title.getBoundingClientRect();
w = Math.max(1, Math.round(r.width));
h = Math.max(1, Math.round(r.height));
off.width = w * DPR; off.height = h * DPR;
octx.setTransform(DPR, 0, 0, DPR, 0, 0);
buildNodes();
}

function measureLineOffsets() {
const r = title.getBoundingClientRect();
lineEls = Array.from(title.querySelectorAll('.line > span')).map(span => {
const sr = span.getBoundingClientRect();
return { span, ox: Math.round(sr.left - r.left), oy: Math.round(sr.top - r.top) };
});
}

function paint() {
measureLineOffsets();
octx.clearRect(0, 0, w, h);
const g = octx.createLinearGradient(0, 0, w, h);
g.addColorStop(0, '#0A0A0A'); g.addColorStop(1, '#2E2A26');
octx.fillStyle = g; octx.fillRect(0, 0, w, h);

// slow diagonal light sweep so the motion reads clearly across the whole headline,
// not just wherever a node happens to sit
const t = performance.now() / 1000;
const sx = ((Math.sin(t * 0.22) * 0.5 + 0.5)) * w * 1.5 - w * 0.25;
const sheen = octx.createRadialGradient(sx, h * 0.45, 0, sx, h * 0.45, w * 0.4);
sheen.addColorStop(0, 'rgba(255,255,255,0.28)');
sheen.addColorStop(0.6, 'rgba(180,180,180,0.10)');
sheen.addColorStop(1, 'rgba(180,180,180,0)');
octx.fillStyle = sheen; octx.fillRect(0, 0, w, h);

const linkDist = Math.min(90, w * 0.16);
for (const n of nodes) {
n.x += n.vx; n.y += n.vy;
if (n.x < 0 || n.x > w) n.vx *= -1;
if (n.y < 0 || n.y > h) n.vy *= -1;
n.x = Math.max(0, Math.min(w, n.x));
n.y = Math.max(0, Math.min(h, n.y));
}
for (let i = 0; i < nodes.length; i++) {
for (let j = i + 1; j < nodes.length; j++) {
const a = nodes[i], b = nodes[j];
const dx = a.x - b.x, dy = a.y - b.y;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < linkDist) {
octx.strokeStyle = `rgba(200,200,200,${(1 - dist / linkDist) * 0.35})`;
octx.lineWidth = 1;
octx.beginPath(); octx.moveTo(a.x, a.y); octx.lineTo(b.x, b.y); octx.stroke();
}
}
}
for (const n of nodes) {
octx.beginPath(); octx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
octx.fillStyle = 'rgba(210,210,210,0.55)'; octx.fill();
}

const dataUrl = `url(${off.toDataURL('image/png')})`;
lineEls.forEach(({ span, ox, oy }) => {
span.style.backgroundImage = dataUrl;
span.style.backgroundSize = `${w}px ${h}px`;
span.style.backgroundPosition = `-${ox}px -${oy}px`;
if (!span.classList.contains('title-fill-line')) span.classList.add('title-fill-line');
});
}

function step(ts) {
if (!running) return;
if (ts - lastPaint > 90) { paint(); lastPaint = ts; }
raf = requestAnimationFrame(step);
}
function start() { if (!running) { running = true; raf = requestAnimationFrame(step); } }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

function init() {
// wait for the headline's slide-in entrance animation to finish so we don't
// measure line positions mid-transform
setTimeout(() => {
measure(); paint();
const io3 = new IntersectionObserver((entries) => {
entries.forEach(entry => {
visible = entry.isIntersecting;
if (visible && !document.hidden) start(); else stop();
});
}, { threshold: 0 });
io3.observe(title);
document.addEventListener('visibilitychange', () => {
if (document.hidden) stop(); else if (visible) start();
});
let resizeTimer2;
window.addEventListener('resize', () => {
clearTimeout(resizeTimer2);
resizeTimer2 = setTimeout(() => { measure(); paint(); }, 200);
});
}, 1300);
}

if (document.fonts && document.fonts.ready) {
document.fonts.ready.then(init).catch(init);
} else {
init();
}
})();

// count-up numbers in bento stats
function initCountUp() {
const els = document.querySelectorAll('.bento-num[data-target]');
const cio = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (!entry.isIntersecting) return;
const el = entry.target;
const target = parseFloat(el.dataset.target);
const suffix = el.dataset.suffix || '';
if (!motionOK) { el.textContent = target + suffix; cio.unobserve(el); return; }
const start = performance.now();
const dur = 900;
function tick(now) {
const p = Math.min((now - start) / dur, 1);
const eased = 1 - Math.pow(1 - p, 3);
el.textContent = Math.round(target * eased) + suffix;
if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
}
requestAnimationFrame(tick);
cio.unobserve(el);
});
}, { threshold: 0.6 });
els.forEach(el => cio.observe(el));
}
initCountUp();

// desktop-only enhancements: magnetic buttons, tilt cards
if (enhancedUX) {
// magnetic buttons
document.querySelectorAll('.btn').forEach(btn => {
btn.addEventListener('mousemove', (e) => {
const r = btn.getBoundingClientRect();
const x = e.clientX - r.left - r.width / 2;
const y = e.clientY - r.top - r.height / 2;
btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22 - 2}px)`;
});
btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// tilt + spotlight cards
document.querySelectorAll('.tilt-card').forEach(card => {
card.addEventListener('mousemove', (e) => {
const r = card.getBoundingClientRect();
const x = e.clientX - r.left, y = e.clientY - r.top;
card.style.setProperty('--mx', (x / r.width) * 100 + '%');
card.style.setProperty('--my', (y / r.height) * 100 + '%');
const rx = ((y / r.height) - 0.5) * -5;
const ry = ((x / r.width) - 0.5) * 5;
card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
});
card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
}
})();
