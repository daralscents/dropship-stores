#!/usr/bin/env python3
"""Genereert Klaviyo-klare HTML e-mailtemplates in email/ met één consistente Lobbes-huisstijl.
Klaviyo-variabelen: {{ first_name|default:'' }}, {% unsubscribe %}, {{ event.* }}, {{ organization.* }}.
"""
from pathlib import Path

SHOP = "https://[JOUW-DOMEIN]"  # na domeinkeuze vervangen
PRODUCT = f"{SHOP}/products/onderweg-fles"
LOGO = "[URL NAAR lobbes-logo-horizontaal.png – upload in Klaviyo → Images]"

LAYOUT = """<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
body{{margin:0;background:#F6F1E7;font-family:'DM Sans',Arial,Helvetica,sans-serif;color:#1A1F1C}}
a{{color:#1F3B33}}
.wrap{{max-width:600px;margin:0 auto;padding:24px 16px}}
.card{{background:#ffffff;border-radius:20px;padding:32px 28px}}
h1{{color:#1F3B33;font-size:26px;line-height:1.2;margin:0 0 16px}}
p{{font-size:16px;line-height:1.6;margin:0 0 14px}}
.btn{{display:inline-block;background:#B4502A;color:#ffffff!important;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px;font-size:16px}}
.muted{{color:#56635D;font-size:13px;line-height:1.5}}
.pre{{display:none;max-height:0;overflow:hidden}}
ul{{padding-left:20px;margin:0 0 14px}} li{{font-size:16px;line-height:1.6;margin-bottom:6px}}
</style></head>
<body>
<div class="pre">{preheader}</div>
<div class="wrap">
  <p style="text-align:center;margin:8px 0 20px"><a href="{shop}"><img src="{logo}" width="180" alt="Lobbes" style="border:0"></a></p>
  <div class="card">
{body}
  </div>
  <p class="muted" style="text-align:center;margin-top:20px">
    Lobbes · {{{{ organization.name }}}} · {{{{ organization.full_address }}}}<br>
    {footer}
  </p>
</div>
</body></html>
"""

MARKETING_FOOTER = "Je ontvangt deze mail omdat je je hebt aangemeld voor de Lobbes-nieuwsbrief. {% unsubscribe 'Afmelden' %} · {% manage_preferences 'Voorkeuren' %}"
SERVICE_FOOTER = "Je ontvangt deze servicemail naar aanleiding van je bezoek of bestelling bij Lobbes. {% unsubscribe 'Geen herinneringen meer ontvangen' %}"

EMAILS = {
    "01-welkom.html": dict(
        title="Welkom bij Lobbes", preheader="Fijn dat je er bent. Dit kun je van ons verwachten.",
        footer=MARKETING_FOOTER,
        body=f"""    <h1>Welkom bij Lobbes{{% if first_name %}}, {{{{ first_name }}}}{{% endif %}}!</h1>
    <p>Fijn dat je er bent. Lobbes maakt slimme, vrolijke spullen voor onderweg met je hond. We beginnen met de Onderweg-fles: water én brokjes in één fles.</p>
    <p>Wat je van ons kunt verwachten:</p>
    <ul><li>Af en toe wandeltips, routes en seizoenstips</li><li>Als eerste horen over nieuwe producten</li><li>Geen spam, en afmelden kan altijd met één klik</li></ul>
    <p style="margin:24px 0"><a class="btn" href="{PRODUCT}?utm_source=klaviyo&utm_medium=email&utm_campaign=welkom">Bekijk de Onderweg-fles</a></p>
    <p class="muted">Vraag? Beantwoord deze mail gewoon, we lezen alles zelf.</p>"""),
    "02-verlaten-winkelwagen.html": dict(
        title="Je vergat iets", preheader="Je Onderweg-fles staat nog in je winkelwagen.",
        footer=SERVICE_FOOTER,
        body=f"""    <h1>Nog even je rondje afmaken?</h1>
    <p>Je hebt de Onderweg-fles in je winkelwagen gezet, maar nog niet afgerekend. Geen haast: we hebben hem voor je bewaard.</p>
    <p><strong>{{{{ event.ProductName|default:'Lobbes Onderweg-fles' }}}}</strong></p>
    <p style="margin:24px 0"><a class="btn" href="{{{{ event.extra.checkout_url|default:'{SHOP}/cart' }}}}">Terug naar je winkelwagen</a></p>
    <p>Twijfel je nog? De vragen die we het vaakst krijgen:</p>
    <ul><li><strong>Lekt hij in mijn tas?</strong> Zet de knop op slot en vervoer hem rechtop.</li><li><strong>Bedenktijd?</strong> Je hebt 14 dagen na ontvangst.</li><li><strong>Verzending?</strong> Gratis naar Nederland en België.</li></ul>"""),
    "03-verlaten-checkout.html": dict(
        title="Je bestelling is bijna klaar", preheader="Je hoeft alleen nog af te rekenen.",
        footer=SERVICE_FOOTER,
        body=f"""    <h1>Je bestelling is bijna klaar</h1>
    <p>Je was al bij het afrekenen. Ging er iets mis of kwam er iets tussen? Je gegevens staan nog klaar.</p>
    <p style="margin:24px 0"><a class="btn" href="{{{{ event.extra.checkout_url }}}}">Bestelling afronden</a></p>
    <p>Lukt het betalen niet? Beantwoord deze mail, dan helpen we je verder.</p>"""),
    "04-na-aankoop-tips.html": dict(
        title="Zo haal je alles uit je Onderweg-fles", preheader="4 tips voor je eerste wandeling.",
        footer=SERVICE_FOOTER,
        body=f"""    <h1>Klaar voor je eerste rondje?</h1>
    <p>Bedankt voor je bestelling! Zodra je Onderweg-fles binnen is, helpen deze tips je op weg:</p>
    <ul>
      <li><strong>Eerst omspoelen</strong> met lauw water voordat je hem voor het eerst gebruikt.</li>
      <li><strong>Brokjes boven, water onder.</strong> Gebruik alleen droge brokjes of snoepjes.</li>
      <li><strong>Op slot</strong> voordat hij in je tas gaat, en bij voorkeur rechtop vervoeren.</li>
      <li><strong>Na het rondje:</strong> omspoelen en open laten drogen.</li>
    </ul>
    <p>Iets niet in orde met je fles? Beantwoord deze mail met een foto. We lossen het op.</p>"""),
    "05-reviewverzoek.html": dict(
        title="Hoe bevalt je Onderweg-fles?", preheader="Je eerlijke mening helpt andere hondenbazen.",
        footer=SERVICE_FOOTER,
        body=f"""    <h1>Hoe bevalt hij?</h1>
    <p>Je gebruikt de Onderweg-fles nu een paar weken. We zijn benieuwd naar je <strong>eerlijke</strong> ervaring, positief of kritisch. Daar leren wij van en het helpt andere hondenbazen kiezen.</p>
    <p style="margin:24px 0"><a class="btn" href="[REVIEW-LINK – bijv. Judge.me of Shopify Product Reviews]">Schrijf een review</a></p>
    <p class="muted">We plaatsen alle reviews van echte kopers, ook de kritische. We geven geen korting of cadeau in ruil voor een (positieve) review.</p>"""),
}


def main():
    out = Path(__file__).resolve().parents[1] / "email"
    out.mkdir(exist_ok=True)
    for name, e in EMAILS.items():
        (out / name).write_text(LAYOUT.format(shop=SHOP, logo=LOGO, **e))
    print("geschreven:", ", ".join(EMAILS))


if __name__ == "__main__":
    main()
