// The picture a link to the site shows in a messenger or a social network (og:image, 1200×630; the owner, 2 November:
// «Е — сделать»): each landing page's first screen as it is drawn — the wordmark, the page's words at the left, its
// scene at the right (the iPad and the kitchen's ticket, the kiosk standing…) — in its language, light, standing still.
// It is taken from the built pages (docs/, node build.mjs first), served here with the site's letters from files: Inter
// (tools/fonts, the weight the words use) and the app's Onest and JetBrains Mono from the ruvo checkout beside this one
// (FONTS= to point elsewhere), as tools/shots.mjs takes them.
//   node tools/og.mjs [--langs=sr] [--only=home,cafe]   → src/og/<lang>/<page>.png (page: home or a kind of venue)
// build.mjs puts each page's own picture in its head (og:image), the home page's on the pages that have none.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VENUE_KEYS, VENUE_SLUGS } from '../src/venues.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const arg = (k) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3).split(',') : null; };
const LANGS = arg('langs') || ['sr', 'en', 'ru'];
const ONLY = arg('only');
const FONTS = process.env.FONTS || path.join(ROOT, '..', 'ruvo', 'app', 'fonts');
const LANG_DIR = { sr: '', en: 'en/', ru: 'ru/' };
// the landing pages: the home page, and each kind of venue that has its page
const pages = (lang) => [['home', LANG_DIR[lang]], ...VENUE_KEYS.filter((k) => existsSync(path.join(DOCS, LANG_DIR[lang], VENUE_SLUGS[lang][k], 'index.html'))).map((k) => [k, `${LANG_DIR[lang]}${VENUE_SLUGS[lang][k]}/`])];

// the built site, and the letters instead of Google's
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  let f = path.join(DOCS, decodeURIComponent(req.url.split('?')[0]));
  if (f.endsWith('/')) f = path.join(f, 'index.html');
  if (!f.startsWith(DOCS) || !existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const appFaces = readFileSync(path.join(FONTS, 'faces.css'), 'utf8').replace(/url\(\.\/([\w.-]+)\)/g, 'url(https://fonts.gstatic.com/local/app/$1)');
const RANGES = { latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD', 'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF', cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' };
const inter = Object.entries(RANGES).map(([k, r]) => `@font-face { font-family: "Inter"; font-weight: 400 700; src: url(https://fonts.gstatic.com/local/inter/inter-${k}-600-normal.woff2) format("woff2"); unicode-range: ${r}; }`).join('\n');

// the card: the wordmark, the eyebrow and the title at the left; the page's scene at the right, at rest
const CARD_CSS = `
#og { position: fixed; inset: 0; z-index: 2147483647; display: grid; grid-template-columns: 350px minmax(0, 1fr); align-items: center; gap: 24px; padding: 0 36px 0 56px; background: #FFFFFF; color: #1D1D1F; }
#og .og-t { display: grid; justify-items: start; gap: 18px; }
#og .wordmark { font-size: 22px; padding: 10px 14px 9px calc(14px + 0.08em); border-radius: 8px; }
#og .wordmark::after { inset: 3px; border-radius: 6px; }
#og .eyebrow { font-size: 22px; }
#og .eyebrow .i { width: 26px; height: 26px; }
#og h1 { margin: 0; font-size: 50px; font-weight: 600; line-height: 1.05; letter-spacing: -0.032em; text-align: left; text-wrap: balance; }
/* the scene larger, its cards a little smaller than on the page: the device carries the picture */
#og .stage { width: 100%; max-width: none; margin: 0; grid-template-columns: minmax(0, 1fr) 200px; }
#og .stage-side { zoom: 0.82; }
#og .stage.stage--port { grid-template-columns: auto 200px; }
#og .stage.stage--port .stage-dev { width: 340px; }
#og .evs { display: none; }
`;

const b = await chromium.launch();
let n = 0;
for (const lang of LANGS) {
  for (const [key, url] of pages(lang)) {
    if (ONLY && !ONLY.includes(key)) continue;
    const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: appFaces + '\n' + inter }));
    await ctx.route('https://fonts.gstatic.com/local/**', (r) => {
      const [, , kind, file] = new URL(r.request().url()).pathname.split('/');
      r.fulfill({ contentType: 'font/woff2', body: readFileSync(kind === 'app' ? path.join(FONTS, file) : path.join(ROOT, 'tools', 'fonts', file)) });
    });
    const p = await ctx.newPage();
    await p.goto(BASE + url);
    await p.addStyleTag({ content: CARD_CSS });
    await p.evaluate(() => {
      const og = document.createElement('div');
      og.id = 'og';
      const t = document.createElement('div');
      t.className = 'og-t';
      const mark = document.querySelector('.top .wordmark').cloneNode(true);
      mark.removeAttribute('href');
      t.append(mark, document.querySelector('.hero .eyebrow').cloneNode(true), document.querySelector('.hero h1').cloneNode(true));
      const stage = document.querySelector('.hero .stage').cloneNode(true);
      stage.classList.remove('live');
      og.append(t, stage);
      document.body.append(og);
    });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    const dir = path.join(ROOT, 'src', 'og', lang);
    mkdirSync(dir, { recursive: true });
    await p.screenshot({ path: path.join(dir, `${key}.png`) });
    n += 1;
    console.log('ok  ', lang, key);
    await ctx.close();
  }
}
await b.close();
server.close();
console.log(n + ' pictures');
