// Lobbes – zet de inhoud van een (dev) Shopify-store klaar via de Admin GraphQL API.
//
// Gebruik (Node 18+):
//   SHOPIFY_STORE=jouw-devstore.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_xxx node tools/shopify/setup-store.mjs          # dry-run: toont wat er gebeurt
//   SHOPIFY_STORE=... SHOPIFY_ADMIN_TOKEN=... node tools/shopify/setup-store.mjs --apply                                # uitvoeren
//
// Token: Shopify admin → Instellingen → Apps → Apps ontwikkelen → app maken met scopes:
//   write_products, write_content (pagina's), write_online_store_navigation, write_discounts,
//   write_legal_policies, write_publications
// Gebruik dit ALLEEN op je dev store / Lobbes-store, nooit op een andere winkel.
// Idempotent waar mogelijk: bestaande handles worden overgeslagen of bijgewerkt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPLY = process.argv.includes('--apply');
const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = '2025-07';
const product = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/product-onderweg-fles.json'), 'utf8'));
const page = (h) => fs.readFileSync(path.join(ROOT, 'content/pages', `${h}.html`), 'utf8');

if (APPLY && (!STORE || !TOKEN)) { console.error('Zet SHOPIFY_STORE en SHOPIFY_ADMIN_TOKEN'); process.exit(1); }
if (APPLY && !/\.myshopify\.com$/.test(STORE)) { console.error('SHOPIFY_STORE moet eindigen op .myshopify.com'); process.exit(1); }

async function gql(query, variables = {}, label = '') {
  if (!APPLY) { console.log(`[dry-run] ${label}`); return null; }
  const r = await fetch(`https://${STORE}/admin/api/${API}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN }, body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(`${label}: ${JSON.stringify(j.errors)}`);
  const first = Object.values(j.data || {})[0];
  if (first?.userErrors?.length) console.warn(`  ⚠ ${label}:`, JSON.stringify(first.userErrors));
  else console.log(`  ✓ ${label}`);
  return j.data;
}

// 0. Veiligheidscheck: toon de winkel
const shop = await gql('{ shop { name myshopifyDomain plan { displayName } } }', {}, 'winkel ophalen');
if (shop) {
  console.log(`Winkel: ${shop.shop.name} (${shop.shop.myshopifyDomain}, ${shop.shop.plan.displayName})`);
  if (/dar al scents/i.test(shop.shop.name)) { console.error('Dit is NIET de Lobbes/dev store. Afgebroken.'); process.exit(1); }
}

// 1. Metafield-definities
for (const d of product.metafieldDefinitions) {
  await gql(`mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id } userErrors { field message code } } }`,
    { d: { name: d.name, namespace: 'lobbes', key: d.key, type: d.type, ownerType: 'PRODUCT', access: { storefront: 'PUBLIC_READ' } } }, `metafield lobbes.${d.key}`);
}

// 2. Product (productSet maakt opties + varianten in één keer)
const defaults = product.metafieldDefinitions.filter((d) => d.default).map((d) => ({ namespace: 'lobbes', key: d.key, type: d.type, value: d.default }));
const set = await gql(`mutation($input: ProductSetInput!) { productSet(synchronous: true, input: $input) { product { id handle variants(first: 10) { nodes { id title } } } userErrors { field message code } } }`, {
  input: {
    title: product.title, handle: product.handle, descriptionHtml: product.descriptionHtml, vendor: product.vendor,
    productType: product.productType, tags: product.tags, status: 'ACTIVE',
    seo: product.seo,
    productOptions: [{ name: product.option, values: product.variants.map((v) => ({ name: v.color })) }],
    variants: product.variants.map((v) => ({ optionValues: [{ optionName: product.option, name: v.color }], price: product.price, sku: v.sku, inventoryPolicy: 'CONTINUE', taxable: true })),
    metafields: defaults,
  },
}, `product ${product.handle} (${product.variants.length} varianten à €${product.price})`);
const productId = set?.productSet?.product?.id;

// 3. Publiceren op Online Store
if (APPLY && productId) {
  const pubs = await gql('{ publications(first: 20) { nodes { id name } } }', {}, 'kanalen ophalen');
  const online = pubs.publications.nodes.find((p) => /online store|onlinewinkel/i.test(p.name));
  if (online) await gql(`mutation($id: ID!, $p: [PublicationInput!]!) { publishablePublish(id: $id, input: $p) { userErrors { field message } } }`, { id: productId, p: [{ publicationId: online.id }] }, 'product publiceren op Online Store');
} else console.log('[dry-run] product publiceren op Online Store');

// 4. Pagina's
const PAGES = [
  ['over-ons', 'Over Lobbes', 'about'], ['contact', 'Contact', 'contact'], ['veelgestelde-vragen', 'Veelgestelde vragen', 'faq'],
  ['verzending-en-levering', 'Verzending & levering', null], ['retourneren', 'Retourneren & terugbetalen', null],
  ['herroepingsformulier', 'Modelformulier voor herroeping', null], ['privacybeleid', 'Privacybeleid', null],
  ['algemene-voorwaarden', 'Algemene voorwaarden', null], ['cookiebeleid', 'Cookiebeleid', null],
];
for (const [handle, title, suffix] of PAGES) {
  await gql(`mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id handle } userErrors { field message code } } }`,
    { p: { title, handle, body: page(handle), isPublished: true, ...(suffix ? { templateSuffix: suffix } : {}) } }, `pagina /pages/${handle}`);
}

// 5. Menu's (main-menu en footer bestaan standaard → bijwerken; juridisch → aanmaken)
const http = (title, url) => ({ title, type: 'HTTP', url });
const MENUS = {
  'main-menu': ['Hoofdmenu', [http('Onderweg-fles', `/products/${product.handle}`), http('Zo werkt het', '/#hoe-het-werkt'), http('Over ons', '/pages/over-ons'), http('Vragen', '/pages/veelgestelde-vragen'), http('Contact', '/pages/contact')]],
  footer: ['Klantenservice', [http('Verzending & levering', '/pages/verzending-en-levering'), http('Retourneren', '/pages/retourneren'), http('Veelgestelde vragen', '/pages/veelgestelde-vragen'), http('Contact', '/pages/contact'), http('Over ons', '/pages/over-ons')]],
  juridisch: ['Juridisch', [http('Algemene voorwaarden', '/pages/algemene-voorwaarden'), http('Privacybeleid', '/pages/privacybeleid'), http('Cookiebeleid', '/pages/cookiebeleid'), http('Herroepingsformulier', '/pages/herroepingsformulier')]],
};
const existing = APPLY ? (await gql('{ menus(first: 50) { nodes { id handle } } }', {}, 'menu\'s ophalen')).menus.nodes : [];
for (const [handle, [title, items]] of Object.entries(MENUS)) {
  const m = existing.find((x) => x.handle === handle);
  if (m) await gql(`mutation($id: ID!, $t: String!, $h: String!, $i: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $t, handle: $h, items: $i) { menu { id } userErrors { field message } } }`, { id: m.id, t: title, h: handle, i: items }, `menu ${handle} bijwerken`);
  else await gql(`mutation($t: String!, $h: String!, $i: [MenuItemCreateInput!]!) { menuCreate(title: $t, handle: $h, items: $i) { menu { id } userErrors { field message } } }`, { t: title, h: handle, i: items }, `menu ${handle} aanmaken`);
}

// 6. Bundelkortingen (moeten exact overeenkomen met thema-instellingen duo_discount=250, trio_discount=400)
for (const [title, qty, amount] of [['Duo-korting', '2', '2.50'], ['Trio-korting', '3', '4.00']]) {
  await gql(`mutation($d: DiscountAutomaticBasicInput!) { discountAutomaticBasicCreate(automaticBasicDiscount: $d) { automaticDiscountNode { id } userErrors { field message code } } }`, {
    d: {
      title, startsAt: new Date().toISOString(),
      minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: qty } },
      customerGets: { value: { discountAmount: { amount, appliesOnEachItem: true } }, items: { products: { productsToAdd: productId ? [productId] : [] } } },
      combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    },
  }, `${title}: €${amount} per fles vanaf ${qty} stuks`);
}

// 7. Shopify-beleid (verschijnt ook in de checkout)
for (const [type, h] of [['REFUND_POLICY', 'retourneren'], ['PRIVACY_POLICY', 'privacybeleid'], ['TERMS_OF_SERVICE', 'algemene-voorwaarden'], ['SHIPPING_POLICY', 'verzending-en-levering']]) {
  await gql(`mutation($p: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $p) { shopPolicy { id } userErrors { field message } } }`, { p: { type, body: page(h) } }, `beleid ${type}`);
}

console.log(APPLY ? '\nKlaar. Controleer handmatig: verzendzones (gratis NL/BE), betaalmethoden, cookiebanner, belasting.' : '\nDry-run klaar. Voeg --apply toe om uit te voeren.');
