# 04 · SEO & organische vindbaarheid

## 1. Zoekwoordenonderzoek (NL)

> Zoekvolumes zijn vanuit deze omgeving **niet** op te halen (geen toegang tot Keyword Planner/Semrush). De prioriteit hieronder is een inschatting [A] op basis van zoekintentie en wat bol.com, BCC en Kruidvat als categorienamen gebruiken [O]. **Valideer in Google Keyword Planner** (gratis met een Google Ads-account; locatie Nederland, taal Nederlands) en vul de kolom "Volume" in.

| Cluster | Zoekwoorden | Intentie | Doelpagina | Prio |
|---|---|---|---|---|
| Hoofdterm | drinkfles hond · waterfles hond · honden drinkfles | Koop | Productpagina | 1 |
| 2-in-1 | drinkfles hond met voerbak · drinkfles hond met eetbakje · waterfles hond met voer · 2 in 1 drinkfles hond | Koop | Productpagina | 1 |
| Onderweg | drinkbak hond onderweg · hond water onderweg · reisfles hond · drinkfles hond wandelen | Koop/oriëntatie | Product + blog | 2 |
| Voer | voerdispenser hond onderweg · snoepjes hond onderweg · brokjes meenemen wandeling | Oriëntatie | Blog → product | 2 |
| Informatief | hoeveel water drinkt een hond · hond warm weer tips · wandelen met hond hitte · puppy training beloningen | Info | Blog | 3 |
| Cadeau | cadeau hondenliefhebber · cadeau voor hondenbaas | Koop (seizoen) | Blog/collectie | 3 |
| Merk | lobbes · lobbes drinkfles | Navigatie | Home | – |

## 2. Gerealiseerd in het thema (technische SEO)

| Onderdeel | Status | Waar |
|---|---|---|
| Unieke `<title>` per pagina (Shopify SEO-titel + " \| Lobbes") | ✅ | `layout/theme.liquid` |
| Meta description (uit Shopify SEO-velden) | ✅ | idem |
| Canonical URL | ✅ | idem |
| Open Graph + Twitter Cards | ✅ | `snippets/meta-tags.liquid` |
| Structured data: Organization + WebSite/SearchAction (home), Product met Offers per variant, verzendkosten en retourbeleid, BreadcrumbList, FAQPage, BlogPosting | ✅ (alle JSON-LD gevalideerd als geldig JSON in de QA) | `snippets/structured-data.liquid`, `sections/faq.liquid`, `sections/main-article.liquid` |
| **Geen** `aggregateRating`/reviews in schema zolang er geen echte reviews zijn | ✅ bewust | – |
| Eén `<h1>` per pagina, logische h2/h3 | ✅ (getest op alle 15 routes) | QA |
| Alt-teksten op alle afbeeldingen | ✅ (getest) | QA; productmedia: alt-tekst invullen bij upload |
| Responsive images (`srcset`/`sizes`), lazy loading, `fetchpriority=high` op LCP-beeld | ✅ | secties |
| Geen render-blocking JS (1 klein deferred script, geen jQuery/frameworks) | ✅ | `assets/theme.js` (±9 KB) |
| Fonts uit Shopify CDN met `font-display: swap` | ✅ | layout |
| Schone URL's | ✅ Shopify-standaard | zie §3 |
| robots.txt & sitemap.xml | ✅ Shopify genereert automatisch | `/robots.txt`, `/sitemap.xml` |
| Mobielvriendelijk, geen horizontale scroll | ✅ (getest op 390/768/1440 px) | QA |

## 3. URL-structuur

| Pagina | URL |
|---|---|
| Home | `/` |
| Product | `/products/onderweg-fles` |
| Alle producten | `/collections/all` (later: `/collections/wandelen`, `/collections/drinken-en-voeren`) |
| Over ons | `/pages/over-ons` |
| Contact | `/pages/contact` |
| FAQ | `/pages/veelgestelde-vragen` |
| Verzending | `/pages/verzending-en-levering` |
| Retour | `/pages/retourneren` |
| Herroepingsformulier | `/pages/herroepingsformulier` |
| Privacy / Voorwaarden / Cookies | `/pages/privacybeleid`, `/pages/algemene-voorwaarden`, `/pages/cookiebeleid` |
| Blog | `/blogs/wandeltips/<artikel>` |

## 4. Paginatitels & meta descriptions (in Shopify invullen)

| Pagina | SEO-titel (≤ 60 tekens) | Meta description (≤ 155 tekens) |
|---|---|---|
| Home | Drinkfles voor honden met voervak \| Lobbes | Water én brokjes in één fles. De Lobbes Onderweg-fles met voervak, waterreservoir en vergrendelknop. Gratis verzending naar NL & BE. |
| Product | Drinkfles hond met voervak – 2-in-1 Onderweg-fles \| Lobbes | Water én brokjes in één fles: de Lobbes Onderweg-fles met voervak, waterreservoir, vergrendelknop en draagkoord. 5 kleuren, gratis verzending NL & BE. |
| Over ons | Over Lobbes – spullen voor onderweg met je hond | Lobbes maakt slimme, vrolijke spullen voor onderweg met je hond. Lees waarom we begonnen en waar we voor staan. |
| FAQ | Veelgestelde vragen \| Lobbes | Antwoorden over de Onderweg-fles, bestellen, betalen, verzending, retourneren en garantie. |
| Contact | Contact \| Lobbes | Vraag over je bestelling of de Onderweg-fles? Neem contact op met Lobbes; we reageren binnen 1 werkdag. |
| Verzending | Verzending & levering \| Lobbes | Gratis verzending naar Nederland en België. Lees alles over levertijden en track & trace. |
| Retour | Retourneren & terugbetalen \| Lobbes | 14 dagen bedenktijd. Zo meld je een retour en krijg je je geld terug. |

## 5. Interne links (al in het thema)
- Hero, uitgelicht product en afsluitende CTA linken naar het product.
- FAQ-antwoorden linken naar Verzending, Retour en de FAQ-pagina.
- De footer linkt naar alle service- en juridische pagina's.
- Blogartikelen tonen onderaan een productblok (`sections/main-article.liquid`, instelbaar per thema).

## 6. Contentstrategie (eerste 3 maanden)

**Doel:** informatieve zoekvragen rond "wandelen met de hond" afvangen en intern doorlinken naar het product. Twee artikelen per maand, 800–1.400 woorden, met een eigen foto of illustratie en een concrete checklist.

| # | Titel (werktitel) | Hoofdzoekwoord | Funnel |
|---|---|---|---|
| 1 | Hoeveel water drinkt een hond per dag? (met tabel per gewicht) | hoeveel water drinkt een hond | Top. ⚠️ Laat cijfers controleren door een dierenarts of verwijs naar een betrouwbare bron |
| 2 | Wandelen met je hond bij warm weer: 9 tips | hond warm weer wandelen | Top → product |
| 3 | Wat neem je mee op een lange wandeling met je hond? (checklist) | wandeling hond meenemen | Midden → product |
| 4 | Puppytraining onderweg: zo gebruik je beloningen slim | puppy training beloning | Midden → product |
| 5 | 10 hondvriendelijke wandelroutes in Nederland | wandelroutes met hond | Top |
| 6 | Op vakantie met de hond in de auto: paklijst | vakantie hond auto | Midden → product |
| 7 | Drinkfles voor honden kiezen: waar let je op? (eerlijke koopgids, ook alternatieven) | drinkfles hond kiezen | Onder → product |
| 8 | Cadeau voor een hondenliefhebber: 12 ideeën | cadeau hondenliefhebber | Seizoen (nov–dec) |

**Extra kanalen voor autoriteit:** vermeldingen bij hondenuitlaatservices, puppycursussen, hondenscholen en lokale dierenspeciaalzaken. Gebruik alleen echte samenwerkingen; koop geen links.

## 7. Na livegang
1. Voeg het domein toe aan **Google Search Console** en dien `/sitemap.xml` in.
2. Koppel **Google Merchant Center** via het Google & YouTube-kanaal in Shopify (Shopping + gratis vermeldingen). Vul GTIN/EAN in als de leverancier die levert. Anders: "identifier_exists = no".
3. Controleer de rich results met de [Rich Results Test](https://search.google.com/test/rich-results).
4. Controleer Core Web Vitals in Search Console na 28 dagen data.
