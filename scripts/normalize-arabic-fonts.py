"""Generate app-specific Tajawal fonts with consistent baseline metrics.

Run with Python + fonttools. Source fonts and glyph outlines remain untouched.
The bundled Open Sans cap height supplies the visual alignment reference.
"""
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "assets" / "fonts"
OUTPUT = FONTS / "normalized"
OUTPUT.mkdir(exist_ok=True)
reference = TTFont(FONTS / "OpenSans-Regular.ttf")
reference_metrics = reference["hhea"]
cap_center = (
    reference_metrics.ascent + reference_metrics.descent
    - reference["OS/2"].sCapHeight
) / reference["head"].unitsPerEm

for source in sorted(FONTS.glob("Tajawal-*.ttf")):
    font = TTFont(source, recalcTimestamp=False)
    metrics = font["OS/2"]
    # Tajawal's original ascender puts letters above a centered icon. Match the
    # English cap-height center while retaining room below for Arabic descenders.
    descent = abs(metrics.sTypoDescender)
    ascent = round(cap_center * font["head"].unitsPerEm) + descent + metrics.sCapHeight
    for table in (font["hhea"], metrics):
        if table is font["hhea"]:
            table.ascent, table.descent, table.lineGap = ascent, -descent, 0
        else:
            table.sTypoAscender, table.sTypoDescender, table.sTypoLineGap = ascent, -descent, 0
    metrics.version = max(metrics.version, 4)
    metrics.fsSelection |= 1 << 7  # USE_TYPO_METRICS on Android and other engines.
    metrics.usWinAscent = max(metrics.usWinAscent, ascent)
    metrics.usWinDescent = max(metrics.usWinDescent, descent)
    # A separate internal family prevents CoreText caching the original metrics.
    # Rename the derivative in accordance with the SIL Open Font License.
    for record in font["name"].names:
        if record.nameID in (1, 3, 4, 6, 16):
            record.string = record.toUnicode().replace("Tajawal", "SimplistArabic").encode(record.getEncoding())
    font.save(OUTPUT / source.name)
    print(f"{source.name}: ascent={ascent}, descent={descent}, gap=0")
