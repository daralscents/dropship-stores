# 10 · Status dev store (`test-1-jvuncbjt.myshopify.com`)

*Bijgewerkt: 11-11-2026. Alles hieronder is via de Shopify-koppeling uitgevoerd en daarna met een query gecontroleerd.*

## Uitgevoerd ✅

| Onderdeel | Resultaat |
|---|---|
| Thema **"Lobbes v1.1"** | Geüpload als **ongepubliceerd** thema (ID 211106660677), alle 74 bestanden geaccepteerd. Het huidige live thema ("test-data") is niet aangeraakt. |
| Product **Onderweg-fles** | `/products/onderweg-fles`, actief, 5 varianten (Steengrijs, Zachtroze, Krijtwit, IJsblauw, Lavendel) à €29,95, SKU's `LOB-OWF-*`, voorraad niet gevolgd + doorverkopen toegestaan (dropshipping), SEO-titel/description, gepubliceerd op Online Store |
| Productafbeeldingen | 5 illustraties (1600×1600, één per kleur) met alt-tekst, elk gekoppeld aan de juiste variant. **Tijdelijk:** vervangen door echte foto's |
| Metafield-definities | 11 velden in namespace `lobbes` (specs + GPSR). `reiniging` en `waarschuwingen` zijn ingevuld; de rest is leeg tot de leverancier bevestigt |
| Pagina's | over-ons (about), veelgestelde-vragen (faq), verzending-en-levering, retourneren, herroepingsformulier, privacybeleid, algemene-voorwaarden, cookiebeleid. De bestaande `contact`-pagina is bijgewerkt met template `contact` |
| Menu's | `lobbes-hoofdmenu`, `lobbes-klantenservice`, `lobbes-juridisch` (nieuw; bestaande menu's ongemoeid), gekoppeld in de thema-instellingen |
| Automatische kortingen | **Duo-korting** €2,50 per fles vanaf 2 stuks · **Trio-korting** €4,00 per fles vanaf 3 stuks. Alleen voor de Onderweg-fles, niet onderling combineerbaar. De bestaande testkortingen gelden alleen voor snowboards en botsen dus niet |
| Verzending België | Nieuwe zone "België" met "Gratis verzending" €0 |
| Markt België | Nieuwe actieve markt "België" (BE) |
| Btw | De winkel staat al op "prijzen inclusief btw" |

## Lessen uit de upload (verwerkt in `tools/check_schema.py`)
- Schema-labels mogen **max. 70 tekens** zijn; Theme Check meldt dit niet. Daardoor werden `main-product` en daarmee `product.json` bij de eerste upload (v1.0) geweigerd.
- De standaardwaarde van `link_list` mag alleen `main-menu` of `footer` zijn.
- In een JSON-template moet elke sectie ook in `order` staan.
- Oud thema **"Lobbes v1.0 (verouderd – mag weg)"** kun je verwijderen. Thema's verwijderen is via de koppeling geblokkeerd.

## Nog handmatig in de Shopify-admin 🔴

| # | Actie | Waar | Waarom niet automatisch |
|---|---|---|---|
| 1 | **Thema bekijken:** Online Store → Thema's → "Lobbes v1.1" → *Voorbeeld* / *Aanpassen* | Admin | Deze omgeving kan de storefront niet openen (netwerkbeleid) |
| 2 | **Verzending NL op gratis zetten:** Instellingen → Verzending → Algemeen profiel → Domestic → "Standaard" €6,95 wijzigen naar €0 (of de €55-voorwaarde verwijderen) | Admin | Deze tariefconfiguratie kan de API niet wijzigen. Tot die tijd betalen NL-klanten onder €55 nog €6,95, terwijl de site "gratis" belooft |
| 3 | **Beleid** invullen (Instellingen → Beleid): retour, privacy, voorwaarden, verzending. Gebruik de teksten uit `content/pages/` of een korte tekst met link naar de pagina | Admin | De koppeling mist het recht `write_legal_policies` |
| 4 | **Cookiebanner** aanzetten: Instellingen → Klantprivacy → Cookiebanner (EU/EER) | Admin | Privacy-instelling |
| 5 | **Betalingen** voor test: in een dev store werkt "(for testing) Bogus Gateway" | Admin | – |
| 6 | Thema-instellingen → Bedrijfsgegevens (KvK, btw, adres, e-mail) | Theme editor | Officiële gegevens, niet verzonnen |
| 7 | Metafields specs + GPSR invullen zodra de leverancier antwoordt | Product → Metafields | Niet geverifieerd |
| 8 | Placeholders [HAKEN] in de juridische pagina's vervangen | Online Store → Pagina's | Bedrijfs-/leveranciersgegevens |
| 9 | Optioneel: de testproducten (snowboards) archiveren, zodat zoekresultaten en `/collections/all` schoon zijn | Producten | Ik verwijder geen bestaande data zonder jouw akkoord |

**Testscenario na stap 1–5:** voeg 2 kleuren toe (de Duo-korting moet −€5,00 tonen), verhoog naar 3 (Trio −€12,00) en reken af met Bogus Gateway (kaartnummer `1`). Controleer daarna de bevestigingsmail.
