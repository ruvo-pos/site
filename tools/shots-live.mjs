// Screenshots of RUVO's screens that need the server, for the site's new parts (the owner, 14 November 2026: «Сайт
// заказов + RUVO Order», «Мотивация команды», «Деньги», «Бэкофис на iPhone + Telegram»): the real server on a
// throwaway PostgreSQL (../ruvo/server), the app (../ruvo/app/web) and the restaurants' ordering site (../ruvo/shop/web)
// as they are now, a day of sales made through the server's own API, at the devices' sizes of tools/shots.mjs with
// their status bars (tools/statusbar.mjs):
//   site          the ordering site on the guest's phone — a restaurant's page (the example restaurant of the site:
//                 its photos, its menu)
//   motivation    the waiter's iPhone, «Profil»: the month's pay, the shift's missions, the rating, the level, the badges
//   office-phone  the back office on the owner's iPhone: «Pregled» — the day's takings, the bills, the hours
// In Serbian, English and Russian, light and dark.
//   node tools/shots-live.mjs [--only=site,motivation] [--langs=sr] [--themes=light] [--png]
// Writes src/shots/<lang>/<name>-<theme>.webp (tools/webp.py from the .png; --png keeps the .png and writes to OUT=).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { statusBar } from './statusbar.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUVO = process.env.RUVO || path.join(ROOT, '..', 'ruvo');
const arg = (k) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3).split(',') : null; };
const LANGS = arg('langs') || ['sr', 'en', 'ru'];
const THEMES = arg('themes') || ['light', 'dark'];
const ONLY = arg('only');
const PNG = process.argv.includes('--png');
const OUT = PNG ? (process.env.OUT || path.join(ROOT, 'tools', '.look')) : path.join(ROOT, 'src/shots');
const SCALE = Number(process.env.SCALE || 1.5);
const PHONE = { size: { width: 440, height: 956 }, top: 62, bottom: 34 };
const PAD = { size: { width: 1210, height: 834 }, top: 24, bottom: 20 };
const LOCALE = { sr: 'sr-Latn-RS', en: 'en-GB', ru: 'ru-RU' };
// (14 November, 15:31, the owner: «кое-где съехавшие пилюли») the iPhone's glass tab bar: a screenshot's browser draws
// it half clear without the blur the phone puts behind it — the rows under it showed through, sharp; on the picture
// it is the frosted pill the eye sees on the phone, of the pill's own colour
export const GLASS = ' .phone .tabbar { background: var(--pill) !important; }';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const { startPg, freshDb, PEPPER } = await import(path.join(RUVO, 'server/test/helpers/pg.js'));
const { start } = await import(path.join(RUVO, 'server/src/index.js'));
const { pairDevice } = await import(path.join(RUVO, 'server/src/services/auth.js'));
const { tenantDb } = await import(path.join(RUVO, 'server/src/db/tenant.js'));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
// a static site: its files, every other address its index.html (the API's address in it this server's), its styles
// with the iPhone's safe areas (env(safe-area-inset-*) as the device gives them), the status bar's letters at
// /fonts/inter-*
let apiOrigin = '';
function site(dir, inset = PHONE) {
  const s = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (/^\/fonts\/inter-[a-z-]+-600-normal\.woff2$/.test(p)) {
      res.writeHead(200, { 'content-type': 'font/woff2' });
      res.end(readFileSync(path.join(ROOT, 'tools', p)));
      return;
    }
    let f = path.join(dir, p === '/' ? 'index.html' : p);
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) {
      if (p.startsWith('/assets/') || path.extname(p)) { res.writeHead(404); res.end(); return; }
      f = path.join(dir, 'index.html');
    }
    let body = readFileSync(f);
    if (f.endsWith('index.html')) body = Buffer.from(body.toString('utf8').replace('content="https://api.ruvo.ac"', `content="${apiOrigin}"`));
    if (f.endsWith('.css')) body = Buffer.from(body.toString('utf8').replace(/env\(safe-area-inset-(top|bottom|left|right)(?:,[^)]*)?\)/g, (m, side) => ({ top: inset.top, bottom: inset.bottom, left: 0, right: 0 }[side] + 'px')));
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(body);
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok({ s, origin: 'http://127.0.0.1:' + s.address().port })));
}

const pg = await startPg();
let srv;
let app;
let appPad;
let shop;
let b;
let db;
let n = 0;
let failed = 0;
try {
  db = await freshDb(pg, 't_site_shots');
  const tdb = tenantDb(db, 'main');
  app = await site(path.join(RUVO, 'app/web'));
  appPad = await site(path.join(RUVO, 'app/web'), PAD);
  shop = await site(path.join(RUVO, 'shop/web'));
  srv = await start({
    port: 0, pepper: PEPPER, seed: false, wsPingMs: 0, mailer: { async send() {} },
    db: { driver: 'pgwire', host: pg.url.hostname, port: Number(pg.url.port), user: 'pos', database: 't_site_shots', max: 10 },
    signup: { on: false, siteUrl: 'https://ruvo.ac', appUrl: app.origin, origins: [app.origin, appPad.origin], notify: null, dayMax: 100 },
    shop: { cardDemo: false, origins: [shop.origin], drive: { url: 'http://127.0.0.1:9' }, hookBase: 'https://api.ruvo.ac', geo: { off: true }, lettersMs: 0 },
  });
  const api = 'http://127.0.0.1:' + srv.port;
  apiOrigin = api;

  // ---------- a dinner of Dorćol: its devices, its waiters' bills, their shifts, the restaurant's motivation ----------
  const dev = async (role) => ({ ...(await pairDevice(tdb, { loc: 'dor', role })), role });
  const IPAD = await dev('ipad');
  const IPHONE = await dev('iphone');
  const OFFICE = await dev('office');
  const call = async (d, method, p, body, session) => {
    const r = await fetch(api + p, { method, headers: { 'content-type': 'application/json', authorization: 'Device ' + d.token, ...(session ? { 'x-session': session } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(method + ' ' + p + ' → ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
    return j;
  };
  const login = async (d, pin) => (await call(d, 'POST', '/v1/pin-login', { pin })).session;
  const bill = async (ses, table, items, method, tip = 0, open = false) => {
    const o = (await call(IPAD, 'POST', '/v1/orders', { table, items }, ses)).order;
    if (!open) await call(IPAD, 'POST', `/v1/orders/${o.id}/pay`, { version: o.version, method, tip }, ses);
  };
  const owner = await login(OFFICE, '9999');
  const office = (method, p, body) => call(OFFICE, method, p, { loc: 'dor', ...body }, owner);
  await office('PUT', '/v1/office/bonus-dishes', { pid: 'palacinke', amount: 40 });
  await office('PUT', '/v1/office/missions', { kind: 'dish', ref: 'palacinke', goal: 6, prize: 300 });
  await office('PUT', '/v1/office/missions', { kind: 'sales', goal: 40000, prize: 500 });
  await office('PUT', '/v1/office/rating', { by: 'sales', minBills: 2, prizes: [3000, 2000, 1000] });
  // the badges a month of a new restaurant reaches: four shifts, a third of the bills with a dessert, the first 10 000
  await office('PUT', '/v1/office/motivation', { rules: { marathon: { goal: 4 }, sweet: { share: 0.3, minBills: 3 }, millionaire: { tiers: [10000, 100000, 1000000] } }, off: [] });
  const marko = await login(IPAD, '1111');
  const jovana = await login(IPAD, '2222');
  const T = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
  const BILLS = [
    [marko, [{ pid: 'pljeskavica', qty: 2 }, { pid: 'sopska' }, { pid: 'palacinke', qty: 2 }, { pid: 'lemonade', qty: 2 }], 'card', 300],
    [jovana, [{ pid: 'carbonara' }, { pid: 'caesar' }, { pid: 'beer', qty: 2 }], 'cash', 200],
    [marko, [{ pid: 'carbonara', qty: 2 }, { pid: 'sopska' }, { pid: 'palacinke' }, { pid: 'rakija', qty: 2 }], 'card', 400],
    [marko, [{ pid: 'carbonara', qty: 2 }, { pid: 'cheesecake', qty: 2 }, { pid: 'espresso', qty: 2 }], 'card', 0],
    [jovana, [{ pid: 'pljeskavica' }, { pid: 'beer', qty: 2 }], 'card', 150],
    [marko, [{ pid: 'caesar', qty: 2 }, { pid: 'palacinke', qty: 2 }, { pid: 'orange', qty: 2 }], 'cash', 500],
    [jovana, [{ pid: 'borsch', qty: 2 }, { pid: 'napoleon', qty: 2 }, { pid: 'espresso', qty: 2 }], 'card', 0],
    [marko, [{ pid: 'pljeskavica', qty: 3 }, { pid: 'beer', qty: 3 }, { pid: 'palacinke' }], 'card', 600],
    [marko, [{ pid: 'omelet' }, { pid: 'avotoast' }, { pid: 'orange', qty: 2 }], 'card', 0, true],
    [jovana, [{ pid: 'pljeskavica', qty: 2 }, { pid: 'sopska', qty: 2 }, { pid: 'beer', qty: 2 }], 'card', 0, true],
  ];
  let ti = 0;
  for (const [ses, items, method, tip, open] of BILLS) await bill(ses, 'f' + (1 + (ti++ % 9)), items, method, tip, open);
  await db.query("update staff set rate = 450, pct = 2 where id in ('marko', 'jovana')");
  await db.query(`insert into shifts (company_id, loc, staff_id, start_at, end_at) values
    ('main', 'dor', 'marko', now() - interval '9 days 7 hours', now() - interval '9 days'),
    ('main', 'dor', 'marko', now() - interval '6 days 8 hours', now() - interval '6 days'),
    ('main', 'dor', 'marko', now() - interval '3 days 7 hours', now() - interval '3 days'),
    ('main', 'dor', 'marko', now() - interval '6 hours', null),
    ('main', 'dor', 'jovana', now() - interval '5 hours', null)`).catch((e) => console.log('shifts:', e.message));
  // «Novac»: the firm's books from 1 January for its two restaurants, Dorćol and Vračar — the places' balances that
  // day; each month the takings (cash into the register, cards and Wolt/Glovo into the bank), the cash carried to the
  // bank, the suppliers, the wages and their taxes, the rent, the bills, the platforms' and the bank's fees, VAT. A
  // month a little unlike the next.
  const M = await call(OFFICE, 'GET', '/v1/money', null, owner);
  await db.query("delete from money_places where unit_id in ('nbg', 'sav', 'zem')");
  await db.query("delete from money_units where id in ('nbg', 'sav', 'zem')");
  await db.query("update money_places set opening_day = '2026-01-01'");
  for (const [id, para] of [['bank', 182000000], ['cash-dor', 6500000], ['safe-dor', 14000000], ['cash-vra', 4200000], ['safe-vra', 9000000]]) await db.query('update money_places set opening = $2 where id = $1', [id, para]);
  const op = (b) => call(OFFICE, 'POST', '/v1/money/ops', { ...b, amount: Math.round(b.amount) * 100 }, owner);
  const SEASON = [0.82, 0.86, 0.95, 1.0, 1.08, 1.12, 1.18, 1.15, 1.06, 1.02, 0.98];
  for (let m = 1; m <= 11; m++) {
    const k = SEASON[m - 1];
    const mm = String(m).padStart(2, '0');
    const d = (x) => `2026-${mm}-${String(Math.min(x, m === 11 ? 13 : 28)).padStart(2, '0')}`;
    const part = m === 11 ? 13 / 30 : 1;
    for (const [u, f] of [['dor', 1], ['vra', 0.74]]) {
      const v = (x) => x * k * part * f;
      await op({ kind: 'in', day: d(28), place: 'cash-' + u, unit: u, article: 'sales_cash', amount: v(1240000) });
      await op({ kind: 'in', day: d(28), place: 'bank', unit: u, article: 'sales_card', amount: v(3380000), counterparty: 'Banca Intesa' });
      await op({ kind: 'in', day: d(20), place: 'bank', unit: u, article: 'sales_platform', amount: v(910000), counterparty: 'Wolt' });
      await op({ kind: 'in', day: d(21), place: 'bank', unit: u, article: 'sales_ips', amount: v(260000) });
      await op({ kind: 'out', day: d(16), place: 'bank', unit: u, article: 'sup_house', amount: v(95000), counterparty: 'Lilly' });
      await op({ kind: 'transfer', day: d(27), place: 'cash-' + u, to: 'bank', amount: v(1050000) });
      await op({ kind: 'out', day: d(10), place: 'bank', unit: u, article: 'sup_goods', amount: v(1240000), counterparty: 'Metro Cash & Carry' });
      await op({ kind: 'out', day: d(12), place: 'bank', unit: u, article: 'sup_goods', amount: v(430000), counterparty: 'Coca-Cola HBC' });
      if (m < 11 || part) await op({ kind: 'out', day: d(5), place: 'bank', unit: u, article: 'staff_pay', amount: 1080000 * f * (0.96 + k / 20) });
      await op({ kind: 'out', day: d(15), place: 'bank', unit: u, article: 'staff_tax', amount: 380000 * f });
      await op({ kind: 'out', day: d(3), place: 'bank', unit: u, article: 'rent', amount: 480000 * f, counterparty: 'Zakup' });
      await op({ kind: 'out', day: d(18), place: 'bank', unit: u, article: 'utilities', amount: (205000 + 240000 * Math.abs(k - 1)) * f, counterparty: 'EPS' });
      await op({ kind: 'out', day: d(22), place: 'bank', unit: u, article: 'platform_fee', amount: v(910000) * 0.27, counterparty: 'Wolt' });
    }
    await op({ kind: 'out', day: d(25), place: 'bank', unit: 'shared', article: 'acq_fee', amount: 3380000 * 1.74 * k * part * 0.018 });
    await op({ kind: 'out', day: d(8), place: 'bank', unit: 'shared', article: 'marketing', amount: 95000 + 30000 * (m % 3) });
    await op({ kind: 'out', day: d(14), place: 'bank', unit: 'shared', article: 'vat', amount: 520000 * 1.74 * k * part });
    await op({ kind: 'out', day: d(6), place: 'bank', unit: 'shared', article: 'it', amount: 24000 });
  }
  // the names in the shot's language (the seed's are Russian)
  const NAMES = {
    sr: { units: { dor: 'Dorćol', vra: 'Vračar', shared: 'Zajedničko' }, places: { bank: 'Tekući račun', 'cash-dor': 'Kasa · Dorćol', 'safe-dor': 'Sef · Dorćol', 'cash-vra': 'Kasa · Vračar', 'safe-vra': 'Sef · Vračar', card: 'Kartice — na putu', ips: 'IPS QR — na putu', deposit: 'Pazar — na putu', platform: 'Wolt i Glovo — na putu' } },
    en: { units: { dor: 'Dorćol', vra: 'Vračar', shared: 'Shared' }, places: { bank: 'Current account', 'cash-dor': 'Till · Dorćol', 'safe-dor': 'Safe · Dorćol', 'cash-vra': 'Till · Vračar', 'safe-vra': 'Safe · Vračar', card: 'Cards — in transit', ips: 'IPS QR — in transit', deposit: 'Cash deposit — in transit', platform: 'Wolt and Glovo — in transit' } },
    ru: { units: { dor: 'Дорчол', vra: 'Врачар', shared: 'Общее' }, places: {} },
  };
  const names = async (lang) => {
    const N = NAMES[lang];
    for (const [id, name] of Object.entries(N.units)) await db.query('update money_units set name = $2 where id = $1', [id, name]);
    for (const [id, name] of Object.entries(N.places)) await db.query('update money_places set name = $2 where id = $1', [id, name]);
    await db.query("update restaurants set name = $1 where id = 'dor'", [lang === 'ru' ? 'Дорчол' : 'Dorćol']);
    await db.query("update restaurants set name = $1 where id = 'vra'", [lang === 'ru' ? 'Врачар' : 'Vračar']);
    await db.query("update companies set name = $1 where id = 'main'", [{ sr: 'Naši restorani', en: 'Our restaurants', ru: 'Наши рестораны' }[lang]]);
  };
  const LEVELS = {
    sr: ['Početnik', 'Profi', 'Majstor'], en: ['Rookie', 'Pro', 'Master'], ru: ['Новичок', 'Профи', 'Мастер'],
  };

  b = await chromium.launch();
  const phone = async (lang, theme, origin, { device = null, prefs = null, kind = 'phone', key = 'ruvo-device', at = null } = {}) => {
    const D = kind === 'pad' ? PAD : PHONE;
    const ctx = await b.newContext({ viewport: D.size, deviceScaleFactor: SCALE, colorScheme: theme, locale: LOCALE[lang], timezoneId: 'Europe/Belgrade', isMobile: kind === 'phone', hasTouch: true });
    // the page's clock at the status bar's time (APP: the site's dinner, 21:41), so the times on the page agree with it
    if (at) await ctx.clock.setFixedTime(at);
    await ctx.addInitScript(({ device, prefs, lang, key }) => {
      try {
        if (device && !localStorage.getItem(key)) localStorage.setItem(key, device);
        if (prefs) localStorage.setItem('pos-proto-prefs-v1', prefs);
        localStorage.setItem('ruvo.lang', lang);
      } catch (e) { /* no storage */ }
    }, { device, prefs, lang, key });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(origin);
    return { ctx, p, errs, kind };
  };
  const devJson = (d) => JSON.stringify({ device: { id: d.id, token: d.token, loc: 'dor', role: d.role, company: 'main', restaurant: { id: 'dor', name: 'Dorćol' } }, session: null });
  const pin = async (p, code, sel = '.lock .pin-key') => {
    await p.waitForSelector(sel, { timeout: 15000 });
    for (const k of code) await p.locator(sel, { hasText: k }).first().click();
  };

  // the dinner of the status bar (APP in content.mjs: Wednesday 14 October, 21:41 in Belgrade)
  const DINNER = new Date('2026-10-14T21:41:00+02:00');
  const SHOTS = {
    site: async (lang, theme) => {
      const d = await phone(lang, theme, shop.origin + '/example', { at: DINNER });
      await d.p.waitForSelector('.dish', { timeout: 15000 });
      await d.p.addStyleTag({ content: '.example-note { display: none !important; }' });
      await d.p.waitForTimeout(1500);
      return d;
    },
    // (15 November, the owner on the «Сайт» tab: «Тут мало инфы») the guest's order on its page — the number on the house
    // plate, the steps, the dishes: the example restaurant's order, placed as a guest places it, while it cooks; its number
    // the notification's beside it (12)
    'site-order': async (lang, theme) => {
      const d = await phone(lang, theme, shop.origin + '/example', { at: DINNER });
      await d.p.waitForSelector('.dish .add', { timeout: 15000 });
      await d.p.locator('.dish .add').first().click();
      await d.p.waitForTimeout(400);
      if (await d.p.locator('.sheet .btn-main').count()) await d.p.locator('.sheet .btn-main').click();
      await d.p.locator('.bar-b').click();
      await d.p.waitForSelector('.bsheet .panel-go', { timeout: 10000 });
      await d.p.locator('.bsheet .panel-go').click();
      await d.p.waitForSelector('.bsheet .checkout #who-name', { timeout: 10000 });
      await d.p.locator('#who-name').fill({ sr: 'Ana', en: 'Ana', ru: 'Анна' }[lang]);
      await d.p.locator('#who-phone').fill('+381 64 111 2222');
      await d.p.locator('.pay:has(input[value="receipt"])').click();
      await d.p.locator('.send .btn-main').click();
      await d.p.waitForURL(/\/example\/o\//, { timeout: 15000 });
      await d.p.evaluate(() => {
        const k = 'ruvo-example-orders';
        const all = JSON.parse(sessionStorage.getItem(k) || '{}');
        const id = location.pathname.split('/').pop();
        if (all[id]) { all[id].num = 12; all[id].at = Date.now() - 40000; all[id].placedAt = new Date(Date.now() - 40000).toISOString(); }
        sessionStorage.setItem(k, JSON.stringify(all));
      });
      await d.p.reload();
      await d.p.waitForSelector('.order-stage', { timeout: 15000 });
      await d.p.addStyleTag({ content: '.example-note { display: none !important; }' });
      await d.p.waitForTimeout(1500);
      return d;
    },
    motivation: async (lang, theme) => {
      await names(lang);
      await office('PUT', '/v1/office/levels', { on: true, list: LEVELS[lang].map((name, i) => ({ name, from: [0, 30000, 60000][i], pct: [1, 1.5, 2][i] })) });
      const d = await phone(lang, theme, app.origin + '/', { device: devJson(IPHONE), prefs: JSON.stringify({ lang, theme }) });
      await pin(d.p, '1111');
      await d.p.waitForSelector('.lock', { state: 'detached', timeout: 10000 });
      await d.p.locator('.tabbar .tab').last().click();
      await d.p.waitForSelector('#pf-ach', { timeout: 10000 });
      // (14 November, 15:31, the owner: «кое-где съехавшие пилюли») the badges' toast gone before the shot; the pill over
      // the screen as on the phone — nothing of the rows under it drawn over it
      await d.p.waitForTimeout(1500);
      // (the last row's one tile, under the pill at the screen's foot, left out of the picture)
      await d.p.addStyleTag({ content: '.toasts, .toast { display: none !important; } .phone .pf-grid > :last-child:nth-child(3n+1) { visibility: hidden; }' + GLASS });
      await d.p.waitForTimeout(1800);
      return d;
    },
    money: async (lang, theme) => {
      await names(lang);
      const d = await phone(lang, theme, appPad.origin + '/eje', { kind: 'pad', key: 'ruvo-money', device: devJson(OFFICE), prefs: JSON.stringify({ lang, theme }) });
      await d.p.waitForSelector('.srv-office', { timeout: 15000 });
      if (!(await d.p.locator('.srv-pin .pin-key').count())) await d.p.locator('.srv-office-foot button').first().click();
      await pin(d.p, '9999', '.srv-pin .pin-key');
      await d.p.waitForSelector('.mn-app .of-main h1', { timeout: 15000 });
      const g = d.p.locator('[data-section="money"]').first();
      if ((await g.count()) && (await g.getAttribute('aria-expanded')) !== 'true') await g.click();
      await d.p.locator('[data-page="report"]:visible').first().click();
      await d.p.waitForTimeout(2500);
      return d;
    },
    'office-phone': async (lang, theme) => {
      await names(lang);
      const d = await phone(lang, theme, app.origin + '/', { device: devJson(OFFICE), prefs: JSON.stringify({ lang, theme }) });
      await pin(d.p, '9999', '.srv-pin .pin-key');
      await d.p.waitForSelector('.of-page, .of-main, .of-side', { timeout: 15000 });
      await d.p.waitForTimeout(2200);
      return d;
    },
  };

  for (const lang of LANGS) {
    for (const theme of THEMES) {
      for (const [name, go] of Object.entries(SHOTS)) {
        if (ONLY && !ONLY.includes(name)) continue;
        let d = null;
        try {
          d = await go(lang, theme);
          await d.p.mouse.move(0, (d.kind === 'pad' ? PAD : PHONE).size.height - 1);
          await d.p.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
          await statusBar(d.p, d.kind, lang, theme === 'dark' ? '#FFFFFF' : '#000000');
          const dir = path.join(OUT, lang);
          mkdirSync(dir, { recursive: true });
          await d.p.screenshot({ path: path.join(dir, `${name}-${theme}.png`) });
          n += 1;
          console.log('ok  ', lang, theme, name, d.errs.length ? 'ERRORS ' + d.errs.join(' | ') : '');
        } catch (e) {
          failed += 1;
          console.log('FAIL', lang, theme, name, String(e.message || e).split('\n')[0]);
          if (d) await d.p.screenshot({ path: path.join(OUT, `broke-${name}-${lang}-${theme}.png`) }).catch(() => {});
        }
        if (d) await d.ctx.close();
      }
    }
  }
} catch (e) {
  failed += 1;
  console.log('FAIL the run broke — ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e));
} finally {
  if (b) await b.close().catch(() => {});
  if (srv) await srv.stop().catch(() => {});
  for (const x of [app, appPad, shop]) if (x) await new Promise((r) => x.s.close(r));
  if (db) await db.end().catch(() => {});
  await pg.stop().catch(() => {});
}
if (!PNG && n) execFileSync('python3', [path.join(ROOT, 'tools', 'webp.py'), OUT], { stdio: 'inherit' });
console.log(n + ' screenshots' + (failed ? ', ' + failed + ' FAILED' : ''));
process.exit(failed ? 1 : 0);
