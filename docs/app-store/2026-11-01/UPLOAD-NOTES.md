# Simplist App Store screenshots

Prepared 1 November 2026 in the soft editorial direction: blush background,
original Simplist logo, Open Sans headlines, and native iOS app captures.

## Upload files

- `iphone-large-1320x2868`: five portrait PNGs, numbered in display order.
- `iphone-1206x2622`: the same five designs for the medium Dynamic Island iPhone screenshot slot.
- `ipad-13-2064x2752`: four portrait PNGs captured on an actual iPad simulator layout.

Use each set in its matching App Store Connect device slot. Upload the numbered
PNG files, not the preview boards or ZIP archives. Both provided iPhone sizes
are accepted sizes; do not mix sizes within a device slot. The app currently
has `ios.supportsTablet: true`, so the iPad set is included.

## Content and verification

1. Home — Gifts you love. One simple registry.
2. Registry overview — Every occasion. One place. (iPhone only)
3. Categories — Find gifts by category.
4. Store catalog — Explore stores you’ll love.
5. Registry details and Share control — Your registry. Ready to share.

The tablet overview is deliberately omitted because its current layout still
shows the Guides resource tab. No Guides page or Guides promotion is included.
The iPhone overview uses its real expanded registry list, which puts that tab
below the visible viewport.

Captured from source commit `8906dda39218f9fc66f976406b58d26f4a58b194` using the
existing fictional registry demo account and existing catalog. No personal
customer account was used. Product names, images, prices, purchase counts,
controls, and layouts are from the running app. No AI-generated application UI
is included. The native Share sheet was inspected; the final image uses the
registry detail screen so the registry and its Share control remain visible.

All upload PNGs were checked for exact dimensions, 8-bit RGB/sRGB output, and
absence of alpha/transparency. Device content is scaled proportionally. The
full screen is retained inside the frame; there are no development overlays,
loading states, dialogs, awards, ratings, download badges, or unsupported feature
claims. `captures/` contains source material and is not an upload folder.

These images represent the current source UI. The submitted build should show
the same experience; Apple reviews the complete submission.

## Apple references checked 1 November 2026

- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [App Review Guidelines, accurate metadata and screenshots](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)
- [Product page screenshot guidance](https://developer.apple.com/app-store/product-page/)

To reproduce the framing, run `node docs/app-store/render-assets.cjs` from
`registry-app`. The script uses the existing Sharp installation in the workspace
and the checked-in logo/fonts; it does not modify application screens.
