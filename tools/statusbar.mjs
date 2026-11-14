// The status bar of a screenshot, laid over the app's top as the device lays it (tools/shots.mjs — the demo's screens;
// tools/shots-live.mjs — the screens that need the server): the time and the day of the site's dinner (APP in
// content.mjs), Wi-Fi, the battery; on the iPhone the signal, the Dynamic Island and the home indicator. Its letters
// (Inter 600, tools/fonts) at fonts/… of the page's own address.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP } from '../src/content.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const icon = (name) => readFileSync(path.join(ROOT, 'src/icons', `${name}.svg`), 'utf8').replace('<svg ', '<svg class="sb-i" ');
export const SB_CSS = `
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
export async function statusBar(p, kind, lang, ink) {
  const A = APP[lang];
  const phone = kind === 'phone';
  const html = `<div id="shot-sb" class="${phone ? 'sb-phone' : 'sb-pad'}" style="--sb:${ink}" aria-hidden="true"><span class="sb-t">${A.time}${phone ? '' : `<span class="sb-d">${A.date}</span>`}</span><span class="sb-r">${phone ? icon('cell-signal-full') : ''}${icon('wifi-high')}<span class="sb-bat"><i></i></span></span></div>${phone ? `<div id="shot-di"></div><div id="shot-hb" style="--sb:${ink}"></div>` : ''}`;
  await p.addStyleTag({ content: SB_CSS });
  await p.evaluate((h) => { document.body.insertAdjacentHTML('beforeend', h); }, html);
  await p.evaluate(() => document.fonts.ready);
}
