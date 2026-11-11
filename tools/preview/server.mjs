// Lobbes – lokale preview van het Shopify-thema (alleen voor ontwikkeling/QA).
// Rendert de echte Liquid-bestanden met liquidjs en gesimuleerde Shopify-objecten.
// Dit is GEEN checkout: afrekenen kan alleen in Shopify.
//   cd tools/preview && npm install && node server.mjs   → http://localhost:4173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const THEME = path.join(ROOT, 'theme');
const PORT = Number(process.env.PORT || 4173);

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const locales = readJSON(path.join(THEME, 'locales/nl.default.json'));
const productData = readJSON(path.join(ROOT, 'content/product-onderweg-fles.json'));

// ---------- Shopify-achtige data ----------
const handleize = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PRICE = Math.round(Number(productData.price) * 100);
const variants = productData.variants.map((v, i) => ({
  id: 1001 + i, title: v.color, options: [v.color], option1: v.color, price: PRICE, available: true,
  sku: v.sku, barcode: '', url: `/products/${productData.handle}?variant=${1001 + i}`, featured_media: null,
}));
const product = {
  id: 1, title: productData.title, handle: productData.handle, url: `/products/${productData.handle}`,
  description: productData.descriptionHtml, vendor: productData.vendor, price: PRICE, media: [], featured_media: null,
  has_only_default_variant: false, options: ['Kleur'], variants,
  options_with_values: [{ name: 'Kleur', position: 1, values: productData.variants.map((v) => v.color), selected_value: variants[0].title }],
  selected_or_first_available_variant: variants[0], available: true, metafields: { lobbes: {} },
};
const pageFiles = {
  'over-ons': ['Over Lobbes', 'about'], contact: ['Contact', 'contact'], 'veelgestelde-vragen': ['Veelgestelde vragen', 'faq'],
  'verzending-en-levering': ['Verzending & levering', ''], retourneren: ['Retourneren & terugbetalen', ''],
  privacybeleid: ['Privacybeleid', ''], 'algemene-voorwaarden': ['Algemene voorwaarden', ''], cookiebeleid: ['Cookiebeleid', ''],
  herroepingsformulier: ['Modelformulier voor herroeping', ''],
};
const pages = Object.fromEntries(Object.entries(pageFiles).map(([h, [title, suffix]]) => [h, {
  handle: h, title, url: `/pages/${h}`, template_suffix: suffix,
  content: fs.readFileSync(path.join(ROOT, 'content/pages', `${h}.html`), 'utf8'),
}]));
const link = (title, url) => ({ title, url, current: false });
const linklists = {
  'main-menu': { title: 'Hoofdmenu', links: [link('Onderweg-fles', '/products/onderweg-fles'), link('Zo werkt het', '/#hoe-het-werkt'), link('Over ons', '/pages/over-ons'), link('Vragen', '/pages/veelgestelde-vragen'), link('Contact', '/pages/contact')] },
  footer: { title: 'Klantenservice', links: [link('Verzending & levering', '/pages/verzending-en-levering'), link('Retourneren', '/pages/retourneren'), link('Veelgestelde vragen', '/pages/veelgestelde-vragen'), link('Contact', '/pages/contact'), link('Over ons', '/pages/over-ons')] },
  juridisch: { title: 'Juridisch', links: [link('Algemene voorwaarden', '/pages/algemene-voorwaarden'), link('Privacybeleid', '/pages/privacybeleid'), link('Cookiebeleid', '/pages/cookiebeleid'), link('Herroepingsformulier', '/pages/herroepingsformulier')] },
};

// Winkelwagen in geheugen, met dezelfde bundelkorting als de Shopify automatische kortingen.
let cartLines = [];
function cartObject() {
  const qtyProduct = cartLines.reduce((s, l) => s + l.quantity, 0);
  const disc = qtyProduct >= 3 ? 400 : qtyProduct >= 2 ? 250 : 0;
  const title = qtyProduct >= 3 ? 'Trio-korting' : 'Duo-korting';
  const items = cartLines.map((l, i) => {
    const v = variants.find((x) => x.id === l.id);
    const original = v.price * l.quantity;
    const amount = disc * l.quantity;
    return {
      id: v.id, key: `${v.id}:k`, quantity: l.quantity, title: `${product.title} - ${v.title}`, url: v.url, image: null,
      product, product_id: product.id, variant: v, variant_id: v.id, original_line_price: original, final_line_price: original - amount,
      line_level_discount_allocations: amount ? [{ amount, discount_application: { title } }] : [], url_to_remove: `/cart/change?line=${i + 1}&quantity=0`,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.final_line_price, 0);
  return { item_count: qtyProduct, items, items_subtotal_price: subtotal, total_price: subtotal, cart_level_discount_applications: [], currency: { iso_code: 'EUR' }, note: '' };
}
function addToCart(id, quantity) {
  const v = variants.find((x) => x.id === Number(id));
  if (!v) throw Object.assign(new Error('Variant niet gevonden'), { status: 422 });
  const ex = cartLines.find((l) => l.id === v.id);
  if (ex) ex.quantity += quantity; else cartLines.push({ id: v.id, quantity });
}

// ---------- Settings ----------
const schema = readJSON(path.join(THEME, 'config/settings_schema.json'));
const settingsData = readJSON(path.join(THEME, 'config/settings_data.json'));
const settings = {};
for (const group of schema) for (const s of group.settings || []) if (s.id && 'default' in s) settings[s.id] = s.default;
Object.assign(settings, settingsData.presets[settingsData.current] || settingsData.current);
const font = (h) => ({ family: '"DM Sans"', fallback_families: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', weight: h?.endsWith('7') ? 700 : 400 });
settings.type_header_font = font(settings.type_header_font);
settings.type_body_font = font(settings.type_body_font);
settings.cart_upsell_product = product;

// ---------- Liquid engine ----------
const engine = new Liquid({ root: [path.join(THEME, 'snippets')], extname: '.liquid', jsTruthy: false, strictFilters: false, dynamicPartials: true });
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const lookup = (key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), locales);
engine.registerFilter('t', (key, ...args) => {
  const a = kw(args);
  let v = lookup(key);
  if (v && typeof v === 'object') v = a.count === 1 ? v.one : v.other;
  if (v == null) return `translation missing: ${key}`;
  return String(v).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => a[k] ?? '');
});
engine.registerFilter('asset_url', (v) => `/assets/${v}`);
engine.registerFilter('shopify_asset_url', (v) => `/assets/${v}`);
engine.registerFilter('image_url', (v) => (v && v.src) || '');
engine.registerFilter('image_tag', (v, ...args) => `<img src="${v}" alt="${kw(args).alt ?? ''}">`);
const money = (c) => `€${(Number(c || 0) / 100).toFixed(2).replace('.', ',')}`;
engine.registerFilter('money', money);
engine.registerFilter('money_without_currency', (c) => (Number(c || 0) / 100).toFixed(2).replace('.', ','));
engine.registerFilter('json', (v) => (v === undefined ? 'null' : JSON.stringify(v)));
engine.registerFilter('font_face', () => '');
engine.registerFilter('font_modify', (f) => f);
engine.registerFilter('stylesheet_tag', (v) => `<link rel="stylesheet" href="${v}">`);
engine.registerFilter('payment_type_svg_tag', (t) => `<svg viewBox="0 0 60 24" width="50" height="20" role="img" aria-label="${t}"><rect width="60" height="24" rx="4" fill="#fff" stroke="#ccc"/><text x="30" y="16" font-size="9" text-anchor="middle" font-family="sans-serif">${t}</text></svg>`);
engine.registerFilter('default_errors', () => '');
engine.registerFilter('handleize', handleize);
for (const f of ['format_code', 'video_tag', 'external_video_tag', 'media_tag']) engine.registerFilter(f, () => '');

function blockTag(name, open, close = '') {
  engine.registerTag(name, {
    parse(token, remain) {
      this.args = token.args; this.tpls = [];
      const stream = this.liquid.parser.parseStream(remain)
        .on(`tag:end${name}`, () => stream.stop())
        .on('template', (t) => this.tpls.push(t))
        .on('end', () => { throw new Error(`${name} niet gesloten`); });
      stream.start();
    },
    *render(ctx, emitter) {
      const extra = open(this.args, ctx);
      emitter.write(extra.html);
      ctx.push(extra.scope || {});
      yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
      emitter.write(typeof close === 'function' ? close(this.args) : close);
    },
  });
}
blockTag('style', () => ({ html: '<style>' }), '</style>');
blockTag('javascript', () => ({ html: '<script>' }), '</script>');
blockTag('stylesheet', () => ({ html: '<style>' }), '</style>');
blockTag('paginate', () => ({ html: '', scope: { paginate: { pages: 1, previous: null, next: null } } }));
blockTag('form', (args, ctx) => {
  const type = (args.match(/^\s*'([^']+)'/) || [])[1];
  const attrs = [];
  for (const m of args.matchAll(/([\w-]+):\s*('([^']*)'|[\w.]+)/g)) {
    const val = m[3] !== undefined ? m[3] : String(ctx.getSync(m[2].split('.')) ?? '');
    attrs.push(`${m[1]}="${val}"`);
  }
  const action = { product: '/cart/add', contact: '/contact', customer: '/contact#newsletter', storefront_password: '/password' }[type] || '/';
  return { html: `<form method="post" action="${action}" ${attrs.join(' ')}><input type="hidden" name="form_type" value="${type}">`, scope: { form: { 'posted_successfully?': false, errors: null } } };
}, '</form>');
engine.registerTag('schema', {
  parse(token, remain) { let t; while ((t = remain.shift())) if (t.name === 'endschema') return; },
  render() { return ''; },
});
engine.registerTag('section', {
  parse(token) { this.name = token.args.trim().replace(/['"]/g, ''); },
  *render(ctx, emitter) { emitter.write(yield renderSection(this.name, {}, ctx.getAll(), this.name)); },
});

// ---------- Secties ----------
function sectionSchema(src) {
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return m ? JSON.parse(m[1]) : {};
}
function resolveSetting(def, val) {
  if (def?.type === 'product' && typeof val === 'string') return val === product.handle ? product : null;
  if (def?.type === 'page' && typeof val === 'string') return pages[val] || null;
  return val;
}
function buildSettings(defs = [], given = {}) {
  const out = {};
  for (const d of defs) if (d.id) out[d.id] = resolveSetting(d, d.id in given ? given[d.id] : d.default);
  return out;
}
const sectionOverrides = {
  'main-product': { shipping_page: 'verzending-en-levering', returns_page: 'retourneren' },
  footer: { menu_2: 'juridisch' },
  'main-page-contact': { privacy_page: 'privacybeleid' },
  'product-highlight': { product: 'onderweg-fles' },
};
async function renderSection(type, data, globals, id) {
  const file = path.join(THEME, 'sections', `${type}.liquid`);
  const src = fs.readFileSync(file, 'utf8');
  const sch = sectionSchema(src);
  const settingsIn = { ...(sectionOverrides[type] || {}), ...(data.settings || {}) };
  const blocks = (data.block_order || []).map((bid) => {
    const b = data.blocks[bid];
    const def = (sch.blocks || []).find((x) => x.type === b.type) || {};
    return { id: bid, type: b.type, shopify_attributes: '', settings: buildSettings(def.settings, b.settings || {}) };
  });
  const section = { id, settings: buildSettings(sch.settings, settingsIn), blocks };
  // In Shopify zijn globale objecten (shop, cart, settings, routes…) ook in snippets beschikbaar.
  return engine.parseAndRender(src, { ...globals, section }, { globals });
}

function baseGlobals(req, pageType, extra = {}) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return {
    shop: { name: 'Lobbes', url: `http://${req.headers.host}`, description: 'Slimme, vrolijke spullen voor onderweg met je hond.', enabled_payment_types: ['ideal', 'bancontact', 'visa', 'master', 'klarna', 'apple_pay'], password_message: '' },
    settings, linklists, pages, cart: cartObject(), product: null,
    routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search', all_products_collection_url: '/collections/all' },
    request: { locale: { iso_code: 'nl' }, page_type: pageType, origin: `http://${req.headers.host}`, path: url.pathname },
    canonical_url: `http://${req.headers.host}${url.pathname}`, template: { name: pageType }, current_page: 1,
    page_title: 'Lobbes – Klaar voor elk rondje', page_description: 'Slimme, vrolijke spullen voor onderweg met je hond.',
    ...extra,
  };
}
async function renderTemplate(req, tplName, pageType, extra) {
  const g = baseGlobals(req, pageType, extra);
  const tplPath = path.join(THEME, 'templates', `${tplName}.json`);
  const tpl = readJSON(fs.existsSync(tplPath) ? tplPath : path.join(THEME, 'templates', `${pageType}.json`));
  let body = '';
  for (const id of tpl.order) body += await renderSection(tpl.sections[id].type, tpl.sections[id], g, id);
  const layout = fs.readFileSync(path.join(THEME, 'layout', `${tpl.layout || 'theme'}.liquid`), 'utf8');
  return engine.parseAndRender(layout, { ...g, content_for_header: '', content_for_layout: body }, { globals: g });
}

// ---------- HTTP ----------
const readBody = (req) => new Promise((r) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => r(d)); });
const parseBody = (raw, type) => (type?.includes('json') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw)));
const mime = { '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp' };

async function sectionsFor(req, list) {
  const g = baseGlobals(req, 'cart');
  const out = {};
  for (const s of list || []) out[s] = await renderSection(s, {}, g, s);
  return out;
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;
    const send = (code, body, type = 'text/html; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type }); res.end(body); };
    if (p.startsWith('/assets/')) {
      const f = path.join(THEME, 'assets', path.basename(p));
      if (!fs.existsSync(f)) return send(404, 'not found', 'text/plain');
      return send(200, fs.readFileSync(f), mime[path.extname(f)] || 'application/octet-stream');
    }
    if (req.method === 'POST') {
      const body = parseBody(await readBody(req), req.headers['content-type']);
      if (p === '/cart/add.js') {
        try { for (const it of body.items || [{ id: body.id, quantity: body.quantity }]) addToCart(it.id, Number(it.quantity || 1)); }
        catch (e) { return send(422, JSON.stringify({ status: 422, description: e.message }), 'application/json'); }
        return send(200, JSON.stringify({ items: cartObject().items.map((i) => ({ id: i.id, quantity: i.quantity })), sections: await sectionsFor(req, body.sections) }), 'application/json');
      }
      if (p === '/cart/change.js') {
        const line = Number(body.line) - 1; const q = Number(body.quantity);
        if (cartLines[line]) { if (q <= 0) cartLines.splice(line, 1); else cartLines[line].quantity = q; }
        return send(200, JSON.stringify({ item_count: cartObject().item_count, sections: await sectionsFor(req, body.sections) }), 'application/json');
      }
      if (p === '/cart/add') { addToCart(body.id, Number(body.quantity || 1)); res.writeHead(302, { Location: '/cart' }); return res.end(); }
      if (p === '/cart') {
        const updates = Object.entries(body).filter(([k]) => k.startsWith('updates'));
        if (updates.length) updates.forEach(([, v], i) => { if (cartLines[i]) cartLines[i].quantity = Number(v); });
        cartLines = cartLines.filter((l) => l.quantity > 0);
        if ('checkout' in body) return send(200, '<h1>Lokale preview</h1><p>Hier zou de Shopify-checkout openen. Afrekenen werkt alleen in Shopify.</p>');
        res.writeHead(302, { Location: '/cart' }); return res.end();
      }
      res.writeHead(302, { Location: req.headers.referer || '/' }); return res.end();
    }
    if (p === '/cart/clear') { cartLines = []; res.writeHead(302, { Location: '/' }); return res.end(); }
    if (p === '/cart/change') { const l = Number(url.searchParams.get('line')) - 1; cartLines.splice(l, 1); res.writeHead(302, { Location: '/cart' }); return res.end(); }
    if (p === '/') return send(200, await renderTemplate(req, 'index', 'index'));
    if (p === `/products/${product.handle}`) {
      return send(200, await renderTemplate(req, 'product', 'product', { product, page_title: productData.seo.title, page_description: productData.seo.description }));
    }
    if (p === '/cart') return send(200, await renderTemplate(req, 'cart', 'cart', { page_title: 'Winkelwagen' }));
    if (p === '/collections/all' || p === '/collections') {
      const collection = { title: 'Alle producten', description: '', products: [product], products_count: 1, url: '/collections/all' };
      return send(200, await renderTemplate(req, p === '/collections' ? 'list-collections' : 'collection', p === '/collections' ? 'list-collections' : 'collection', { collection, collections: [collection], page_title: 'Alle producten' }));
    }
    if (p === '/search') {
      const q = url.searchParams.get('q') || '';
      const results = q && /fles|hond|water|voer/i.test(q) ? [{ ...product, object_type: 'product' }] : [];
      return send(200, await renderTemplate(req, 'search', 'search', { search: { performed: !!q, terms: q, results, results_count: results.length }, page_title: 'Zoeken' }));
    }
    const pm = p.match(/^\/pages\/([\w-]+)$/);
    if (pm && pages[pm[1]]) {
      const page = pages[pm[1]];
      return send(200, await renderTemplate(req, page.template_suffix ? `page.${page.template_suffix}` : 'page', 'page', { page, page_title: page.title }));
    }
    if (p === '/password') return send(200, await renderTemplate(req, 'password', 'password'));
    return send(404, await renderTemplate(req, '404', '404', { page_title: 'Pagina niet gevonden' }));
  } catch (e) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(e.stack || e));
  }
}).listen(PORT, () => console.log(`Lobbes preview: http://localhost:${PORT}`));
