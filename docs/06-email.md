# 06 · E-mailmarketing & klantbehoud

Templates: `email/*.html` (gegenereerd door `tools/make_emails.py`, Klaviyo-syntax). Merkstijl: zandkleurige achtergrond, witte kaart, bosgroene koppen, terracotta knop, DM Sans met Arial als fallback.

> ⚠️ De Klaviyo-account die nu aan deze omgeving gekoppeld is, is van **Dar Al Scents**. Maak voor Lobbes een **aparte Klaviyo-account** aan (gratis tot 250 profielen), zodat lijsten, afzenderreputatie en toestemmingen gescheiden blijven. Er is in de bestaande account niets aangemaakt.

## 1. Overzicht flows (wie verstuurt wat, zonder dubbele mails)

| # | Mail | Trigger | Verstuurd door | Timing | Type | Template |
|---|---|---|---|---|---|---|
| 1 | Welkomstmail | Aanmelding nieuwsbrief (lijst "Nieuwsbrief", double opt-in) | Klaviyo | Direct na bevestiging | Marketing | `01-welkom.html` |
| 2 | Verlaten winkelwagen | Klaviyo "Added to Cart", geen "Started Checkout"/"Placed Order" | Klaviyo | 4 uur | Service/herinnering | `02-verlaten-winkelwagen.html` |
| 3 | Verlaten checkout | Shopify "Started Checkout", geen "Placed Order" | **Klaviyo** (zet Shopify's eigen mail **uit**) | 1 uur; optioneel 2e mail na 24 uur | Service/herinnering | `03-verlaten-checkout.html` |
| 4 | Bestelbevestiging | Order geplaatst | **Shopify** (Instellingen → Meldingen) | Direct | Transactioneel | Shopify-standaard, NL, met logo/kleuren |
| 5 | Verzendbevestiging + track & trace | Fulfillment met trackingnummer | **Shopify** | Bij verzending | Transactioneel | Shopify-standaard |
| 6 | Levering/onderweg-updates | Trackingstatus | **Shopify** (Shipping updates) | Automatisch | Transactioneel | Shopify-standaard |
| 7 | Na aankoop: gebruikstips | Klaviyo "Placed Order" | Klaviyo | 2 dagen na order | Service | `04-na-aankoop-tips.html` |
| 8 | Reviewverzoek | Klaviyo "Fulfilled Order" | Klaviyo **of** de review-app (niet allebei) | 14 dagen na fulfilment | Service | `05-reviewverzoek.html` |

**Dubbele mails voorkomen:**
- Shopify → Instellingen → Meldingen → *Verlaten checkout*: **uitzetten** als Klaviyo-flow 3 actief is.
- Flow 2 krijgt de filters *Started Checkout zero times since starting this flow* en *Placed Order zero times since starting this flow*.
- Flow 3 krijgt de filter *Placed Order zero times since starting this flow*.
- In alle herinneringsflows: *smart sending* aan (max. 1 mail per 16 uur).
- Kies voor reviewverzoeken óf Klaviyo óf de review-app (bijv. Judge.me), niet beide.

## 2. Wet- en regelgeving (NL/EU)
- **Nieuwsbrief = toestemming** (Telecommunicatiewet art. 11.7). Gebruik **double opt-in** en geen voorafgevinkt vakje in de checkout. Shopify: Instellingen → Klantaccounts/Marketing → "Bevestiging vereisen".
- **Soft opt-in** voor bestaande klanten (eigen, vergelijkbare producten) mag, mits je bij het verzamelen van het e-mailadres duidelijk de mogelijkheid tot afmelden hebt gegeven en elke mail een afmeldlink bevat.
- **Herinneringsmails** (verlaten winkelwagen/checkout) zijn geen pure transactiemails. Voorzichtige lijn: verstuur ze alleen naar wie toestemming gaf **of** onder de soft opt-in valt, en neem altijd een afmeldlink op (zit in de templates). ❗ Laat dit juridisch toetsen.
- **Reviewverzoeken:** geen beloning in ruil voor een (positieve) review. Geplaatste reviews moeten van echte kopers zijn en je moet vermelden hoe je dat controleert (Omnibus-richtlijn).
- Afzender: herkenbaar ("Lobbes"), met een fysiek adres in de footer (`organization.full_address` in Klaviyo instellen).
- **Domeinauthenticatie:** stel SPF, DKIM en DMARC in voor je verzenddomein (Klaviyo "branded sending domain"). Dat is verplicht voor goede bezorging bij Gmail en Yahoo.

## 3. Shopify-meldingen (NL) – aanpassen
Shopify → Instellingen → Meldingen → *Aanpassen*: logo (`brand/logo/lobbes-logo-horizontaal.svg` als PNG exporteren), accentkleur `#B4502A`. Zet de winkeltaal op Nederlands, zodat de standaardteksten Nederlands zijn. Voeg onderaan de bestelbevestiging toe:
> *Vragen over je bestelling? Beantwoord deze mail of mail naar [E-MAILADRES]. Je hebt 14 dagen bedenktijd na ontvangst. Zie [link naar /pages/retourneren].*

## 4. Pre-launch & aanmelden
- De wachtwoordpagina (`templates/password.json`) en de footer bevatten een aanmeldformulier. Dat formulier maakt een Shopify-klant aan met e-mailmarketingstatus en tags `newsletter,…`. Klaviyo synchroniseert dit via de Shopify-integratie.
- **Geen** pop-up met korting bij lancering: dat drukt de marge (zie prijsmodel). Wil je toch een incentive, kies dan "gratis wandeltips-checklist (PDF)" in plaats van korting.

## 5. Later (na 100+ klanten)
- Winback na 90 dagen (bijv. tweede product, cadeau-angle).
- Verjaardag van de hond (optioneel profielveld), met een persoonlijke mail zonder korting.
- Seizoenscampagnes: voorjaar (wandelseizoen), zomer (hitte-tips), november/december (cadeau).
