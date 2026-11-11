# 08 · Kwaliteitscontrole – uitgevoerde tests

*Datum: 11-11-2026. Omgeving: lokale Liquid-preview (`tools/preview`) die de échte themabestanden rendert met gesimuleerde Shopify-data. Nog niet getest in een echte Shopify-store (zie §4).*

## 1. Automatische tests

| Test | Tool | Resultaat |
|---|---|---|
| Shopify Theme Check (Liquid-syntax, ontbrekende snippets/vertalingen, img-afmetingen, assets, schema's) | `@shopify/theme-check-node` | ✅ **0 meldingen** (de werking van de checker is geverifieerd met een bewust foute kopie) |
| 15 routes × 3 schermformaten (iPhone 13 · iPad Mini · 1440px desktop) = 45 weergaven | Playwright (`tools/preview/qa.mjs`) | ✅ **0 problemen** |
| – HTTP-status (404-pagina geeft 404) | | ✅ |
| – Geen horizontale scroll | | ✅ (tabellen worden op mobiel gestapeld) |
| – Precies één `<h1>` per pagina | | ✅ |
| – Meta description + canonical aanwezig | | ✅ |
| – Geen kapotte afbeeldingen, alle `<img>` met alt | | ✅ |
| – Geen ontbrekende vertalingen | | ✅ |
| – JSON-LD geldig | | ✅ |
| – Geen JavaScript-fouten in de console | | ✅ |
| – Toegankelijkheid WCAG 2.0/2.1 A + AA | axe-core 4.14 | ✅ **0 schendingen** |
| Interne links (alle unieke links uit de desktopweergaven) | fetch | ✅ 15/15 OK |

### Koopflow (mobiel)
| Stap | Resultaat |
|---|---|
| Sticky koopknop verborgen bij laden, verschijnt na scrollen (en is dan pas focusbaar) | ✅ |
| Kleur kiezen werkt label en URL (`?variant=`) bij | ✅ |
| Duo kiezen + "In winkelwagen" opent de lade, teller = 2, regel toont "Duo-korting", totaal €54,90 | ✅ |
| "+" in de lade → 3 stuks → Trio-totaal €77,85 | ✅ |
| Escape sluit de lade en zet de focus terug | ✅ |
| Winkelwagenpagina: verwijderen werkt, afrekenknop (`name=checkout`) aanwezig | ✅ |
| **Zonder JavaScript**: Trio kiezen en toevoegen via normaal formulier → €77,85 | ✅ |
| Mobiel menu openen/sluiten | ✅ |

## 2. Gevonden en opgeloste problemen

| Probleem | Oplossing |
|---|---|
| Liquid-fout: filter binnen `{% form %}` (nieuwsbrief) | Waarde eerst toegewezen (`assign`) |
| Contrast: wit op terracotta #D9693C = 3,5:1 (< 4,5) en terracotta-tekst op zand | UI-accent naar **#B4502A** (5,1:1 op wit, 4,5:1 op zand); bovenkoppen op klei/groen aangepast; #D9693C blijft voor logo en illustraties |
| Bundelkeuze liep uit het raster (leeg element) | Markup opgeschoond |
| "Kleur:Steengrijs" zonder spatie | Label-layout aangepast |
| JS-fout: selector `[data-qty]` raakte ook knoppen in de lade | Eigen attribuut `data-qty-wrap` |
| Sticky koopknop `aria-hidden` maar focusbaar | `inert` totdat hij zichtbaar is |
| Galerij niet met toetsenbord scrollbaar | `tabindex="0"` + label |
| Tabellen privacy/cookies → horizontale scroll op mobiel | Responsieve gestapelde tabel met `data-label` |
| Bundel zonder JS voegde maar 1 stuk toe | Bundelradio's posten direct `quantity` |
| Slot-icoon in afrekenknop van de lade te groot | Vaste iconmaat in knoppen |
| Dubbel nieuwsbriefformulier op de homepage | Sectie verwijderd (footerformulier blijft) |
| Lage contrasttekst in de footer | Kleur aangepast |

## 3. Handmatig/visueel gecontroleerd
- Homepage, productpagina, winkelwagenlade, juridische pagina's en afsluitende CTA op mobiel en desktop (screenshots).
- Huisstijl consistent: kleuren via thema-instellingen, één knopstijl, één kaartstijl, iconenset in dezelfde lijnstijl als het logo.
- Spelling: alle teksten zijn in het Nederlands geschreven en nagelopen; kleurnamen worden consequent met een hoofdletter geschreven.
- **Laadsnelheid (indicatief):** homepage-HTML ±34 KB, CSS 23 KB, JS 10 KB (deferred), geen externe scripts of frameworks; illustraties zijn SVG. Echte Lighthouse/Core Web Vitals-meting: na upload in Shopify (fonts en CDN-afbeeldingen tellen dan mee).

## 4. Nog te testen in Shopify (na koppelen dev store)
- [ ] Thema uploaden als **ongepubliceerd** thema en Theme Editor openen (schema's laden zonder fouten).
- [ ] Productpagina met échte productmedia (variant → afbeelding wisselen).
- [ ] Automatische kortingen Duo/Trio werken in winkelwagen én checkout en komen overeen met de site.
- [ ] Testbestelling via **Bogus Gateway** (dev store) of Shopify Payments testmodus: bevestigingsmail, verzendmail.
- [ ] Contactformulier en nieuwsbrief: komen aan in Shopify (Klanten / inbox).
- [ ] Cookiebanner (EU) zichtbaar; pixels laden pas na toestemming.
- [ ] Lighthouse mobiel: doel Performance ≥ 90, Accessibility 100, SEO 100.

## 5. Zelf opnieuw draaien
```bash
cd tools/preview && npm install && node server.mjs &
node qa.mjs
```
