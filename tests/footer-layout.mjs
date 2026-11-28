// Footer layout check. Not deployed (assets come from public/ only).
// Run: PLAYWRIGHT=/path/to/node_modules/playwright CHROME=/path/to/chromium node tests/footer-layout.mjs
// Checks, at desktop, laptop and phone widths:
//  - key hints and buttons come before the credit/copyright line
//  - at >=1000px the buttons sit on the key-hint line
//  - credit and copyright share the last line at >=1000px
//  - nothing overflows the viewport horizontally
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
import { fileURLToPath } from 'node:url';
const page = fileURLToPath(new URL('../public/index.html', import.meta.url));
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let fails = 0;
const check = (ok, msg) => { if (!ok) { fails++; console.log('FAIL', msg); } };
for (const [name, w] of [['desktop', 1280], ['laptop', 1000], ['phone', 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('file://' + page);
  const m = await p.evaluate(() => {
    const top = el => Math.round(el.getBoundingClientRect().top);
    const f = document.querySelector('footer');
    const spans = [...f.querySelectorAll('span')];
    const keys = spans.filter(s => s.querySelector('kbd'));
    const credit = spans.find(s => /Helix docs/.test(s.textContent) && !s.querySelector('span'));
    const copy = spans.find(s => /© 2026/.test(s.textContent) && !s.querySelector('span'));
    const btns = ['unlock', 'wipe'].map(id => document.getElementById(id));
    return { keys: keys.map(top), btns: btns.map(top), credit: top(credit), copy: top(copy),
      links: f.querySelectorAll('a').length, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  const lastKey = Math.max(...m.keys), lastBtn = Math.max(...m.btns);
  check(m.keys.length === 3, `${name}: three key hints`);
  check(m.links === 2, `${name}: both links kept`);
  check(Math.min(m.credit, m.copy) > Math.max(lastKey, lastBtn), `${name}: credit/copyright below hints and buttons`);
  check(!m.overflow, `${name}: no horizontal overflow`);
  if (w >= 1000) {
    check(new Set(m.keys).size === 1, `${name}: key hints on one line`);
    check(m.btns.every(t => Math.abs(t - m.keys[0]) <= 4), `${name}: buttons on key-hint line`);
    check(Math.abs(m.credit - m.copy) <= 4, `${name}: credit and copyright on one line`);
  }
  await p.close();
}
await b.close();
console.log(fails ? `${fails} failing` : 'footer layout: all pass');
process.exit(fails ? 1 : 0);
