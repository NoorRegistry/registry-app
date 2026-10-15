# Arabic baseline normalization

These app-specific `SimplistArabic` fonts are derived from the original Tajawal
files one directory above. Glyph outlines, shaping, kerning and weights are
unchanged. Only vertical metrics and the internal derivative family names change.

The originals have an ascender of roughly 0.643 em, a descender of 0.357 em and a
0.2 em line gap. Their cap-height center sits above the center of a native text
line, unlike our bundled Open Sans. This is visible beside icons and in buttons.
The generated fonts match Open Sans's cap-height center, retain the original
Arabic descender space, remove the extra line gap and consistently select typo
metrics on Android. Windows bounds still retain room for accents and diacritics.

All existing `Tajawal*` Expo aliases load these files, including navigation titles
and form inputs. Shared Typography uses a consistent line height and keeps Latin
numbers/prices in Open Sans. No screen-specific vertical offsets are needed.

Regenerate from the immutable source files with Python and `fonttools`:

```sh
python3 scripts/normalize-arabic-fonts.py
```

The fonts remain licensed under the included SIL Open Font License 1.1.
Original copyright: (c) 2017 by Boutros International. All rights reserved.
The derivative uses a distinct internal family to avoid native font cache clashes.
