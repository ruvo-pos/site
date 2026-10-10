// Makes the RUVO website (ruvo.ac) from src/content.mjs and src/site.css. No dependencies.
//   node build.mjs            → docs/     what GitHub Pages serves (Settings → Pages → branch main, folder /docs);
//                                         links between pages end in "/" (ruvo.ac/en/privacy/)
//   node build.mjs --preview  → preview/  the same pages for the private Claude preview: links end in "index.html",
//                                         and the Serbian home page has no skeleton of its own (the preview adds one)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, SITE, T } from './src/content.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW = process.argv.includes('--preview');
const OUT = path.join(ROOT, PREVIEW ? 'preview' : 'docs');
const ORIGIN = `https://${SITE.domain}`;
const PAGES = ['home', 'privacy', 'support'];
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

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mail = `<a href="mailto:${SITE.email}">${SITE.email}</a>`;
// typesetting in running text: a number stays with its word ("30 dana", "10 минут"), a one-letter word with the
// next one ("i magacin", "в бэкофисе"), and a hyphenated word on one line ("iPad-u", "back-office-a")
const keep = (html) => html.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part : part
  .replace(/(\d) (?=\p{L})/gu, '$1\u00A0')
  .replace(/(^|[\s(\u00A0])(\p{L}) /gu, '$1$2\u00A0')
  .replace(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu, '<span class="nw">$&</span>'))).join('');
// plain text from content.mjs: escaped, with the address made a link
const txt = (s) => keep(esc(s)).split(SITE.email).join(mail);
// the company's details go where the texts say {company}, {pib}, {address}, {email}
const fill = (s) => keep(s)
  .replace(/\{company\}/g, esc(SITE.company))
  .replace(/\{pib\}/g, SITE.pib)
  .replace(/\{address\}/g, esc(SITE.address))
  .replace(/\{email\}/g, mail);

const fileOf = (lang, page) => T[lang].paths[page];
// a link from one page to another, relative, so the pages work anywhere they are served
function href(from, to, hash = '') {
  let r = path.posix.relative(path.posix.dirname(from), to);
  if (!PREVIEW) r = r.replace(/(^|\/)index\.html$/, '$1') || './';
  return r + hash;
}
const urlOf = (file) => `${ORIGIN}/${file.replace(/(^|\/)index\.html$/, '$1')}`;

function head(lang, page, file, title, description) {
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlOf(fileOf(l, page))}">`);
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${esc(title)}</title>`,
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

function page(lang, key, file, title, description, body) {
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
${head(lang, key, file, title, description)}
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
<nav class="nav" aria-label="${esc(t.ui.menuLabel)}">${section('features', t.nav.features)}${section('start', t.nav.start)}${section('contact', t.nav.contact)}</nav>
<nav class="langs" aria-label="${esc(t.ui.langLabel)}">${langs.join('')}</nav>
</div></header>`;
}

function footer(lang, key, file) {
  const t = T[lang];
  const link = (p) => `<a href="${href(file, fileOf(lang, p))}"${p === key ? ' aria-current="page"' : ''}>${esc(t.nav[p])}</a>`;
  return `<footer class="foot"><div class="wrap foot-in">
<div class="foot-co"><a class="wordmark sm" href="${href(file, fileOf(lang, 'home'))}" aria-label="RUVO — ${esc(t.nav.home)}">RUVO</a><p>${esc(SITE.company)} · ${esc(t.tax)} ${SITE.pib}<br>${esc(SITE.address)}</p></div>
<nav class="foot-nav" aria-label="${esc(t.ui.footLabel)}"><ul><li>${link('privacy')}</li><li>${link('support')}</li><li>${mail}</li></ul><p>${esc(t.home.made)} © ${SITE.updated.iso.slice(0, 4)}</p></nav>
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

function homePage(lang) {
  const t = T[lang];
  const h = t.home;
  const file = fileOf(lang, 'home');
  const house = SITE.address.match(/\s(\d+[a-z]?),/i)[1];
  const soon = h.integrations.length - 1;
  const body = `<div class="tiles" aria-hidden="true"></div>
${header(lang, 'home', file)}
<main id="main">
<section class="hero"><div class="wrap hero-in">
<div class="hero-text">
<p class="eyebrow">${esc(h.eyebrow)}</p>
<h1>${txt(h.h1)}</h1>
<p class="lead">${txt(h.lead)}</p>
<div class="cta-row"><a class="btn" href="mailto:${SITE.email}">${MAIL_ICON}${esc(h.cta)}</a><span class="trial">${esc(h.trial)}</span></div>
</div>
${scene(lang)}
</div></section>
<section class="band raised" id="features" aria-labelledby="features-h"><div class="wrap">
<div class="sec-head"><h2 id="features-h">${esc(h.featuresTitle)}</h2></div>
<ul class="feats">${h.features.map(([tag, title, text]) => `
<li class="feat"><span class="feat-tag">${esc(tag)}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ul>
<div class="integr"><h3 class="integr-title">${esc(h.integrationsTitle)}</h3><ul>${h.integrations.map((x, i) => `<li${i === soon ? ' class="soon"' : ''}>${esc(x)}</li>`).join('')}</ul></div>
</div></section>
<section class="band" id="start" aria-labelledby="start-h"><div class="wrap">
<div class="sec-head"><h2 id="start-h">${esc(h.startTitle)}</h2></div>
<ol class="steps">${h.start.map(([title, text], i) => `
<li class="step"><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${txt(title)}</h3><p>${txt(text)}</p></li>`).join('')}
</ol>
<p class="note"><span class="note-i" aria-hidden="true">i</span><span>${txt(h.fiscal)}</span></p>
</div></section>
<section class="band raised" id="contact" aria-labelledby="contact-h"><div class="wrap contact-in">
<div class="sec-head"><h2 id="contact-h">${esc(h.contactTitle)}</h2><p>${esc(h.contactText)}</p></div>
<div class="plates"><a class="plate" href="mailto:${SITE.email}">${SITE.email}</a><div class="house" aria-hidden="true"><span class="house-st">${t.ui.plate.map(esc).join('<br>')}</span><span class="house-no">${house}</span></div></div>
<p class="addr"><b>${esc(SITE.company)}</b><br>${esc(SITE.address)}</p>
</div></section>
</main>
${footer(lang, 'home', file)}`;
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
  const urls = PAGES.flatMap((key) => LANGS.map((lang) => `  <url>
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
}
put('assets/favicon.svg', FAVICON);
if (!PREVIEW) {
  put('404.html', notFoundPage());
  put('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  put('sitemap.xml', sitemap());
  put('CNAME', `${SITE.domain}\n`);
  put('.nojekyll', '');
}
console.log(`${path.relative(ROOT, OUT)}/: ${written.length} files\n  ${written.join('\n  ')}`);
