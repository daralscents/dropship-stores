# 03 · Prijsstrategie & winstberekening

Rekenmodel: `tools/pricing_model.py` → `docs/03-prijsmodel.xlsx`. Pas de aannames bovenin het script aan en draai het opnieuw (`python3 tools/pricing_model.py`).

## 1. Uitgangspunten

| Post | Waarde | Status |
|---|---|---|
| Inkoop incl. verzending naar klant | €12,74 per stuk | **Gegeven** |
| Btw verkoop | 21% | NL-tarief |
| Btw in inkoopprijs? | **Onbekend.** Gemodelleerd als *niet-aftrekbare kosten* (conservatief). | ❗ Vraag de leverancier om een factuur met btw-specificatie. Verkoopt de leverancier via IOSS met btw erin, dan kun je die meestal **niet** terugvragen. Komt de levering uit een EU-magazijn met NL-btw op de factuur, dan **wel**. Dat scheelt tot €2,21 per stuk. |
| EU-douanerecht | €3 per productcategorie per zending, sinds 1-7-2026, alleen bij verzending van buiten de EU | [O] Europese Commissie/SRA. Vraag de leverancier of dit al in de €12,74 zit. |
| EU-handling fee | mogelijk ±€2 per zending, ingangsdatum nog onzeker | [O] SRA; staat in het model op €0 (instelbaar) |
| Betaalkosten | 1,9% + €0,25 (gemengd) | [A] Controleer de Shopify Payments-tarieven in je admin |
| Retouren | 5% van orders; 50% restwaarde | [A] |
| Klantenservice | €0,50 per order | [A] |
| Vaste kosten | €45 per maand (Shopify Basic, domein, apps) | [A] Controleer de actuele tarieven |

## 2. Brutomarge vs. contributiemarge vs. nettowinst

- **Brutomarge** = omzet ex btw − inkoop − douane.
- **Contributiemarge** = brutomarge − betaalkosten − verwacht retourverlies − klantenservice. **Dit is je maximale CAC** (acquisitiekosten per klant waarbij je quitte speelt).
- **Nettowinst** = (contributiemarge − werkelijke CAC) × orders − vaste kosten.
- **Break-even ROAS** = verkoopprijs incl. btw ÷ contributiemarge (zoals Meta/TikTok ROAS meten: op bruto-omzet).

## 3. Prijspunten single (met €3 douane)

| Prijs | Brutomarge | Contributiemarge = max CAC | Break-even ROAS |
|---|---|---|---|
| €19,95 | €0,75 (5%) | **−€0,89** | n.v.t. (verlies) |
| €24,95 | €4,88 (24%) | €2,94 | 8,5 |
| €27,95 | €7,36 (32%) | €5,24 | 5,3 |
| **€29,95** | **€9,01 (36%)** | **€6,77** | **4,4** |
| €32,95 | €11,49 (42%) | €9,07 | 3,6 |

Zonder douane (EU-voorraad of douane al inbegrepen): alle contributiemarges **+€3**. Bij €29,95 wordt dat dan €9,77 met een break-even ROAS van 3,1.

### Gekozen prijs: **€29,95** (psychologisch ,95-patroon, gangbaar in NL)
- Onder RVS-premium (€35–45), ruim boven generiek (€15–20). Past bij merkpositionering.
- €27,95 is te krap voor betaalde advertenties (BE-ROAS 5,3); €32,95 vergroot het prijsverschil met marketplace-alternatieven te veel.
- **Geen doorgestreepte "van"-prijs.** Er is nooit tegen een hogere prijs verkocht, dus een vergelijkingsprijs zou misleidend zijn (Omnibus-richtlijn / art. 6:193c BW).

## 4. Bundels (echte korting, berekend t.o.v. de normale prijs)

| Bundel | Prijs | Per stuk | Besparing | Contributiemarge | BE-ROAS |
|---|---|---|---|---|---|
| Single | €29,95 | €29,95 | – | €6,77 | 4,4 |
| **Duo** (2 stuks, kleuren vrij te kiezen) | **€54,90** | €27,45 | €5,00 | €13,47 | 4,1 |
| **Trio** (3 stuks) | **€77,85** | €25,95 | €12,00 | €18,63 | 4,2 |

Bundels zijn beter voor de marge per order, omdat de douaneheffing maar één keer per zending telt (zelfde productcategorie). Ze passen bij meerhondenhuishoudens en cadeaus.

**Implementatie in Shopify** (zonder app, via native automatische kortingen):
1. *Duo*: korting "Bedrag korting op producten", €2,50 per artikel, minimale hoeveelheid 2, alleen dit product. 2 × (29,95 − 2,50) = €54,90 ✔
2. *Trio*: €4,00 per artikel, minimale hoeveelheid 3. 3 × (29,95 − 4,00) = €77,85 ✔
   **Let op:** zet beide kortingen op *niet combineerbaar met andere productkortingen*; Shopify past dan automatisch de voordeligste toe (bij 3+ stuks dus de Trio-korting).
3. De productpagina toont de bundelkeuze als hoeveelheidskeuze en vermeldt: "Korting wordt automatisch verrekend in je winkelwagen". Dat sluit exact aan op wat er in de checkout gebeurt.

## 5. Eerlijke conclusie en risico's

1. **Betaalde advertenties alleen zijn bij deze inkoopprijs krap.** Een break-even ROAS van 4,4 (single) is haalbaar met sterke creatives, maar niet vanzelfsprekend. Daarom start de lancering organisch, met UGC en creators (CAC €2–5). Zie de netto-scenario's in de xlsx: bij 150 orders/maand en een gemengde CAC van €5 houd je ±€221/maand netto over. Bij alleen ads (CAC €9) maak je verlies.
2. **Hefbomen om winstgevend op te schalen** (in volgorde van impact):
   - Inkoop heronderhandelen bij volume (doel ≤ €9 incl. verzending), of een andere leverancier met EU-magazijn (geen €3 douane, snellere levering, minder retouren).
   - Gemiddelde orderwaarde verhogen: bundels plus een tweede product (bijv. poepzakhouder of reisbak) als cross-sell.
   - E-mail/klantbehoud: herhaalaankopen zonder advertentiekosten.
3. **Prijsvergelijkbaarheid**: klanten kunnen een vergelijkbaar ogend product op bol.com vinden voor ±€17. Rechtvaardig het verschil met merk, service, garantieafhandeling in NL, (bij voorkeur) snelle levering en private label. Lukt dat niet, overweeg dan €27,95 met een strakkere CAC-discipline.
4. **Aanbiedingen**: alleen echte, tijdelijke acties (bijv. Black Friday −15% via kortingscode). Toon bij een prijsverlaging de laagste prijs van de afgelopen 30 dagen (Omnibus).

## 6. Advertentiekader (afgeleid)

| KPI | Grens single €29,95 | Doel om op te schalen |
|---|---|---|
| Max CAC (break-even) | €6,77 | ≤ €4,50 |
| Break-even ROAS | 4,4 | ≥ 5,5 (7-daagse klik) |
| CPC → conversieratio-check | Bij CPC €0,40 is ≥6% CR nodig voor break-even | CR ≥ 3% en AOV ≥ €38 |
