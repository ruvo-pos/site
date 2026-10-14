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
import { APP, FORECAST_DAY, LANGS, MAINS, PHOTOS, PRICES, SITE, T } from './src/content.mjs';
import { SIGNUP as SG } from './src/signup.mjs';
import { VENUE_KEYS, VENUE_SETUP, VENUE_SLUGS, VENUES, VENUE_SOON } from './src/venues.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW = process.argv.includes('--preview');
// the empty places for photos, striped, with what to shoot — only on request (14 October the owner put photos aside:
// «Убери пока вообще фото с лендинга»), so the preview shows the site as it is
const SLOTS = PREVIEW && process.argv.includes('--slots');
const OUT = path.join(ROOT, PREVIEW ? 'preview' : 'docs');
const ORIGIN = `https://${SITE.domain}`;
// registration on the site: on when SITE.signup is (the app works through the server), or asked for with --signup
const SIGNUP_ON = SITE.signup || process.argv.includes('--signup');
// a kind of venue is a page of its own (src/venues.mjs): «v:cafe» → kafic/, en/cafe/, ru/cafe/ — but not those still to come
const VPAGES = VENUE_KEYS.filter((k) => !VENUE_SOON.includes(k)).map((k) => `v:${k}`);
const PAGES = ['home', ...VPAGES, 'privacy', 'support', ...(SIGNUP_ON ? ['signup', 'confirm', 'terms'] : [])];
const LOCALE = { sr: 'sr-Latn-RS', en: 'en-GB', ru: 'ru-RU' };
// The site's own text is set in the system's face — San Francisco on Apple's devices, after Apple's site (the owner,
// 14 October: «приблизить к визуалу сайта Apple») — and in Inter where there is no San Francisco (a browser downloads
// Inter only where it is used); the drawn screens of the app in the app's Onest; the wordmark and the enamel plates in
// Unbounded; the running timers in JetBrains Mono.
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&amp;family=Onest:wght@400;500;600;700&amp;family=Unbounded:wght@700&amp;family=JetBrains+Mono:wght@600&amp;display=swap';
// The screens of the app are drawn in the points of the device they are on (src/site.css): u(15) — fifteen points of
// the iPad's or the iPhone's screen, whatever size the device is drawn at (--u, set on each device from its width)
const CSS = readFileSync(path.join(ROOT, 'src/site.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\bu\((-?\d*\.?\d+)\)/g, 'calc(var(--u)*$1)')
  .replace(/\n\s*\n/g, '\n')
  .replace(/^\s+/gm, '')
  .trim();

// the enamel plate with an R, for the browser tab
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#1E44B0"/><rect x="3.25" y="3.25" width="25.5" height="25.5" rx="5" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M12 23.5V9h4.6a4.1 4.1 0 0 1 0 8.2H12m4.3 0 4.6 6.3" fill="none" stroke="#fff" stroke-width="2.7"/></svg>
`;
// Icons: line icons in the manner of Apple's SF Symbols (the owner, 14 October: «Нужны иконки, везде, где мы их
// используем, как в Apple»; SF Symbols themselves may not be used on a website) — Phosphor Regular (phosphoricons.com,
// MIT — src/icons/LICENSE-phosphor), the ones the site uses, copied into src/icons/. A page carries each icon it uses
// once, as a <symbol> (sprite() in page()), and draws it with <use>: IC('chef-hat'). They take the colour of the text.
const ICON_SVG = new Map();
const iconPath = (name) => {
  if (!ICON_SVG.has(name)) {
    const svg = readFileSync(path.join(ROOT, 'src/icons', `${name}.svg`), 'utf8');
    ICON_SVG.set(name, svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''));
  }
  return ICON_SVG.get(name);
};
const IC = (name, cls = '') => {
  iconPath(name);
  return `<svg class="i${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
};
const sprite = (html) => {
  const used = [...new Set([...html.matchAll(/href="#i-([a-z0-9-]+)"/g)].map((m) => m[1]))];
  return used.length ? `<svg class="sprite" aria-hidden="true" focusable="false"><defs>${used.map((n) => `<symbol id="i-${n}" viewBox="0 0 256 256" fill="currentColor">${iconPath(n)}</symbol>`).join('')}</defs></svg>` : '';
};
// the kinds of venue
const VICON = Object.fromEntries(VENUE_KEYS.map((k) => [k, IC(VENUE_SETUP[k].icon)]));
// what a venue needs, a line each (VENUE_SETUP.equip names them in the order of a venue's lines; the home page's here)
const EQUIP_ICON = { ipad: 'device-tablet', iphone: 'device-mobile', kds: 'device-tablet-camera', kiosk: 'hand-tap', tv: 'monitor', router: 'wifi-high', fiscal: 'cash-register', courier: 'moped', office: 'laptop' };
const HOME_EQUIP = ['ipad', 'iphone', 'kds', 'router', 'fiscal'];
// «Zašto RUVO», «U ceni objekta» and «Povezivanja», in the order of their lines in content.mjs
const WHY_ICON = ['cash-register', 'lock-simple-open', 'shield-check', 'chef-hat'];
const INCL_ICON = ['device-tablet', 'device-tablet-camera', 'package', 'sparkle', 'users'];
const INTEGR_ICON = ['qr-code', 'credit-card', 'file-text', 'paper-plane-tilt', 'arrows-left-right', 'moped'];
// a link that reads on: «Pogledajte cene ›»
const MORE = (label) => `${esc(label)}${IC('caret-right', 'lnk-i')}`;
// the demo: one page per language of the app (Serbian, Russian); English links to the Serbian one, where the app's
// own switch turns it into Russian
const DEMO = { sr: 'demo/index.html', en: 'demo/index.html', ru: 'ru/demo/index.html' };
const DEMO_LANG = { sr: 'sr', en: 'sr', ru: 'ru' };
const DEMO_JS = readFileSync(path.join(ROOT, 'src/demo/app.js'), 'utf8');
const DEMO_CSS = readFileSync(path.join(ROOT, 'src/demo/app.css'), 'utf8');
// a new bundle gets a new address, so no browser keeps running yesterday's
const DEMO_V = createHash('sha256').update(DEMO_JS).update(DEMO_CSS).digest('hex').slice(0, 10);
// the app's faces, and Inter for its start page, which is set as the site is (the system's face; Inter where there is no
// San Francisco)
const APP_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&amp;family=JetBrains+Mono:wght@600&amp;family=Onest:wght@400;500;600;700&amp;family=Unbounded:wght@600;700&amp;display=swap';

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

const LANG_DIR = { sr: '', en: 'en/', ru: 'ru/' };
const fileOf = (lang, page) => (page.startsWith('v:')
  ? `${LANG_DIR[lang]}${VENUE_SLUGS[lang][page.slice(2)]}/index.html`
  : T[lang].paths[page] || SG[lang].paths[page]);
// the pages made of the home page's sections: the home page and every kind of venue
const isLanding = (key) => key === 'home' || key.startsWith('v:');
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
    `<meta name="theme-color" content="${THEME_BG.light}" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="${THEME_BG.dark}" media="(prefers-color-scheme: dark)">`,
    `<link rel="icon" href="${href(file, 'assets/favicon.svg')}" type="image/svg+xml">`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${FONTS}">`,
    THEME_EARLY,
    `<style>\n${CSS}\n</style>`,
  ].join('\n');
}

// The theme (the owner, 14 October: «У меня сайт отображается в темной теме — можем сделать переключатель?»): the page
// follows the device's light or dark until the visitor chooses one with the switch; the choice is kept in this browser
// (localStorage) and set on <html> as data-theme before the page is drawn, so no page flashes in the other theme.
const THEME_KEY = 'ruvo-theme';
const THEME_BG = { light: '#FFFFFF', dark: '#000000' };
const THEME_EARLY = `<script>(() => { try { const t = localStorage.getItem('${THEME_KEY}'); if (t !== 'light' && t !== 'dark') return; document.documentElement.dataset.theme = t; for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.content = t === 'dark' ? '${THEME_BG.dark}' : '${THEME_BG.light}'; } catch (e) {} })();</script>`;
// the switch: a sun or a moon in the header (on a phone, with its words, at the foot of the page); without JavaScript it
// is not shown — the page then simply follows the device
function themeButton(lang, cls = '') {
  const th = T[lang].ui.theme;
  return `<button type="button" class="tt${cls ? ` ${cls}` : ''}" data-tt data-to-light="${esc(th.toLight)}" data-to-dark="${esc(th.toDark)}" data-light="${esc(th.light)}" data-dark="${esc(th.dark)}" aria-label="${esc(th.toDark)}" title="${esc(th.toDark)}" hidden><span class="tt-moon">${IC('moon')}</span><span class="tt-sun">${IC('sun')}</span>${cls ? `<span class="tt-l">${esc(th.dark)}</span>` : ''}</button>`;
}

// «Za koga ▾» closes when a click lands elsewhere — on the dimmed page under it too — or on Escape (without the script
// it still opens and closes by itself); the theme switch
const SITE_JS = `(() => {
  const vm = document.querySelector('[data-vm]');
  if (vm) {
    document.addEventListener('click', (e) => { if (vm.open && (!vm.contains(e.target) || e.target.closest('[data-vm-close]'))) vm.open = false; });
    // a section of this page chosen in it: the flyout goes, the page scrolls there
    vm.addEventListener('click', (e) => { if (e.target.closest('.vm-panel a[href^="#"]')) vm.open = false; });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !vm.open) return;
      vm.open = false;
      vm.querySelector('summary').focus();
    });
  }
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : media.matches);
  const buttons = [...document.querySelectorAll('[data-tt]')];
  // a button says what it will do: on a dark page — the light theme (a sun), on a light one — the dark (a moon)
  const sync = () => {
    const d = dark();
    for (const b of buttons) {
      const label = d ? b.dataset.toLight : b.dataset.toDark;
      b.dataset.mode = d ? 'dark' : 'light';
      b.setAttribute('aria-label', label);
      b.title = label;
      const words = b.querySelector('.tt-l');
      if (words) words.textContent = d ? b.dataset.light : b.dataset.dark;
    }
    for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.content = d ? '${THEME_BG.dark}' : '${THEME_BG.light}';
  };
  for (const b of buttons) {
    b.hidden = false;
    b.addEventListener('click', () => {
      const next = dark() ? 'light' : 'dark';
      const apply = () => {
        root.dataset.theme = next;
        try { localStorage.setItem('${THEME_KEY}', next); } catch (e) {}
        sync();
      };
      if (document.startViewTransition && !still.matches) document.startViewTransition(apply);
      else apply();
    });
  }
  media.addEventListener('change', sync);
  sync();
})();`;

function page(lang, key, file, title, description, body, opts = {}) {
  if (body.includes('data-vm') || body.includes('data-tt')) body += `\n<script>\n${SITE_JS}\n</script>`;
  body = `${sprite(body)}\n${body}`;
  if (PREVIEW && file === 'index.html') {
    return `<title>${esc(T.ru.ui.preview)}</title>
<link rel="stylesheet" href="${FONTS}">
${THEME_EARLY}
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

// «Za koga ▾» beside the wordmark (the owner, 14 October: the kinds of venue go up into the menu, «с выпадающим
// списком»): on a venue's page it names that venue with its icon; the list opens under it — every kind with a line of
// what RUVO does for it, the one shown marked, and at the foot the way back to the page about everything. A <details>,
// so it opens without JavaScript too.
// The flyout is Apple's (14 October, the Apple-like site): it drops from the bar across the whole width — every kind
// with its icon, its name large and a line of what RUVO does for it — and the page under it dims. Without the section
// links in the bar (narrower than 1000 px) they are at its foot.
function venueMenu(lang, key, file) {
  const t = T[lang];
  const V = VENUES[lang];
  const cur = key.startsWith('v:') ? key.slice(2) : null;
  const home = fileOf(lang, 'home');
  const items = VENUE_KEYS.map((k) => {
    const v = V.items[k];
    const inner = `<span class="vm-ic">${VICON[k]}</span><span class="vm-t"><b>${esc(v.name)}</b><small>${esc(v.line)}</small></span>`;
    // still to come: greyed, «Uskoro», no link
    if (VENUE_SOON.includes(k)) return `<li class="soon"><span class="vm-a" aria-disabled="true">${inner}<span class="vm-soon">${esc(V.menu.soon)}</span></span></li>`;
    return `<li><a class="vm-a" href="${href(file, fileOf(lang, `v:${k}`))}"${k === cur ? ' aria-current="page"' : ''}>${inner}</a></li>`;
  }).join('');
  const label = cur ? `${VICON[cur]}<span class="vm-l">${esc(V.items[cur].short)}</span>` : `<span class="vm-l">${esc(V.menu.label)}</span>`;
  const section = (id) => `<a href="${isLanding(key) ? `#${id}` : href(file, home, `#${id}`)}">${esc(t.nav[id])}</a>`;
  return `<details class="vm" data-vm>
<summary class="vm-btn" aria-label="${esc(V.menu.label)}${cur ? `: ${esc(V.items[cur].name)}` : ''}">${label}${IC('caret-down', 'vm-chev')}</summary>
<div class="vm-panel"><div class="wrap vm-in">
<p class="vm-k">${esc(V.menu.title)}</p>
<ul class="vm-list">${items}</ul>
<div class="vm-foot"><a class="vm-all" href="${href(file, home)}"${key === 'home' ? ' aria-current="page"' : ''}>${MORE(V.menu.all)}</a><nav class="vm-sec" aria-label="${esc(t.ui.menuLabel)}">${['features', 'pricing', 'contact'].map(section).join('')}</nav></div>
</div></div>
<div class="vm-scrim" data-vm-close></div>
</details>`;
}

// The bar (Apple's global navigation): thin, translucent, staying at the top; small words. The wordmark and «Za koga»
// on the left, the sections in the middle, the languages, the theme and the demo on the right.
function header(lang, key, file) {
  const t = T[lang];
  const home = fileOf(lang, 'home');
  // a venue's page has the sections too, so its links stay on it
  const section = (id, label) => `<a href="${isLanding(key) ? `#${id}` : href(file, home, `#${id}`)}">${esc(label)}</a>`;
  const langs = LANGS.map((l) => `<a href="${href(file, fileOf(l, key))}" hreflang="${l}" lang="${T[l].ui.lang}" title="${esc(T[l].name)}"${l === lang ? ' aria-current="page"' : ''}>${l.toUpperCase()}</a>`);
  const cta = SIGNUP_ON
    ? (key !== 'signup' && key !== 'confirm' ? `<a class="top-cta" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].nav.signup)}</a>` : '')
    : `<a class="top-cta" href="${href(file, DEMO[lang])}">${esc(t.home.demo.cta)}</a>`;
  return `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="top"><div class="wrap top-in">
<a class="wordmark" href="${href(file, home)}" aria-label="RUVO — ${esc(t.nav.home)}">RUVO</a>
${venueMenu(lang, key, file)}
<nav class="nav" aria-label="${esc(t.ui.menuLabel)}">${['features', 'pricing', 'contact'].map((id) => section(id, t.nav[id])).join('')}</nav>
<div class="top-end">
<nav class="langs" aria-label="${esc(t.ui.langLabel)}">${langs.join('')}</nav>
${themeButton(lang)}
${cta}
</div>
</div></header>`;
}

function footer(lang, key, file) {
  const t = T[lang];
  const home = fileOf(lang, 'home');
  const link = (p) => `<a href="${href(file, fileOf(lang, p))}"${p === key ? ' aria-current="page"' : ''}>${esc(t.nav[p] || SG[lang].nav[p])}</a>`;
  const section = (id) => `<a href="${isLanding(key) ? `#${id}` : href(file, home, `#${id}`)}">${esc(t.nav[id])}</a>`;
  const col = (title, items) => `<div class="foot-col"><h2>${esc(title)}</h2><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`;
  const V = VENUES[lang];
  const venue = (k) => (VENUE_SOON.includes(k)
    ? `<span class="foot-soon">${esc(V.items[k].name)} · ${esc(V.menu.soon.toLowerCase())}</span>`
    : `<a href="${href(file, fileOf(lang, `v:${k}`))}"${key === `v:${k}` ? ' aria-current="page"' : ''}>${esc(V.items[k].name)}</a>`);
  // Apple's foot: small grey words on the light grey, the columns, a hairline, the company
  return `<footer class="foot"><div class="wrap">
<div class="foot-in">
<div class="foot-co"><a class="wordmark sm" href="${href(file, home)}" aria-label="RUVO — ${esc(t.nav.home)}">RUVO</a><p>${esc(t.home.made)}</p></div>
<nav class="foot-cols" aria-label="${esc(t.ui.footLabel)}">
${col(t.ui.foot.product, [...['features', 'pricing'].map(section), `<a href="${href(file, DEMO[lang])}">${esc(t.nav.demo)}</a>`])}
${col(V.menu.label, VENUE_KEYS.map(venue))}
${col(t.ui.foot.docs, [link('privacy'), ...(SIGNUP_ON ? [link('terms')] : []), link('support')])}
${col(t.ui.foot.contact, [mail, esc(SITE.address)])}
</nav>
</div>
<div class="foot-base"><p>${esc(SITE.company)} · ${esc(t.tax)} ${SITE.pib} · © ${SITE.updated.iso.slice(0, 4)}</p>${themeButton(lang, 'tt-foot')}</div>
</div></footer>`;
}

// ---------- the devices (the owner, 14 October: «Все мобильные приложения — под размер iPhone Pro Max 18, всё, что на
// планшете — под размер iPad»): a tablet's screen on an iPad — the 11-inch iPad Pro, 1210×834 points, on its side, or
// upright for the kiosk —, a phone's on an iPhone 18 Pro Max, 440×956 points. Each screen is the app's own, drawn from
// its parts, in its words (APP in content.mjs) and its colours (--a-… in site.css: light or dark with the site, as the
// app follows its device's; the kitchen's always dark), to the screen's points (u() in site.css), so it scales with its
// device like a picture. ----------
const fmt = (lang, v, opts) => new Intl.NumberFormat(LOCALE[lang], opts).format(v);
const rsd = (lang, v) => `${money(v)} RSD`;
// money on the app's screens as the app writes it (app/src/domain.js, fmtMoney): whole dinars, the thousands apart by a
// no-break space — «2 580» in every language
const money = (v) => { const n = Math.round(v); return (n < 0 ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); };
const moneyRsd = (v) => `${money(v)} RSD`;

// a device: 'pad' (an iPad on its side), 'port' (an iPad upright), 'phone' (an iPhone); `label` says what it shows to
// those who do not see it — none where the picture around it says it
function dev(kind, inner, label = '') {
  const aria = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
  return `<div class="dv dv-${kind}"${aria}><div class="dv-f"><div class="scr">${inner}</div></div></div>`;
}
// the status bars: the iPad's — the time and the day, Wi-Fi, the battery; the iPhone's — around the Dynamic Island; the
// iPhone's home indicator
const BATTERY = '<span class="bat"><i></i></span>';
const sbPad = (lang) => `<div class="sb"><span class="sb-t">${APP[lang].time}<span>${esc(APP[lang].date)}</span></span><span class="sb-r">${IC('wifi-high')}${BATTERY}</span></div>`;
const sbPhone = (lang) => `<div class="sb sb-ph"><span class="sb-t">${APP[lang].time}</span><span class="di"></span><span class="sb-r">${IC('cell-signal-full')}${IC('wifi-high')}${BATTERY}</span></div>`;
const HOME_BAR = '<span class="hb"></span>';

// the front terminal's bar (ui/ipad.jsx): the wordmark and the venue; the floor, delivery and closed tables; the shift,
// the stop list, who is working
function frontBar(lang, { tab = 'hall', place = null } = {}) {
  const A = APP[lang];
  const tabs = [['hall', 'squares-four', A.bar.hall, 0], ['delivery', 'moped', A.bar.delivery, 1], ['checks', 'receipt', A.bar.checks, 0]];
  return `<div class="ab"><span class="ab-brand">RUVO</span><span class="ab-place">${esc(place || A.place)}</span>
<span class="seg ab-seg">${tabs.map(([id, icon, label, n]) => `<span${id === tab ? ' class="on"' : ''}>${IC(icon)}${esc(label)}${n ? `<i>${n}</i>` : ''}</span>`).join('')}</span>
<span class="ab-end"><span class="ab-btn">${IC('clock')}${esc(A.bar.shift)}<i class="ok">8</i></span><span class="ab-btn">${IC('prohibit')}${esc(A.bar.stop)}</span><span class="ab-user"><b>M</b>Marko${IC('lock-simple')}</span><span class="ab-ic">${IC('squares-four')}</span></span></div>`;
}

// the menu beside an open table: the categories, the open one's dishes — each with how many of it the order has; above
// them, what is on now (the guests' happy hours)
function menuCols(lang, g, counts = {}, promo = '') {
  return `<div class="os-cats"><span class="os-search">${IC('magnifying-glass')}${esc(APP[lang].search)}</span>${g.cats.map((c, i) => `<span class="os-cat${i === g.on ? ' on' : ''}">${esc(c)}</span>`).join('')}</div>
<div class="os-grid">${promo}${g.dishes.map(([name, price]) => `<div class="mc"><b>${esc(name)}</b><span>${money(price)}</span>${counts[name] ? `<i>${counts[name]}</i>` : ''}</div>`).join('')}</div>`;
}
// the order panel's head: back to the floor (or to delivery), the table and its guests, who opened it and when
function panelHead(lang, p) {
  const A = APP[lang];
  const badge = p.badge ? `<span class="pf ${p.badge.toLowerCase()}">${esc(p.badge)}</span>` : '';
  const guests = p.guests ? `<span class="op-guests">${IC('users')}<span class="gst">${IC('minus')}<b>${p.guests}</b>${IC('plus')}</span></span>` : '';
  return `<div class="op-head"><span class="op-back">${IC('caret-left')}${esc(p.tab === 'delivery' ? A.bar.delivery : A.order.back)}</span>
<div class="op-title"><b>${badge}${esc(p.title)}</b>${guests}</div>
<p class="op-meta">${esc(p.meta)}</p></div>`;
}

// The front terminal with a table open (ui/ipad.jsx): the menu, and the order — course 1 to send («Nova»), course 2 held
// until «Pozovi», «Pošalji na pripremu · 8». In the hero's loop the button is pressed: the lines say «Poslato» and the
// panel offers the bill and closing the table, which is also how the screen stands still. A counter's sale
// (`mode: 'pay'`, the bakery) has nothing to send: it is charged.
function orderScreen(lang, p) {
  const A = APP[lang];
  const O = A.order;
  const later = p.later || [];
  const all = [...p.lines, ...later];
  const total = all.reduce((sum, l) => sum + l[2], 0);
  const qty = all.reduce((sum, l) => sum + l[1], 0);
  const counts = Object.fromEntries(all.map(([name, q]) => [name, q]));
  const pay = p.mode === 'pay';
  const st = pay ? '' : `<span class="ol-st"><span class="st-new">${esc(O.draft)}</span><span class="st-sent">${esc(O.sent)}</span></span>`;
  const line = ([name, q, price]) => `<div class="ol"><span class="ol-q">${q}×</span><span class="ol-n">${esc(name)}</span><span class="ol-p">${money(price)}</span>${st}</div>`;
  const course = (n, held) => `<div class="op-course"><span>${esc(O.course)} ${n}${held ? ` · ${esc(O.waits)}` : ''}</span>${held ? `<span class="op-fire">${IC('bell')}${esc(O.fire)}</span>` : ''}</div>`;
  const lines = later.length ? `${course(1)}${p.lines.map(line).join('')}${course(2, true)}${later.map(line).join('')}` : p.lines.map(line).join('');
  const payBtns = (go) => `<span class="op-pay"><span class="pb">${IC('receipt')}${esc(O.prebill)}</span><span class="pb go">${IC('check')}${esc(go)}</span></span>`;
  const acts = pay ? payBtns(p.send) : `<span class="op-send">${IC('chef-hat')}${esc(O.sendTo)} · ${qty}</span>${payBtns(O.pay)}`;
  return `<div class="os">
${menuCols(lang, p.grid || MAINS[lang], counts)}
<div class="op${pay ? ' op--pay' : ''}">
${panelHead(lang, p)}
<div class="op-lines">${lines}</div>
<div class="op-foot"><div class="op-total"><span>${esc(O.total)}</span><b>${money(total)}<small>RSD</small></b></div><div class="op-acts">${acts}</div><div class="op-more">${O.more.map((m, i) => `<span>${IC(['star', 'tag', 'arrows-left-right'][i])}${esc(m)}</span>`).join('')}</div></div>
</div>
</div>`;
}

// The hero's kitchen ticket, as the kitchen screen shows it (ui/kds.jsx): the table and its time, the dishes — each
// ticked when done —, what waits, the number and the station, «Gotovo»
function ticketCard(lang, k) {
  const A = APP[lang];
  return `<div class="kt">
<div class="kt-head"><b>${esc(k.src)}</b><span class="kt-time">${esc(k.time)}</span></div>
<div class="kt-lines">${k.lines.map(([q, name]) => `<div class="kl"><span class="kl-q">${q}</span><span class="kl-n">${esc(name)}</span><span class="kl-ok">${IC('check')}</span></div>`).join('')}</div>
${k.waits ? `<p class="kt-wait">${esc(k.waits)}</p>` : ''}${k.note ? `<p class="kt-wait note">${esc(k.note)}</p>` : ''}
<div class="kt-foot"><span>${esc(A.kds.no)}${esc(String(k.no).replace(/^#/, ''))} · ${esc(k.station)}</span><span class="kt-bump">${IC('check')}${esc(k.done || A.kds.bump)}</span></div>
</div>`;
}
// a bakery's: tomorrow's forecast, what to prepare by the recipes — under a blue rule instead of the kitchen's green
function planCard(q) {
  return `<div class="kt fcast">
<div class="kt-head"><b>${esc(q.title)}</b><span class="kt-when">${esc(q.when)}</span></div>
<p class="kt-station">${esc(q.station)}</p>
<div class="kp-rows">${q.rows.map(([name, v]) => `<div class="kp"><span>${esc(name)}</span><b>${esc(v)}</b></div>`).join('')}</div>
<p class="kp-note">${esc(q.note)}</p>
</div>`;
}
// the card under it: rows of a name and a value (numbers in the page's way, summed into the note's {sum})
function chipCard(lang, c, icon) {
  const sum = c.rows.reduce((total, r) => total + (typeof r[1] === 'number' ? r[1] : 0), 0);
  return `<div class="nc"><p class="nc-h">${IC(icon)}<span>${esc(c.title)}</span></p>${c.rows.map(([name, v, tone]) => `<div class="nc-r"><span>${esc(name)}</span><b${tone ? ` class="${tone}"` : ''}>${esc(typeof v === 'number' ? money(v) : v)}</b></div>`).join('')}<p class="nc-note">${esc(c.note.replace('{sum}', money(sum)))}</p></div>`;
}
const CHIP_ICON = { home: 'package', restaurant: 'package', cafe: 'package', fastfood: 'monitor', bakery: 'package', hotel: 'chart-bar', catering: 'package', delivery: 'moped', group: 'chart-bar' };

// The first screen. On the home page: the order for table 12 on the front terminal's iPad, the kitchen's part of it on
// the kitchen screen, under it what the recipes take from the stock (written off when the bill is paid). A kind of venue
// draws its own (src/venues.mjs): the bar's coffee, the kiosk upright and the pickup screen, tomorrow's forecast, the
// hotel's or the group's day. With the page in sight it plays as a loop (14 October, «Первый экран оставить нарисованным,
// но оживить»): «Pošalji na pripremu» → «Poslato» → the ticket → its dishes done → «Gotovo» → the card under it.
// Without motion (or without JavaScript) it stands still, whole.
function ticket12(lang) {
  const k = T[lang].home.ticket;
  return {
    label: k.label,
    pad: { title: k.table, guests: k.guests, meta: k.meta, lines: k.lines, later: k.later, grid: k.grid },
    ticket: { no: k.no, src: k.table, time: k.time, station: k.kitchen, lines: k.lines.slice(0, 2).map(([name, q]) => [q, name]), waits: k.waits },
    chip: { title: k.stock.title, rows: k.stock.rows, note: k.stock.note },
  };
}
function sceneOf(lang, key) {
  if (key === 'home') return ticket12(lang);
  const s = VENUES[lang].items[key.slice(2)].scene;
  return s.ticket12 ? { ...ticket12(lang), ...(s.label ? { label: s.label } : {}), ...(s.chip ? { chip: s.chip } : {}) } : s;
}
// The home page's (and the restaurant's) first screen goes on through an evening (the owner, 14 October, 15:53: «как
// будто там кипит работа»): four acts of eight seconds on the same iPad — table 12 to the kitchen (as before); the floor,
// table 5 ready and served from the waiter's iPhone; delivery, a new Wolt order to its courier; table 12 paid by IPS QR,
// its stock written off and the day's sales up — and a notice every four seconds over the corner of the iPad (LIVE in
// content.mjs). At rest (less motion, no JavaScript, out of sight) it is the first act, whole, as before.
function heroLive(lang, file, s) {
  const L = T[lang].home.live;
  const ex = (id) => T[lang].home.examples.items.find((it) => it.id === id);
  const total = [...s.pad.lines, ...(s.pad.later || [])].reduce((sum, l) => sum + l[2], 0);
  const f = ex('floor').floor;
  const shift = (sales, open, extra) => chipCard(lang, { title: L.shift.title, rows: [[L.shift.open, String(open)], [L.shift.sales, sales, extra ? 'ok' : '']], note: extra ? `+${money(total)} RSD · ${L.written.split(' · ')[1]}` : L.shift.staff }, 'clock');
  const ready = `<div class="nc rd"><p class="nc-h">${IC('device-mobile')}<span>${esc(L.ready.who)}</span><em>${esc(L.now)}</em></p><p class="rd-t">${IC('bell')}${esc(L.ready.title)}</p>${L.ready.lines.map(([q, n]) => `<div class="nc-r"><span>${q}× ${esc(n)}</span><b class="rd-ok">${IC('check')}</b></div>`).join('')}<span class="rd-b">${IC('check')}${esc(L.ready.done)}</span></div>`;
  const stock = s.chip;
  const written = chipCard(lang, { title: stock.title, rows: stock.rows.map(([n, v]) => [n, v]), note: L.written }, 'package').replace('<p class="nc-note">', `<p class="nc-note ok">${IC('check')}`);
  const pay = `<div class="hl-pay"><div class="pay-sh"><p class="pay-t">${esc(L.pay.title)}</p><p class="pay-sum">${money(total)}<small>RSD</small></p><span class="seg pay-seg">${L.pay.methods.map((m, i) => `<span${i === L.pay.methods.length - 1 ? ' class="on"' : ''}>${esc(m)}</span>`).join('')}</span><div class="pay-qr">${qrSvg(20261014)}<span class="pay-ok">${IC('check')}${esc(L.pay.paid)}</span></div><p class="pay-cap">${esc(L.pay.scan)}</p></div></div>`;
  const screen = dev('pad', `${sbPad(lang)}${frontBar(lang, { tab: s.pad.tab, place: s.pad.place })}${orderScreen(lang, s.pad)}<div class="hl hl-2">${floorScreen(lang, ex('floor'))}</div><div class="hl hl-3">${deliveryScreen(lang, ex('delivery'))}</div>${pay}`);
  const events = `<div class="evs">${L.events.map(([icon, title, text]) => `<div class="ev"><span class="ev-ic">${IC(icon)}</span><span class="ev-t"><b>${esc(title)}</b><small>${esc(text.replace('{sum}', money(total)))}</small></span><span class="ev-now">${esc(L.now)}</span></div>`).join('')}</div>`;
  return `<div class="stage multi" role="img" aria-label="${esc(L.label)}" data-live>
<div class="stage-dev">${screen}${events}</div>
<div class="stage-side">
<div class="sg sg-1">${ticketCard(lang, s.ticket)}${chipCard(lang, s.chip, CHIP_ICON.home)}</div>
<div class="sg sg-2">${ready}${shift(f.revenue, f.open)}</div>
<div class="sg sg-3">${ticketCard(lang, { ...L.wolt, station: s.ticket.station })}${chipCard(lang, L.courier, 'moped')}</div>
<div class="sg sg-4">${written}${shift(f.revenue + total, f.open - 1, true)}</div>
</div>
</div>`;
}
function heroArt(lang, file, key) {
  const s = sceneOf(lang, key);
  if (!s.kiosk && !s.plan && (key === 'home' || VENUES[lang].items[key.slice(2)].scene.ticket12)) return heroLive(lang, file, s);
  const screen = s.kiosk
    ? dev('port', kioskScreen(lang, s.kiosk, file, false))
    : dev('pad', `${sbPad(lang)}${frontBar(lang, { tab: s.pad.tab, place: s.pad.place })}${orderScreen(lang, s.pad)}`);
  return `<div class="stage${s.kiosk ? ' stage--port' : ''}" role="img" aria-label="${esc(s.label)}" data-live>
<div class="stage-dev">${screen}</div>
<div class="stage-side">${s.plan ? planCard(s.plan) : ticketCard(lang, s.ticket)}${chipCard(lang, s.chip, CHIP_ICON[key === 'home' ? 'home' : key.slice(2)])}</div>
</div>`;
}

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

// ---------- «Sve što objektu treba»: a screen of the app for each tab, on its device ----------

// the waiter's iPhone (ui/iphone.jsx): table 7's order — course 1 sent, course 2 held until «Pozovi» —, and the guests'
// bill with the IPS QR on the second iPhone, paid
function phoneOrder(lang, x) {
  const A = APP[lang];
  const o = x.order;
  const total = [...o.lines, ...o.later].reduce((sum, l) => sum + l[2], 0);
  const line = ([name, q, price], later = false) => `<div class="pl${later ? ' later' : ''}"><span class="pl-q">${q}×</span><span class="pl-n">${esc(name)}</span><span class="pl-p">${money(price)}</span>${later ? '' : `<span class="pl-st">${esc(A.order.sent)}</span>`}</div>`;
  return `${sbPhone(lang)}<div class="ph">
<div class="ph-head"><span class="ph-back">${IC('caret-left')}</span><span class="ph-t"><b>${esc(o.table)}</b><small>${esc(o.meta)}</small></span><span class="ph-ic">${IC('star')}${IC('tag')}</span></div>
<div class="ph-body">${o.lines.map((l) => line(l)).join('')}<div class="ph-course"><span>${esc(o.course)}</span><span class="ph-fire">${IC('bell')}${esc(A.order.fire)}</span></div>${o.later.map((l) => line(l, true)).join('')}
<div class="ph-total"><span>${esc(x.bill.total)}</span><b>${money(total)}<small>RSD</small></b></div></div>
<div class="ph-acts"><span class="pb">${IC('receipt')}${esc(o.bill)}</span><span class="pb go">${IC('plus')}${esc(A.phone.add)}</span></div>
${HOME_BAR}</div>`;
}
function phoneBill(lang, x) {
  const o = x.order;
  const b = x.bill;
  const total = [...o.lines, ...o.later].reduce((sum, l) => sum + l[2], 0);
  return `${sbPhone(lang)}<div class="ph ph--bill">
<div class="ph-head c"><span class="ph-t"><b>${esc(b.title)}</b><small>${esc(b.table)}</small></span></div>
<div class="ph-bill"><span class="ph-sum">${money(total)}<small>RSD</small></span>${qrSvg()}<span class="ph-cap">${esc(b.qr)}</span><span class="ph-paid">${IC('check')}${esc(b.paid)}</span></div>
${HOME_BAR}</div>`;
}

// the front terminal's floor at dinner, as the demo shows it: tables by state around the bar; at the side the delivery
// that is coming, the dishes ready to serve and the shift
function floorScreen(lang, x) {
  const f = x.floor;
  const table = (t) => {
    const st = t.st || (t.guests ? 'open' : 'free');
    const tag = st === 'ready' ? `<span class="tb-tag">${esc(f.readyTag)} ${f.ready}</span>` : st === 'bill' ? `<span class="tb-tag">${esc(f.billTag)}</span>` : '';
    const body = t.guests
      ? `<span class="tb-who">${IC('user')}${t.guests} · ${t.mins}′</span>${t.sum ? `<span class="tb-sum">${money(t.sum)}</span>` : ''}`
      : `<span class="tb-seats">${esc(f.seats[t.seats])}</span>`;
    return `<div class="tb ${t.shape} ${st}">${tag}<b>${t.n}</b>${body}</div>`;
  };
  return `${sbPad(lang)}${frontBar(lang)}<div class="fl">
<div class="fl-main">
<div class="fl-top"><span class="seg">${f.halls.map(([name, n], i) => `<span${i ? '' : ' class="on"'}>${esc(name)}<i>${n}</i></span>`).join('')}</span><span class="fl-legend">${f.legend.map((l, i) => `<span class="lg lg-${['free', 'open', 'ready', 'bill'][i]}">${esc(l)}</span>`).join('')}</span></div>
<div class="fl-plan">${f.tables.map(table).join('')}<div class="fl-bar"><span>${esc(f.bar)}</span></div></div>
</div>
<div class="fl-side">
<div class="fc"><p class="fc-h">${IC('moped')}${esc(f.delivery)}<i>1</i></p><div class="fl-dl"><span class="pf wolt">Wolt</span><b>${esc(f.dl[0])}</b><small>${esc(f.dl[1])}</small></div></div>
<div class="fc"><p class="fc-h">${IC('bell')}${esc(f.readyTitle)}<i>${f.ready}</i></p><div class="fl-ready"><b>5</b><span>${esc(f.readyText)}</span></div><span class="fl-served">${IC('check')}${esc(f.served)}</span></div>
<div class="fc"><p class="fc-h">${IC('clock')}${esc(f.shift)}</p><div class="fl-stats"><div><b>${f.open}</b><small>${esc(f.openLabel)}</small></div><div><b>${money(f.revenue)}</b><small>${esc(f.revLabel)}</small></div></div></div>
</div>
</div>`;
}

// the kitchen screen (ui/kds.jsx), dark: the stations, what is in work summed by dish, the tickets — on time, getting
// long, late after the call —, what was done a moment ago
function kitchenScreen(lang, x) {
  const A = APP[lang];
  const k = x.kds;
  const n = k.tickets.length;
  const sum = new Map();
  for (const t of k.tickets) for (const [q, name] of t.lines) sum.set(name, (sum.get(name) || 0) + q);
  const ticket = (t) => `<div class="tk ${t.tone}"><div class="tk-head"><b>${esc(t.src)}</b><span class="tk-time">${t.time}</span></div>
<div class="tk-lines">${t.lines.map(([q, name]) => `<div class="tk-l"><span class="tk-q">${q}</span><span class="tk-n">${esc(name)}</span>${IC('fire')}</div>`).join('')}</div>${t.wait ? `<p class="tk-wait">${esc(k.wait)}</p>` : ''}${t.called ? `<p class="tk-called">${IC('bell')}${esc(k.called)}</p>` : ''}
<div class="tk-foot"><span>${esc(A.kds.no)}${t.no} · ${esc(k.station)}</span><span class="tk-bump">${IC('check')}${esc(A.kds.bump)}</span></div></div>`;
  return `<div class="kds">${sbPad(lang)}<div class="ab"><span class="ab-brand">RUVO</span><span class="ab-place">${esc(A.place)}</span>
<span class="seg ab-seg"><span>${esc(A.kds.all)}<i>${n + k.bar}</i></span><span class="on">${esc(k.station)}<i>${n}</i></span><span>${esc(k.other)}<i>${k.bar}</i></span></span>
<span class="ab-end"><span class="ab-btn">${IC('prohibit')}${esc(A.bar.stop)}</span><span class="ab-btn on">${IC('list-bullets')}${esc(A.kds.overview)}</span><span class="ab-btn">${IC('speaker-high')}${esc(A.kds.sound)}</span><span class="ab-clock">${A.time}</span></span></div>
<div class="kb">
<div class="kb-sum"><p class="kb-k">${esc(A.kds.inWork)}</p><p class="kb-q">${esc(A.kds.queue.replace('{n}', n).replace('{m}', k.queueMin))}</p><ul>${[...sum].sort((a, b) => b[1] - a[1]).map(([name, q]) => `<li><b>${q}</b><span>${esc(name)}</span></li>`).join('')}</ul></div>
<div class="kb-tk">${k.tickets.map(ticket).join('')}</div>
<div class="kb-done"><p class="kb-k">${esc(A.kds.recent)}</p><p class="kb-norm"><b>${k.norm[0]}%</b>${esc(A.kds.norm.replace('{p}%', '').replace('{m}', k.norm[1]))}</p>${k.recent.map(([src, what]) => `<div class="kr"><span><b>${esc(src)}</b><small>${esc(what)}</small></span><span class="kr-b">${esc(A.kds.recall)}</span></div>`).join('')}</div>
</div></div>`;
}

// delivery on the front terminal: what is cooking, what waits for its courier, what has gone — carried over by hand from
// the platforms' tablets until the direct link (stage 2)
function deliveryScreen(lang, x) {
  const d = x.delivery;
  const card = (c) => `<div class="dc${c.done ? ' done' : ''}${c.ready ? ' rdy' : ''}"><div class="dc-h"><span class="pf ${c.ch.toLowerCase()}">${esc(c.ch)}</span><b>${esc(c.code)}</b></div><div class="dc-items">${c.items.map((i) => `<span>${esc(i)}</span>`).join('')}</div><div class="dc-f"><span class="dc-st">${esc(c.state)}</span>${c.courier ? `<span class="dc-c">${IC('moped')}${esc(c.courier)}</span>` : ''}</div></div>`;
  return `${sbPad(lang)}${frontBar(lang, { tab: 'delivery' })}<div class="dl">
<div class="dl-top"><span class="dl-add">${IC('plus')}Wolt</span><span class="dl-add">${IC('plus')}Glovo</span><span class="dl-note">${esc(d.manual)}</span></div>
<div class="dl-cols">${d.cols.map(([title, cards], i) => `<div class="dl-col${i === d.cols.length - 1 ? ' dl-done' : ''}"><p class="dl-h">${esc(title)}<i>${cards.length}</i></p>${cards.map(card).join('')}</div>`).join('')}</div>
</div>`;
}

// The guests' kiosk (ui/kiosk.jsx), upright, with the app's own pictures of the dishes (src/dishes/: its drawings, and the
// photos of the pastries), two in the basket
const DISH_FILE = Object.fromEntries(readdirSync(path.join(ROOT, 'src/dishes')).filter((f) => /\.(svg|webp)$/.test(f)).map((f) => [f.replace(/\.\w+$/, ''), f]));
function kioskScreen(lang, k, file, lazy = true) {
  const price = Object.fromEntries(k.dishes);
  const sum = k.basket.reduce((total, id) => total + price[id], 0);
  const dish = ([id, p]) => `<div class="kd${k.basket.includes(id) ? ' in' : ''}"><span class="kd-img"><img src="${href(file, `assets/dishes/${DISH_FILE[id]}`)}" alt=""${lazy ? ' loading="lazy"' : ''} decoding="async"></span><span class="kd-n">${txt(k.names[id])}</span><span class="kd-p">${money(p)}<small>RSD</small></span></div>`;
  // the menu goes on under the open category — its next section, cut by the basket at the foot of the screen
  return `<div class="ks">${sbPad(lang)}
<div class="ks-top"><span class="ab-brand">RUVO</span><span class="ks-place">${esc(k.place)}</span><span class="seg ks-lang">${k.langs.map((l, i) => `<span${(lang === 'ru' ? i === 1 : i === 0) ? ' class="on"' : ''}>${esc(l)}</span>`).join('')}</span><span class="ks-ic">${IC('squares-four')}</span></div>
<div class="ks-cats"><span class="ks-search">${IC('magnifying-glass')}</span>${k.cats.map((c, i) => `<span${i === k.on ? ' class="on"' : ''}>${esc(c)}</span>`).join('')}</div>
<p class="ks-sec">${esc(k.section)}</p>
<div class="ks-grid c${k.dishes.length > 4 ? 3 : 2}">${k.dishes.map(dish).join('')}</div>${k.next ? `<p class="ks-sec">${esc(k.next[0])}</p><div class="ks-grid c${k.dishes.length > 4 ? 3 : 2}">${k.next[1].map(dish).join('')}</div>` : ''}
<div class="ks-cart"><span class="ks-b"><b>${esc(k.basketTitle)}</b><small>${esc(k.items)} · ${moneyRsd(sum)}</small></span><span class="kio-go">${esc(k.checkout)}</span></div>
</div>`;
}

// the bill of table 4 with the guest's card on the front terminal: each dish gets the biggest discount — the level's on
// food, happy hours' on drinks — and the points are counted on what is paid, as the app counts them (actions.js:
// floor(paid × earn / 100)); over the menu, what is on now
function guestsScreen(lang, x) {
  const A = APP[lang];
  const g = x.guests;
  const part = (kind) => g.lines.filter((l) => l[3] === kind).reduce((total, l) => total + l[2], 0);
  const sub = part('food') + part('drink');
  const offFood = Math.round((part('food') * g.levelPct) / 100);
  const offDrink = Math.round((part('drink') * Math.max(g.levelPct, g.promoPct)) / 100);
  const due = sub - offFood - offDrink;
  const earned = Math.floor((due * g.earn) / 100);
  const initials = g.name.split(' ').map((w) => w[0]).join('');
  const line = ([name, q, price]) => `<div class="ol"><span class="ol-q">${q}×</span><span class="ol-n">${esc(name)}</span><span class="ol-p">${money(price)}</span><span class="ol-st"><span class="st-sent">${esc(A.order.sent)}</span></span></div>`;
  const promo = `<div class="os-promo">${IC('tag')}<span><b>${esc(g.now)} · ${esc(g.promo)}</b>${esc(g.promoText)}</span></div>`;
  const counts = Object.fromEntries(g.lines.map(([name, q]) => [name, q]));
  return `${sbPad(lang)}${frontBar(lang)}<div class="os">
${menuCols(lang, g.grid, counts, promo)}
<div class="op op--guest">
${panelHead(lang, { title: g.table, guests: g.guests, meta: g.meta })}
<div class="gc"><span class="gc-av">${esc(initials)}</span><span class="gc-t"><b>${esc(g.name)}</b><small>${money(g.points)} ${esc(g.ptsWord)}</small></span><span class="gc-lvl">${esc(g.level)} · −${g.levelPct}%</span></div>
<div class="op-lines">${g.lines.map(line).join('')}</div>
<div class="op-foot">
<div class="gb-sums"><div><span>${esc(g.subtotal)}</span><span>${money(sub)}</span></div><div class="gb-d"><span>${IC('tag')}${esc(g.disc.food)}</span><span>−${money(offFood)}</span></div><div class="gb-d"><span>${IC('tag')}${esc(g.disc.drink)}</span><span>−${money(offDrink)}</span></div></div>
<div class="op-total"><span>${esc(g.due)}</span><b>${money(due)}<small>RSD</small></b></div>
<p class="gb-earn"><span>${esc(g.earnLabel)}</span><b>+${earned} ${esc(g.ptsWord)}</b></p>
<div class="op-acts"><span class="op-pay"><span class="pb">${IC('star')}${esc(g.payPoints)}</span><span class="pb go">${IC('check')}${esc(g.close)}</span></span></div>
</div>
</div>
</div>`;
}

// The back office (ui/office.jsx): its menu on the left — the open section unfolded, its page marked —, the page
const OFFICE_NAV = [['today', 'chart-bar'], ['analytics', 'sparkle', ['reports', 'forecast']], ['menu', 'list'], ['storage', 'package', ['stock', 'tech', 'docs', 'sef']], ['loyalty', 'star'], ['team', 'users', ['people', 'shifts', 'log']], ['integr', 'plug'], ['settings', 'sliders-horizontal']];
function office(lang, pageId, body, tools = '') {
  const O = APP[lang].office;
  const nav = OFFICE_NAV.map(([id, icon, kids]) => {
    const open = kids && kids.includes(pageId);
    return `<span class="on-i${open ? ' open' : ''}">${IC(icon)}<span>${esc(O.nav[id])}</span>${kids ? IC('caret-down', 'on-c') : ''}</span>${open ? kids.map((c) => `<span class="on-s${c === pageId ? ' on' : ''}">${esc(O.nav[c])}</span>`).join('') : ''}`;
  }).join('');
  return `${sbPad(lang)}<div class="of">
<div class="of-side"><div class="of-brand"><span class="ab-brand">RUVO</span><span>${esc(O.title)}</span><b class="of-av">M</b></div><span class="of-sel">${IC('storefront')}<span>${esc(O.all)}</span>${IC('caret-down')}</span><div class="of-nav">${nav}</div></div>
<div class="of-main"><div class="of-head"><p class="of-h1">${esc(O.nav[pageId])}${IC('info')}</p>${tools}</div>${body}</div>
</div>`;
}
const select = (text, icon = '') => `<span class="of-btn">${icon ? IC(icon) : ''}${esc(text)}${IC('caret-down')}</span>`;

// the tech card of a dish: what a portion costs and its food cost, counted from its rows; and what runs low
function stockScreen(lang, x) {
  const c = x.card;
  const cost = c.rows.reduce((sum, r) => sum + r[2], 0);
  const fc = Math.round((cost / c.price) * 100);
  const body = `<div class="of-cols">
<div class="of-card tc">
<div class="tc-head"><span class="of-caps">${esc(c.crumb)}</span><b class="tc-dish">${esc(c.dish)}</b><span class="of-meta">${esc(c.yield)}</span></div>
<div class="tc-table"><div class="tc-row th">${c.head.map((h) => `<span>${esc(h)}</span>`).join('')}</div>${c.rows.map(([name, q, v]) => `<div class="tc-row"><span>${esc(name)}</span><span>${esc(q)}</span><span>${money(v)}</span></div>`).join('')}</div>
<div class="tc-sum"><div><span>${esc(c.cost)}</span><b>${moneyRsd(cost)}</b></div><div><span>${esc(c.menu)}</span><b>${moneyRsd(c.price)}</b></div><div class="tc-fc"><span>${esc(c.fc)}</span><b>${fc}%</b><i style="--v:${fc}%"></i></div></div>
</div>
<div class="of-card low"><p class="low-head">${IC('warning-circle')}${esc(c.low)}</p>${c.lowRows.map(([name, have, min]) => `<div class="low-row"><span class="low-n">${esc(name)}</span><span class="low-have">${esc(have)}</span><span class="low-min">${esc(c.min)} ${esc(min)}</span></div>`).join('')}</div>
</div>`;
  return office(lang, 'tech', body, select(APP[lang].place, 'storefront'));
}

// a question in plain words → the week by day against the week before, and «Objasni»; the total and the change counted here
function reportsScreen(lang, x) {
  const r = x.report;
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const now = sum(r.now);
  const before = sum(r.before);
  const pct = fmt(lang, (now / before - 1) * 100, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  const total = r.total.replace('{n}', fmt(lang, now / 1e6, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const max = Math.max(...r.now, ...r.before);
  const h = (v) => `${((v / max) * 100).toFixed(1)}%`;
  const body = `<div class="ask">${IC('sparkle')}<span>${esc(r.ask)}</span></div>
<div class="of-card rep">
<div class="rep-head"><div><span class="of-caps">${esc(r.title)} · ${esc(r.period)}</span><span class="rep-total">${esc(total)}</span></div><span class="rep-delta">▲ ${esc(pct)}<small>${esc(r.cmp)}</small></span></div>
<div class="bars">${r.days.map((d, i) => `<div class="bar"><span class="bar-plot"><span class="bar-c" style="--h:${h(r.now[i])}"></span><span class="bar-p" style="--h:${h(r.before[i])}"></span></span><span class="bar-d">${esc(d)}</span></div>`).join('')}</div>
</div>
<div class="ans"><span class="ans-k">${IC('sparkle')}${esc(r.explain)}</span><p>${esc(r.answer.replace('{pct}', pct))}</p></div>`;
  return office(lang, 'reports', body, select(r.period, 'calendar-blank'));
}

// an incoming e-invoice from SEF: the supplier's lines matched to our products, the answer due, one button to receive
function sefScreen(lang, x) {
  const s = x.sef;
  const body = `<div class="of-card sef">
<div class="sef-inv"><div><b class="sef-sup">${esc(s.supplier)}</b><span class="of-meta">${esc(s.meta)}</span></div><span class="sef-due">${esc(s.due)}</span></div>
<div class="sef-rows"><div class="sef-row th"><span>${esc(s.head[0])}</span><span></span><span>${esc(s.head[1])}</span></div>${s.rows.map(([item, q, product, factor]) => `<div class="sef-row"><span class="sef-item">${esc(item)}<small>${esc(q)}</small></span><span class="sef-arrow">${IC('arrow-right')}</span><span class="sef-prod">${esc(product)}<small>${esc(factor)} · ${esc(s.remembered)}</small></span></div>`).join('')}</div>
<div class="sef-btns"><span class="pb">${IC('x')}${esc(s.reject)}</span><span class="pb go">${IC('check')}${esc(s.accept)}</span></div>
</div>`;
  return office(lang, 'sef', body, `<span class="seg of-seg">${s.tabs.map((tab, i) => `<span${i ? '' : ' class="on"'}>${esc(tab)}</span>`).join('')}</span>`);
}

// the team: who is on shift now (the last came a moment ago), and a waiter's week counted as the app counts pay —
// hours × the hourly rate + a share of the sales
function teamScreen(lang, x) {
  const t = x.team;
  const pay = t.pay;
  const share = Math.round((pay.sales * pay.pct) / 100);
  const total = pay.hours * pay.rate + share;
  const pct = fmt(lang, pay.pct, { minimumFractionDigits: 1 });
  const row = ([name, role, since], i) => `<div class="tm-row${i === t.people.length - 1 ? ' tm-new' : ''}"><span class="tm-av">${esc(name[0])}</span><span class="tm-n"><b>${esc(name)}</b><small>${esc(t.roles[role])}</small></span><span class="tm-since"><i></i>${esc(t.since)} ${esc(since)}</span></div>`;
  const body = `<div class="of-cols">
<div class="of-card tm"><div class="tm-head"><b>${esc(t.title)}</b><span class="of-meta">${esc(t.count)}</span></div><div class="tm-rows">${t.people.map(row).join('')}</div></div>
<div class="of-card pay"><span class="of-caps">${esc(t.payTitle)}</span>
<div class="pay-who"><span class="tm-av">${esc(pay.name[0])}</span><b>${esc(pay.name)}</b><small>${esc(t.roles.waiter)}</small></div>
<div class="pay-rows"><div><span>${esc(t.hours)}</span><span>${pay.hours} h</span></div><div><span>${esc(t.rate)}</span><span>${moneyRsd(pay.rate)}</span></div><div><span>${esc(t.share.replace('{pct}', pct))}<small>${moneyRsd(pay.sales)}</small></span><span>${moneyRsd(share)}</span></div></div>
<div class="pay-total"><span>${esc(t.total)}</span><b>${moneyRsd(total)}</b></div>
</div>
</div>`;
  return office(lang, 'shifts', body, select(APP[lang].place, 'storefront'));
}

// «Prognoza» on the back office (ui/office-forecast.jsx): the day's tiles; what the owner knows about the day, in words,
// and the change it made; the bills by the hour — the hall below, delivery above, the usual day dashed where the event
// changes it; the people by the hour. Counted here from FORECAST_DAY as the app counts (forecast.js: forecastDay,
// staffByHour). Once in sight the screen plays its moment: the words are typed, «Учесть» is pressed, the change appears,
// the evening grows, and the numbers it moves change (.fc-was → .fc-now)
function forecastScreen(lang, sc) {
  const F = FORECAST_DAY;
  const hours = F.hall.map((_, i) => F.from + i);
  const ev = (h) => h >= F.event.from && h < F.event.to;
  const hall = F.hall.map((v, i) => (ev(hours[i]) ? v * F.event.k : v));
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const checks = sum(hall) + sum(F.deliv);
  const before = sum(F.hall) + sum(F.deliv);
  const r = Math.round;
  const range = (v, step = 1) => `${money(r((v * (1 - F.err)) / step) * step)}–${money(r((v * (1 + F.err)) / step) * step)}`;
  const pct = (v) => `${r(v * 100)}%`;
  const staff = (h, d) => ({ w: Math.max(1, Math.ceil(h / F.waiter - 0.05)), c: Math.max(1, Math.ceil(((h + d) * F.kitchen) / F.cook - 0.05)) });
  const now = hall.map((h, i) => staff(h, F.deliv[i]));
  const was = F.hall.map((h, i) => staff(h, F.deliv[i]));
  const swap = (a, b) => (a === b ? `${a}` : `<span class="fc-sw"><span class="fc-was" aria-hidden="true">${a}</span><span class="fc-now">${b}</span></span>`);
  const pc = (v) => `${((v / 20) * 100).toFixed(2)}%`;
  // the tiles before the owner's words and after them (the accuracy stays)
  const tile = (n, hallN) => [
    [r(n), `${range(n)} · ${sc.hallW} ${r(hallN)}, ${sc.delivW} ${r(sum(F.deliv))}`],
    [money(r((n * F.check) / 100) * 100), range(n * F.check, 1000)],
    [r(n * (F.kitchen + F.bar)), `${sc.kitchenW} ${r(n * F.kitchen)} · ${sc.barW} ${r(n * F.bar)}`],
  ];
  const t0 = tile(before, sum(F.hall));
  const t1 = tile(checks, sum(hall));
  const tiles = [0, 1, 2].map((i) => [sc.tiles[i], swap(t0[i][0], t1[i][0]), swap(esc(t0[i][1]), esc(t1[i][1]))])
    .concat([[sc.tiles[3], `±${pct(F.err)}`, esc(`${sc.errW}: ${pct(F.wape)}`)]]);
  const bars = hours.map((h, i) => {
    const e = ev(h);
    return `<span class="fcb"><span class="fcb-s">${F.deliv[i] ? `<i class="fcb-d" style="--h:${pc(F.deliv[i])}"></i>` : ''}${e ? `<i class="fcb-x" style="--h:${pc(hall[i] - F.hall[i])}"></i>` : ''}<i class="fcb-h" style="--h:${pc(F.hall[i])}"></i></span>${e ? `<i class="fcb-base" style="--b:${pc(F.hall[i] + F.deliv[i])}"></i>` : ''}</span>`;
  }).join('');
  const row = (label, key) => `<b>${esc(label)}</b>${now.map((x, i) => `<span${x[key] > 1 ? ' class="hi"' : ''}>${swap(was[i][key], x[key])}</span>`).join('')}`;
  const body = `<p class="of-meta fc-sub">${esc(sc.sub)}</p>
<div class="fc-tiles">${tiles.map(([label, v, sub]) => `<div class="of-card fct"><span class="of-caps">${esc(label)}</span><b class="fct-v">${v}</b><span class="of-meta">${sub}</span></div>`).join('')}</div>
<div class="of-card fc-ev"><p class="fc-h">${esc(sc.events)}${IC('info')}</p>
<div class="fc-ask"><span class="fc-field"><span class="fc-typed">${esc(sc.typed)}</span></span><span class="pb go fc-apply">${IC('sparkle')}${esc(sc.apply)}</span></div>
<p class="fc-adj">${IC('caret-up')}<span><b>${esc(sc.adj[0])}</b> · ${esc(sc.adj[1])}</span>${IC('x')}</p></div>
<div class="of-card fc-ch"><div class="fc-ch-head"><p class="fc-h">${esc(sc.hours)}${IC('info')}</p><span class="fc-leg"><i class="s1"></i>${esc(sc.hall)}<i class="s2"></i>${esc(sc.deliv)}<i class="sb"></i>${esc(sc.base)}</span></div>
<div class="fc-plot"><span class="fc-ax">${[20, 15, 10, 5, 0].map((v) => `<i style="--y:${v * 5}%">${v}</i>`).join('')}</span><span class="fc-area">${bars}</span><span></span><span class="fc-hrs">${hours.map((h) => `<i>${h}</i>`).join('')}</span></div></div>
<div class="of-card fc-pp"><p class="fc-h">${esc(sc.people)}${IC('info')}</p>
<div class="fc-pt"><span class="th">${esc(sc.hourCol)}</span>${hours.map((h) => `<span class="th">${h}</span>`).join('')}${row(sc.rows[0], 'w')}${row(sc.rows[1], 'c')}</div></div>`;
  return office(lang, 'forecast', body, `<span class="of-tools">${select(sc.day, 'calendar-blank')}${select(APP[lang].place, 'storefront')}</span>`);
}

// «Prognoza» (14 October, the owner: «уделил бы внимание прогнозированию — хорошую фичу придумали»): its own section after
// the screens — the day ahead on the iPad, playing its moment once in sight; the four things it does; how far to trust it
const FC_ICON = ['chart-bar', 'sparkle', 'users', 'target'];
function forecastSec(lang) {
  const f = T[lang].home.forecast;
  return `<section class="band" id="forecast" aria-labelledby="forecast-h"><div class="wrap">
<div class="sec-head"><p class="eyebrow">${IC('chart-line-up')}${esc(f.eyebrow)}</p><h2 id="forecast-h">${txt(f.title)}</h2><p>${txt(f.lead)}</p></div>
<div class="fc" data-live>
<div class="fc-shot" role="img" aria-label="${esc(f.label)}">${dev('pad', forecastScreen(lang, f.screen))}</div>
<ul class="fc-list">${f.items.map(([title, text], i) => `
<li>${IC(FC_ICON[i], 'fc-i')}<h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
</div>
<p class="fc-note">${txt(f.note)}</p>
</div></section>`;
}

// each tab's picture: the device (or two) and, for the kiosk, the number the guest says at the till beside it
const SHOTS = {
  floor: (lang, x) => dev('pad', floorScreen(lang, x)),
  waiter: (lang, x) => `<div class="pair">${dev('phone', phoneOrder(lang, x))}${dev('phone', phoneBill(lang, x))}</div>`,
  kitchen: (lang, x) => dev('pad', kitchenScreen(lang, x)),
  delivery: (lang, x) => dev('pad', deliveryScreen(lang, x)),
  kiosk: (lang, x, file) => `<div class="pair">${dev('port', kioskScreen(lang, x.kiosk, file))}<div class="nc kio-no"><p class="nc-h">${IC('hand-tap')}<span>${esc(x.kiosk.yourNo)}</span></p><span class="kio-num">${x.kiosk.no}</span><p class="nc-note">${esc(x.kiosk.payAt)}</p></div></div>`,
  guests: (lang, x) => dev('pad', guestsScreen(lang, x)),
  stock: (lang, x) => dev('pad', stockScreen(lang, x)),
  reports: (lang, x) => dev('pad', reportsScreen(lang, x)),
  sef: (lang, x) => dev('pad', sefScreen(lang, x)),
  team: (lang, x) => dev('pad', teamScreen(lang, x)),
};
const SHOT_KIND = { waiter: 'phones', kiosk: 'port' };

// ---------- live photos: a place shows once its file is in src/photos/ (PHOTOS in content.mjs); the preview shows each
// empty one, numbered in the order of the page, with what to shoot — the live site never shows an empty frame ----------
const PHOTO_DIR = path.join(ROOT, 'src/photos');
const PHOTO_FILES = Object.fromEntries(Object.keys(PHOTOS).map((id) => [id,
  ['jpg', 'jpeg', 'webp', 'png'].map((e) => `${id}.${e}`).find((f) => existsSync(path.join(PHOTO_DIR, f))) || null]));
const PHOTO_NO = Object.fromEntries(Object.keys(PHOTOS).map((id, i) => [id, i + 1]));
// a photo changed under the same name is a new address (?v=), so no browser keeps showing the old one
const PHOTO_V = Object.fromEntries(Object.entries(PHOTO_FILES).filter(([, f]) => f)
  .map(([id, f]) => [id, createHash('sha256').update(readFileSync(path.join(PHOTO_DIR, f))).digest('hex').slice(0, 10)]));
const CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function photo(lang, file, id, caption = '') {
  const p = PHOTOS[id];
  const f = PHOTO_FILES[id];
  const style = ` style="--ratio: ${p.ratio}"`;
  // the hero's photo is the first thing on the page: it loads at once, the rest as the page scrolls to them
  const load = id === 'hero' ? 'fetchpriority="high"' : 'loading="lazy"';
  if (f) return `<figure class="photo"${style}><img src="${href(file, `img/${f}`)}?v=${PHOTO_V[id]}" alt="${esc(p.alt[lang])}" ${load} decoding="async">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  if (!SLOTS) return '';
  return `<figure class="photo slot"${style} aria-hidden="true"><span class="slot-in"><span class="slot-n">${CAMERA}Фото ${PHOTO_NO[id]}${caption ? ` · ${esc(caption)}` : ''}</span><span class="slot-t">${esc(p.shot)}</span><code>src/photos/${id}.jpg</code></span></figure>`;
}

// Everything a venue needs — one section (14 October: the card grid and «Kako izgleda u radu» told the same twice): the
// app's screens on their devices, one per tab; under each its words; under them the connections and the way into the
// demo. Without JavaScript the screens stand one under another; the script turns them into tabs (one shown, the rest kept
// in the same grid cell, so switching does not move the page), and a shown screen plays a moment of its work once it is
// in sight. A kind of venue shows its own tabs in its own order (VENUE_SETUP.tabs), under its own title.
function features(lang, file, v = null, tabs = null) {
  const x = T[lang].home.examples;
  const h = T[lang].home;
  const d = h.demo;
  const soon = h.integrations.length - 1;
  const items = tabs ? tabs.map((id) => x.items.find((it) => it.id === id)) : x.items;
  return `<section class="band alt" id="features" aria-labelledby="features-h"><span class="anchor" id="examples"></span><div class="wrap">
<div class="sec-head"><h2 id="features-h">${esc(v ? v.featuresTitle : x.title)}</h2><p>${txt(v ? v.featuresLead : x.lead)}</p></div>
<div class="ex" data-tabs data-live>
<div class="ex-tabs-wrap"><div class="ex-tabs" aria-label="${esc(x.tabsLabel)}" hidden>${items.map((it, i) => `<button type="button" id="ex-t-${it.id}" aria-controls="ex-p-${it.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${esc(it.tab)}</button>`).join('')}</div></div>
<div class="ex-panels">${items.map((it) => `
<div class="ex-panel" id="ex-p-${it.id}">
<div class="ex-shot ex-shot--${SHOT_KIND[it.id] || 'pad'}" role="img" aria-label="${esc(it.label)}">${SHOTS[it.id](lang, it, file)}</div>
<div class="ex-text"><h3>${txt(it.title)}</h3><p>${txt(it.text)}</p><ul>${it.points.map((p) => `<li>${txt(p)}</li>`).join('')}</ul></div>
</div>`).join('')}
</div>
</div>
<div class="integr"><h3 class="integr-title">${esc(h.integrationsTitle)}</h3><ul>${h.integrations.map((it, i) => `<li${i === soon ? ' class="soon"' : ''}>${IC(INTEGR_ICON[i])}${esc(it)}</li>`).join('')}</ul></div>
<div class="ex-demo"><p>${txt(d.note)}</p><a class="lnk" href="${href(file, DEMO[lang])}">${MORE(d.link)}</a></div>
</div></section>`;
}

// The small things of a shift (14 October): a dark band like the kitchen screen; instead of an icon each shows its
// piece of the app's own screen, in the app's own words.
function micro(lang, key, u) {
  const n = (v) => fmt(lang, v);
  const line = (a, b = '', cls = '') => `<div class="mu-line${cls}"><span>${a}</span>${b}</div>`;
  const M = {
    bell: () => `<div class="mu-div">${esc(u.course)}</div>${line(esc(u.dish), `<span class="mu-q">×${u.qty}</span>`, ' dim')}<span class="mu-btn go">${esc(u.btn)}</span>`,
    stop: () => line(esc(u.rows[0][0]), `<span class="mu-tag warn">${esc(u.rows[0][1])}</span>`) + line(esc(u.rows[1][0]), `<span class="mu-tag late">${esc(u.rows[1][1])}</span>`, ' dim'),
    split: () => `<span class="mu-seg"><span>${esc(u.seg[0])}</span><span class="on">${esc(u.seg[1])}</span></span>${u.parts.map(([a, v]) => line(esc(a), `<b>${n(v)}</b>`)).join('')}`,
    cash: () => line(esc(u.due), `<b>${n(u.sum)}</b>`, ' dim') + line(esc(u.got), `<b>${n(u.paid)}</b>`) + `<div class="mu-big"><span>${esc(u.change)}</span><b>${n(u.paid - u.sum)}</b></div>`,
    lock: () => `<span class="mu-t">${esc(u.title)}</span><span class="mu-dots"><i class="f"></i><i class="f"></i><i class="f"></i><i></i></span><span class="mu-tag">${esc(u.reason)}</span>`,
    tag: () => `<span class="mu-tag gold big">${esc(u.disc)}</span><span class="mu-ok">${IC('check')}${esc(u.ok)}</span>`,
    rotate: () => line(esc(u.row)) + `<span class="mu-btn">${esc(u.btn)}</span>`,
    move: () => `<div class="mu-floor"><span class="mf">1</span><span class="mf">2</span><span class="mf ghost"></span><span class="mf lift">3</span></div><span class="mu-btn sm">${esc(u.btn)}</span>`,
    user: () => `<span class="mu-who"><span class="mu-av">${esc(u.name[0])}</span>${esc(u.name)}</span><span class="mu-t">${esc(u.title)}</span><span class="mu-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `<i>${k}</i>`).join('')}</span>`,
    bike: () => line('<span class="pf wolt">Wolt</span>', `<b>${esc(u.code)}</b>`, ' start') + line(esc(u.item), '', ' dim') + `<span class="mu-tag ok">${esc(u.courier)}</span>`,
    clock: () => `<div class="mu-line bare"><span class="mu-t">${esc(u.day)}</span><span class="mu-tag now">${esc(u.now)} 01:30</span></div><span class="mu-day"><i class="d-fill"></i><i class="d-mid"></i><i class="d-now"></i></span><span class="mu-times"><span>05:00</span><span>00:00</span><span>05:00</span></span>`,
    info: () => `<span class="mu-t">${esc(u.dish)}</span><span class="mu-tags">${u.tags.map((t) => `<span class="mu-tag">${esc(t)}</span>`).join('')}</span><span class="mu-note">${esc(u.note)}</span>`,
    queue: () => line(esc(u.label), `<b>${esc(u.load)}</b>`) + `<span class="mu-warn">${IC('clock')}<span>${esc(u.note)}</span></span>`,
    norm: () => `<div class="mu-big"><span>${esc(u.label)}</span><b>${u.pct}%</b></div>${u.rows.map(([a, b], i) => line(esc(a), `<b>${esc(b)}</b>`, i ? ' dim' : '')).join('')}`,
    pair: () => u.rows.map(([a, v]) => line(esc(a), `<b>${n(v)}</b>`)).join('') + `<div class="mu-line bare"><span class="mu-tag gold">${IC('tag')}${esc(u.disc)}</span><b class="mu-minus">−${n(u.minus)}</b></div>`,
    board: () => `<div class="mu-bd">${[[u.cooking, u.wait, ''], [u.ready, u.done, ' ok']].map(([h, list, c]) => `<div class="mb-col${c}"><span class="mb-h">${esc(h)}</span><span class="mb-ns">${list.map(([no, nm]) => `<span class="mb-n">${esc(no)}${nm ? `<small>${esc(nm)}</small>` : ''}</span>`).join('')}</span></div>`).join('')}</div>`,
  };
  return `<div class="mu mu--${key}" aria-hidden="true">${M[key]()}</div>`;
}
// Two rows from edge to edge of the page (the owner, 14 October: «две строки от края до края страницы — должно казаться,
// что их много и мы всё учли»), drifting slowly in opposite directions while they are in sight: each row carries a second,
// hidden copy of itself that closes the loop. A button stops them; for those who asked for less motion, and without
// JavaScript, they stand still and each row scrolls sideways. A kind of venue puts its own first (VENUE_SETUP.rush).
function rush(lang, keys = null) {
  const r = T[lang].home.rush;
  const items = keys ? [...keys.map((k) => r.items.find((it) => it[0] === k)), ...r.items.filter((it) => !keys.includes(it[0]))] : r.items;
  const half = Math.ceil(items.length / 2);
  const tiles = (list) => list.map(([key, title, text, ui]) => `
<li>${micro(lang, key, ui)}<h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('');
  const row = (list, n) => `<div class="rush-row r${n}"><div class="rush-track"><ul class="rush">${tiles(list)}
</ul><ul class="rush rush-copy" aria-hidden="true">${tiles(list)}
</ul></div></div>`;
  return `<section class="band night" id="rush" aria-labelledby="rush-h"><div class="wrap">
<div class="sec-head"><h2 id="rush-h">${esc(r.title)}</h2><p>${txt(r.lead)}</p></div>
</div>
<div class="rush-rows" data-live data-rush>
${row(items.slice(0, half), 1)}
${row(items.slice(half), 2)}
</div>
<div class="wrap rush-foot"><button type="button" class="rush-pp" data-rush-pp aria-label="${esc(r.pause)}" data-pause="${esc(r.pause)}" data-play="${esc(r.play)}" hidden>${IC('pause-fill', 'rp-pause')}${IC('play-fill', 'rp-play')}</button></div>
</section>`;
}

// Why RUVO: four statements, each under its icon, as Apple's «Why Apple» — then the way to the prices and the demo
function why(lang, file) {
  const w = T[lang].home.why;
  const d = T[lang].home.demo;
  return `<section class="band" id="why" aria-labelledby="why-h"><div class="wrap">
<div class="sec-head"><h2 id="why-h">${esc(w.title)}</h2></div>
<ul class="why">${w.items.map(([title, text], i) => `
<li>${IC(WHY_ICON[i], 'why-i')}<h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
<div class="cta-row c"><a class="btn" href="#pricing">${esc(w.cta)}</a><a class="lnk" href="${href(file, DEMO[lang])}">${MORE(d.cta)}</a></div>
</div></section>`;
}

// The closing section: one big enamel plate in the brand's blue — the call to try RUVO with its two buttons (the demo,
// or registration once it is on, and a letter), and under a rule the address on its plates
function contact(lang, file, title = null) {
  const t = T[lang];
  const h = t.home;
  const f = title ? { ...h.final, title } : h.final;
  const house = SITE.address.match(/\s(\d+[a-z]?),/i)[1];
  const buttons = SIGNUP_ON
    ? `<a class="btn inv" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.cta)}</a><a class="btn inv ghost" href="${href(file, DEMO[lang])}">${esc(h.demo.cta)}</a>`
    : `<a class="btn inv" href="${href(file, DEMO[lang])}">${esc(h.demo.cta)}</a><a class="btn inv ghost" href="mailto:${SITE.email}">${esc(h.cta)}</a>`;
  return `<section class="band" id="contact" aria-labelledby="contact-h"><div class="wrap">
<div class="final">
<div class="final-head"><h2 id="contact-h">${txt(f.title)}</h2><p>${txt(f.text)}</p><div class="cta-row">${buttons}</div></div>
<div class="contact-card">
<div class="plates"><a class="plate" href="mailto:${SITE.email}">${SITE.email}</a><div class="house" aria-hidden="true"><span class="house-st">${t.ui.plate.map(esc).join('<br>')}</span><span class="house-no">${house}</span></div></div>
<p class="addr"><b>${esc(SITE.company)}</b><br>${esc(SITE.address)}<br><span class="contact-note">${esc(h.contactText)}</span></p>
</div>
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

// `bills` — the calculator's examples, the first pressed at the start: a kind of venue puts its own first
function pricing(lang, file, bills = null) {
  const p = { ...T[lang].home.pricing, ...(bills ? { bills } : {}) };
  const c = p.calc;
  const d = T[lang].home.demo;
  const num = (v) => fmt(lang, v);
  const yearOf = (v) => v * PRICES.yearMonths;
  // each plan ends with the same button, so the cards end on one line
  const cta = SIGNUP_ON
    ? `<a class="plan-cta" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.priceCta)}</a>`
    : `<a class="plan-cta" href="${href(file, DEMO[lang])}">${esc(d.cta)}</a>`;
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
<ul class="incl-list">${p.includes.map((x, i) => `<li>${IC(INCL_ICON[i])}<span>${txt(x)}</span></li>`).join('')}</ul>
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
    // the first example is the page's own (a kind of venue puts its setup first): it fills the calculator in at the start
    if (chips.length) { preset(D.presets[0]); press(0); }
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
  // tabs: the product's screens
  for (const box of document.querySelectorAll('[data-tabs]')) {
    const list = box.querySelector('[aria-controls]').parentNode;
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
      // a tab row that scrolls sideways keeps the chosen one in view
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: 'smooth' });
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
    box.classList.add('js');
    show(0);
  }
  // what moves on the page moves only while it is in sight, and not at all for those who asked for less motion
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  // the small things drift in two rows; the button under them stops them and starts them again
  const rr = document.querySelector('[data-rush]');
  const pp = document.querySelector('[data-rush-pp]');
  if (rr && !still.matches) {
    rr.classList.add('marquee');
    if (pp) {
      pp.hidden = false;
      pp.addEventListener('click', () => {
        const stop = !rr.classList.contains('paused');
        rr.classList.toggle('paused', stop);
        pp.dataset.state = stop ? 'paused' : '';
        pp.setAttribute('aria-label', stop ? pp.dataset.play : pp.dataset.pause);
      });
    }
  }
  const live = [...document.querySelectorAll('[data-live]')];
  if (live.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('live', e.isIntersecting && !still.matches);
    }, { threshold: 0.35 });
    live.forEach((el) => io.observe(el));
  }
})();`;

// The home page, and the page of each kind of venue (`key` «v:cafe»…): the same sections; a venue's has its own first
// screen (words and scene), its tabs, its small things, what it needs, its example price first and its closing call.
// Old links to «Za koga» (#who) land on the first screen, where the menu that replaced it is.
function landing(lang, key) {
  const t = T[lang];
  const h = t.home;
  const file = fileOf(lang, key);
  const vk = key === 'home' ? null : key.slice(2);
  const v = vk ? VENUES[lang].items[vk] : null;
  const setup = vk ? VENUE_SETUP[vk] : null;
  // the calculator's examples: the venue's own first, then the general ones that are not the same setup
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const bills = setup ? [[v.preset, setup.preset], ...h.pricing.bills.filter(([, s]) => !same(s, setup.preset))] : null;
  const equip = v ? v.equip : h.equip.items;
  const equipIcons = setup ? setup.equip : HOME_EQUIP;
  const body = `${header(lang, key, file)}
<main id="main">
<section class="hero"><span class="anchor" id="who"></span><div class="wrap">
<div class="hero-text">
<p class="eyebrow">${v ? `${VICON[vk]}${esc(v.eyebrow)}` : esc(h.eyebrow)}</p>
<h1>${txt(v ? v.h1 : h.h1)}</h1>
<p class="lead">${txt(v ? v.lead : h.lead)}</p>
<div class="cta-row c">${SIGNUP_ON
    ? `<a class="btn" href="${href(file, fileOf(lang, 'signup'))}">${esc(SG[lang].home.cta)}</a><a class="lnk" href="${href(file, DEMO[lang])}">${MORE(h.demo.cta)}</a>`
    : `<a class="btn" href="${href(file, DEMO[lang])}">${esc(h.demo.cta)}</a><a class="lnk" href="mailto:${SITE.email}">${MORE(h.cta)}</a>`}</div>
</div>
${heroArt(lang, file, key)}
</div></section>
${features(lang, file, v, setup && setup.tabs)}
${forecastSec(lang)}
${rush(lang, setup && setup.rush)}
${why(lang, file)}
${pricing(lang, file, bills)}
<section class="band alt" id="start" aria-labelledby="start-h"><div class="wrap">
<div class="sec-head"><h2 id="start-h">${esc(h.startTitle)}</h2></div>
<ol class="steps">${(SIGNUP_ON ? SG[lang].home.start : h.start).map(([title, text], i) => `
<li class="step"><span class="path-n" aria-hidden="true">${i + 1}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ol>
<div class="equip"><div class="equip-h"><h3>${esc(h.equip.title)}</h3><p>${txt(h.equip.note)}</p></div><ul>${equip.map((x, i) => `<li>${IC(EQUIP_ICON[equipIcons[i]], 'eq-i')}<span>${txt(x)}</span></li>`).join('')}</ul></div>
</div></section>
${contact(lang, file, v && v.final)}
</main>
${footer(lang, key, file)}
<script>
${HOME_JS}
</script>`;
  return page(lang, key, file, v ? v.title : h.title, v ? v.description : h.description, body);
}

function privacyPage(lang) {
  const t = T[lang];
  const p = t.privacy;
  const file = fileOf(lang, 'privacy');
  // the policy's own markup (<b>, a link) is kept; a nested array is a list
  const block = (x) => (Array.isArray(x) ? `<ul>${x.map((li) => `<li>${fill(li)}</li>`).join('')}</ul>` : `<p>${fill(x)}</p>`);
  const body = `${header(lang, 'privacy', file)}
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
  const body = `${header(lang, 'support', file)}
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
  const body = `${header(lang, 'signup', file)}
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
  const body = `${header(lang, 'confirm', file)}
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
  const body = `${header(lang, 'terms', file)}
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
${THEME_EARLY}
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
${THEME_EARLY}
<style>
${CSS}
</style>
</head>
<body>
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
  put(fileOf(lang, 'home'), landing(lang, 'home'));
  for (const key of VPAGES) put(fileOf(lang, key), landing(lang, key));
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
for (const f of Object.values(DISH_FILE)) put(`assets/dishes/${f}`, readFileSync(path.join(ROOT, 'src/dishes', f)));
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
