// (15 November 2026, the owner: «Проверь теперь симметрию на ruvo.ac») what stands out of line on the built pages, at
// each width: a block in a centred column that is not in its middle, a section whose whole stands off the page's middle,
// a rule with more space on one side than on the other, like blocks side by side of two heights or with two gaps, the
// bar's sections not in the page's middle. Reads docs/ as it is (run `node build.mjs` first), nothing is changed.
//
//   node tools/symmetry.mjs                       every page of the three languages at 1440, 1005, 834 and 390
//   node tools/symmetry.mjs --pages=en/,en/cafe/ --widths=1440,390 --png   and full-page PNGs in tools/.look/symmetry/
//
// The app's drawn screens (`.scr`, the devices, the small things' tiles, the notices) keep the app's own grid and are
// not looked at. Exit code 1 when something is found.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const FONTS = process.env.FONTS || path.join(ROOT, '..', 'ruvo', 'app', 'fonts');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const PNG = process.argv.includes('--png');
const WIDTHS = arg('widths', '1440,1005,834,390').split(',').map(Number);
// every built page but the demo (the app) and the redirects
const pagesOf = (dir, rel = '') => readdirSync(dir).flatMap((n) => {
  const f = path.join(dir, n); const r = rel + n;
  if (statSync(f).isDirectory()) return /^(assets|demo|og)$/.test(n) ? [] : pagesOf(f, r + '/');
  return n === 'index.html' ? [rel] : [];
});
const PAGES = arg('pages', '') ? arg('pages', '').split(',') : pagesOf(DOCS).filter((p) => !/confirm|potvrda/.test(p));
const LOOK = path.join(ROOT, 'tools', '.look', 'symmetry');
if (PNG) mkdirSync(LOOK, { recursive: true });

// the fonts as the site asks for them (Google Fonts) — from the app's own files
const faces = existsSync(path.join(FONTS, 'faces.css'))
  ? readFileSync(path.join(FONTS, 'faces.css'), 'utf8').replace(/url\(\.\/([^)]+)\)/g, 'url(https://fonts.local/$1)') : '';

const probe = () => {
  const out = [];
  const W = document.documentElement.clientWidth; const sy = scrollY;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  const pth = (el) => { const a = []; let e = el; for (let i = 0; e && e !== document.body && i < 3; i++, e = e.parentElement) a.unshift(name(e)); return a.join(' > '); };
  const drawn = '.scr, .dv, svg, .shot, .mu, .rush, .kt, .nc, .op, .os, .ios-n, .ev, .evs, .tg, .side, .kio-no, .combo, .trio, .pair';
  const scroller = (el) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll|hidden)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) return true; } return false; };
  const all = [...document.querySelectorAll('main *, body > footer *, body > header *')].filter((e) => !e.closest(drawn) && vis(e));
  const y = (r) => Math.round(r.top + sy);
  // a block in a centred column, off its middle
  for (const el of all) {
    const p = el.parentElement; const cs = getComputedStyle(el), ps = getComputedStyle(p);
    if (/^(absolute|fixed)$/.test(cs.position) || /^inline/.test(cs.display) || scroller(el)) continue;
    const flexRow = /flex/.test(ps.display) && [...p.children].filter(vis).length > 1;
    if (flexRow) continue;
    const centred = ps.textAlign === 'center' || ps.justifyItems === 'center' || ps.justifyContent === 'center' || (cs.marginLeft === cs.marginRight && cs.marginLeft !== '0px');
    if (!centred) continue;
    const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
    const cl = pr.left + parseFloat(ps.paddingLeft) + parseFloat(ps.borderLeftWidth), cr = pr.right - parseFloat(ps.paddingRight) - parseFloat(ps.borderRightWidth);
    if (cr - cl < 40 || r.width > cr - cl - 8) continue;
    const off = ((r.left - cl) - (cr - r.right)) / 2;
    if (Math.abs(off) > 1 && Math.abs(off) < 60) out.push(['centre', `${pth(el)} is ${off.toFixed(1)} px off its column's middle`, y(r)]);
  }
  // a section's whole (what is drawn too: the first screen with its notice), against the page's middle
  for (const s of document.querySelectorAll('main > section, main > div')) {
    if (!vis(s)) continue;
    let L = 1e9, R = -1e9;
    for (const e of s.querySelectorAll('*')) {
      if (!vis(e) || scroller(e)) continue;
      // a box that only holds others (a column with its padding) is not what one sees: its words and its painted boxes are
      const es = getComputedStyle(e);
      const painted = es.backgroundColor !== 'rgba(0, 0, 0, 0)' || es.backgroundImage !== 'none' || es.borderTopWidth !== '0px' || es.boxShadow !== 'none';
      if (e.childElementCount && !painted && ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = e.getBoundingClientRect(); if (r.width >= W - 2 || r.right < 0 || r.left > W) continue;
      L = Math.min(L, r.left); R = Math.max(R, r.right);
    }
    const off = Math.round((L - (W - R)) / 2);
    if (L < 1e9 && Math.abs(off) > 1 && L > 0 && R < W && s.querySelector('.sec-head, .hero-text')) out.push(['whole', `${name(s)}: ${Math.round(L)} px at the left, ${Math.round(W - R)} at the right`, y(s.getBoundingClientRect())]);
  }
  // a rule (a top border) between two blocks: the space over it and under it
  for (const el of all) {
    const cs = getComputedStyle(el); const prev = el.previousElementSibling;
    if (cs.borderTopStyle === 'none' || cs.borderTopWidth === '0px' || cs.borderBottomWidth !== '0px' || !prev || !vis(prev)) continue;
    const r = el.getBoundingClientRect(), pr = prev.getBoundingClientRect(); const first = el.firstElementChild;
    const above = r.top - pr.bottom, below = first ? first.getBoundingClientRect().top - r.top - parseFloat(cs.borderTopWidth) : parseFloat(cs.paddingTop);
    if (above > 8 && below > 0 && Math.abs(above - below) > 2) out.push(['rule', `${pth(el)}: ${Math.round(above)} px over the rule, ${Math.round(below)} under it`, y(r)]);
  }
  // like blocks side by side: one height, one gap (cards and tiles — what has a ground or a frame)
  const seen = new Set();
  for (const c of all) {
    const kids = [...c.children].filter((k) => vis(k) && !k.closest(drawn) && !/^(absolute|fixed)$/.test(getComputedStyle(k).position));
    if (kids.length < 2) continue;
    const rows = {};
    for (const k of kids) { const t = Math.round(k.getBoundingClientRect().top / 2); (rows[t] = rows[t] || []).push(k); }
    for (const ks of Object.values(rows)) {
      if (ks.length < 2 || !ks.every((k) => k.className === ks[0].className && k.tagName === ks[0].tagName)) continue;
      const ground = ks.some((k) => { const cs = getComputedStyle(k); return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderTopWidth !== '0px' || cs.boxShadow !== 'none'; });
      const rs = ks.map((k) => k.getBoundingClientRect()).sort((p, q) => p.left - q.left);
      const hs = rs.map((r) => Math.round(r.height)); const gs = rs.slice(1).map((r, i) => Math.round(r.left - rs[i].right));
      const key = pth(c) + name(ks[0]); if (seen.has(key)) continue;
      if (ground && Math.max(...hs) - Math.min(...hs) > 1) { seen.add(key); out.push(['heights', `${pth(c)} > ${name(ks[0])}: heights ${hs.join(' / ')}`, y(rs[0])]); }
      else if (gs.length > 1 && Math.max(...gs) - Math.min(...gs) > 1 && Math.min(...gs) >= 0) { seen.add(key); out.push(['gaps', `${pth(c)} > ${name(ks[0])}: gaps ${gs.join(' / ')}`, y(rs[0])]); }
    }
  }
  // the bar: its sections' words in the page's middle
  const nav = document.querySelector('.top .nav');
  if (nav && vis(nav)) { const b = nav.getBoundingClientRect(); const off = (b.left + b.right) / 2 - W / 2; if (Math.abs(off) > 1) out.push(['bar', `the sections' words are ${off.toFixed(1)} px off the page's middle`, 0]); }
  return out;
};

const browser = await chromium.launch();
let found = 0;
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' });
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'fonts.googleapis.com') return faces ? route.fulfill({ contentType: 'text/css', body: faces }) : route.abort();
    if (u.host === 'fonts.local') return route.fulfill({ path: path.join(FONTS, path.basename(u.pathname)), contentType: 'font/woff2' });
    if (u.host === 'ruvo.local') {
      let p = decodeURIComponent(u.pathname); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(DOCS, p);
      return f.startsWith(DOCS) && existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' });
    }
    return route.abort();
  });
  const page = await ctx.newPage();
  for (const pg of PAGES) {
    await page.goto('http://ruvo.local/' + pg, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
    // the first screen's notice, standing still where it shows (with less motion it does not show at all)
    await page.addStyleTag({ content: '.evs .ev:first-child { opacity: 1 !important; animation: none !important; transform: none !important; }' });
    if (PNG) await page.screenshot({ path: path.join(LOOK, `${(pg || 'sr/').replace(/\/$/, '').replace(/\//g, '_') || 'sr'}-${w}.png`), fullPage: true });
    for (const [kind, what, at] of await page.evaluate(probe)) { found++; console.log(`${pg || '/'} ${w}  ${kind.padEnd(7)} ${what}  (y ${at})`); }
  }
  await ctx.close();
}
await browser.close();
console.log(found ? `${found} found` : 'nothing out of line');
process.exitCode = found ? 1 : 0;
