#!/usr/bin/env python3
"""Genereert productillustraties (SVG) van de Lobbes Onderweg-fles in alle kleuren.

Dit zijn vectorillustraties gebaseerd op de vorm van het aangeleverde referentiebeeld
(voervak boven, vergrendelknop midden, waterreservoir onder, draagkoord).
Ze dienen als nette placeholder tot er eigen productfoto's zijn.
"""
from pathlib import Path

COLORS = {
    # handle: (naam, schaalkleur, donkerder accent)
    "steengrijs": ("Steengrijs", "#B8BDC2", "#9AA0A6"),
    "zachtroze": ("Zachtroze", "#EEA2B4", "#D9849A"),
    "krijtwit": ("Krijtwit", "#F4F3EF", "#D9D6CF"),
    "ijsblauw": ("IJsblauw", "#80C7E6", "#5FAFD3"),
    "lavendel": ("Lavendel", "#C69CC3", "#AE7FAB"),
}

KIBBLE = "".join(
    f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
    for x, y, r, c in [
        (140, 330, 13, "#8A5A33"), (168, 336, 12, "#9C6A3F"), (196, 332, 13, "#7E5230"), (224, 338, 12, "#A0703F"),
        (252, 331, 13, "#8A5A33"), (150, 306, 12, "#A0703F"), (178, 309, 13, "#7E5230"), (206, 304, 12, "#9C6A3F"),
        (234, 310, 13, "#8A5A33"), (262, 305, 11, "#A0703F"), (140, 282, 12, "#7E5230"), (166, 280, 13, "#8A5A33"),
        (194, 279, 12, "#A0703F"), (222, 283, 13, "#9C6A3F"), (250, 279, 12, "#7E5230"), (156, 256, 12, "#9C6A3F"),
        (184, 254, 13, "#8A5A33"), (212, 257, 12, "#7E5230"), (240, 254, 12, "#A0703F"), (264, 258, 11, "#8A5A33"),
        (140, 233, 11, "#A0703F"), (170, 231, 12, "#7E5230"), (199, 233, 12, "#9C6A3F"), (228, 230, 12, "#8A5A33"),
        (256, 233, 11, "#9C6A3F"),
    ]
)


def bottle_svg(name: str, shell: str, accent: str, bg: str | None = "#F6F1E7") -> str:
    stroke = "#CFC9BE" if shell.upper() == "#F4F3EF" else accent
    background = f'<rect width="800" height="800" fill="{bg}"/>' if bg else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="Lobbes Onderweg-fles in {name}">
{background}
<ellipse cx="400" cy="772" rx="150" ry="14" fill="#1A1F1C" opacity=".08"/>
<g transform="translate(200 0)">
  <path d="M235 64C300 8 352 60 346 150C340 270 352 430 340 590" fill="none" stroke="#CFC8BD" stroke-width="5" stroke-linecap="round"/>
  <rect x="331" y="560" width="18" height="30" rx="6" fill="#B9B2A6"/>
  <path d="M100 470H300C305 520 318 560 318 620V735Q318 770 283 770H117Q82 770 82 735V620C82 560 95 520 100 470Z" fill="#EEF5F8" stroke="#D3DDE2" stroke-width="3"/>
  <path d="M86 610Q200 590 314 610V735Q314 766 283 766H117Q86 766 86 735Z" fill="#DCEEF6"/>
  <path d="M86 610Q140 600 200 604Q260 600 314 610" fill="none" stroke="#BFDCEA" stroke-width="3"/>
  <circle cx="160" cy="680" r="5" fill="#fff" opacity=".9"/><circle cx="210" cy="660" r="3.5" fill="#fff" opacity=".9"/><circle cx="240" cy="700" r="6" fill="#fff" opacity=".8"/><circle cx="185" cy="720" r="4" fill="#fff" opacity=".8"/>
  <path d="M108 520C104 560 100 600 100 640" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>
  <path d="M95 480V170C95 100 140 60 200 60C260 60 305 100 305 170V480Z" fill="{shell}" stroke="{stroke}" stroke-width="3"/>
  <path d="M125 165C125 115 160 88 200 88C240 88 275 115 275 165Z" fill="#FFFFFF" stroke="#E7E3DC" stroke-width="2"/>
  <path d="M190 104a10 10 0 0 0 20 0v-6h-20z" fill="{accent}"/>
  <rect x="118" y="172" width="164" height="202" rx="20" fill="#FBF8F3" stroke="{stroke}" stroke-width="2"/>
  <g clip-path="url(#w-{name})">{KIBBLE}</g>
  <clipPath id="w-{name}"><rect x="118" y="172" width="164" height="202" rx="20"/></clipPath>
  <path d="M132 186V300" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".75"/>
  <path d="M200 394C214 394 226 404 226 420C226 436 214 448 200 448C186 448 174 436 174 420C174 404 186 394 200 394Z" fill="{accent}"/>
  <path d="M200 404C209 404 215 411 215 419C215 428 209 434 200 434C191 434 185 428 185 419C185 411 191 404 200 404Z" fill="{shell}"/>
  <path d="M200 426v10" stroke="{accent}" stroke-width="5" stroke-linecap="round"/>
  <g fill="none" stroke="#5D6B66" stroke-width="2.4" stroke-linecap="round"><rect x="168" y="462" width="12" height="9" rx="2"/><path d="M171 462v-4a4 4 0 0 1 8 0"/><rect x="220" y="462" width="12" height="9" rx="2"/><path d="M223 462v-4a3 3 0 0 1 6 0v4"/></g>
</g>
</svg>
'''


def main():
    root = Path(__file__).resolve().parents[1]
    out = root / "theme" / "assets"
    out.mkdir(parents=True, exist_ok=True)
    for handle, (name, shell, accent) in COLORS.items():
        (out / f"fles-{handle}.svg").write_text(bottle_svg(name, shell, accent))
        (out / f"fles-{handle}-transparant.svg").write_text(bottle_svg(name, shell, accent, bg=None))
    print("ok", len(COLORS))


if __name__ == "__main__":
    main()
