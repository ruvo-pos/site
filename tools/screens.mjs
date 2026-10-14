// The real screens on the first screen of ruvo.ac (src/screens/*.webp), shot from the demo that the site itself carries
// (src/demo/app.js, app.css) with its demo restaurant, at 12:20 in Belgrade, in the app's own fonts:
//   front-<lang>.webp — the front's floor plan on an iPad (1194 × 834, the iPad's status bar on top), 1400 px wide;
//   kds-<lang>.webp   — the kitchen screen (1280 × 800), 1100 px wide;
//   phone-<lang>.webp — the waiter's iPhone (440 × 956: status bar with the island, the app, the home bar): table 6,
//                       main dishes, two Ćevapi and a Pljeskavica picked, «Pošalji» at the bottom; 480 px wide.
// <lang> is sr and ru (the English page shows the Serbian screens: the app has no English).
//
// Needs Playwright with its Chromium: `node tools/screens.mjs`. Fonts come from Google Fonts like in the app; where
// that is closed (a sandbox), FONTS_DIR=<…/node_modules/@fontsource> with onest, unbounded and jetbrains-mono serves them
// locally. Where `playwright` is not installed next to the site, PLAYWRIGHT=<path to playwright/index.mjs>.
// Then `node build.mjs` — the screens get a new ?v= in their address by content.
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/screens');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const FONTS_DIR = process.env.FONTS_DIR || '';
const NOW = new Date('2026-10-14T12:20:00+02:00');
const LANGS = {
  sr: { locale: 'sr-Latn-RS', mains: /^Glavna jela$/, add: /^Dodaj/, picks: [/Ćevapi/, /Pljeskavica/, /Ćevapi/] },
  ru: { locale: 'ru-RU', mains: /^Горячее$/, add: /^Добавить/, picks: [/Чевапи/, /Плескавица/, /Чевапи/] },
};

const fontLinks = FONTS_DIR
  ? ['onest/400', 'onest/500', 'onest/600', 'onest/700', 'unbounded/600', 'unbounded/700', 'jetbrains-mono/600'].map((f) => `<link rel="stylesheet" href="/fs/${f}.css">`).join('')
  : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&family=Onest:wght@400;500;600;700&family=Unbounded:wght@600;700&display=swap">';
const appPage = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${fontLinks}<link rel="stylesheet" href="/app.css"></head><body><div id="app"></div><script>window.RUVO_DEMO = { lang: '${lang}', site: '/' };</script><script src="/app.js"></script></body></html>`;
// the devices' own bars, drawn: iPad (24 pt: time, Wi-Fi, battery), iPhone (54 pt: time, the island, signal, Wi-Fi,
// battery) and the iPhone's home bar (34 pt)
const ICONS = {
  signal: '<svg width="18" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3" width="3.2" height="9" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>',
  wifi: '<svg width="16" height="12" viewBox="0 0 17 12"><path d="M8.5 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.2C14 1.5 11.4.5 8.5.5S3 1.5 1 3.5l1.2 1.2C3.9 3.1 6.1 2.2 8.5 2.2zm0 3.4c1.5 0 2.9.6 3.9 1.5l1.2-1.2c-1.3-1.2-3.1-2-5.1-2s-3.8.8-5.1 2l1.2 1.2c1-.9 2.4-1.5 3.9-1.5zm0 3.4c.7 0 1.3.3 1.7.7L8.5 11.4 6.8 9.7c.4-.4 1-.7 1.7-.7z"/></svg>',
  battery: '<svg width="26" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="#000" opacity=".4"/><rect x="2" y="2" width="17" height="9" rx="2"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" opacity=".5"/></svg>',
};
const barPage = (kind) => {
  const css = 'html,body{margin:0;background:#fff}.b{position:relative;background:#fff;font:600 17px/1 Onest,system-ui,sans-serif;color:#000}.t{position:absolute;letter-spacing:-0.2px}.ic{position:absolute;display:flex;align-items:center}';
  const body = {
    pad: `<div class="b" style="width:1194px;height:24px"><span class="t" style="left:20px;top:6px;font-size:13px">12:20</span><span class="ic" style="right:20px;top:6px;gap:5px">${ICONS.wifi}${ICONS.battery}</span></div>`,
    phone: `<div class="b" style="width:440px;height:54px"><span class="t" style="left:44px;top:19px">12:20</span><span style="position:absolute;left:50%;top:11px;width:126px;height:37px;margin-left:-63px;background:#000;border-radius:19px"></span><span class="ic" style="right:30px;top:20px;gap:6px">${ICONS.signal}${ICONS.wifi}${ICONS.battery}</span></div>`,
    home: '<div class="b" style="width:440px;height:34px"><span style="position:absolute;left:50%;bottom:8px;width:144px;height:5px;margin-left:-72px;background:#000;border-radius:3px"></span></div>',
  }[kind];
  return `<!doctype html><html><head><meta charset="utf-8">${fontLinks}<style>${css}</style></head><body>${body}</body></html>`;
};

const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const send = (type, body) => { res.writeHead(200, { 'content-type': type }); res.end(body); };
  const page = u.match(/^\/(app|bar)-(\w+)\.html$/);
  if (page) return send('text/html; charset=utf-8', page[1] === 'app' ? appPage(page[2]) : barPage(page[2]));
  if (u === '/app.js' || u === '/app.css') return send(TYPES[path.extname(u)], readFileSync(path.join(ROOT, 'src/demo', u.slice(1))));
  if (FONTS_DIR && u.startsWith('/fs/')) {
    const f = path.join(FONTS_DIR, u.slice(4));
    if (f.startsWith(FONTS_DIR) && existsSync(f) && statSync(f).isFile()) return send(TYPES[path.extname(f)] || 'application/octet-stream', readFileSync(f));
  }
  res.writeHead(404); res.end('no');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const errors = [];
const shot = async (lang, vp, scale, mobile, hash, act) => {
  const c = await browser.newContext({ viewport: vp, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile, locale: LANGS[lang].locale, timezoneId: 'Europe/Belgrade', storageState: STATE[lang] });
  await c.clock.install({ time: new Date(NOW.getTime() + 5000) });
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(`${lang} ${hash}: ${e.message}`));
  await p.goto(`${BASE}app-${lang}.html${hash}`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  await act(p);
  const png = await p.screenshot();
  await c.close();
  return png;
};
const bar = async (kind, w, h, scale) => {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const p = await c.newPage();
  await p.goto(`${BASE}bar-${kind}.html`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  const png = await p.screenshot();
  await c.close();
  return png;
};
const pin = async (p, code) => {
  await p.waitForSelector('.lock', { timeout: 8000 });
  for (const d of code) await p.click(`.pin-key[aria-label="${d}"]`);
  await p.waitForTimeout(900);
};

// the demo restaurant, filled once per language at 12:20
const STATE = {};
for (const lang of Object.keys(LANGS)) {
  const c = await browser.newContext({ viewport: { width: 1194, height: 834 }, locale: LANGS[lang].locale, timezoneId: 'Europe/Belgrade' });
  await c.clock.install({ time: NOW });
  const p = await c.newPage();
  await p.goto(`${BASE}app-${lang}.html`);
  await p.waitForSelector('.l-title');
  await p.waitForTimeout(2500);
  STATE[lang] = await c.storageState();
  await c.close();
}

const bars = { pad: await bar('pad', 1194, 24, 2), phone: await bar('phone', 440, 54, 3), home: await bar('home', 440, 34, 3) };
// stack the pieces and save as WebP in the browser's own encoder (no image library needed)
const encoder = await (await browser.newContext()).newPage();
const save = async (name, pieces, width) => {
  const data = await encoder.evaluate(async ({ pieces, width }) => {
    const imgs = await Promise.all(pieces.map((b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64; })));
    const fullW = imgs[0].naturalWidth;
    const fullH = imgs.reduce((s, i) => s + i.naturalHeight, 0);
    const stack = document.createElement('canvas');
    stack.width = fullW; stack.height = fullH;
    let y = 0;
    for (const i of imgs) { stack.getContext('2d').drawImage(i, 0, y); y += i.naturalHeight; }
    // down to the size on the site in halving steps, so the text stays sharp
    let cur = stack;
    while (cur.width / 2 >= width) {
      const half = document.createElement('canvas');
      half.width = Math.round(cur.width / 2); half.height = Math.round(cur.height / 2);
      const g = half.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, half.width, half.height);
      cur = half;
    }
    const out = document.createElement('canvas');
    out.width = width; out.height = Math.round(fullH * width / fullW);
    const g = out.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, out.width, out.height);
    return { url: out.toDataURL('image/webp', 0.88), w: out.width, h: out.height };
  }, { pieces: pieces.map((b) => b.toString('base64')), width });
  writeFileSync(path.join(OUT, name), Buffer.from(data.url.split(',')[1], 'base64'));
  console.log(`src/screens/${name}: ${data.w} × ${data.h}`);
};

for (const [lang, L] of Object.entries(LANGS)) {
  const front = await shot(lang, { width: 1194, height: 810 }, 2, false, '#ipad', async (p) => {
    await pin(p, '1111');
    await p.waitForSelector('.hall');
    await p.waitForTimeout(700);
  });
  await save(`front-${lang}.webp`, [bars.pad, front], 1400);
  const kds = await shot(lang, { width: 1280, height: 800 }, 2, false, '#kds', async (p) => { await p.waitForTimeout(900); });
  await save(`kds-${lang}.webp`, [kds], 1100);
  const phone = await shot(lang, { width: 440, height: 868 }, 3, true, '#iphone', async (p) => {
    await p.click('button:has-text("Marko")');
    await pin(p, '1111');
    await p.waitForSelector('.ptable');
    await p.click('.ptable:has(.pt-n:text-is("6"))');
    await p.waitForTimeout(500);
    await p.click('.guest-btn:has-text("4")');
    await p.waitForTimeout(800);
    await p.locator('.chip', { hasText: L.mains }).first().click();
    await p.waitForTimeout(400);
    for (const rx of L.picks) {
      await p.locator('.row-item', { hasText: rx }).first().click();
      await p.waitForTimeout(500);
      const add = p.locator('.sheet button', { hasText: L.add }).first();
      if (await add.count()) { await add.click(); await p.waitForTimeout(500); }
    }
    await p.waitForTimeout(400);
  });
  await save(`phone-${lang}.webp`, [bars.phone, phone, bars.home], 480);
}
await browser.close();
server.close();
if (errors.length) { console.log('page errors:\n' + errors.join('\n')); process.exit(1); }
