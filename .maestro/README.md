# Local Android smoke flows

Run these against the local API and its test database, using a dedicated
`Android QA` customer. They create addresses and place COD orders. Never use a
real customer cart. No Maestro Cloud or AI analysis is needed.

Prerequisites: an installed development APK, Metro running, and Maestro 2.11+
with Java 17+. The emulator used locally is `emulator-5554`.

```sh
MAESTRO_CLI_NO_ANALYTICS=1 maestro --device emulator-5554 test \
  -e QA_EMAIL=your-test-account@example.invalid -e QA_OTP=your-test-code .maestro/login.yaml
maestro --device emulator-5554 test .maestro/address.yaml
maestro --device emulator-5554 test .maestro/checkout.yaml
maestro --device emulator-5554 test \
  -e DELIVERED_REFERENCE=SS-00020 -e CANCELLED_REFERENCE=SS-00021 .maestro/order-notifications.yaml
```

The checkout flow expects two units of `QA Android Checkout Item`, priced at
KWD 4.125 each, and the address created by `address.yaml`. The notification flow
expects the delivered/paid order and a separate cancelled order, with the four
order events in the inbox. Supply the actual references from your fixtures.

Address checks cover the center-pin map, Apartment/House fields, preserving
details when changing location, the fixed Save button with the keyboard open,
and saving the address. Checkout checks delivery, COD, totals, confirmation,
history/details, and cart clearing. Notification checks verify all four inbox
event routes. They do not verify remote FCM delivery.

For a 320 dp viewport on the local 480 dpi emulator:

```sh
adb shell wm size 960x2133
# Run the flows, then restore the original viewport.
adb shell wm size reset
```

Screenshots are saved inside Maestro's run output directory. Restore any
temporary device font/viewport settings and remove your disposable fixtures
after testing.

## iOS map gestures

`address-map-ios.yaml` checks four pan directions, Continue, and changing the
selected location. It opens an unsaved address draft; it does not save an address
or place an order. Keep the Expo floating tools button away from Change location.
If Simulator drags only zoom while the map gestures are enabled, restart the
simulated device (without erasing it) and retry before changing map code.

## Home

`home.yaml` covers the registry carousel, the header cart, public registry search,
optional event date selection/clearing, horizontal featured rows and their final
See all tiles, product actions, and registry activity. It uses the original shared
product card. Run on both iOS and Android against the local API with the backend's
`node test/home-smoke.cjs seed` fixtures. The flow signs into the disposable Home QA
account and completes onboarding. Disable OTP email and push delivery on the local
API, and provide its development OTP through `QA_OTP`.

```sh
maestro --device <simulator-or-emulator-id> test \
  -e QA_EMAIL=<fixture-email> -e QA_OTP=<development-otp> \
  -e QA_LOGIN=true -e QA_REGISTRY_CATEGORY_ID=<fixture-category-id> \
  -e QA_DATE_LABEL="October 15, 2026" .maestro/home.yaml
```

Set `QA_DATE_LABEL` to the 15th of the current month in English (matching the date
picker), and `QA_LOGIN=false` only when already signed into this QA account.
The flow adds one unit of a fixture product to the QA cart. It does not place an
order or save the registry draft. Run the backend fixture cleanup after testing.

`home-rtl.yaml` switches an English QA session to Arabic, checks the mirrored Home
layout and featured-gift scrolling/navigation, then restores English. Run it on
each platform after the main flow, before removing the QA fixtures.

## Registry overview (iOS and Android)

Use the backend's persistent fixtures from `node test/registry-overview-demo.cjs`.
They remain in the configured development database for manual testing. The main
account is `registry-overview-qa@example.invalid`: five owned registries, one
shared registry, purchased items, and activity. Companion accounts are
`registry-overview-single-qa@example.invalid` (one registry) and
`registry-overview-empty-qa@example.invalid` (no registries).

Start the local API with email/push delivery disabled and its development OTP
configured. Metro and the installed development app must use this local API.

```sh
MAESTRO_CLI_NO_ANALYTICS=1 maestro --device <device-id> test \
  -e QA_EMAIL=registry-overview-qa@example.invalid -e QA_OTP=<development-otp> \
  .maestro/registry-overview-login.yaml
MAESTRO_CLI_NO_ANALYTICS=1 maestro --device <device-id> test \
  .maestro/registry-overview.yaml
```

The main flow checks the three-registry limit, expansion/collapse, owner and
shared detail navigation, shared photo permissions, and Activity/Ideas/Guides.
It uses deterministic registry IDs from the fixture script. Photo picker checks
require a harmless image added to the simulator library. Keep these persistent
fixtures; they are separate from the disposable checkout/Home smoke fixtures.

`registry-overview-states.yaml` signs into the single-registry and empty accounts,
checks that both stay on the overview, then restores the main QA account. Pass
`QA_OTP` as above. The login helper signs out the current QA session first.
`registry-overview-rtl.yaml` checks Arabic ownership tabs and the mirrored layout,
then restores English. It reconnects to local Metro after each language reload.
The iOS checks used the iPhone 17 Pro simulator. Native photo cancellation and
upload were also checked with the repository's brand image. Those picker checks
are manual; the repeatable flows do not select photos from a personal library.
