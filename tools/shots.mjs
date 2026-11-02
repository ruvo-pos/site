// Screenshots of the RUVO app for the site (the owner, 2 November, 03:31: «наполняем наш лендинг актуальными примерами и
// скриншотами»): the app's own screens as they are now — the demo's own bundle (src/demo/app.js, app.css, the one the
// demo pages run) with the app's own letters (Onest, JetBrains Mono, from the ruvo checkout beside this one; FONTS= to
// point elsewhere), the demo's restaurant in Serbian, English and Russian, light and dark (the kiosk and the guests' app
// light only, the board dark only, as they always are; the kitchen light as chosen on its screen), at the sizes of the
// devices the site draws round them: an iPad Pro 11″ on its side 1210×834 (the front,
// the kitchen, the back office) and upright 834×1210 (the kiosk), an iPhone 18 Pro Max 440×956 (the waiter, the guests'
// app), and for the demo's start page a laptop 1440×900 (the back office) and a screen 1440×810 (the board). Each as the
// device shows it: the app under the status bar (the safe areas of the device given to its CSS: 24/20 points on the
// iPad, 62/34 on the iPhone), the time and the day, Wi-Fi, the battery, on the iPhone the Dynamic Island and the home
// indicator. The clock is the site's, 21:41 on Wednesday 14 October (APP in content.mjs: Apple's 9:41, at dinner), set
// before the demo makes its restaurant, so the hall, the tickets and the bills are a dinner's.
//   node tools/shots.mjs [--only=floor,kitchen] [--langs=sr] [--themes=light] [--png]   (Playwright with its Chromium)
// Writes src/shots/<lang>/<name>-<theme>.webp (tools/webp.py makes them from the .png it takes; --png keeps the .png
// and writes to OUT= instead, to look at); build.mjs puts them on the pages (SHOTS there).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP, PRICES, T } from '../src/content.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3).split(',') : null; };
const LANGS = arg('langs') || ['sr', 'en', 'ru'];
const THEMES = arg('themes') || ['light', 'dark'];
const ONLY = arg('only');
const PNG = process.argv.includes('--png');
const OUT = PNG ? (process.env.OUT || path.join(ROOT, 'tools', '.look')) : path.join(ROOT, 'src/shots');
const FONTS = process.env.FONTS || path.join(ROOT, '..', 'ruvo', 'app', 'fonts');
const SCALE = Number(process.env.SCALE || 1.5);
const CLOCK = new Date('2026-10-14T21:41:00+02:00');
// the devices: the screen's points and its safe areas
const DEV = {
  pad: { size: { width: 1210, height: 834 }, top: 24, bottom: 20 },
  port: { size: { width: 834, height: 1210 }, top: 24, bottom: 20 },
  phone: { size: { width: 440, height: 956 }, top: 62, bottom: 34 },
  // the demo's start page draws two more (app/src/ui/demo-art.jsx): the back office on a laptop and the pickup board on
  // a screen over the counter — no status bar on either
  lap: { size: { width: 1440, height: 900 }, top: 0, bottom: 0, bare: true },
  tv: { size: { width: 1440, height: 810 }, top: 0, bottom: 0, bare: true },
};

// ---------- the demo's page for each language and device, with the app's own letters ----------
const WORK = path.join(ROOT, 'tools', '.shots');
rmSync(WORK, { recursive: true, force: true });
mkdirSync(path.join(WORK, 'fonts'), { recursive: true });
copyFileSync(path.join(ROOT, 'src/demo/app.js'), path.join(WORK, 'app.js'));
for (const f of readdirSync(FONTS).filter((x) => x.endsWith('.woff2'))) copyFileSync(path.join(FONTS, f), path.join(WORK, 'fonts', f));
for (const f of readdirSync(path.join(ROOT, 'tools', 'fonts')).filter((x) => x.endsWith('.woff2'))) copyFileSync(path.join(ROOT, 'tools', 'fonts', f), path.join(WORK, 'fonts', f));
const faces = readFileSync(path.join(FONTS, 'faces.css'), 'utf8').replace(/url\(\.\//g, 'url(fonts/');
const css = readFileSync(path.join(ROOT, 'src/demo/app.css'), 'utf8');
for (const [kind, d] of Object.entries(DEV)) {
  const inset = { top: d.top, bottom: d.bottom, left: 0, right: 0 };
  writeFileSync(path.join(WORK, `app-${kind}.css`), css.replace(/env\(safe-area-inset-(top|bottom|left|right)(?:,[^)]*)?\)/g, (m, side) => `${inset[side]}px`));
  for (const lang of ['sr', 'en', 'ru']) {
    const config = JSON.stringify({ lang, site: './', prices: PRICES }).replace(/</g, '\\u003c');
    writeFileSync(path.join(WORK, `${lang}-${kind}.html`), `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${faces}</style><link rel="stylesheet" href="app-${kind}.css"></head><body><div id="app"></div><script>window.RUVO_DEMO = ${config};</script><script src="app.js"></script></body></html>`);
  }
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const f = path.join(WORK, decodeURIComponent(req.url.split('?')[0].replace(/^\/+/, '')));
  if (!f.startsWith(WORK + path.sep) || !existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

// ---------- the status bar, laid over the app's top as the device lays it ----------
const icon = (name) => readFileSync(path.join(ROOT, 'src/icons', `${name}.svg`), 'utf8').replace('<svg ', '<svg class="sb-i" ');
const SB_CSS = `
@font-face { font-family: 'SB'; font-weight: 600; src: url(fonts/inter-latin-600-normal.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'SB'; font-weight: 600; src: url(fonts/inter-latin-ext-600-normal.woff2) format('woff2'); unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'SB'; font-weight: 600; src: url(fonts/inter-cyrillic-600-normal.woff2) format('woff2'); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
#shot-sb { position: fixed; z-index: 2147483647; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; color: var(--sb); font-family: 'SB', system-ui, sans-serif; font-weight: 600; letter-spacing: 0; pointer-events: none; }
#shot-sb.sb-pad { height: 24px; padding: 0 22px; font-size: 12px; }
#shot-sb.sb-phone { height: 56px; padding: 6px 32px 0 44px; font-size: 17px; }
#shot-sb .sb-d { margin-left: 6px; }
#shot-sb .sb-r { display: inline-flex; align-items: center; gap: 6px; }
#shot-sb.sb-phone .sb-r { gap: 7px; }
#shot-sb .sb-i { width: 15px; height: 15px; }
#shot-sb.sb-phone .sb-i { width: 18px; height: 18px; }
#shot-sb .sb-bat { position: relative; width: 24px; height: 11.5px; box-sizing: border-box; border: 1.1px solid currentColor; border-radius: 3.6px; opacity: 0.92; }
#shot-sb.sb-phone .sb-bat { width: 27px; height: 13px; }
#shot-sb .sb-bat::after { content: ''; position: absolute; top: 50%; right: -3.4px; width: 1.6px; height: 4px; margin-top: -2px; border-radius: 0 1px 1px 0; background: currentColor; opacity: 0.5; }
#shot-sb .sb-bat i { position: absolute; inset: 1.4px; border-radius: 1.8px; background: currentColor; }
#shot-di { position: fixed; z-index: 2147483647; top: 11px; left: 50%; width: 124px; height: 36px; margin-left: -62px; border-radius: 20px; background: #000; pointer-events: none; }
#shot-hb { position: fixed; z-index: 2147483647; bottom: 8px; left: 50%; width: 140px; height: 5px; margin-left: -70px; border-radius: 3px; background: var(--sb); pointer-events: none; }
`;
async function statusBar(p, kind, lang, ink) {
  const A = APP[lang];
  const phone = kind === 'phone';
  const html = `<div id="shot-sb" class="${phone ? 'sb-phone' : 'sb-pad'}" style="--sb:${ink}" aria-hidden="true"><span class="sb-t">${A.time}${phone ? '' : `<span class="sb-d">${A.date}</span>`}</span><span class="sb-r">${phone ? icon('cell-signal-full') : ''}${icon('wifi-high')}<span class="sb-bat"><i></i></span></span></div>${phone ? `<div id="shot-di"></div><div id="shot-hb" style="--sb:${ink}"></div>` : ''}`;
  await p.addStyleTag({ content: SB_CSS });
  await p.evaluate((h) => { document.body.insertAdjacentHTML('beforeend', h); }, html);
  await p.evaluate(() => document.fonts.ready);
}

// ---------- a device: a fresh browser, the demo's restaurant made at the site's dinner, in the language asked ----------
async function device(b, kind, lang, theme) {
  const ctx = await b.newContext({ viewport: DEV[kind].size, deviceScaleFactor: SCALE, colorScheme: theme, locale: { sr: 'sr-Latn-RS', en: 'en-GB', ru: 'ru-RU' }[lang], timezoneId: 'Europe/Belgrade' });
  await ctx.clock.install({ time: CLOCK });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  // the demo's start page fills the empty restaurant by itself (ui/launcher.jsx, DemoLauncher); the device after it —
  // with the device's own settings first when asked (prefs: the kitchen's light look), the page opened again on them
  const open = async (hash, prefs = null) => {
    await p.goto(`${BASE}${lang}-${kind}.html`);
    await p.waitForSelector('.launcher.demo');
    await p.waitForFunction(() => { try { return Object.keys(JSON.parse(localStorage.getItem('pos-proto-data-v1') || '{}').orders || {}).length > 0; } catch (e) { return false; } }, null, { timeout: 15000 });
    if (prefs) {
      await p.evaluate((x) => { const k = 'pos-proto-prefs-v1'; localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), ...x })); }, prefs);
      // (a page loaded anew — a change of the hash alone would keep the app as it was, its settings read)
      await p.goto(`${BASE}${lang}-${kind}.html?prefs#${hash}`);
    } else {
      await p.evaluate((h) => { window.location.hash = h; }, hash);
    }
    await settle();
  };
  // the toasts gone, the sheets open, the fonts in
  const settle = async (ms = 700) => {
    await p.waitForTimeout(ms);
    await p.clock.fastForward(6000);
    await p.waitForTimeout(400);
  };
  return { ctx, p, errs, open, settle, lang, kind, theme };
}

const pin = async (p) => {
  if (!(await p.waitForSelector('.lock', { timeout: 4000 }).catch(() => null))) return;
  for (const k of '1111') await p.locator('.lock .pin-key', { hasText: k }).first().click();
  await p.waitForSelector('.lock', { state: 'detached' });
};
// the back office's pages, by its menu: a section, then its page (ui/office.jsx, NAV)
const NAV = {
  analytics: { sr: 'Analitika', en: 'Analytics', ru: 'Аналитика' },
  reports: { sr: 'Izveštaji', en: 'Reports', ru: 'Отчёты' },
  forecast: { sr: 'Prognoza', en: 'Forecast', ru: 'Прогноз' },
  storage: { sr: 'Magacin', en: 'Stock', ru: 'Склад' },
  tech: { sr: 'Normativi', en: 'Recipes', ru: 'Техкарты' },
  sef: { sr: 'Fakture dobavljača', en: 'Supplier invoices', ru: 'Счета поставщиков' },
  team: { sr: 'Tim', en: 'Team', ru: 'Команда' },
  shifts: { sr: 'Smene i plate', en: 'Shifts and pay', ru: 'Смены и зарплата' },
  settings: { sr: 'Podešavanja', en: 'Settings', ru: 'Настройки' },
  locs: { sr: 'Restorani', en: 'Restaurants', ru: 'Рестораны' },
};
async function nav(d, group, page) {
  const { p, lang } = d;
  const g = p.locator(`.of-group-btn[aria-controls="of-sub-${group}"]`);
  if ((await g.getAttribute('aria-expanded')) !== 'true') await g.click();
  await p.locator(`#of-sub-${group} .of-sub-btn[title="${NAV[page][lang]}"]`).click();
  await d.settle(900);
}
async function officePage(d, group, page) {
  await d.open('office');
  await d.p.waitForSelector('.of-nav');
  await nav(d, group, page);
}
// the supplier invoices of the demo: its two example companies, connected to SEF (as test/sef.mjs in the app does it),
// and the vegetables' invoice opened — the supplier's lines matched to the restaurant's products
async function sefInvoice(d) {
  const { p } = d;
  await officePage(d, 'storage', 'sef');
  await p.click('#sef-demo-firms');
  await d.settle(500);
  await nav(d, 'settings', 'locs');
  const ids = await p.locator('#firms-card .firm-row').evaluateAll((els) => els.map((e) => e.id.replace('firm-', '')));
  for (const id of ids) {
    await p.locator('#firm-sef-' + id).scrollIntoViewIfNeeded();
    await p.click('#firm-sef-' + id);
    await p.waitForSelector('#sef-demo-connect');
    await p.click('#sef-demo-connect');
    await d.settle(500);
  }
  await nav(d, 'storage', 'sef');
  await p.waitForSelector('.sef-table');
  await p.locator('.sef-table tbody tr', { hasText: 'Povrće' }).click();
  await d.settle(900);
}
// the forecast with the site's words for the day typed in and taken (by the keywords, as the demo has no AI)
async function forecastDay(d) {
  const { p, lang } = d;
  await officePage(d, 'analytics', 'forecast');
  await p.fill('#fc-events', T[lang].home.forecast.screen.typed);
  await p.locator('.fc-ask-btns .btn').first().click();
  await d.settle(900);
}
const SHOTS = {
  // the front's iPad: the hall at dinner; delivery; a table's bill with the guest's card
  floor: { kind: 'pad', go: async (d) => { await d.open('ipad'); await pin(d.p); await d.settle(); } },
  delivery: { kind: 'pad', go: async (d) => { await d.open('ipad'); await pin(d.p); await d.p.locator('.tabbar .tab').nth(1).click(); await d.settle(); } },
  // the kitchen: dark, and (2 November, the owner: «Сделать и светлый») light — the look chosen on the screen itself
  kitchen: { kind: 'pad', go: async (d) => { await d.open('kds', d.theme === 'light' ? { kdsLight: true } : null); await d.settle(); } },
  // the waiter's iPhone: his tables…
  'waiter-tables': { kind: 'phone', go: async (d) => { await d.open('iphone'); await d.p.getByRole('button', { name: /Marko/ }).click(); await pin(d.p); await d.settle(); } },
  // …and its bill: how the guest pays, and the bill goes to the till (2 November: «Счёт на кассу»)
  'waiter-bill': { kind: 'phone', go: async (d) => { await d.open('iphone'); await d.p.getByRole('button', { name: /Marko/ }).click(); await pin(d.p); await d.p.locator('.ptable.pt-ready').first().click(); await d.settle(600); await d.p.locator('.ph-bar .btn').first().click(); await d.settle(900); } },
  // a table's bill on the iPad with the guest's card: the level's discount, the points
  guests: { kind: 'pad', go: async (d) => { await d.open('ipad'); await pin(d.p); await d.p.locator('.tbl[aria-label*=" 5,"], .tbl[aria-label$=" 5"]').first().click(); await d.settle(600); await d.p.locator('.ph-pill').filter({ hasText: /^(Gost|Guest|Гость)$/ }).first().click(); await d.settle(500); await d.p.fill('#guest-find', '381'); await d.p.waitForTimeout(300); await d.p.locator('.guest-row').first().click(); await d.settle(600); await d.p.locator('.cat-btn').nth(2).click(); await d.settle(900); } },
  // the guests' kiosk, upright, always light
  kiosk: { kind: 'port', theme: 'light', go: async (d) => { await d.open('kiosk'); await d.settle(); } },
  // the back office on the iPad
  tech: { kind: 'pad', go: async (d) => { await officePage(d, 'storage', 'tech'); } },
  // the reports: the site's question in plain words, and the report it makes — the week by day against the week before
  reports: { kind: 'pad', go: async (d) => { await officePage(d, 'analytics', 'reports'); const q = d.p.locator('.of-page input, .of-page textarea').first(); await q.fill(T[d.lang].home.examples.items.find((x) => x.id === 'reports').report.ask); await q.press('Enter'); await d.settle(1200); } },
  sef: { kind: 'pad', go: sefInvoice },
  // the team: the week's pay — hours × the rate, a share of the sales, the tips
  pay: { kind: 'pad', go: async (d) => { await officePage(d, 'team', 'shifts'); await d.p.getByRole('tab', { name: { sr: 'Plate', en: 'Pay', ru: 'Зарплата' }[d.lang] }).click(); await d.settle(900); } },
  forecast: { kind: 'pad', go: forecastDay },
  // for the demo's start page (build.mjs, demoPage): the back office's first page on a laptop; the guests' app on their
  // phone, always light; the pickup board over the counter, always dark
  office: { kind: 'lap', go: async (d) => { await d.open('office'); await d.p.waitForSelector('.of-nav'); await d.settle(900); } },
  'guest-app': { kind: 'phone', theme: 'light', go: async (d) => { await d.open('guest'); await d.settle(900); } },
  board: { kind: 'tv', theme: 'dark', go: async (d) => { await d.open('board'); await d.settle(900); } },
};

const b = await chromium.launch();
let n = 0;
let failed = 0;
for (const lang of LANGS) {
  for (const theme of THEMES) {
    for (const [name, s] of Object.entries(SHOTS)) {
      if (ONLY && !ONLY.includes(name)) continue;
      // a screen with a theme of its own (the board's dark, the kiosk's and the guests' app's light) is taken once
      if (s.theme && theme !== s.theme) continue;
      const d = await device(b, s.kind, lang, theme);
      try {
        await s.go(d);
        await d.p.mouse.move(0, DEV[s.kind].size.height - 1);
        await d.p.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
        await d.p.waitForTimeout(400);
        if (!DEV[s.kind].bare) await statusBar(d.p, s.kind, lang, theme === 'dark' ? '#FFFFFF' : '#000000');
        const dir = path.join(OUT, lang);
        mkdirSync(dir, { recursive: true });
        await d.p.screenshot({ path: path.join(dir, `${name}-${theme}.png`) });
        n += 1;
        console.log('ok  ', lang, theme, name, d.errs.length ? 'ERRORS ' + d.errs.join(' | ') : '');
      } catch (e) {
        failed += 1;
        console.log('FAIL', lang, theme, name, String(e.message || e).split('\n')[0]);
      }
      await d.ctx.close();
    }
  }
}
await b.close();
server.close();
rmSync(WORK, { recursive: true, force: true });
// .png → .webp, the .png gone
if (!PNG) execFileSync('python3', [path.join(ROOT, 'tools', 'webp.py'), OUT], { stdio: 'inherit' });
console.log(n + ' screenshots' + (failed ? ', ' + failed + ' FAILED' : ''));
process.exit(failed ? 1 : 0);
