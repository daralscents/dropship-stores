# 07 · Juridische checklist (NL/EU) – vóór livegang

> Dit is een zorgvuldige voorbereiding, **geen juridisch advies**. Laat de teksten in `content/pages/` en de punten met ❗ toetsen door een jurist of via bijvoorbeeld Thuiswinkel.org / DigiD-loket-ondernemers (KVK). Er zijn **geen** bedrijfsgegevens verzonnen: alle officiële gegevens staan als `[PLACEHOLDER]` in de teksten of als lege thema-instelling.

## 1. Verplichte bedrijfsinformatie (art. 3:15d BW, Dienstenrichtlijn, Handelsregisterwet)
| Gegeven | Waar | Status |
|---|---|---|
| Handelsnaam + juridische naam | Thema-instellingen → Bedrijfsgegevens (footer/contact) + teksten | ❗ invullen |
| Vestigingsadres (geen postbus) | idem | ❗ invullen |
| KvK-nummer | idem | ❗ invullen |
| Btw-identificatienummer | idem | ❗ invullen |
| E-mailadres (en telefoon optioneel) | idem | ❗ invullen |

Het thema toont alleen ingevulde velden, zodat er nooit lege labels zichtbaar zijn. In de juridische pagina's staan placeholders tussen [HAKEN]. De QA-suite rapporteert deze zolang ze er staan.

## 2. Consumentenrecht & herroeping
- ✅ 14 dagen bedenktijd vanaf ontvangst, met uitleg in Retourneren en de Algemene voorwaarden (art. 6:230o BW).
- ✅ **Modelformulier voor herroeping** als eigen pagina (`/pages/herroepingsformulier`).
- ✅ Terugbetaling binnen 14 dagen, inclusief standaard verzendkosten; wachten tot retour ontvangen is toegestaan.
- ❗ Kies of de retourkosten voor de klant zijn (zo staat het nu in de teksten) of voor jou, en pas de teksten aan.
- ❗ **Retouradres in NL/EU** regelen. Laat klanten nooit naar China retourneren zonder dat vooraf duidelijk te melden. Beter: een eigen retouradres.
- ✅ Leveringstermijn max. 30 dagen (art. 7:19a BW) staat in de teksten.
- ✅ Wettelijke garantie (conformiteit) benoemd. Een eventuele extra garantie mag je wettelijke rechten niet beperken.
- ✅ **Geen ODR-link opgenomen:** het Europese ODR-platform is per 20 juli 2025 opgeheven (Verordening (EU) 2024/3228). Verwijs dus niet meer naar ec.europa.eu/odr.

## 3. Prijzen & aanbiedingen
- ✅ Alle prijzen incl. btw; verzendkosten vóór de checkout zichtbaar ("Gratis verzending NL & BE").
- ✅ Geen doorgestreepte vergelijkingsprijzen. Bij latere acties toon je de **laagste prijs van de afgelopen 30 dagen** (art. 6:193c BW / Omnibus).
- ✅ Bundelkorting is een echte korting op de normale prijs, en de site berekent die exact zoals Shopify hem toepast.
- ✅ Geen nepschaarste, afteltimers of verzonnen verkoopaantallen (oneerlijke handelspraktijken, art. 6:193a e.v. BW).
- ✅ Geen reviews tot er echte reviews zijn. Plaats je reviews, vermeld dan hoe je controleert dat ze van echte kopers komen (art. 6:193g/h BW).

## 4. Privacy (AVG) & cookies (Telecommunicatiewet 11.7a)
- ✅ Privacybeleid met doelen, grondslagen, bewaartermijnen, ontvangers, doorgifte buiten de EER en rechten (`content/pages/privacybeleid.html`).
- ❗ **Cookiebanner:** zet de ingebouwde Shopify-banner aan (Instellingen → Klantprivacy → Cookiebanner, regio EU/EER). Het thema laadt zelf **geen** trackers; pixels via Shopify-apps en Customer Events respecteren de toestemming via de Customer Privacy API.
- ❗ Voeg een link "Cookievoorkeuren" toe aan de footer. Die maakt Shopify automatisch zodra de banner aan staat; anders handmatig in het juridische menu.
- ❗ Sluit verwerkersovereenkomsten / accepteer DPA's (Shopify, Klaviyo, leverancier/fulfilment). Bij een leverancier buiten de EER: gebruik standaardcontractbepalingen (SCC's) en vermeld dit in het privacybeleid.
- ❗ Houd een verwerkingsregister bij (ook als kleine onderneming; het is het eenvoudigste bewijs van zorgvuldigheid).

## 5. Productveiligheid – GPSR (Verordening (EU) 2023/988, van toepassing sinds 13-12-2024)
Als webshop die een product **van buiten de EU** op de EU-markt brengt, ben jij in de praktijk vaak de **importeur**, en daarmee (mede) aansprakelijk. Bij dropshipping verandert dat niet: de verkoper richting consument blijft verantwoordelijk.

| Verplichting | Wat te doen | Status |
|---|---|---|
| Online vermelden (art. 19): fabrikant (naam, postadres, elektronisch contact), **verantwoordelijke persoon in de EU** (als fabrikant buiten EU), productidentificatie (type/model/batch), waarschuwingen/veiligheidsinfo in het **Nederlands** | Metafields `lobbes.fabrikant`, `lobbes.eu_verantwoordelijke`, `lobbes.model`, `lobbes.waarschuwingen`. Het thema toont ze onder "Veiligheid & fabrikant" | ❗ invullen; tot dan staat er "wordt binnenkort aangevuld". **Niet live gaan zonder deze gegevens.** |
| Gegevens op product/verpakking | Naam + adres van fabrikant én importeur/EU-verantwoordelijke op verpakking of meegeleverd document | ❗ met leverancier regelen (private label-sticker/insert) |
| Technische documentatie / risicoanalyse | Opvragen bij leverancier; zelf een korte risicoanalyse maken (kleine onderdelen, lekken, materialen) | ❗ |
| Materialen in contact met voer/water | Vraag een **materiaalverklaring en testrapport** (bijv. LFGB of EU 10/2011 voor kunststof in contact met levensmiddelen; strikt genomen is diervoeding geen levensmiddel, maar de rapporten zijn het beste bewijs bij "BPA-vrij"/"food grade"-claims). Claim niets zonder bewijs. | ❗ |
| REACH / POPs | Bevestiging dat geen SVHC's > 0,1% en geen verboden stoffen zijn gebruikt | ❗ opvragen |
| Incidenten | Ongevallen melden via [Safety Business Gateway](https://ec.europa.eu/safety-gate); procedure voor terugroepen vastleggen | ❗ |

**Vraag de leverancier schriftelijk om:** (1) volledige naam en adres van de fabrikant, (2) model/typenummer, (3) materiaalspecificatie + testrapporten, (4) inhoud water/voer en afmetingen, (5) gebruiks- en reinigingsinstructies, (6) of de €12,74 btw en douanerechten bevat en wie importeur is (IOSS-nummer?), (7) levertijd naar NL/BE en het retouradres.

## 6. Import, btw en douane (dropshipping)
- Zendingen van buiten de EU tot €150: btw via **IOSS**. Wie is de "importeur" en wiens IOSS-nummer wordt gebruikt? Bij de meeste dropshipmodellen ben jij de verkoper op afstand en heb je **zelf** een IOSS-registratie (of intermediair) nodig, óf de leverancier verzendt DDP met de btw al voldaan. ❗ Laat dit bevestigen door je boekhouder.
- Sinds **1 juli 2026** geldt **€3 douanerecht** per productcategorie per zending (tijdelijk tot 1 juli 2028). Dit zit in het prijsmodel als kostenpost.
- Een mogelijke EU-handling fee (±€2 per aangifteregel) is aangekondigd, maar de ingangsdatum is onzeker. Volg dit.
- **Klant mag niet verrast worden** door invoerkosten bij levering. Bij verzending zonder voldane btw/douane moet dat vóór de koop duidelijk zijn. Dat is onwenselijk; kies voor DDP/IOSS of EU-voorraad.
- Btw-aangifte: verkopen aan BE-consumenten boven €10.000/jaar (EU-totaal) via **OSS** aangeven.

## 7. Overige aandachtspunten
- **Afbeeldingen:** de aangeleverde productfoto is waarschijnlijk van de fabrikant of een andere verkoper. Gebruik die alleen met schriftelijke toestemming; het thema gebruikt eigen illustraties.
- **Merk "Lobbes":** zelf controleren in BOIP/TMview vóór je investeert in verpakking en domein (zie `02-merkidentiteit.md`).
- **Toegankelijkheid:** de European Accessibility Act geldt sinds 28-06-2025 voor e-commerce. Micro-ondernemingen (< 10 fte én ≤ €2 mln omzet) zijn uitgezonderd, maar het thema is al getest op WCAG 2.1 AA met axe-core (0 schendingen).
- **Algemene voorwaarden** moeten vóór of bij het sluiten van de overeenkomst beschikbaar zijn: link in de footer + Shopify-beleid (Instellingen → Beleid) zodat ze in de checkout verschijnen.
