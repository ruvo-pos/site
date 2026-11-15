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
// --store (15 November: the App Store's screenshots of RUVO, the staff's app ac.ruvo.pos): the front's, the kitchen's,
// the waiter's and the owner's screens at the sizes App Store Connect takes — the iPad Pro 13″ on its side, 1376×1032
// points at 2× (2752×2064), the iPhone 6.9″, 440×956 at 3× (1320×2868) —, light, from the app's own demo build as it is
// now (DEMO= — ../ruvo/app/dist/demo, made by its build.mjs), as .png in OUT= (tools/.store/<lang>/).
//   node tools/shots.mjs --store [--langs=en] [--only=floor]
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP, PRICES, T } from '../src/content.mjs';
import { statusBar } from './statusbar.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3).split(',') : null; };
const STORE = process.argv.includes('--store');
const LANGS = arg('langs') || ['sr', 'en', 'ru'];
const THEMES = arg('themes') || (STORE ? ['light'] : ['light', 'dark']);
// the App Store's: the hall, a table's bill, the kitchen, the reports on the iPad; the waiter's order at the table and
// the guest's bill, the owner's back office on the iPhone
const ONLY = arg('only') || (STORE ? ['floor', 'guests', 'kitchen', 'reports', 'waiter-order', 'waiter-bill', 'office-phone'] : null);
const PNG = STORE || process.argv.includes('--png');
const OUT = STORE ? (process.env.OUT || path.join(ROOT, 'tools', '.store')) : PNG ? (process.env.OUT || path.join(ROOT, 'tools', '.look')) : path.join(ROOT, 'src/shots');
const DEMO = process.env.DEMO || (STORE ? path.join(ROOT, '..', 'ruvo', 'app', 'dist', 'demo') : path.join(ROOT, 'src/demo'));
const FONTS = process.env.FONTS || path.join(ROOT, '..', 'ruvo', 'app', 'fonts');
const SCALE = Number(process.env.SCALE || 1.5);
const CLOCK = new Date('2026-10-14T21:41:00+02:00');
// the devices: the screen's points and its safe areas
const DEV = {
  pad: STORE ? { size: { width: 1376, height: 1032 }, top: 24, bottom: 20, scale: 2 } : { size: { width: 1210, height: 834 }, top: 24, bottom: 20 },
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
copyFileSync(path.join(DEMO, 'app.js'), path.join(WORK, 'app.js'));
// the demo dishes' photos beside the bundle (app/src/ui/dish-photos.js reads them from the bundle's own folder)
if (existsSync(path.join(DEMO, 'dishes'))) {
  mkdirSync(path.join(WORK, 'dishes'));
  for (const f of readdirSync(path.join(DEMO, 'dishes'))) copyFileSync(path.join(DEMO, 'dishes', f), path.join(WORK, 'dishes', f));
}
for (const f of readdirSync(FONTS).filter((x) => x.endsWith('.woff2'))) copyFileSync(path.join(FONTS, f), path.join(WORK, 'fonts', f));
for (const f of readdirSync(path.join(ROOT, 'tools', 'fonts')).filter((x) => x.endsWith('.woff2'))) copyFileSync(path.join(ROOT, 'tools', 'fonts', f), path.join(WORK, 'fonts', f));
const faces = readFileSync(path.join(FONTS, 'faces.css'), 'utf8').replace(/url\(\.\//g, 'url(fonts/');
const css = readFileSync(path.join(DEMO, 'app.css'), 'utf8');
for (const [kind, d] of Object.entries(DEV)) {
  const inset = { top: d.top, bottom: d.bottom, left: 0, right: 0 };
  writeFileSync(path.join(WORK, `app-${kind}.css`), css.replace(/env\(safe-area-inset-(top|bottom|left|right)(?:,[^)]*)?\)/g, (m, side) => `${inset[side]}px`));
  for (const lang of ['sr', 'en', 'ru']) {
    const config = JSON.stringify({ lang, site: './', prices: PRICES }).replace(/</g, '\\u003c');
    writeFileSync(path.join(WORK, `${lang}-${kind}.html`), `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${faces}</style><link rel="stylesheet" href="app-${kind}.css"></head><body><div id="app"></div><script>window.RUVO_DEMO = ${config};</script><script src="app.js"></script></body></html>`);
  }
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  const f = path.join(WORK, decodeURIComponent(req.url.split('?')[0].replace(/^\/+/, '')));
  if (!f.startsWith(WORK + path.sep) || !existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

// ---------- the status bar (tools/statusbar.mjs) ----------

// ---------- a device: a fresh browser, the demo's restaurant made at the site's dinner, in the language asked ----------
async function device(b, kind, lang, theme) {
  const ctx = await b.newContext({ viewport: DEV[kind].size, deviceScaleFactor: STORE ? DEV[kind].scale || 3 : SCALE, colorScheme: theme, locale: { sr: 'sr-Latn-RS', en: 'en-GB', ru: 'ru-RU' }[lang], timezoneId: 'Europe/Belgrade' });
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
  // (14 November: the back office's menu of 9 November — the recipes open from «Jela», the supplier invoices from
  // «Prijemnice»)
  menu: { sr: 'Artikli', en: 'Items', ru: 'Номенклатура' },
  dishes: { sr: 'Jela', en: 'Dishes', ru: 'Блюда' },
  docin: { sr: 'Prijemnice', en: 'Goods received', ru: 'Приходные накладные' },
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
  const byId = p.locator(`#of-sub-${group} [data-page="${page}"]`);
  if (await byId.count()) await byId.first().click();
  else await p.locator(`#of-sub-${group} .of-sub-btn[title="${NAV[page][lang]}"]`).click();
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
  const sefPage = async () => { await nav(d, 'storage', 'docin'); await p.click('#doc-sef'); await d.settle(700); };
  await d.open('office');
  await p.waitForSelector('.of-nav');
  await sefPage();
  await p.click('#sef-demo-firms');
  await d.settle(500);
  await nav(d, 'settings', 'locs');
  if (!(await p.locator('#firms-card').count())) { await p.locator('.set-tabs .seg-btn', { hasText: { sr: 'Kompanija', en: 'Company', ru: 'Компания' }[d.lang] }).first().click(); await d.settle(600); }
  const ids = await p.locator('#firms-card .firm-row').evaluateAll((els) => els.map((e) => e.id.replace('firm-', '')));
  for (const id of ids) {
    await p.locator('#firm-sef-' + id).scrollIntoViewIfNeeded();
    await p.click('#firm-sef-' + id);
    await p.waitForSelector('#sef-demo-connect');
    await p.click('#sef-demo-connect');
    await d.settle(500);
  }
  await sefPage();
  await p.waitForSelector('.sef-table');
  await p.locator('.sef-table tbody tr', { hasText: 'Povrće' }).click();
  await d.settle(900);
}
// the forecast with the site's words for the day typed in and taken (by the keywords, as the demo has no AI)
async function forecastDay(d) {
  const { p, lang } = d;
  await officePage(d, 'analytics', 'forecast');
  // (14 November: the day's events in a sheet of their own, «Uračunaj» at its foot)
  await p.click('#fc-add');
  await p.fill('#fc-events', T[lang].home.forecast.screen.typed);
  await p.locator('.sheet .btn-primary, .sheet .btn.primary, .sheet-foot .btn').last().click();
  await d.settle(1200);
  await p.keyboard.press('Escape').catch(() => {});
  await d.settle(600);
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
  // (15 November) the fast food's page (venues.mjs): the kiosk with the whole menu (prefs.kioskAll), the mains open, a
  // burger and a pljeskavica in the basket — the order the kitchen's ticket beside it shows
  'kiosk-mains': { kind: 'port', theme: 'light', go: async (d) => {
    const { p, lang } = d;
    await d.open('kiosk', { kioskAll: true });
    await p.locator('.ks-pill[data-cat="mains"]').click();
    await d.settle(600);
    for (const name of [{ sr: 'Burger sa junetinom', en: 'Beef burger', ru: 'Бургер с говядиной' }, { sr: 'Pljeskavica', en: 'Pljeskavica', ru: 'Плескавица' }]) {
      await p.locator('#ks-mains .ks-card', { has: p.locator('.ks-name', { hasText: new RegExp('^' + name[lang].replace(/ /g, '\\s') + '$') }) }).first().click();
      await d.settle(400);
      await p.locator('.ks-modal-foot .ks-primary').click();
      await d.settle(400);
    }
    await p.locator('.ks-pill[data-cat="mains"]').click();
    await d.settle(900);
  } },
  // the back office on the iPad
  tech: { kind: 'pad', go: async (d) => { await officePage(d, 'menu', 'dishes'); await d.p.click('#dish-techs'); await d.p.waitForSelector('.tech-layout'); await d.settle(900); } },
  // the reports: the site's question in plain words, and the report it makes — the week by day against the week before
  reports: { kind: 'pad', go: async (d) => { await officePage(d, 'analytics', 'reports'); const q = d.p.locator('.of-page input, .of-page textarea').first(); await q.fill(T[d.lang].home.examples.items.find((x) => x.id === 'reports').report.ask); await q.press('Enter'); await d.settle(1200); } },
  sef: { kind: 'pad', go: sefInvoice },
  // the team: the week's pay — hours × the rate, a share of the sales, the tips
  pay: { kind: 'pad', go: async (d) => { await officePage(d, 'team', 'shifts'); await d.p.getByRole('tab', { name: { sr: 'Plate', en: 'Pay', ru: 'Зарплата' }[d.lang] }).click(); await d.settle(900); } },
  forecast: { kind: 'pad', go: forecastDay },
  // for the demo's start page (build.mjs, demoPage): the back office's first page on a laptop; the guests' app on their
  // phone, always light; the pickup board over the counter, always dark
  office: { kind: 'lap', go: async (d) => { await d.open('office'); await d.p.waitForSelector('.of-nav'); await d.settle(900); } },
  // (--store) the waiter takes the order at the table: the mains, two dishes added, «Send» at the foot
  'waiter-order': { kind: 'phone', store: true, go: async (d) => {
    await d.open('iphone'); await d.p.getByRole('button', { name: /Marko/ }).click(); await pin(d.p); await d.p.locator('.ptable.pt-ready').first().click(); await d.settle(600);
    await d.p.locator('.ph-bar .btn-primary').click(); await d.settle(900);
    await d.p.locator('.chip').nth(2).click(); await d.settle(400);
    for (const i of [4, 8, 8]) { await d.p.locator('.row-hit').nth(i).click(); await d.settle(300); }
    await d.settle(600);
  } },
  // (--store) the owner's back office on the iPhone: the day's summary
  'office-phone': { kind: 'phone', store: true, go: async (d) => { await d.open('office'); await d.p.waitForSelector('.of-main, .of-page'); await d.settle(900); } },
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
      if (s.store && !STORE) continue;
      // a screen with a theme of its own (the board's dark, the kiosk's and the guests' app's light) is taken once
      if (s.theme && theme !== s.theme) continue;
      const d = await device(b, s.kind, lang, theme);
      try {
        await s.go(d);
        await d.p.mouse.move(0, DEV[s.kind].size.height - 1);
        await d.p.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
        await d.p.waitForTimeout(400);
        // (14 November, 15:31: «съехавшие пилюли») the glass tab bar as the phone shows it, frosted (tools/shots-live.mjs)
        await d.p.addStyleTag({ content: '.phone .tabbar { background: var(--pill) !important; }' });
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
