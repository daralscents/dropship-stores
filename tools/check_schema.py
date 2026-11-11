#!/usr/bin/env python3
"""Extra schemacontrole voor regels die Shopify bij upload afdwingt maar Theme Check niet altijd meldt.

- labels/namen max. 70 tekens
- link_list-standaard alleen 'main-menu' of 'footer'
- url-standaard alleen '/collections' of '/collections/all'
- JSON-templates: elke sectie in 'sections' moet ook in 'order' staan (en andersom)
Gebruik: python3 tools/check_schema.py   (exitcode 1 bij fouten)
"""
import glob
import json
import re
import sys
from pathlib import Path

THEME = Path(__file__).resolve().parents[1] / "theme"
errors = []


def walk(obj, where):
    if isinstance(obj, dict):
        for key in ("label", "name"):
            v = obj.get(key)
            if isinstance(v, str) and len(v) > 70:
                errors.append(f"{where}: {key} > 70 tekens ({len(v)}): {v}")
        t, d = obj.get("type"), obj.get("default")
        if t == "link_list" and d not in (None, "main-menu", "footer"):
            errors.append(f"{where}: link_list '{obj.get('id')}' default '{d}' niet toegestaan")
        if t == "url" and d not in (None, "/collections", "/collections/all"):
            errors.append(f"{where}: url '{obj.get('id')}' default '{d}' niet toegestaan")
        for v in obj.values():
            walk(v, where)
    elif isinstance(obj, list):
        for v in obj:
            walk(v, where)


for f in sorted(glob.glob(str(THEME / "sections/*.liquid"))):
    m = re.search(r"\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema", Path(f).read_text(), re.S)
    if m:
        walk(json.loads(m.group(1)), Path(f).name)
walk(json.loads((THEME / "config/settings_schema.json").read_text()), "settings_schema.json")
for f in sorted(glob.glob(str(THEME / "templates/*.json"))):
    d = json.loads(Path(f).read_text())
    if set(d.get("sections", {})) != set(d.get("order", [])):
        errors.append(f"{Path(f).name}: 'sections' en 'order' komen niet overeen")

print("\n".join(errors) if errors else "Schemacontrole: OK")
sys.exit(1 if errors else 0)
