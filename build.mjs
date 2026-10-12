// Makes the RUVO website (ruvo.ac) from src/content.mjs, src/signup.mjs and src/site.css. No dependencies.
//   node build.mjs            → docs/     what GitHub Pages serves (Settings → Pages → branch main, folder /docs);
//                                         links between pages end in "/" (ruvo.ac/en/privacy/)
//   node build.mjs --preview  → preview/  the same pages for the private Claude preview: links end in "index.html",
//                                         and the Serbian home page has no skeleton of its own (the preview adds one).
//   --signup                  → registration and the Terms of Service too, before SITE.signup is switched on (in the
//                                         preview its forms only pretend to send)
// The demo (ruvo.ac/demo/, ruvo.ac/ru/demo/) is the app's own bundle, src/demo/app.js and app.css: made in the ruvo
// repository by `node build.mjs` in app/ (dist/demo/) and copied here.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, PHOTOS, PRICES, SITE, T } from './src/content.mjs';
import { SIGNUP as SG } from './src/signup.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW = process.argv.includes('--preview');
const OUT = path.join(ROOT, PREVIEW ? 'preview' : 'docs');
const ORIGIN = `https://${SITE.domain}`;
// registration on the site: on when SITE.signup is (the app works through the server), or asked for with --signup
const SIGNUP_ON = SITE.signup || process.argv.includes('--signup');
const PAGES = ['home', 'privacy', 'support', ...(SIGNUP_ON ? ['signup', 'confirm', 'terms'] : [])];
const LOCALE = { sr: 'sr-Latn-RS', en: 'en-GB', ru: 'ru-RU' };
const FONTS = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&amp;family=Unbounded:wght@700&amp;family=JetBrains+Mono:wght@600&amp;display=swap';
const CSS = readFileSync(path.join(ROOT, 'src/site.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\n\s*\n/g, '\n')
  .replace(/^\s+/gm, '')
  .trim();

// the enamel plate with an R, for the browser tab
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#1E44B0"/><rect x="3.25" y="3.25" width="25.5" height="25.5" rx="5" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M12 23.5V9h4.6a4.1 4.1 0 0 1 0 8.2H12m4.3 0 4.6 6.3" fill="none" stroke="#fff" stroke-width="2.7"/></svg>
`;
const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>';
const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z"/></svg>';
// line icons, 24 × 24, drawn in currentColor. ICONS are the app's own (app/src/ui/common.jsx), so the site and the
// screens speak one language; WHO_ICONS and WHY_ICONS are drawn for the site in the same stroke.
const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICONS = Object.fromEntries(Object.entries({
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  stop: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM6 6l12 12',
  split: 'M12 3v18M5 7h4M5 12h4M5 17h4M15 7h4M15 12h4M15 17h4',
  cash: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM6 10v4M18 10v4',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  tag: 'M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0zM8.2 7.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  rotate: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15',
  move: 'M5 12h14M15 8l4 4-4 4M9 8l-4 4 4 4',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4.5 20a7.5 7.5 0 0 1 15 0',
  bike: 'M5.5 13a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM18.5 13a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM5.5 16.5L9 9h5l4.5 7.5M14 9l-2-4H9M12 5h3',
  clock: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM12 7.5V12l3 2',
  info: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM12 11v5.5M12 7.5v.5',
  box: 'M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5L12 12l8.5-4.5M12 12v9',
  spark: 'M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9L11 17.5l-1.9-5.1L4 10.5l5.1-1.9zM18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  star: 'M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9-4.4-4.1 6-.8z',
  users: 'M9 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM3 19.5a6 6 0 0 1 12 0M16 5.3a3.4 3.4 0 0 1 0 6.4M18 13.6a6 6 0 0 1 3 5.9',
}).map(([k, d]) => [k, icon(`<path d="${d}"/>`)]));
const WHO_ICONS = {
  // a restaurant with a dining room: fork and knife
  restaurant: icon('<path d="M7 3v18M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3"/><path d="M17.5 21V3c-2 0-3.5 2.5-3.5 6v4.5h3.5"/>'),
  // a café and bar: a cup with steam
  cafe: icon('<path d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-4z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>'),
  // fast food: the self-order kiosk
  kiosk: icon('<rect x="6" y="2.5" width="12" height="15" rx="2"/><path d="M12 17.5V21M8.5 21h7M9 7h6M9 10.5h6M9 14h3"/>'),
  // a bakery and pastry shop: a loaf
  bakery: icon('<path d="M4 12a4 4 0 0 1 3.1-3.9A5 5 0 0 1 12 5.5a5 5 0 0 1 4.9 2.6A4 4 0 0 1 20 12v7H4z"/><path d="M9 12v3.5M12 11v4.5M15 12v3.5"/>'),
  // a hotel: a bed
  hotel: icon('<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><path d="M7 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>'),
  // catering and canteens: a cloche
  catering: icon('<path d="M3 18.5h18M5 18.5a7 7 0 0 1 14 0M12 8.5V6.5M10.5 6.5h3"/>'),
  // a delivery kitchen: the courier
  delivery: ICONS.bike,
  // a group of venues: two buildings
  group: icon('<path d="M3 21h18M5 21V9.5l4.5-3.5L14 9.5V21M14 21V6.5L17 4l3 2.5V21M8 13h3M8 17h3M16.5 10h1M16.5 13.5h1M16.5 17h1"/>'),
};
const WHY_ICONS = [
  // the fiscal register stays: a receipt
  icon('<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>'),
  // no lock-in: an open padlock
  icon('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2M12 15v2"/>'),
  // data in the EU: a shield with a tick
  icon('<path d="M12 3l7 2.8v5.4c0 4.4-3 8.2-7 9.8-4-1.6-7-5.4-7-9.8V5.8L12 3z"/><path d="m9 12 2.1 2.1L15.2 10"/>'),
  // made in a restaurant: a chef's hat
  icon('<path d="M7 16.5h10V21H7zM7 16.5c-2.4-.6-4-2.6-4-5a4 4 0 0 1 4.6-4A4.5 4.5 0 0 1 12 4.5a4.5 4.5 0 0 1 4.4 3A4 4 0 0 1 21 11.5c0 2.4-1.6 4.4-4 5"/>'),
];
// the demo: one page per language of the app (Serbian, Russian); English links to the Serbian one, where the app's
// own switch turns it into Russian
const DEMO = { sr: 'demo/index.html', en: 'demo/index.html', ru: 'ru/demo/index.html' };
const DEMO_LANG = { sr: 'sr', en: 'sr', ru: 'ru' };
const DEMO_JS = readFileSync(path.join(ROOT, 'src/demo/app.js'), 'utf8');
const DEMO_CSS = readFileSync(path.join(ROOT, 'src/demo/app.css'), 'utf8');
// a new bundle gets a new address, so no browser keeps running yesterday's
const DEMO_V = createHash('sha256').update(DEMO_JS).update(DEMO_CSS).digest('hex').slice(0, 10);
const APP_FONTS = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&amp;family=Onest:wght@400;500;600;700&amp;family=Unbounded:wght@600;700&amp;display=swap';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mail = `<a href="mailto:${SITE.email}">${SITE.email}</a>`;
// typesetting in running text: a number stays with its word ("30 dana", "10 минут"), a one-letter word with the
// next one ("i magacin", "в бэкофисе"), a number that ends the text with the word before it ("umesto 12."), and a
// hyphenated word on one line ("iPad-u", "back-office-a")
const keep = (html) => html.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part : part
  .replace(/(\d) (?=\p{L})/gu, '$1\u00A0')
  .replace(/ (?=[—–] )/g, '\u00A0')
  .replace(/(^|[\s(\u00A0])(\p{L}) /gu, '$1$2\u00A0')
  .replace(/ (\d+[.,;:!?]?)$/u, '\u00A0$1')
  .replace(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu, '<span class="nw">$&</span>'))).join('');
// plain text from content.mjs: escaped, with the address made a link
const txt = (s) => keep(esc(s)).split(SITE.email).join(mail);
// the company's details go where the texts say {company}, {pib}, {address}, {email}
const fill = (s) => keep(s)
  .replace(/\{company\}/g, esc(SITE.company))
  .replace(/\{pib\}/g, SITE.pib)
  .replace(/\{address\}/g, esc(SITE.address))
  .replace(/\{email\}/g, mail);

const fileOf = (lang, page) => T[lang].paths[page] || SG[lang].paths[page];
// a link from one page to another, relative, so the pages work anywhere they are served
function href(from, to, hash = '') {
  let r = path.posix.relative(path.posix.dirname(from), to);
  if (!PREVIEW) r = r.replace(/(^|\/)index\.html$/, '$1') || './';
  return r + hash;
}
const urlOf = (file) => `${ORIGIN}/${file.replace(/(^|\/)index\.html$/, '$1')}`;

function head(lang, page, file, title, description, { noindex = false } = {}) {
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlOf(fileOf(l, page))}">`);
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${esc(title)}</title>`,
    ...(noindex ? ['<meta name="robots" content="noindex">'] : []),
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${urlOf(file)}">`,
    ...alternates,
    `<link rel="alternate" hreflang="x-default" href="${urlOf(fileOf('sr', page))}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="RUVO">',
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${urlOf(file)}">`,
    `<meta property="og:locale" content="${T[lang].ui.og}">`,
    '<meta name="color-scheme" content="light dark">',
    '<meta name="theme-color" content="#E8EBE7" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0F1214" media="(prefers-color-scheme: dark)">',
    `<link rel="icon" href="${href(file, 'assets/favicon.svg')}" type="image/svg+xml">`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${FONTS}">`,
    `<style>\n${CSS}\n</style>`,
  ].join('\n');
}

function page(lang, key, file, title, description, body, opts = {}) {
  if (PREVIEW && file === 'index.html') {
    return `<title>${esc(T.ru.ui.preview)}</title>
<link rel="stylesheet" href="${FONTS}">
<style>
${CSS}
</style>
<div lang="${T[lang].ui.lang}">
${body}
</div>
`;
  }
  return `<!doctype html>
<html lang="${T[lang].ui.lang}">
<head>
${head(lang, key, file, title, description, opts)}
</head>
<body>
${body}
</body>
</html>
`;
}

function header(lang, key, file) {
  const t = T[lang];
  const home = fileOf(lang, 'home');
  const section = (id, label) => `<a href="${key === 'home' ? `#${id}` : href(file, home, `#${id}`)}">${esc(label)}</a>`;
  const langs = LANGS.map((l) => `<a href="${href(file, fileOf(l, key))}" hreflang="${l}" lang="${T[l].ui.lang}" title="${esc(T[l].name)}"${l === lang ? ' aria-current="page"' : ''}>${l.toUpperCase()}</a>`);
  return `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="top"><div class="wrap top-in">
<a class="wordmark" href="${href(file, home)}" aria-label="RUVO — ${esc(t.nav.home)}">RUVO</a>
<nav class="nav" aria-label="${esc(t.ui.menuLabel)}">${['features', 'examples', 'who', 'pricing', 'contact'].map((id) => section(id, t.nav[id])).join('')}</nav>
${SIGNUP_ON
    ? (key !== 'signup' && key !== 'confirm' ? `<a class="top-cta" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].nav.signup)}</a>` : '')
    : `<a class="top-cta" href="${href(file, DEMO[lang])}">${esc(t.home.demo.cta)}</a>`}
<nav class="langs" aria-label="${esc(t.ui.langLabel)}">${langs.join('')}</nav>
</div></header>`;
}

function footer(lang, key, file) {
  const t = T[lang];
  const home = fileOf(lang, 'home');
  const link = (p) => `<a href="${href(file, fileOf(lang, p))}"${p === key ? ' aria-current="page"' : ''}>${esc(t.nav[p] || SG[lang].nav[p])}</a>`;
  const section = (id) => `<a href="${key === 'home' ? `#${id}` : href(file, home, `#${id}`)}">${esc(t.nav[id])}</a>`;
  const col = (title, items) => `<div class="foot-col"><h2>${esc(title)}</h2><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`;
  return `<footer class="foot"><div class="wrap">
<div class="foot-in">
<div class="foot-co"><a class="wordmark sm" href="${href(file, home)}" aria-label="RUVO — ${esc(t.nav.home)}">RUVO</a><p>${esc(t.home.made)}</p></div>
<nav class="foot-cols" aria-label="${esc(t.ui.footLabel)}">
${col(t.ui.foot.product, [...['features', 'examples', 'who', 'pricing'].map(section), `<a href="${href(file, DEMO[lang])}">${esc(t.nav.demo)}</a>`])}
${col(t.ui.foot.docs, [link('privacy'), ...(SIGNUP_ON ? [link('terms')] : []), link('support')])}
${col(t.ui.foot.contact, [mail, esc(SITE.address)])}
</nav>
</div>
<p class="foot-base">${esc(SITE.company)} · ${esc(t.tax)} ${SITE.pib} · © ${SITE.updated.iso.slice(0, 4)}</p>
</div></footer>`;
}

// the order for table 12 on the iPad, and the kitchen's part of it on the kitchen screen
function scene(lang) {
  const k = T[lang].home.ticket;
  const num = (v) => new Intl.NumberFormat(LOCALE[lang]).format(v);
  const total = [...k.lines, ...k.later].reduce((sum, l) => sum + l[2], 0);
  const line = ([name, qty, price], cls = '') => `<div class="pl${cls}"><span class="pl-n">${esc(name)}</span><span class="pl-q">×${qty}</span><span class="pl-p">${num(price)}</span></div>`;
  return `<div class="scene" role="img" aria-label="${esc(k.label)}">
<div class="pad">
<div class="pad-head"><span class="pad-title">${esc(k.table)}</span><span class="pad-meta">${esc(k.meta)}</span></div>
<div class="pad-lines">${k.lines.map((l) => line(l)).join('')}<div class="course">${esc(k.course)}</div>${k.later.map((l) => line(l, ' later')).join('')}</div>
<div class="pad-total"><span>${esc(k.total)}</span><span>${num(total)}<small>RSD</small></span></div>
<div class="pad-btns"><span class="pad-btn go">${esc(k.send)}</span><span class="pad-btn bill">${esc(k.bill)}</span></div>
</div>
<div class="kds-t">
<div class="kds-head"><span class="kds-no">#17</span><span class="kds-tbl">${esc(k.table)}</span><span class="kds-time">04:12</span></div>
<div class="kds-station">${esc(k.kitchen)}</div>
<div class="kds-lines">${k.lines.slice(0, 2).map(([name, qty]) => `<div class="kl"><span class="kl-q">${qty}</span><span class="kl-n">${esc(name)}</span></div>`).join('')}</div>
<div class="kds-wait">${esc(k.waits)}</div>
</div>
</div>`;
}

// the hero's picture: the order and the kitchen ticket, over the photo of a real service once there is one
function heroArt(lang, file) {
  const ph = photo(lang, file, 'hero');
  return `<div class="hero-art${ph ? ' has-photo' : ''}">${ph}${scene(lang)}</div>`;
}

// ---------- «Kako izgleda u radu»: five screens of the app, drawn in em so each scales with its column ----------
const fmt = (lang, v, opts) => new Intl.NumberFormat(LOCALE[lang], opts).format(v);
const rsd = (lang, v) => `${fmt(lang, v)} RSD`;

// A QR-like picture for the guest's bill: the corner squares and timing rows of a QR code around a fixed pseudo-random
// field. It reads as a code and carries nothing — a real IPS QR is made with the restaurant's account by its bank.
function qrSvg(seed = 20261012) {
  const n = 25;
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rnd() < 0.48 ? 1 : 0;
  const finder = (ox, oy) => {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const X = ox + x;
        const Y = oy + y;
        if (X < 0 || Y < 0 || X >= n || Y >= n) continue;
        const inside = x >= 0 && y >= 0 && x <= 6 && y <= 6;
        const ring = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[Y][X] = inside && (ring || core) ? 1 : 0;
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  for (let i = 8; i < n - 8; i++) { m[6][i] = (i + 1) % 2; m[i][6] = (i + 1) % 2; }
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!m[y][x]) continue;
      let w = 1;
      while (x + w < n && m[y][x + w]) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w - 1;
    }
  }
  return `<svg class="qr-svg" viewBox="-2 -2 ${n + 4} ${n + 4}" aria-hidden="true" focusable="false"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#13171A"/></svg>`;
}

// the waiter's iPhone: table 7's order, course 2 held; next to it the guests' bill with the IPS QR, paid
function waiterScene(lang, x) {
  const o = x.order;
  const b = x.bill;
  const total = [...o.lines, ...o.later].reduce((sum, l) => sum + l[2], 0);
  const line = ([name, qty, price], cls = '') => `<div class="ph-line${cls}"><span class="ph-n">${esc(name)}</span><span class="ph-q">×${qty}</span><span class="ph-p">${fmt(lang, price)}</span></div>`;
  return `<div class="scn scn-waiter">
<div class="phone"><div class="phone-scr">
<div class="ph-top"><span class="ph-back">‹ ${esc(o.back)}</span><span class="ph-title">${esc(o.table)}</span><span class="ph-meta">${esc(o.meta)}</span></div>
<div class="ph-lines">${o.lines.map((l) => line(l)).join('')}<div class="ph-course">${esc(o.course)}</div>${o.later.map((l) => line(l, ' later')).join('')}</div>
<div class="ph-sum"><span>${esc(b.total)}</span><span>${rsd(lang, total)}</span></div>
<div class="ph-btns"><span class="ph-btn go">${esc(o.send)}</span><span class="ph-btn">${esc(o.bill)}</span></div>
</div></div>
<div class="phone"><div class="phone-scr bill">
<div class="ph-top"><span class="ph-title">${esc(b.title)}</span></div>
<div class="ph-bill"><span class="ph-meta">${esc(b.table)}</span><span class="ph-total">${fmt(lang, total)}<small>RSD</small></span>${qrSvg()}<span class="ph-cap">${esc(b.qr)}</span><span class="ph-paid">${esc(b.paid)}</span></div>
</div></div>
</div>`;
}

// the kitchen screen: three tickets — on time, getting long, late after the call
function kitchenScene(lang, x) {
  const k = x.kds;
  const ticket = (t) => `<div class="tk ${t.tone}"><div class="tk-head"><span class="tk-no">#${t.no}</span><span class="tk-src">${esc(t.src)}</span><span class="tk-time">${t.time}</span></div>
<div class="tk-lines">${t.lines.map(([qty, name]) => `<div class="tk-l"><span class="tk-q">${qty}</span><span class="tk-n">${esc(name)}</span></div>`).join('')}</div>${t.wait ? `<div class="tk-wait">${esc(k.wait)}</div>` : ''}${t.called ? `<div class="tk-called">${esc(k.called)}</div>` : ''}</div>`;
  return `<div class="scn scn-kds"><div class="kds-scr">
<div class="kds-bar"><span class="kds-seg"><span class="on">${esc(k.station)}</span><span>${esc(k.other)}</span></span><span class="kds-count">${esc(k.count)}</span></div>
<div class="kds-cols">${k.tickets.map(ticket).join('')}</div>
</div></div>`;
}

// the tech card of a dish: what a portion costs and its food cost, counted from its rows; and what runs low
function stockScene(lang, x) {
  const c = x.card;
  const cost = c.rows.reduce((sum, r) => sum + r[2], 0);
  const fc = Math.round((cost / c.price) * 100);
  return `<div class="scn scn-stock">
<div class="ui tc">
<div class="tc-head"><span class="ui-caps">${esc(c.crumb)}</span><span class="tc-dish">${esc(c.dish)}</span><span class="ui-meta">${esc(c.yield)}</span></div>
<div class="tc-table"><div class="tc-row th">${c.head.map((h) => `<span>${esc(h)}</span>`).join('')}</div>${c.rows.map(([name, qty, v]) => `<div class="tc-row"><span>${esc(name)}</span><span>${esc(qty)}</span><span>${fmt(lang, v)}</span></div>`).join('')}</div>
<div class="tc-sum"><div><span>${esc(c.cost)}</span><b>${rsd(lang, cost)}</b></div><div><span>${esc(c.menu)}</span><b>${rsd(lang, c.price)}</b></div><div class="tc-fc"><span>${esc(c.fc)}</span><b>${fc}%</b><i style="--v:${fc}%"></i></div></div>
</div>
<div class="ui low"><div class="low-head"><span class="low-i">!</span>${esc(c.low)}</div>${c.lowRows.map(([name, have, min]) => `<div class="low-row"><span class="low-n">${esc(name)}</span><span class="low-have">${esc(have)}</span><span class="low-min">${esc(c.min)} ${esc(min)}</span></div>`).join('')}</div>
</div>`;
}

const SPARK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';

// a question in plain words → the week by day against the week before, and «Objasni»; the total and the change counted here
function reportsScene(lang, x) {
  const r = x.report;
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const now = sum(r.now);
  const before = sum(r.before);
  const pct = fmt(lang, (now / before - 1) * 100, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  const total = r.total.replace('{n}', fmt(lang, now / 1e6, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const max = Math.max(...r.now, ...r.before);
  const h = (v) => `${((v / max) * 100).toFixed(1)}%`;
  return `<div class="scn scn-rep"><div class="ui rep">
<div class="ask">${SPARK}<span>${esc(r.ask)}</span></div>
<div class="rep-head"><div><span class="ui-caps">${esc(r.title)} · ${esc(r.period)}</span><span class="rep-total">${esc(total)}</span></div><span class="rep-delta">▲ ${esc(pct)}<small>${esc(r.cmp)}</small></span></div>
<div class="bars">${r.days.map((d, i) => `<div class="bar"><span class="bar-plot"><span class="bar-c" style="--h:${h(r.now[i])}"></span><span class="bar-p" style="--h:${h(r.before[i])}"></span></span><span class="bar-d">${esc(d)}</span></div>`).join('')}</div>
<div class="ans"><span class="ans-k">${SPARK}${esc(r.explain)}</span><p>${esc(r.answer.replace('{pct}', pct))}</p></div>
</div></div>`;
}

// an incoming e-invoice from SEF: the supplier's lines matched to our products, the answer due, one button to receive
function sefScene(lang, x) {
  const s = x.sef;
  return `<div class="scn scn-sef"><div class="ui sef">
<div class="sef-top"><span class="sef-inbox">${esc(s.inbox)}</span><span class="seg">${s.tabs.map((tab, i) => `<span${i ? '' : ' class="on"'}>${esc(tab)}</span>`).join('')}</span></div>
<div class="sef-inv"><div><span class="sef-sup">${esc(s.supplier)}</span><span class="ui-meta">${esc(s.meta)}</span></div><span class="sef-due">${esc(s.due)}</span></div>
<div class="sef-rows"><div class="sef-row th"><span>${esc(s.head[0])}</span><span></span><span>${esc(s.head[1])}</span></div>${s.rows.map(([item, qty, product, factor]) => `<div class="sef-row"><span class="sef-item">${esc(item)}<small>${esc(qty)}</small></span><span class="sef-arrow">→</span><span class="sef-prod">${esc(product)}<small>${esc(factor)} · ${esc(s.remembered)}</small></span></div>`).join('')}</div>
<div class="sef-btns"><span class="ui-btn go">${esc(s.accept)}</span><span class="ui-btn">${esc(s.reject)}</span></div>
</div></div>`;
}

// the front terminal's floor at dinner, as the demo shows it: tables by state around the bar; at the side the delivery
// that is coming, the dishes ready to serve and the shift
const PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>';
function floorScene(lang, x) {
  const f = x.floor;
  const table = (t) => {
    const st = t.st || (t.guests ? 'open' : 'free');
    const tag = st === 'ready' ? `<span class="tb-tag">${esc(f.readyTag)} ${f.ready}</span>` : st === 'bill' ? `<span class="tb-tag">${esc(f.billTag)}</span>` : '';
    const body = t.guests
      ? `<span class="tb-who">${PERSON}${t.guests} · ${t.mins}′</span>${t.sum ? `<span class="tb-sum">${fmt(lang, t.sum)}</span>` : ''}`
      : `<span class="tb-seats">${esc(f.seats[t.seats])}</span>`;
    return `<div class="tb ${t.shape} ${st}">${tag}<b>${t.n}</b>${body}</div>`;
  };
  return `<div class="scn scn-floor"><div class="ui fl">
<div class="fl-top"><span class="seg">${f.halls.map(([name, n], i) => `<span${i ? '' : ' class="on"'}>${esc(name)}<i>${n}</i></span>`).join('')}</span><span class="fl-legend">${f.legend.map((l, i) => `<span class="lg lg-${['free', 'open', 'ready', 'bill'][i]}">${esc(l)}</span>`).join('')}</span></div>
<div class="fl-body">
<div class="fl-plan">${f.tables.map(table).join('')}<div class="fl-bar"><span>${esc(f.bar)}</span></div></div>
<div class="fl-side">
<div class="fl-card"><div class="fl-ch">${esc(f.delivery)}<i>1</i></div><div class="fl-dl"><span class="pf wolt">Wolt</span><b>${esc(f.dl[0])}</b><small>${esc(f.dl[1])}</small></div></div>
<div class="fl-card"><div class="fl-ch">${esc(f.readyTitle)}<i>${f.ready}</i></div><div class="fl-ready"><b>5</b><span>${esc(f.readyText)}</span></div><span class="fl-served">${esc(f.served)}</span></div>
<div class="fl-card"><div class="fl-ch">${esc(f.shift)}</div><div class="fl-stats"><div><b>${f.open}</b><small>${esc(f.openLabel)}</small></div><div><b>${fmt(lang, f.revenue)}</b><small>${esc(f.revLabel)}</small></div></div></div>
</div>
</div>
</div></div>`;
}

// delivery on the front terminal: what is cooking, what waits for its courier, what has gone — carried over by hand from
// the platforms' tablets until the direct link (stage 2)
function deliveryScene(lang, x) {
  const d = x.delivery;
  const active = d.cols.reduce((n, [, cards]) => n + cards.filter((c) => !c.done).length, 0);
  const card = (c) => `<div class="dc${c.done ? ' done' : ''}${c.ready ? ' rdy' : ''}"><div class="dc-h"><span class="pf ${c.ch.toLowerCase()}">${esc(c.ch)}</span><b>${esc(c.code)}</b></div><div class="dc-items">${c.items.map((i) => `<span>${esc(i)}</span>`).join('')}</div><div class="dc-f"><span class="dc-st">${esc(c.state)}</span>${c.courier ? `<span class="dc-c">${esc(c.courier)}</span>` : ''}</div></div>`;
  return `<div class="scn scn-dl"><div class="ui dl">
<div class="dl-top"><span class="seg">${d.tabs.map((t, i) => `<span${i === 1 ? ' class="on"' : ''}>${esc(t)}${i === 1 ? `<i>${active}</i>` : ''}</span>`).join('')}</span><span class="ui-meta">${esc(d.manual)}</span></div>
<div class="dl-cols">${d.cols.map(([title, cards], i) => `<div class="dl-col${i === d.cols.length - 1 ? ' dl-done' : ''}"><div class="dl-h">${esc(title)}<i>${cards.length}</i></div>${cards.map(card).join('')}</div>`).join('')}</div>
</div></div>`;
}

// the guests' kiosk with the app's own pictures of the dishes (src/dishes/), two of them in the basket; beside it the
// number the guest says at the till
function kioskScene(lang, x, file) {
  const k = x.kiosk;
  const price = Object.fromEntries(k.dishes);
  const sum = k.basket.reduce((total, id) => total + price[id], 0);
  return `<div class="scn scn-kiosk">
<div class="kio"><div class="kio-scr">
<div class="kio-top"><span class="kio-brand">RUVO</span><span class="kio-place">${esc(k.place)}</span><span class="kio-lang">${k.langs.map((l, i) => `<span${(lang === 'ru' ? i === 1 : i === 0) ? ' class="on"' : ''}>${esc(l)}</span>`).join('')}</span></div>
<div class="kio-cats">${k.cats.map((c, i) => `<span${i === k.on ? ' class="on"' : ''}>${esc(c)}</span>`).join('')}</div>
<div class="kio-sec">${esc(k.section)}</div>
<div class="kio-grid">${k.dishes.map(([id, p]) => `<div class="kd${k.basket.includes(id) ? ' in' : ''}"><span class="kd-img"><img src="${href(file, `assets/dishes/${id}.svg`)}" alt="" loading="lazy" decoding="async"></span><span class="kd-n">${esc(k.names[id])}</span><span class="kd-p">${fmt(lang, p)}<small>RSD</small></span></div>`).join('')}</div>
<div class="kio-cart"><span class="kio-b"><b>${esc(k.basketTitle)}</b><small>${esc(k.items)} · ${rsd(lang, sum)}</small></span><span class="kio-go">${esc(k.checkout)}</span></div>
</div></div>
<div class="ui kio-no"><span class="ui-caps">${esc(k.yourNo)}</span><span class="kio-num">${k.no}</span><span class="kio-pay">${esc(k.payAt)}</span></div>
</div>`;
}

// the bill of table 4 with the guest's card: each dish gets the biggest discount — the level's on food, happy hours' on
// drinks — and the points are counted on what is paid, as the app counts them (actions.js: floor(paid × earn / 100))
function guestsScene(lang, x) {
  const g = x.guests;
  const part = (kind) => g.lines.filter((l) => l[3] === kind).reduce((total, l) => total + l[2], 0);
  const sub = part('food') + part('drink');
  const offFood = Math.round((part('food') * g.levelPct) / 100);
  const offDrink = Math.round((part('drink') * Math.max(g.levelPct, g.promoPct)) / 100);
  const due = sub - offFood - offDrink;
  const earned = Math.floor((due * g.earn) / 100);
  const initials = g.name.split(' ').map((w) => w[0]).join('');
  const line = ([name, qty, price]) => `<div class="gb-l"><span>${esc(name)}</span><span class="gb-q">×${qty}</span><span>${fmt(lang, price)}</span></div>`;
  return `<div class="scn scn-guest">
<div class="ui gb">
<div class="gb-head"><span class="gb-title">${esc(g.table)}</span><span class="ui-meta">${esc(g.meta)}</span></div>
<div class="gc"><span class="gc-av">${esc(initials)}</span><span class="gc-t"><b>${esc(g.name)}</b><small>${fmt(lang, g.points)} ${esc(g.ptsWord)}</small></span><span class="gc-lvl">${esc(g.level)} · −${g.levelPct}%</span></div>
<div class="gb-lines">${g.lines.map(line).join('')}</div>
<div class="gb-sums">
<div><span>${esc(g.subtotal)}</span><span>${fmt(lang, sub)}</span></div>
<div class="gb-d"><span>${esc(g.disc.food)}</span><span>−${fmt(lang, offFood)}</span></div>
<div class="gb-d"><span>${esc(g.disc.drink)}</span><span>−${fmt(lang, offDrink)}</span></div>
<div class="gb-due"><span>${esc(g.due)}</span><span>${rsd(lang, due)}</span></div>
<div class="gb-earn"><span>${esc(g.earnLabel)}</span><b>+${earned} ${esc(g.ptsWord)}</b></div>
</div>
<div class="gb-btns"><span class="ui-btn">${esc(g.payPoints)}</span><span class="ui-btn go">${esc(g.close)}</span></div>
</div>
<div class="ui gp"><span class="ui-caps">${esc(g.now)}</span><b>${esc(g.promo)}</b><span>${esc(g.promoText)}</span></div>
</div>`;
}

const SCENES = { floor: floorScene, waiter: waiterScene, kitchen: kitchenScene, delivery: deliveryScene, kiosk: kioskScene, guests: guestsScene, stock: stockScene, reports: reportsScene, sef: sefScene };
// the photo of each example in real life, where there is one to take (PHOTOS)
const EX_PHOTO = { floor: 'ex-floor', waiter: 'ex-waiter', kitchen: 'ex-kitchen', delivery: 'ex-delivery', kiosk: 'ex-kiosk', stock: 'ex-stock' };

// ---------- live photos: a place shows once its file is in src/photos/ (PHOTOS in content.mjs); the preview shows each
// empty one, numbered in the order of the page, with what to shoot — the live site never shows an empty frame ----------
const PHOTO_DIR = path.join(ROOT, 'src/photos');
const PHOTO_FILES = Object.fromEntries(Object.keys(PHOTOS).map((id) => [id,
  ['jpg', 'jpeg', 'webp', 'png'].map((e) => `${id}.${e}`).find((f) => existsSync(path.join(PHOTO_DIR, f))) || null]));
const PHOTO_NO = Object.fromEntries(Object.keys(PHOTOS).map((id, i) => [id, i + 1]));
const CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function photo(lang, file, id, caption = '') {
  const p = PHOTOS[id];
  const f = PHOTO_FILES[id];
  const style = ` style="--ratio: ${p.ratio}"`;
  if (f) return `<figure class="photo"${style}><img src="${href(file, `img/${f}`)}" alt="${esc(p.alt[lang])}" loading="lazy" decoding="async">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  if (!PREVIEW) return '';
  return `<figure class="photo slot"${style} aria-hidden="true"><span class="slot-in"><span class="slot-n">${CAMERA}Фото ${PHOTO_NO[id]}${caption ? ` · ${esc(caption)}` : ''}</span><span class="slot-t">${esc(p.shot)}</span><code>src/photos/${id}.jpg</code></span></figure>`;
}

// Without JavaScript the examples stand one under another; the script turns them into tabs (one shown, the rest
// kept in the same grid cell, so switching does not move the page)
function examples(lang, file) {
  const x = T[lang].home.examples;
  const d = T[lang].home.demo;
  return `<section class="band" id="examples" aria-labelledby="examples-h"><div class="wrap">
<div class="sec-head"><h2 id="examples-h">${esc(x.title)}</h2><p>${txt(x.lead)}</p></div>
<div class="ex" data-tabs>
<div class="ex-tabs" aria-label="${esc(x.tabsLabel)}" hidden>${x.items.map((it, i) => `<button type="button" id="ex-t-${it.id}" aria-controls="ex-p-${it.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${esc(it.tab)}</button>`).join('')}</div>
<div class="ex-panels">${x.items.map((it) => `
<div class="ex-panel" id="ex-p-${it.id}">
<div class="ex-shot" role="img" aria-label="${esc(it.label)}">${SCENES[it.id](lang, it, file)}</div>
<div class="ex-text"><h3>${txt(it.title)}</h3><p>${txt(it.text)}</p><ul>${it.points.map((p) => `<li>${txt(p)}</li>`).join('')}</ul>${EX_PHOTO[it.id] ? photo(lang, file, EX_PHOTO[it.id]) : ''}</div>
</div>`).join('')}
</div>
</div>
<div class="ex-demo"><p>${txt(d.note)}</p><a class="btn ghost" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(d.link)}</a></div>
</div></section>`;
}

// ---------- after Toast's home page: everything a venue needs, the small things of a shift, who RUVO is for, why ----------
// The four devices are drawn as the app draws them on its start screen (CSS glyphs); the rest of the cards get an icon.
const GLYPHS = { front: 'g-front', waiter: 'g-waiter', kds: 'g-kds', kiosk: 'g-kiosk' };
function suite(lang) {
  const x = T[lang].home.suite;
  const h = T[lang].home;
  const soon = h.integrations.length - 1;
  const art = (key) => (GLYPHS[key]
    ? `<span class="glyph ${GLYPHS[key]}"><span class="glyph-ui"></span></span>`
    : `<span class="suite-i">${ICONS[key]}</span>`);
  return `<section class="band raised" id="features" aria-labelledby="features-h"><div class="wrap">
<div class="sec-head"><h2 id="features-h">${esc(x.title)}</h2><p>${txt(x.lead)}</p></div>
<ul class="cards suite">${x.items.map(([key, title, text]) => `
<li class="card"><span class="suite-art" aria-hidden="true">${art(key)}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
<div class="integr"><h3 class="integr-title">${esc(h.integrationsTitle)}</h3><ul>${h.integrations.map((it, i) => `<li${i === soon ? ' class="soon"' : ''}>${esc(it)}</li>`).join('')}</ul></div>
</div></section>`;
}

function rush(lang) {
  const r = T[lang].home.rush;
  return `<section class="band raised" id="rush" aria-labelledby="rush-h"><div class="wrap">
<div class="sec-head"><h2 id="rush-h">${esc(r.title)}</h2><p>${txt(r.lead)}</p></div>
<ul class="rush">${r.items.map(([key, title, text]) => `
<li><span class="rush-i" aria-hidden="true">${ICONS[key]}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
</div></section>`;
}

function who(lang, file) {
  const w = T[lang].home.who;
  const shots = ['who-restaurant', 'who-cafe', 'who-hotel'].map((id, i) => photo(lang, file, id, w.photoCaps[i])).filter(Boolean);
  return `<section class="band" id="who" aria-labelledby="who-h"><div class="wrap">
<div class="sec-head"><h2 id="who-h">${esc(w.title)}</h2><p>${txt(w.lead)}</p></div>
${shots.length ? `<div class="who-photos" style="--n: ${shots.length}">${shots.join('')}</div>` : ''}
<ul class="cards who">${w.items.map(([key, title, text]) => `
<li class="card"><span class="who-i" aria-hidden="true">${WHO_ICONS[key]}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
</div></section>`;
}

function why(lang, file) {
  const w = T[lang].home.why;
  const d = T[lang].home.demo;
  return `<section class="band raised" id="why" aria-labelledby="why-h"><div class="wrap">
<div class="sec-head"><h2 id="why-h">${esc(w.title)}</h2></div>
${photo(lang, file, 'why-team')}
<ul class="why">${w.items.map(([title, text], i) => `
<li><span class="why-i" aria-hidden="true">${WHY_ICONS[i]}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
<div class="why-cta"><a class="btn" href="#pricing">${esc(w.cta)}</a><a class="btn ghost" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(d.cta)}</a></div>
</div></section>`;
}

// the closing section: the call to try RUVO with its two buttons — the demo (or registration, once it is on) and a
// letter —, then the address on the enamel plates
function contact(lang, file) {
  const t = T[lang];
  const h = t.home;
  const f = h.final;
  const house = SITE.address.match(/\s(\d+[a-z]?),/i)[1];
  const buttons = SIGNUP_ON
    ? `<a class="btn" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.cta)}</a><a class="btn ghost" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(h.demo.cta)}</a>`
    : `<a class="btn" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(h.demo.cta)}</a><a class="btn ghost" href="mailto:${SITE.email}">${MAIL_ICON}${esc(h.cta)}</a>`;
  return `<section class="band" id="contact" aria-labelledby="contact-h"><div class="wrap contact-in">
<div class="sec-head"><h2 id="contact-h">${txt(f.title)}</h2><p>${txt(f.text)}</p></div>
<div class="cta-row">${buttons}</div>
<div class="contact-card">
<div class="plates"><a class="plate" href="mailto:${SITE.email}">${SITE.email}</a><div class="house" aria-hidden="true"><span class="house-st">${t.ui.plate.map(esc).join('<br>')}</span><span class="house-no">${house}</span></div></div>
<p class="addr"><b>${esc(SITE.company)}</b><br>${esc(SITE.address)}<br><span class="contact-note">${esc(h.contactText)}</span></p>
</div>
</div></section>`;
}

// ---------- «Cene»: monthly and yearly, what a venue includes, every licence and module, example bills, a calculator ----------
const priceOf = (key) => {
  const [kind, id] = key.split(':');
  const v = kind === 'd' ? PRICES.device[id] : PRICES.modules[id];
  if (typeof v !== 'number') throw new Error('no price for ' + key);
  return v;
};

// What a setup costs a month — the same sum as the app's billOf: the venue with one front terminal and one kitchen
// screen, the terminals and kitchen screens beyond those, a licence for every waiter device and every kiosk, the modules
// on in each venue, Telegram once for the company. The example bills are counted with it here, and the calculator's
// script carries its source text, so the two never differ. → { lines: [[key, qty, sum]], month }
function billOf(D, s) {
  const n = s.venues || 1;
  const lines = [];
  const add = (key, qty, price) => { if (qty > 0) lines.push([key, qty, qty * price]); };
  add('venue', n, D.venue);
  add('ipad', n * Math.max(0, (s.ipad || 0) - D.included.ipad), D.device.ipad);
  add('kds', n * Math.max(0, (s.kds || 0) - D.included.kds), D.device.kds);
  add('iphone', n * (s.iphone || 0), D.device.iphone);
  add('kiosk', n * (s.kiosk || 0), D.device.kiosk);
  for (const m of ['ips', 'terminal', 'shifts']) if (s[m]) add(m, n, D.modules[m]);
  if (s.telegram) add('telegram', 1, D.modules.telegram);
  return { lines, month: lines.reduce((sum, l) => sum + l[2], 0) };
}

function pricing(lang, file) {
  const p = T[lang].home.pricing;
  const c = p.calc;
  const d = T[lang].home.demo;
  const num = (v) => fmt(lang, v);
  const yearOf = (v) => v * PRICES.yearMonths;
  // each plan ends with the same button, so the cards end on one line
  const cta = SIGNUP_ON
    ? `<a class="plan-cta" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.priceCta)}</a>`
    : `<a class="plan-cta" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(d.cta)}</a>`;
  // a plan says its price and nothing more (the owner, 13 October: «Сейчас очень много текста»)
  const plan = (k, amount) => {
    const x = p.plans[k];
    return `<article class="plan${k === 'year' ? ' enamel' : ''}" aria-labelledby="plan-${k}">
<h3 class="plan-label" id="plan-${k}">${esc(x.label)}${x.badge ? ` <span class="plan-badge">${esc(x.badge)}</span>` : ''}</h3>
<p class="plan-amount">${num(amount)}<small>RSD</small></p>
<p class="plan-unit">${esc(x.unit)} · ${esc(p.vat)}</p>${cta}
</article>`;
  };
  // a row of the price list: the name, for a licence the hardware in one word, both prices
  const group = ([title, items]) => `<tbody>
<tr class="pt-g"><th colspan="3" scope="colgroup">${esc(title)}</th></tr>${items.map(([key, name, hw]) => {
    const v = priceOf(key);
    const cells = v === 0 ? `<td colspan="2" class="pt-free">${esc(p.free)}</td>` : `<td>${num(v)}</td><td>${num(yearOf(v))}</td>`;
    return `
<tr><th scope="row"><span class="pt-n">${txt(name)}</span>${hw ? ` <span class="pt-hw">${esc(hw)}</span>` : ''}</th>${cells}</tr>`;
  }).join('')}
</tbody>`;
  // two tables of one look on the page's halves: the licences; the modules and what a company pays once
  const table = (gs) => `<table class="pt">
<thead><tr><th scope="col"><span class="vh">${esc(p.tableTitle)}</span></th><th scope="col">${esc(p.cols[0])}</th><th scope="col">${esc(p.cols[1])}</th></tr></thead>
${gs.map(group).join('\n')}
</table>`;
  // every block under the plans has the same head: its title, on the right a note or the calculator's examples
  const head = (title, right = '') => `<div class="p-head"><h3>${esc(title)}</h3>${right}</div>`;
  // the example setups (café, restaurant, a group) are the calculator's presets: one press fills it in
  const presets = `<div class="calc-presets" role="group" aria-label="${esc(p.presets)}"><span class="calc-presets-k">${esc(p.presets)}:</span>${p.bills.map(([name], i) => `<button type="button" class="chip" data-preset="${i}" aria-pressed="${i === 0}">${esc(name)}</button>`).join('')}</div>`;
  // a row of the calculator: the name (with «1 included» where a venue includes one) and − value +
  const stepper = (id, label, min, max, value, hint = '') => `<div class="stp"><label for="c-${id}">${esc(label)}${hint ? ` <small>${esc(hint)}</small>` : ''}</label><span class="stp-ctl"><button type="button" data-d="-1" aria-label="${esc(c.less)}: ${esc(label)}">−</button><input id="c-${id}" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${value}"><button type="button" data-d="1" aria-label="${esc(c.more)}: ${esc(label)}">+</button></span></div>`;
  const mod = (m) => `<label class="mod"><input type="checkbox" value="${m}"><span class="mod-box" aria-hidden="true"></span><span class="mod-n">${esc(c.mods[m])}${m === 'telegram' ? ` <small>${esc(c.perCompany)}</small>` : ''}</span><span class="mod-p">${num(PRICES.modules[m])}</span></label>`;
  // what the calculator counts with: the price list, the names of its lines and the presets; «<» never ends the script
  const data = JSON.stringify({ ...PRICES, locale: LOCALE[lang], lines: c.lines, presets: p.bills.map(([, s]) => s) }).replace(/</g, '\\u003c');
  const half = Math.ceil(p.faq.length / 2);
  return `<section class="band" id="pricing" aria-labelledby="pricing-h"><div class="wrap">
<div class="sec-head"><h2 id="pricing-h">${esc(p.title)}</h2><p>${txt(p.lead)}</p></div>
<div class="plans">
${plan('month', PRICES.venue)}
${plan('year', yearOf(PRICES.venue))}
<article class="plan incl" aria-labelledby="plan-incl">
<h3 class="plan-label" id="plan-incl">${esc(p.includesTitle)}</h3>
<ul class="incl-list">${p.includes.map((x) => `<li>${txt(x)}</li>`).join('')}</ul>
</article>
</div>
<div class="p-block ptab">${head(p.tableTitle, `<p>RSD, ${esc(p.vat)}</p>`)}
<div class="pt-cols">
${table(p.groups.slice(0, 1))}
${table(p.groups.slice(1))}
</div>
</div>
<div class="p-block calc" id="calc" hidden>${head(c.title, presets)}
<div class="calc-card"><div class="calc-grid">
<div class="calc-col calc-in">
<p class="calc-k">${esc(c.venuesTitle)}</p>
${stepper('venues', c.venues, 1, 50, 1)}
<p class="calc-k">${esc(c.perVenue)}</p>
${stepper('ipad', c.ipad, 1, 10, 1, c.included)}
${stepper('kds', c.kds, 0, 10, 1, c.included)}
${stepper('iphone', c.iphone, 0, 30, 0)}
${stepper('kiosk', c.kiosk, 0, 10, 0)}
</div>
<fieldset class="calc-col calc-mods"><legend class="calc-k">${esc(c.modsTitle)}</legend><div class="mod-list">${['ips', 'terminal', 'shifts', 'telegram'].map(mod).join('')}</div></fieldset>
<div class="calc-col calc-out">
<div class="calc-tots" aria-live="polite">
<div class="calc-tot"><p class="calc-k">${esc(c.month)}</p><p class="calc-total"><span data-o="month">${num(PRICES.venue)}</span><small>RSD</small></p></div>
<div class="calc-tot"><p class="calc-k">${esc(c.year)} <span class="plan-badge">${esc(c.yearNote)}</span></p><p class="calc-total"><span data-o="year">${num(yearOf(PRICES.venue))}</span><small>RSD</small></p></div>
</div>
<ul class="calc-lines" data-o="lines"></ul>
</div>
</div></div>
</div>
<div class="p-block pfaq">${head(p.faqTitle)}<div class="pfaq-cols">${[p.faq.slice(0, half), p.faq.slice(half)].map((col) => `<div class="pfaq-col">${col.map(([q, a]) => `
<details class="pfaq-item"><summary>${txt(q)}</summary><p>${txt(a)}</p></details>`).join('')}
</div>`).join('')}</div></div>
<script type="application/json" id="calc-data">${data}</script>
</div></section>`;
}

// The home page's script: the calculator (billOf above, the same sum as the app's) and the tabs of the examples.
// Without it the price list, the example bills and all the examples still show.
const HOME_JS = `(() => {
  const calc = document.getElementById('calc');
  if (calc) {
    const D = JSON.parse(document.getElementById('calc-data').textContent);
    const f = new Intl.NumberFormat(D.locale);
    const $ = (s) => calc.querySelector(s);
    const val = (id) => {
      const i = $('#c-' + id);
      let n = Math.round(Number(i.value));
      if (!Number.isFinite(n)) n = Number(i.min);
      return Math.min(Number(i.max), Math.max(Number(i.min), n));
    };
    const on = (m) => $('input[value="' + m + '"]').checked;
    ${billOf.toString().replace(/\n/g, '\n    ')}
    const update = () => {
      const s = { venues: val('venues'), ipad: val('ipad'), kds: val('kds'), iphone: val('iphone'), kiosk: val('kiosk') };
      for (const m of ['ips', 'terminal', 'shifts', 'telegram']) s[m] = on(m);
      const b = billOf(D, s);
      $('[data-o=month]').textContent = f.format(b.month);
      $('[data-o=year]').textContent = f.format(b.month * D.yearMonths);
      const ul = $('[data-o=lines]');
      ul.textContent = '';
      for (const [key, qty, sum] of b.lines) {
        const li = document.createElement('li');
        const a = document.createElement('span');
        const c = document.createElement('span');
        a.textContent = D.lines[key] + (qty > 1 ? ' \\u00D7 ' + qty : '');
        c.textContent = f.format(sum);
        li.append(a, c);
        ul.append(li);
      }
    };
    // the example setups: a press fills the calculator in; any change by hand lets the pressed one go
    const chips = [...calc.querySelectorAll('[data-preset]')];
    const press = (i) => chips.forEach((x, j) => x.setAttribute('aria-pressed', String(i === j)));
    const preset = (s) => {
      for (const k of ['venues', 'ipad', 'kds', 'iphone', 'kiosk']) $('#c-' + k).value = s[k] || (k === 'venues' || k === 'ipad' ? 1 : 0);
      for (const m of ['ips', 'terminal', 'shifts', 'telegram']) $('input[value="' + m + '"]').checked = !!s[m];
    };
    calc.addEventListener('input', () => { press(-1); update(); });
    calc.addEventListener('change', (e) => { if (e.target.type === 'number') e.target.value = val(e.target.id.slice(2)); update(); });
    calc.addEventListener('click', (e) => {
      const c = e.target.closest('[data-preset]');
      if (c) { const i = Number(c.dataset.preset); preset(D.presets[i]); press(i); update(); return; }
      const b = e.target.closest('button[data-d]');
      if (!b) return;
      const i = b.parentNode.querySelector('input');
      i.value = Math.min(Number(i.max), Math.max(Number(i.min), (Math.round(Number(i.value)) || 0) + Number(b.dataset.d)));
      press(-1);
      update();
    });
    calc.hidden = false;
    update();
  }
  const ex = document.querySelector('[data-tabs]');
  if (ex) {
    const list = ex.querySelector('.ex-tabs');
    const tabs = [...list.querySelectorAll('button')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    list.setAttribute('role', 'tablist');
    tabs.forEach((t, j) => {
      t.setAttribute('role', 'tab');
      panels[j].setAttribute('role', 'tabpanel');
      panels[j].setAttribute('aria-labelledby', t.id);
    });
    const show = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].classList.toggle('on', on);
        panels[j].inert = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i));
      t.addEventListener('keydown', (e) => {
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        show((to + tabs.length) % tabs.length, true);
      });
    });
    list.hidden = false;
    ex.classList.add('js');
    show(0);
  }
})();`;

function homePage(lang) {
  const t = T[lang];
  const h = t.home;
  const file = fileOf(lang, 'home');
  const body = `<div class="tiles" aria-hidden="true"></div>
${header(lang, 'home', file)}
<main id="main">
<section class="hero"><div class="wrap hero-in">
<div class="hero-text">
<p class="eyebrow">${esc(h.eyebrow)}</p>
<h1>${txt(h.h1)}</h1>
<p class="lead">${txt(h.lead)}</p>
<div class="cta-row">${SIGNUP_ON
    ? `<a class="btn" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.cta)}</a><a class="btn ghost" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(h.demo.cta)}</a>`
    : `<a class="btn" href="${href(file, DEMO[lang])}">${PLAY_ICON}${esc(h.demo.cta)}</a><a class="btn ghost" href="mailto:${SITE.email}">${MAIL_ICON}${esc(h.cta)}</a>`}</div>
</div>
${heroArt(lang, file)}
</div></section>
${suite(lang)}
${examples(lang, file)}
${rush(lang)}
${who(lang, file)}
${why(lang, file)}
${pricing(lang, file)}
<section class="band raised" id="start" aria-labelledby="start-h"><div class="wrap">
<div class="sec-head"><h2 id="start-h">${esc(h.startTitle)}</h2></div>
<ol class="steps">${(SIGNUP_ON ? SG[lang].home.start : h.start).map(([title, text], i) => `
<li class="step"><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ol>
<div class="equip"><div class="equip-h"><h3>${esc(h.equip.title)}</h3>${photo(lang, file, 'start-kit')}</div><ul>${h.equip.items.map((x) => `<li>${txt(x)}</li>`).join('')}</ul><p>${txt(h.equip.note)}</p></div>
</div></section>
${contact(lang, file)}
</main>
${footer(lang, 'home', file)}
<script>
${HOME_JS}
</script>`;
  return page(lang, 'home', file, h.title, h.description, body);
}

function privacyPage(lang) {
  const t = T[lang];
  const p = t.privacy;
  const file = fileOf(lang, 'privacy');
  // the policy's own markup (<b>, a link) is kept; a nested array is a list
  const block = (x) => (Array.isArray(x) ? `<ul>${x.map((li) => `<li>${fill(li)}</li>`).join('')}</ul>` : `<p>${fill(x)}</p>`);
  const body = `<div class="tiles short" aria-hidden="true"></div>
${header(lang, 'privacy', file)}
<main id="main" class="doc"><div class="wrap"><div class="doc-in">
<h1>${esc(p.title)}</h1>
<p class="upd">${esc(p.updatedLabel)}: <time datetime="${SITE.updated.iso}">${esc(SITE.updated[lang])}</time></p>
${p.sections.map(([title, items]) => `<section><h2>${esc(title)}</h2>${items.map(block).join('')}</section>`).join('\n')}
</div></div></main>
${footer(lang, 'privacy', file)}`;
  return page(lang, 'privacy', file, `${p.title} — RUVO`, p.description, body);
}

function supportPage(lang) {
  const t = T[lang];
  const s = t.support;
  const file = fileOf(lang, 'support');
  const co = [[t.ui.co.company, esc(SITE.company)], [t.ui.co.pib, SITE.pib], [t.ui.co.address, esc(SITE.address)], [t.ui.co.email, mail]];
  const body = `<div class="tiles short" aria-hidden="true"></div>
${header(lang, 'support', file)}
<main id="main" class="doc"><div class="wrap"><div class="doc-in">
<h1>${esc(s.title)}</h1>
<p class="doc-lead">${fill(esc(s.lead))}</p>
<section aria-labelledby="faq-h"><h2 id="faq-h">${esc(s.faqTitle)}</h2><div class="faq">${s.faq.map(([q, a]) => `
<div class="faq-item"><h3>${txt(q)}</h3><p>${fill(esc(a))}</p></div>`).join('')}
</div></section>
<section aria-labelledby="co-h"><h2 id="co-h">${esc(s.companyTitle)}</h2><dl class="co">${co.map(([dt, dd]) => `<dt>${esc(dt)}</dt><dd>${dd}</dd>`).join('')}</dl></section>
</div></div></main>
${footer(lang, 'support', file)}`;
  return page(lang, 'support', file, `${s.title} — RUVO`, s.description, body);
}

// ---------- registration: the form, the link's page with the PIN, the Terms (src/signup.mjs) ----------
// {mail} in a message becomes the address as a link, {email} the address the person typed — put in by the scripts
const textData = (id, data) => `<script type="application/json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function signupPage(lang) {
  const t = T[lang];
  const g = SG[lang].signup;
  const file = fileOf(lang, 'signup');
  const field = (name, { type = 'text', required = false, attrs = '' } = {}) => {
    const [label, hint] = g.fields[name];
    const ids = [hint ? `f-${name}-hint` : '', `f-${name}-err`].filter(Boolean).join(' ');
    return `<div class="fld"><label for="f-${name}">${esc(label)}${required ? '' : ` <span class="opt">${esc(g.optional)}</span>`}</label><input id="f-${name}" name="${name}" type="${type}"${required ? ' required' : ''} ${attrs} aria-describedby="${ids}">${hint ? `<p class="fld-hint" id="f-${name}-hint">${esc(hint)}</p>` : ''}<p class="fld-err" id="f-${name}-err" hidden></p></div>`;
  };
  const select = (name, options) => {
    const [label] = g.fields[name];
    return `<div class="fld"><label for="f-${name}">${esc(label)} <span class="opt">${esc(g.optional)}</span></label><select id="f-${name}" name="${name}"><option value="">${esc(g.choose)}</option>${options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></div>`;
  };
  const link = (page, label) => `<a href="${href(file, fileOf(lang, page))}">${esc(label)}</a>`;
  const accept = esc(g.accept).replace('{terms}', link('terms', g.termsLink)).replace('{privacy}', link('privacy', g.privacyLink));
  const body = `<div class="tiles short" aria-hidden="true"></div>
${header(lang, 'signup', file)}
<main id="main" class="doc"><div class="wrap"><div class="su">
<div class="su-main">
<h1>${esc(g.title)}</h1>
<p class="doc-lead">${txt(g.lead)}</p>
${PREVIEW ? `<p class="su-demo">${esc(g.demo)}</p>` : ''}
<form class="su-form" id="su" novalidate data-api="${esc(SITE.api)}" data-lang="${lang}"${PREVIEW ? ' data-demo="1"' : ''}>
${field('name', { required: true, attrs: 'autocomplete="name" maxlength="80"' })}
${field('email', { type: 'email', required: true, attrs: 'autocomplete="email" maxlength="120" spellcheck="false"' })}
${field('phone', { type: 'tel', attrs: 'autocomplete="tel" maxlength="30"' })}
${field('restaurant', { required: true, attrs: 'maxlength="60"' })}
<div class="fld-row">${field('company', { attrs: 'autocomplete="organization" maxlength="120"' })}${field('pib', { attrs: 'inputmode="numeric" maxlength="11" spellcheck="false"' })}</div>
<div class="fld-row">${select('venues', g.venues)}${select('pos', g.pos.map((x) => [x, x]))}</div>
<div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
<div class="fld"><label class="cb"><input type="checkbox" id="f-accept" name="accept" required aria-describedby="f-accept-err"><span>${accept}</span></label><p class="fld-err" id="f-accept-err" hidden></p></div>
<p class="su-msg" role="alert" hidden></p>
<button class="btn" type="submit">${esc(g.submit)}</button>
</form>
<div class="su-done" id="su-done" tabindex="-1" hidden><span class="su-done-i" aria-hidden="true">✓</span><h2>${esc(g.done.title)}</h2><p data-t="text"></p><p class="su-spam" data-t="spam"></p></div>
</div>
<aside class="su-side" aria-labelledby="su-side-h"><h2 id="su-side-h">${esc(g.sideTitle)}</h2><ol class="su-steps">${g.side.map(([title, text], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><div><h3>${txt(title)}</h3><p>${txt(text)}</p></div></li>`).join('')}</ol></aside>
</div></div></main>
${footer(lang, 'signup', file)}
${textData('su-text', { submit: g.submit, sending: g.sending, errors: g.errors, done: g.done, mail: SITE.email })}
<script>
${SIGNUP_JS}
</script>`;
  return page(lang, 'signup', file, `${g.title} — RUVO`, g.description, body);
}

function confirmPage(lang) {
  const t = T[lang];
  const g = SG[lang].confirm;
  const file = fileOf(lang, 'confirm');
  const pin = (id, label) => `<div class="fld"><label for="${id}">${esc(label)}</label><input id="${id}" class="pin-in" type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" pattern="[0-9]{4}" required></div>`;
  const body = `<div class="tiles short" aria-hidden="true"></div>
${header(lang, 'confirm', file)}
<main id="main" class="doc"><div class="wrap"><div class="doc-in cf">
<h1>${esc(g.title)}</h1>
<p class="doc-lead">${txt(g.lead)}</p>
${PREVIEW ? `<p class="su-demo">${esc(g.demo)}</p>` : ''}
<form class="cf-form" id="cf" novalidate data-api="${esc(SITE.api)}" data-lang="${lang}" data-locale="${LOCALE[lang]}"${PREVIEW ? ' data-demo="1"' : ''}>
<div class="fld-row">${pin('c-pin', g.pin)}${pin('c-pin2', g.pin2)}</div>
<p class="fld-hint">${esc(g.hint)}</p>
<p class="su-msg" role="alert" hidden></p>
<button class="btn" type="submit">${esc(g.submit)}</button>
</form>
<div class="cf-done" id="cf-done" tabindex="-1" hidden>
<h2>${esc(g.done.title)}</h2>
<p class="cf-k">${esc(g.done.code)}</p>
<p class="cf-code" data-t="code"></p>
<p class="cf-until" data-t="until"></p>
<ol class="cf-steps">${g.done.steps.map((x) => `<li>${txt(x)}</li>`).join('')}</ol>
<a class="btn" href="${esc(SITE.app)}" data-t="app">${esc(g.done.open)}</a>
<p class="cf-note" data-t="mailed"></p>
<p class="cf-note">${txt(g.done.trial)}</p>
</div>
</div></div></main>
${footer(lang, 'confirm', file)}
${textData('cf-text', { submit: g.submit, sending: g.sending, errors: g.errors, done: g.done, mail: SITE.email, signup: href(file, fileOf(lang, 'signup')) })}
<script>
${CONFIRM_JS}
</script>`;
  return page(lang, 'confirm', file, `${g.title} — RUVO`, g.description, body, { noindex: true });
}

function termsPage(lang) {
  const t = T[lang];
  const g = SG[lang].terms;
  const file = fileOf(lang, 'terms');
  const links = (x) => fill(x)
    .replace(/\{privacy\}/g, `<a href="${href(file, fileOf(lang, 'privacy'))}">${esc(t.nav.privacy)}</a>`)
    .replace(/\{pricing\}/g, `<a href="${href(file, fileOf(lang, 'home'), '#pricing')}">${esc(t.nav.pricing)}</a>`);
  const block = (x) => (Array.isArray(x) ? `<ul>${x.map((li) => `<li>${links(li)}</li>`).join('')}</ul>` : `<p>${links(x)}</p>`);
  const description = g.description.replace('{company}', SITE.company);
  const body = `<div class="tiles short" aria-hidden="true"></div>
${header(lang, 'terms', file)}
<main id="main" class="doc"><div class="wrap"><div class="doc-in">
<h1>${esc(g.title)}</h1>
<p class="upd">${esc(g.updatedLabel)}: <time datetime="${SITE.updated.iso}">${esc(SITE.updated[lang])}</time></p>
${g.sections.map(([title, items]) => `<section><h2>${esc(title)}</h2>${items.map(block).join('')}</section>`).join('\n')}
</div></div></main>
${footer(lang, 'terms', file)}`;
  return page(lang, 'terms', file, `${g.title} — RUVO`, description, body);
}

// The form: checked here first (the same rules as the server: a name, an address, a phone if any, the PIB's check digit,
// the consent), then sent to the server; its answer — or what went wrong — shown by the field or under the form.
const SIGNUP_JS = `(() => {
  const form = document.getElementById('su');
  if (!form) return;
  const T = JSON.parse(document.getElementById('su-text').textContent);
  const demo = form.dataset.demo === '1';
  const el = (n) => form.elements[n];
  const v = (n) => el(n).value.trim();
  const put = (node, text, email) => {
    node.textContent = '';
    text.split(/(\\{mail\\}|\\{email\\})/).forEach((part) => {
      if (part === '{mail}') { const a = document.createElement('a'); a.href = 'mailto:' + T.mail; a.textContent = T.mail; node.append(a); }
      else if (part === '{email}') { const b = document.createElement('b'); b.textContent = email || ''; node.append(b); }
      else node.append(part);
    });
  };
  const pibOk = (s) => {
    if (!/^\\d{9}$/.test(s)) return false;
    let p = 10;
    for (let i = 0; i < 8; i++) { let t = (Number(s[i]) + p) % 10; if (t === 0) t = 10; p = (2 * t) % 11; }
    return (11 - p) % 10 === Number(s[8]);
  };
  const showErr = (name, msg) => {
    const box = document.getElementById('f-' + name + '-err');
    if (!box) return;
    box.textContent = msg || '';
    box.hidden = !msg;
    el(name).setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const rules = {
    name: () => (v('name').length < 2 ? T.errors.required : ''),
    email: () => (!v('email') ? T.errors.required : /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v('email')) ? '' : T.errors.email),
    phone: () => (v('phone') && !/^\\+?[\\d\\s()\\/.-]{6,}$/.test(v('phone')) ? T.errors.phone : ''),
    restaurant: () => (!v('restaurant') ? T.errors.required : ''),
    pib: () => (v('pib') && !pibOk(v('pib').replace(/\\D+/g, '')) ? T.errors.pib : ''),
    accept: () => (el('accept').checked ? '' : T.errors.accept),
  };
  const msgBox = form.querySelector('.su-msg');
  const say = (text) => { if (text) put(msgBox, text); msgBox.hidden = !text; };
  form.addEventListener('input', (e) => { const n = e.target.name; if (rules[n] && e.target.getAttribute('aria-invalid') === 'true') showErr(n, rules[n]()); });
  form.addEventListener('change', (e) => { if (e.target.name === 'accept') showErr('accept', rules.accept()); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    say('');
    let first = null;
    for (const n of Object.keys(rules)) { const m = rules[n](); showErr(n, m); if (m && !first) first = n; }
    if (first) { el(first).focus(); return; }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = T.sending;
    const body = { lang: form.dataset.lang, name: v('name'), email: v('email'), phone: v('phone'), restaurant: v('restaurant'), company: v('company'), pib: v('pib').replace(/\\D+/g, ''), venues: el('venues').value || null, pos: el('pos').value, accept: true, website: el('website').value };
    try {
      let status = 202;
      let data = { ok: true };
      if (demo) await new Promise((r) => setTimeout(r, 600));
      else {
        const res = await fetch(form.dataset.api + '/v1/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        status = res.status;
        data = await res.json().catch(() => ({}));
      }
      if (status === 202) {
        const done = document.getElementById('su-done');
        put(done.querySelector('[data-t=text]'), T.done.text, body.email);
        put(done.querySelector('[data-t=spam]'), T.done.spam);
        form.hidden = true;
        done.hidden = false;
        done.focus();
        return;
      }
      if (status === 400 && data.issues) {
        const known = { email: T.errors.email, pib: T.errors.pib, phone: T.errors.phone, accept: T.errors.accept };
        let f = null;
        for (const i of data.issues) if (rules[i.path]) { showErr(i.path, known[i.path] || T.errors.required); f = f || i.path; }
        if (f) el(f).focus(); else say(T.errors.other);
      } else say(status === 429 ? T.errors.wait : status === 503 ? T.errors.off : status === 502 ? T.errors.mail : T.errors.other);
    } catch (err) {
      say(T.errors.net);
    } finally {
      btn.disabled = false;
      btn.textContent = T.submit;
    }
  });
})();`;

// The link's page: the token after «#» (it never reaches a server log), two PINs, the account — and the code, big.
const CONFIRM_JS = `(() => {
  const form = document.getElementById('cf');
  if (!form) return;
  const T = JSON.parse(document.getElementById('cf-text').textContent);
  const demo = form.dataset.demo === '1';
  const token = location.hash.slice(1);
  const msgBox = form.querySelector('.su-msg');
  const put = (node, text) => {
    node.textContent = '';
    text.split(/(\\{mail\\}|\\{signup\\})/).forEach((part) => {
      if (part === '{mail}') { const a = document.createElement('a'); a.href = 'mailto:' + T.mail; a.textContent = T.mail; node.append(a); }
      else if (part === '{signup}') { const a = document.createElement('a'); a.href = T.signup; a.textContent = T.errors.signupLink; node.append(a); }
      else node.append(part);
    });
  };
  const say = (text) => { if (text) put(msgBox, text); msgBox.hidden = !text; };
  const btn = form.querySelector('button[type=submit]');
  if (!demo && !/^[A-Za-z0-9_-]{43}$/.test(token)) { say(T.errors.noToken); btn.disabled = true; return; }
  const weak = (p) => { const d = [...p].map(Number); return d.every((x) => x === d[0]) || d.every((x, i) => !i || x === d[i - 1] + 1) || d.every((x, i) => !i || x === d[i - 1] - 1); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    say('');
    const a = document.getElementById('c-pin');
    const b = document.getElementById('c-pin2');
    const pin = a.value.trim();
    if (!/^\\d{4}$/.test(pin)) { say(T.errors.format); a.focus(); return; }
    if (b.value.trim() !== pin) { say(T.errors.mismatch); b.focus(); return; }
    if (weak(pin)) { say(T.errors.weak); a.focus(); return; }
    btn.disabled = true;
    btn.textContent = T.sending;
    try {
      let status = 201;
      let data = { code: { code: '482913', expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() }, appUrl: null, mailed: true };
      if (demo) await new Promise((r) => setTimeout(r, 600));
      else {
        const res = await fetch(form.dataset.api + '/v1/signup/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, pin }) });
        status = res.status;
        data = await res.json().catch(() => ({}));
      }
      if (status === 201) {
        history.replaceState(null, '', location.pathname + location.search);
        const done = document.getElementById('cf-done');
        const until = new Intl.DateTimeFormat(form.dataset.locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Belgrade' }).format(new Date(data.code.expiresAt));
        done.querySelector('[data-t=code]').textContent = data.code.code;
        done.querySelector('[data-t=until]').textContent = T.done.until.replace('{until}', until);
        if (data.appUrl) done.querySelector('[data-t=app]').href = data.appUrl;
        done.querySelector('[data-t=mailed]').textContent = data.mailed ? T.done.mailed : T.done.notMailed;
        for (const x of document.querySelectorAll('.cf > .doc-lead, .cf > .su-demo')) x.hidden = true;
        form.hidden = true;
        done.hidden = false;
        done.focus();
        return;
      }
      const err = data.error;
      say(err === 'pin_weak' ? T.errors.weak : err === 'signup_not_found' ? T.errors.notFound : err === 'signup_used' ? T.errors.used : err === 'signup_expired' ? T.errors.expired
        : err === 'email_taken' ? T.errors.taken : status === 429 ? T.errors.wait : status === 503 ? T.errors.off : T.errors.other);
    } catch (err) {
      say(T.errors.net);
    } finally {
      btn.disabled = false;
      btn.textContent = T.submit;
    }
  });
})();`;

// The demo: the app itself — the iPad, the waiter's iPhone, the kitchen screen and the kiosk of a demo restaurant —
// running in the visitor's browser: what they do stays there (open tabs share it). window.RUVO_DEMO tells the app it
// is the demo: in which language to open, and the way back to the site. Not for search engines.
function demoPage(lang) {
  const file = DEMO[lang];
  const d = T[lang].home.demo.page;
  const asset = (name) => `${href(file, `demo/${name}`)}?v=${DEMO_V}`;
  // the app's demo counts the demo company's month with the site's own prices (no RUVO console there)
  const config = JSON.stringify({ lang, site: href(file, fileOf(lang, 'home')), prices: PRICES }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="${T[lang].ui.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(d.title)}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${esc(d.description)}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${href(file, 'assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${APP_FONTS}">
<link rel="stylesheet" href="${asset('app.css')}">
</head>
<body>
<div id="app"><noscript><p style="padding:24px;font-family:system-ui,sans-serif">${esc(d.noscript)}</p></noscript></div>
<script>window.RUVO_DEMO = ${config};</script>
<script src="${asset('app.js')}"></script>
</body>
</html>
`;
}

// GitHub Pages serves this for any address that does not exist, at any depth: so its links start at the root
function notFoundPage() {
  const blocks = LANGS.map((l) => `<div lang="${T[l].ui.lang}"><p><b>${esc(T[l].notFound.title)}</b></p><p>${esc(T[l].notFound.text)}</p></div>`);
  const links = LANGS.map((l) => `<li><a href="/${fileOf(l, 'home').replace(/index\.html$/, '')}" hreflang="${l}" lang="${T[l].ui.lang}">${esc(T[l].nav.home)}</a></li>`);
  return `<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>404 — RUVO</title>
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${FONTS}">
<style>
${CSS}
</style>
</head>
<body>
<div class="tiles short" aria-hidden="true"></div>
<header class="top"><div class="wrap top-in"><a class="wordmark" href="/" aria-label="RUVO">RUVO</a></div></header>
<main id="main" class="wrap lost">
<h1>404</h1>
${blocks.join('\n')}
<ul>${links.join('')}</ul>
</main>
</body>
</html>
`;
}

function sitemap() {
  const urls = PAGES.filter((key) => key !== 'confirm').flatMap((key) => LANGS.map((lang) => `  <url>
    <loc>${urlOf(fileOf(lang, key))}</loc>
    <lastmod>${SITE.updated.iso}</lastmod>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlOf(fileOf(l, key))}"/>`).join('\n')}
  </url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

rmSync(OUT, { recursive: true, force: true });
const written = [];
const put = (rel, text) => {
  const f = path.join(OUT, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, text);
  written.push(rel);
};
for (const lang of LANGS) {
  put(fileOf(lang, 'home'), homePage(lang));
  put(fileOf(lang, 'privacy'), privacyPage(lang));
  put(fileOf(lang, 'support'), supportPage(lang));
  if (SIGNUP_ON) {
    put(fileOf(lang, 'signup'), signupPage(lang));
    put(fileOf(lang, 'confirm'), confirmPage(lang));
    put(fileOf(lang, 'terms'), termsPage(lang));
  }
}
put('assets/favicon.svg', FAVICON);
// the kiosk example's dishes: the app's own drawings (taken from its kiosk), one file each
for (const f of readdirSync(path.join(ROOT, 'src/dishes')).filter((x) => x.endsWith('.svg'))) put(`assets/dishes/${f}`, readFileSync(path.join(ROOT, 'src/dishes', f)));
for (const f of Object.values(PHOTO_FILES).filter(Boolean)) put(`img/${f}`, readFileSync(path.join(PHOTO_DIR, f)));
put(DEMO.sr, demoPage('sr'));
put(DEMO.ru, demoPage('ru'));
put('demo/app.js', DEMO_JS);
put('demo/app.css', DEMO_CSS);
if (!PREVIEW) {
  put('404.html', notFoundPage());
  put('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  put('sitemap.xml', sitemap());
  put('CNAME', `${SITE.domain}\n`);
  put('.nojekyll', '');
}
console.log(`${path.relative(ROOT, OUT)}/: ${written.length} files\n  ${written.join('\n  ')}`);
