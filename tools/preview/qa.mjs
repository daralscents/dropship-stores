// Lobbes – geautomatiseerde QA tegen de lokale preview (node server.mjs moet draaien).
//   node qa.mjs [baseUrl]   → schrijft qa-report.json en print een samenvatting
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.argv[2] || 'http://localhost:4173';
const ROUTES = ['/', '/products/onderweg-fles', '/cart', '/collections/all', '/search?q=fles', '/pages/over-ons', '/pages/contact',
  '/pages/veelgestelde-vragen', '/pages/verzending-en-levering', '/pages/retourneren', '/pages/privacybeleid',
  '/pages/algemene-voorwaarden', '/pages/cookiebeleid', '/pages/herroepingsformulier', '/bestaat-niet'];
const VIEWPORTS = {
  mobiel: { ...devices['iPhone 13'] },
  tablet: { ...devices['iPad Mini'] },
  desktop: { viewport: { width: 1440, height: 900 } },
};
const report = { pages: [], flows: [], linkCheck: [], summary: {} };
const fail = (msg) => { report.summary.failures = (report.summary.failures || 0) + 1; console.log('  ✗', msg); };
const ok = (msg) => console.log('  ✓', msg);

const browser = await chromium.launch();
for (const [vpName, opts] of Object.entries(VIEWPORTS)) {
  console.log(`\n== ${vpName} ==`);
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
  for (const r of ROUTES) {
    errors.length = 0;
    const res = await page.goto(BASE + r, { waitUntil: 'networkidle' });
    // lazy images laden
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(200);
    const info = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      metaDesc: document.querySelector('meta[name=description]')?.content || '',
      canonical: !!document.querySelector('link[rel=canonical]'),
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src),
      missingTranslations: (document.body.innerText.match(/translation missing[^\n]*/g) || []),
      placeholders: [...new Set(document.body.innerText.match(/\[[A-Z][A-Z0-9 \/–\-\.,'":()]{3,}[^\]]*\]/g) || [])],
      smallTargets: [...document.querySelectorAll('a, button, input[type=radio] + label, summary')].filter((el) => {
        const b = el.getBoundingClientRect(); const st = getComputedStyle(el);
        return b.width > 0 && b.height > 0 && st.display !== 'inline' && (b.height < 24 || b.width < 24);
      }).length,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { JSON.parse(s.textContent); return 'ok'; } catch (e) { return 'INVALID: ' + e.message; } }),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
    }));
    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') }));
    });
    const entry = { viewport: vpName, route: r, status: res.status(), ...info, axe, consoleErrors: [...errors] };
    delete entry.links;
    report.pages.push(entry);
    const expect = r === '/bestaat-niet' ? 404 : 200;
    const problems = [];
    if (res.status() !== expect) problems.push(`status ${res.status()}`);
    if (info.overflowX > 0) problems.push(`horizontale scroll ${info.overflowX}px`);
    if (info.h1 !== 1) problems.push(`${info.h1} h1's`);
    if (!info.metaDesc) problems.push('geen meta description');
    if (info.brokenImgs.length) problems.push(`kapotte afbeeldingen ${info.brokenImgs}`);
    if (info.imgsNoAlt.length) problems.push(`img zonder alt ${info.imgsNoAlt.length}`);
    if (info.missingTranslations.length) problems.push(`vertaling ontbreekt ${info.missingTranslations}`);
    if (info.jsonLd.some((j) => j !== 'ok')) problems.push(`JSON-LD ongeldig ${info.jsonLd}`);
    if (errors.length) problems.push(`console: ${errors.join(' | ')}`);
    if (axe.length) problems.push(`axe: ${axe.map((a) => `${a.id}(${a.impact}, ${a.nodes}x: ${a.sample})`).join('; ')}`);
    if (problems.length) fail(`${r}: ${problems.join(' · ')}`); else ok(`${r}${info.placeholders.length ? `  (placeholders: ${info.placeholders.length})` : ''}`);
    if (vpName === 'desktop') for (const l of info.links) if (l.startsWith('/') && !report.linkCheck.includes(l)) report.linkCheck.push(l);
  }
  await ctx.close();
}

// ---------- Interne links ----------
console.log('\n== Interne links ==');
const brokenLinks = [];
for (const l of report.linkCheck) {
  const u = l.split('#')[0] || '/';
  const r = await fetch(BASE + u, { redirect: 'manual' });
  if (![200, 302].includes(r.status)) brokenLinks.push(`${l} → ${r.status}`);
}
if (brokenLinks.length) fail(`kapotte links: ${brokenLinks.join(', ')}`); else ok(`${report.linkCheck.length} unieke interne links OK`);

// ---------- Flows (mobiel) ----------
console.log('\n== Koopflow (mobiel) ==');
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
const flowErr = [];
page.on('pageerror', (e) => flowErr.push(e.message));
await page.goto(BASE + '/cart/clear');
await page.goto(BASE + '/products/onderweg-fles', { waitUntil: 'networkidle' });
const step = async (name, fn) => { try { await fn(); ok(name); report.flows.push({ name, ok: true }); } catch (e) { fail(`${name}: ${e.message}`); report.flows.push({ name, ok: false, error: e.message }); } };
const assert = (c, m) => { if (!c) throw new Error(m); };
await step('Sticky koopknop verborgen bij laden', async () => assert(!(await page.locator('[data-sticky-atc]').evaluate((e) => e.classList.contains('is-visible'))), 'sticky al zichtbaar'));
await step('Kleur kiezen (Zachtroze) werkt label + URL bij', async () => {
  await page.locator('label[title="Zachtroze"]').click();
  assert((await page.locator('[data-selected-option="0"]').textContent()).trim() === 'Zachtroze', 'label niet bijgewerkt');
  assert(page.url().includes('variant=1002'), 'variant niet in URL: ' + page.url());
});
await step('Duo kiezen en toevoegen opent winkelwagenlade', async () => {
  await page.locator('label[for^="Bundle-2-"]').click();
  await page.locator('[data-atc]').click();
  await page.waitForSelector('#CartDrawer.is-open', { timeout: 4000 });
  const count = await page.locator('.header [data-cart-count]').textContent();
  assert(count.trim() === '2', `teller ${count}`);
  const disc = await page.locator('#CartDrawer .cart-item__discount').first().textContent();
  assert(/Duo-korting/.test(disc), 'Duo-korting niet getoond');
  const total = await page.locator('#CartDrawer .cart-summary__total').textContent();
  assert(/54,90/.test(total), 'totaal is niet €54,90: ' + total);
});
await step('Plus-knop in lade → 3 stuks met Trio-totaal €77,85', async () => {
  await page.locator('#CartDrawer [data-line-change][data-qty="3"]').click();
  await page.waitForFunction(() => /77,85/.test(document.querySelector('#CartDrawer .cart-summary__total')?.textContent || ''), null, { timeout: 4000 });
});
await step('Lade sluiten met Escape geeft focus terug', async () => {
  await page.keyboard.press('Escape');
  assert(!(await page.locator('#CartDrawer').evaluate((e) => e.classList.contains('is-open'))), 'lade nog open');
});
await step('Sticky koopknop verschijnt na scrollen', async () => {
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(400);
  assert(await page.locator('[data-sticky-atc]').evaluate((e) => e.classList.contains('is-visible')), 'sticky niet zichtbaar');
});
await step('Winkelwagenpagina: verwijderen en checkout-knop aanwezig', async () => {
  await page.goto(BASE + '/cart', { waitUntil: 'networkidle' });
  assert(await page.locator('main button[name=checkout]').count() === 1, 'geen checkout-knop');
  await page.locator('.cart-item__remove').first().click();
  await page.waitForLoadState('networkidle');
  assert(/nog leeg/.test(await page.textContent('main')), 'winkelwagen niet leeg');
});
await step('Zonder JavaScript: formulier voegt Trio (3) toe via POST', async () => {
  await fetch(BASE + '/cart/clear');
  const c2 = await browser.newContext({ ...devices['iPhone 13'], javaScriptEnabled: false });
  const p2 = await c2.newPage();
  await p2.goto(BASE + '/products/onderweg-fles');
  await p2.locator('label[for^="Bundle-3-"]').click();
  await p2.locator('[data-atc]').click();
  await p2.waitForURL('**/cart');
  const t = await p2.textContent('.cart-summary__total');
  assert(/77,85/.test(t), 'totaal ' + t);
  await c2.close();
  await fetch(BASE + '/cart/clear');
});
await step('Mobiel menu opent en sluit', async () => {
  await page.goto(BASE + '/');
  await page.locator('[data-menu-open]').click();
  assert(await page.locator('#MobileNav').evaluate((e) => e.classList.contains('is-open')), 'menu niet open');
  await page.locator('.mobile-nav__panel [data-menu-close]').click();
  assert(!(await page.locator('#MobileNav').evaluate((e) => e.classList.contains('is-open'))), 'menu niet dicht');
});
if (flowErr.length) fail('JS-fouten in flow: ' + flowErr.join(' | '));
await ctx.close();
await browser.close();

report.summary.pagesTested = report.pages.length;
report.summary.placeholdersByPage = Object.fromEntries(report.pages.filter((p) => p.viewport === 'desktop' && p.placeholders.length).map((p) => [p.route, p.placeholders]));
fs.writeFileSync(new URL('./qa-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`\nKlaar: ${report.pages.length} paginaweergaven, ${report.summary.failures || 0} problemen. Rapport: tools/preview/qa-report.json`);
process.exit(report.summary.failures ? 1 : 0);
