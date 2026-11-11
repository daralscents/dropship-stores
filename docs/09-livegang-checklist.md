# 09 · Wat is er nodig om live te gaan?

Legenda: ✅ werkt / klaar · 🟡 voorbereid, moet nog gekoppeld of ingevuld worden · 🔴 vereist externe toegang of handmatige actie van jou

## A. Status per onderdeel

| Onderdeel | Status | Toelichting |
|---|---|---|
| Marktonderzoek, positionering | ✅ | `docs/01` |
| Merk (naam, logo, palet, typografie, tone of voice) | ✅ | `docs/02`, `brand/` |
| Merknaam juridisch vrij / domein beschikbaar | 🔴 | BOIP/TMview zelf checken; domein controleer ik met Shopify zodra de koppeling werkt |
| Prijsmodel en scenario's | ✅ | `docs/03` + xlsx; aannames verifiëren (btw in inkoop, douane, betaalkosten) |
| Shopify-thema (alle pagina's, product, winkelwagen, lade) | ✅ lokaal getest | `theme/`, 0 Theme Check-meldingen, 0 QA-problemen |
| Thema in Shopify dev store | 🔴 | Shopify-koppeling moet opnieuw geautoriseerd worden op de **dev store** |
| Product, pagina's, menu's, kortingen, beleid in Shopify | 🟡 | Script `tools/shopify/setup-store.mjs` (dry-run getest) of via de koppeling |
| Checkout & betalingen | 🔴 | Alleen via Shopify. Er is bewust **geen** nep-checkout gebouwd |
| Productfoto's/video's | 🔴 | Nu nette SVG-illustraties. Echte foto's van proefexemplaren nodig (zie §C) |
| Specificaties (inhoud, materiaal, afmetingen) | 🔴 | Bij leverancier opvragen → metafields invullen; de site toont ze automatisch |
| GPSR-gegevens (fabrikant, EU-verantwoordelijke, model, waarschuwingen) | 🔴 | **Verplicht vóór livegang**; metafields invullen |
| Juridische teksten | 🟡 | Klaar met placeholders [HAKEN]; invullen en laten toetsen |
| Bedrijfsgegevens in footer/contact | 🔴 | Thema-instellingen → Bedrijfsgegevens |
| E-mailflows | 🟡 | Templates + plan in `docs/06`; aparte Klaviyo-account voor Lobbes nodig |
| SEO-basis | ✅ in thema · 🟡 in admin | SEO-titels/descriptions invullen (tabel in `docs/04`), Search Console + Merchant Center na livegang |
| Marketingplan en advertentiescripts | ✅ | `docs/05` |

## B. Stappenplan (in volgorde)

### 1. Koppelen (vandaag)
1. **Shopify-connector opnieuw autoriseren op je dev store** (claude.ai → Instellingen → Connectors → Shopify, of `/mcp` in Claude Code). Kies de **development store**, niet Dar Al Scents.
2. Daarna zet ik (na jouw akkoord per actie) in de dev store: het thema als **ongepubliceerd** thema, het product met 5 varianten, de metafield-definities, de pagina's, de menu's, de Duo/Trio-kortingen en het beleid. Ook controleer ik de domeinbeschikbaarheid.
   - Alternatief zonder mij: `shopify theme push --unpublished --path theme --store <dev>.myshopify.com` en `node tools/shopify/setup-store.mjs --apply` (zie README).

### 2. Leverancier (week 1)
3. Vraag schriftelijk op: fabrikantgegevens, modelnummer, inhoud water/voer, afmetingen, materiaal + testrapporten, btw/douane in de €12,74, IOSS/importeur, levertijd NL/BE, retouradres. Zie `docs/07` §5.
4. Bestel **10–15 proefexemplaren** in verschillende kleuren: lektest (rechtop/liggend, 24 uur in een tas), foto's en video's, en een check of alle 5 kleuren écht leverbaar zijn.
5. Liefst: private label (logo op de fles of een sticker + eigen insertkaart met fabrikant/importeursgegevens) en/of EU-voorraad.

### 3. Shopify-instellingen (handmatig in admin)
6. **Verzending:** zone Nederland + België, tarief "Gratis" (€0). Levertijdtekst invullen in thema-instellingen → Verzending & service → *Levertijd* (alleen als die bevestigd is).
7. **Betalingen:** Shopify Payments activeren (iDEAL, Bancontact, kaarten, Apple Pay), of een alternatief zoals Mollie/Pay.nl.
8. **Belastingen:** prijzen incl. btw (Instellingen → Belastingen → "Alle prijzen inclusief belasting"); OSS/IOSS volgens je boekhouder.
9. **Klantprivacy:** cookiebanner aan (EU), en marketing-toestemming met double opt-in.
10. **Meldingen:** logo/kleur, NL-taal, verlaten-checkout-mail **uit** zodra Klaviyo die verstuurt.
11. **Beleid:** controleer dat de door het script ingevulde beleidsteksten (retour, privacy, voorwaarden, verzending) kloppen.
12. **Thema-instellingen:** bedrijfsgegevens, socials, favicon, deelafbeelding, "Bundel-suggestie product" = Onderweg-fles.
13. **Productmetafields** invullen (Producten → Onderweg-fles → Metafields).
14. **Productmedia** uploaden per kleur, met alt-tekst ("Lobbes Onderweg-fles in Zachtroze – voervak en waterreservoir"), en elke variant koppelen aan zijn afbeelding.
15. **Placeholders** in juridische pagina's vervangen; `node tools/preview/qa.mjs` toont welke nog over zijn (lokaal: `content/pages/`).

### 4. Testen in Shopify
16. Testbestellingen (Bogus Gateway in de dev store), Duo/Trio-korting, mails, contactformulier, mobiele weergave, Lighthouse.

### 5. Live (alleen met jouw expliciete akkoord)
17. Domein kopen en koppelen (🔴 jouw beslissing en kosten).
18. Dev store overdragen of naar een betaald plan zetten (🔴 kosten). Thema publiceren en wachtwoord eraf (🔴).
19. Search Console, Merchant Center, Meta- en TikTok-pixels (via de officiële apps) koppelen.

## C. Beeldmateriaal: shotlist (proefexemplaren)
| # | Shot | Gebruik |
|---|---|---|
| 1 | Packshot per kleur op zand (#F6F1E7), recht van voren, 2000×2000 | Productgalerij |
| 2 | Detail: voervak met brokjes; knop open/slot; draagkoord | Galerij / voordelen |
| 3 | Hand vult brokjes en water (video 5 sec) | "Zo werkt het", ads |
| 4 | Hond drinkt uit de fles, buiten (strand/bos) | Hero, ads |
| 5 | Fles aan de pols met riem in de andere hand | Voordelen |
| 6 | Flatlay: jaszak-chaos vs. één fles | Ads (angle A) |
| 7 | Alle 5 kleuren naast elkaar | Galerij, social |

**AI-beelden:** alleen voor sfeer/achtergronden of als compositie-voorbeeld. Gebruik **geen** AI-afbeelding van het product zelf als productfoto: vorm, knoppen en verhoudingen moeten exact kloppen met wat de klant ontvangt.
