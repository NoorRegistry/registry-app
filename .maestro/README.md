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
