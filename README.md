# Lobbes – webshop voor de 2-in-1 hondenwaterfles met voervak

**Lobbes**: slimme, vrolijke spullen voor onderweg met je hond. *Klaar voor elk rondje.*
Eerste product: de **Onderweg-fles** (waterreservoir + voervak + vergrendelknop + draagkoord), €29,95, Duo €54,90, Trio €77,85.

## Inhoud

| Map/bestand | Wat |
|---|---|
| `docs/01-marktonderzoek.md` | Markt, concurrenten, prijzen, reviewklachten, doelgroepen, positionering (met bronnen) |
| `docs/02-merkidentiteit.md` | Naam + onderbouwing, domein/merkcheck-status, slogan, logo, kleuren, typografie, tone of voice |
| `docs/03-prijsstrategie.md` + `03-prijsmodel.xlsx` | Prijs, bundels, bruto-/contributiemarge, max CAC, break-even ROAS, scenario's |
| `docs/04-seo.md` | Zoekwoorden, technische SEO, titels/descriptions, contentplan |
| `docs/05-marketing.md` | Lanceringsplan, angles, advertentiescripts, test- en opschaalcriteria |
| `docs/06-email.md` + `email/` | Flows (zonder dubbele mails), wetgeving, Klaviyo-templates |
| `docs/07-juridisch.md` | Consumentenrecht, privacy/cookies, GPSR, import/btw/douane |
| `docs/08-qa-rapport.md` | Uitgevoerde tests en opgeloste problemen |
| `docs/09-livegang-checklist.md` | **Wat werkt, wat is voorbereid, wat moet nog** + stappenplan |
| `docs/10-shopify-dev-store-status.md` | Wat er in de dev store staat en wat nog handmatig moet |
| `brand/logo/` | Logo, woordmerk, beeldmerk (SVG, licht/donker) |
| `theme/` | Shopify Online Store 2.0-thema (Liquid, geen dependencies) |
| `content/` | Productdata (JSON) en paginateksten (HTML) |
| `tools/` | Prijsmodel, generators, lokale preview + QA, Shopify-setupscript |

## Thema lokaal bekijken en testen
```bash
cd tools/preview
npm install
node server.mjs          # http://localhost:4173 (gesimuleerde data, géén echte checkout)
node qa.mjs              # 45 paginaweergaven + koopflow + toegankelijkheid
cd ../.. && python3 tools/check_schema.py   # Shopify-uploadregels die Theme Check mist
```

## Naar Shopify (dev store)
```bash
npm install -g @shopify/cli
shopify theme push --unpublished --path theme --store <jouw-dev-store>.myshopify.com
```
```bash
SHOPIFY_STORE=<jouw-dev-store>.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_... node tools/shopify/setup-store.mjs           # dry-run
SHOPIFY_STORE=<jouw-dev-store>.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_... node tools/shopify/setup-store.mjs --apply
```
Het setupscript weigert te draaien op een winkel met de naam "Dar Al Scents".

## Opnieuw genereren
```bash
python3 tools/pricing_model.py        # prijsmodel → docs/03-prijsmodel.xlsx
python3 tools/make_product_svgs.py    # productillustraties → theme/assets/fles-*.svg
python3 tools/make_emails.py          # e-mailtemplates → email/
```
