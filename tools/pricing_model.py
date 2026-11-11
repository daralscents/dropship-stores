#!/usr/bin/env python3
"""Lobbes – prijs- en winstmodel.

Alle aannames staan bovenaan in ASSUMPTIONS. Pas ze aan en draai opnieuw:
    python3 tools/pricing_model.py
Output: docs/03-prijsmodel.xlsx en een samenvatting op stdout.
"""
from pathlib import Path

ASSUMPTIONS = {
    # --- Gegeven door eigenaar ---
    "inkoop_per_stuk": 12.74,          # incl. verzending naar klant (gegeven)
    # --- Aannames (TE VERIFIËREN) ---
    "btw": 0.21,                        # NL-tarief; inkoop behandeld als NIET-aftrekbaar (conservatief)
    "douane_per_zending": 3.00,         # EU vast douanerecht €3 per productcategorie per zending (vanaf 1-7-2026),
                                        # alleen als zending van buiten de EU komt. 0 bij EU-magazijn.
    "handling_fee_per_zending": 0.00,   # mogelijke EU 'handling fee' (±€2) – nog niet bevestigd; zet op 2.00 voor worst case
    "betaal_pct": 0.019,                # gemengd tarief iDEAL/kaart/Bancontact/Klarna – check Shopify Payments-tarieven
    "betaal_vast": 0.25,
    "retour_pct": 0.05,                 # 5% van orders retour/terugbetaald (aanname)
    "restwaarde_retour": 0.50,          # deel van inkoopwaarde dat bij retour terugverdiend wordt (doorverkoop)
    "klantenservice_per_order": 0.50,   # tijd/tools per order
    "verpakking_extra": 0.00,           # bijv. merk-insertkaart bij private label
    "vaste_kosten_maand": 45.00,        # Shopify Basic (~€29-36) + domein + apps; check actuele tarieven
}

# Prijspunten (incl. btw) die we vergelijken; aanbevolen = 29.95
SINGLE_PRICES = [19.95, 24.95, 27.95, 29.95, 32.95]
BUNDLES = [  # (naam, aantal, prijs incl. btw)
    ("Single", 1, 29.95),
    ("Duo (2 stuks)", 2, 54.90),
    ("Trio (3 stuks)", 3, 77.85),
]


def unit_economics(price_incl: float, qty: int, a=ASSUMPTIONS, duty_on=True):
    rev_ex = price_incl / (1 + a["btw"])
    vat = price_incl - rev_ex
    cogs = a["inkoop_per_stuk"] * qty + a["verpakking_extra"] * qty
    duty = (a["douane_per_zending"] + a["handling_fee_per_zending"]) if duty_on else 0.0
    gross = rev_ex - cogs - duty
    pay = price_incl * a["betaal_pct"] + a["betaal_vast"]
    # Verwacht retourverlies: omzet terug, deel van inkoop terugverdiend
    ret = a["retour_pct"] * (rev_ex - a["restwaarde_retour"] * cogs)
    cs = a["klantenservice_per_order"]
    contrib = gross - pay - ret - cs
    be_roas = price_incl / contrib if contrib > 0 else float("inf")
    return {
        "prijs_incl": price_incl, "aantal": qty, "omzet_ex": rev_ex, "btw": vat,
        "inkoop": cogs, "douane": duty, "brutomarge": gross,
        "brutomarge_pct": gross / rev_ex, "betaalkosten": pay, "retourverlies": ret,
        "klantenservice": cs, "contributiemarge": contrib,
        "contributie_pct": contrib / rev_ex,
        "max_cac": contrib, "breakeven_roas": be_roas,
    }


def net_scenarios(base, a=ASSUMPTIONS):
    """Maandscenario's: orders x (contributie - CAC) - vaste kosten."""
    out = []
    for orders in (50, 150, 400):
        for label, cac in (("organisch (CAC €2)", 2.0), ("mix (CAC €5)", 5.0), ("alleen ads (CAC €9)", 9.0)):
            net = orders * (base["contributiemarge"] - cac) - a["vaste_kosten_maand"]
            out.append((orders, label, cac, net))
    return out


def fmt(x):
    return f"€{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def main():
    root = Path(__file__).resolve().parents[1]
    rows = []
    print("== Prijspunten single (met €3 douane) ==")
    for p in SINGLE_PRICES:
        for duty_on in (True, False):
            u = unit_economics(p, 1, duty_on=duty_on)
            rows.append(("Single", duty_on, u))
        u = unit_economics(p, 1)
        print(f"{fmt(p):>8}  bruto {fmt(u['brutomarge'])} ({u['brutomarge_pct']:.0%})  contributie {fmt(u['contributiemarge'])}  BE-ROAS {u['breakeven_roas']:.2f}")
    print("\n== Bundels (douane 1x per zending) ==")
    bundle_rows = []
    for name, q, p in BUNDLES:
        for duty_on in (True, False):
            u = unit_economics(p, q, duty_on=duty_on)
            bundle_rows.append((name, duty_on, u))
        u = unit_economics(p, q)
        print(f"{name:<15} {fmt(p):>8}  per stuk {fmt(p/q)}  contributie {fmt(u['contributiemarge'])}  BE-ROAS {u['breakeven_roas']:.2f}")
    base = unit_economics(29.95, 1)
    print("\n== Netto per maand bij €29,95 single ==")
    for orders, label, cac, net in net_scenarios(base):
        print(f"{orders:>4} orders  {label:<22} netto {fmt(net)}")

    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill
    except ImportError:
        print("openpyxl ontbreekt; xlsx overgeslagen")
        return
    wb = Workbook()
    ws = wb.active
    ws.title = "Aannames"
    ws.append(["Aanname", "Waarde", "Status"])
    for k, v in ASSUMPTIONS.items():
        ws.append([k, v, "gegeven" if k == "inkoop_per_stuk" else "aanname – verifiëren"])
    hdr = ["Variant", "Douane", "Prijs incl", "Aantal", "Omzet ex btw", "Btw", "Inkoop", "Douane/fee",
           "Brutomarge", "Bruto %", "Betaalkosten", "Retourverlies", "Klantenservice",
           "Contributiemarge", "Contributie %", "Max CAC", "Break-even ROAS"]
    for title, data in (("Single prijspunten", rows), ("Bundels", bundle_rows)):
        s = wb.create_sheet(title)
        s.append(hdr)
        for name, duty_on, u in data:
            s.append([name, "ja" if duty_on else "nee (EU-voorraad)", u["prijs_incl"], u["aantal"],
                      round(u["omzet_ex"], 2), round(u["btw"], 2), round(u["inkoop"], 2), round(u["douane"], 2),
                      round(u["brutomarge"], 2), round(u["brutomarge_pct"], 3), round(u["betaalkosten"], 2),
                      round(u["retourverlies"], 2), u["klantenservice"], round(u["contributiemarge"], 2),
                      round(u["contributie_pct"], 3), round(u["max_cac"], 2), round(u["breakeven_roas"], 2)])
    s = wb.create_sheet("Netto scenario's")
    s.append(["Orders/maand", "Acquisitie", "CAC", "Netto winst/maand (na vaste kosten)"])
    for r in net_scenarios(base):
        s.append([r[0], r[1], r[2], round(r[3], 2)])
    for sheet in wb.worksheets:
        for c in sheet[1]:
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor="1F3B33")
        for col in sheet.columns:
            sheet.column_dimensions[col[0].column_letter].width = 18
    out = root / "docs" / "03-prijsmodel.xlsx"
    out.parent.mkdir(exist_ok=True)
    wb.save(out)
    print(f"\nGeschreven: {out.relative_to(root)}")


if __name__ == "__main__":
    main()
