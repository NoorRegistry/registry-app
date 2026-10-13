# Simplist mobile app

Expo SDK 57 / React Native 0.86, with a native development client.

## Local development

Use Node.js 24 (`nvm use`) and a current npm 11 release, then run `npm ci`.
Local API and authentication settings belong in `.env.local`.

Run `npm run ios` for the iOS simulator, or `npm run android` for Android.
After changing native dependencies, rebuild the development client. JavaScript
changes only need Metro (`npm start`). iOS requires Xcode 26.4 or newer and
CocoaPods; the deployment target is iOS 16.4.

## Validation

- `npx expo install --check`
- `npx expo-doctor@latest`
- `npx tsc --noEmit`
- `npm run lint`
- `npx jest --runInBand`

The SDK-recommended Sentry 7.11 config plugin imports `@expo/config-plugins`
directly, so it is an explicit development dependency. Expo Doctor reports a
direct-install warning for it and explicitly allows this peer-dependency case.
Our own config plugin uses the preferred `expo/config-plugins` entry point.

The SDK 57 Expo lint preset is enabled, including React Compiler diagnostics.

## Native configuration

Branding, bundle identifiers, splash assets, linking, and native plugins are
configured in `app.config.ts` and `plugins/`. Both native projects were regenerated
for SDK 57. Keep native customizations in configuration/plugins so future prebuilds
can reproduce them. Inspect and preserve any manual native changes before running
`npx expo prebuild --clean`.

See [Firebase setup](README_FIREBASE.md) for Google sign-in configuration.

## Notifications

The Home bell opens a paginated inbox with unread badges and mark-all-read.
Profile and the inbox expose notification settings: activity push and device
permission status. Permission is requested once, after the first authenticated
Home visit (including after profile completion). A declined prompt is not repeated;
users can enable notifications in system Settings. Registration retries on foreground,
token changes and the settings refresh action. Rebuild the native app after adding
`expo-notifications` or changing its plugin/entitlements.

Push payloads use a supported type plus resource IDs, never arbitrary URLs:
friend request → request details, acceptance → friend details, registry sharing →
guest registry, purchase → the owner's item details with its purchase history.
Each destination calls its normal API to load fresh data and enforce authorization.
Pending taps persist through login, onboarding, profile completion and relaunch.
Payloads for a different account are discarded. Unknown/malformed payloads are
ignored. Reading the notification does not block navigation.

Logout unregisters the installation before clearing the session, stops in-flight
registration, clears delivered notifications and resets the app badge. If device
unregistration fails, logout shows a short retry error so it cannot falsely claim
that account pushes have stopped. The same device is assigned to only its current
account. Closing the app keeps push registration active.

Configure APNs in EAS for each bundle ID, and FCM v1 for Android. Development uses
`com.shiftgiftme.mobile.dev`; preview/production use `com.shiftgiftme.mobile`.
A real iPhone development build is still required to confirm full remote delivery;
notification navigation can be tested with `xcrun simctl push`. For simulator APNs
fixtures, put the application payload under `body` alongside `aps`, matching Expo's
native iOS serializer. The backend README documents worker configuration.

## Addresses and COD orders

Profile is the sixth bottom tab; Guides remains in the navigation. The profile
uses a scrolling brand header and a compact white header after scrolling, with
Orders, Addresses and Friends shortcuts. Settings owns language and notification
preferences. Help and Register as a partner currently open placeholder screens.
Account icons use Phosphor duotone SVGs, with their MIT notice beside the assets.
Recent shopping and address primary actions use the shared brand color.

Profile → Addresses manages saved Kuwait addresses. The address editor uses a
full-screen map picker followed by a scrolling form with a fixed Save footer.
Location permission is requested only on “Use my location”; users can also pan
the map to select a location without granting permission.
Checkout uses the selected/latest address, a fixed KWD 2 delivery fee and COD.
The backend requotes prices, reserves stock and protects repeated submission.
Successful checkout opens the animated confirmation screen. Profile → Orders
opens paginated history and order details; order pushes open the same details.

Android uses Google Maps when `GOOGLE_MAPS_ANDROID_API_KEY` is set at prebuild.
Without a key, the development flow uses Leaflet/OpenStreetMap in a WebView with
visible attribution and normal browser caching. `EXPO_PUBLIC_MAP_TILE_URL` can
select another OSM-compatible tile provider; choose a suitable provider before
launching at scale. iOS uses Google Maps when `GOOGLE_MAPS_IOS_API_KEY` is set
at prebuild, and Apple Maps until configured. The location picker uses a fixed center
pin on both platforms; moving the map selects the coordinate beneath the pin.
Continue is disabled until the map stops. The details map is a readonly preview.
Reverse geocoding uses the platform location service rather than a Google
Geocoding API key. It runs after movement stops, waits 650 ms and reuses the result
on Continue. Manual address fields remain available if that lookup fails.
The three address types have equal widths with icons above centered labels,
including at 320 dp. With enlarged text or narrower widths, types and paired
fields stack vertically. Save remains visible above the keyboard on iOS and Android.
Local Android smoke flows are documented in `.maestro/README.md`.

Google Maps development setup uses the `noorregistryapp@gmail.com` account and
the existing `Registry App Dev` project (`registry-app-80b12`). Keep its keys
separate from production. Link billing and enable only Maps SDK for iOS and
Maps SDK for Android for the coordinate picker. Create a separate restricted
key for each platform: iOS bundle `com.shiftgiftme.mobile.dev`; Android package
`com.shiftgiftme.mobile.dev` with the development build's SHA-1 fingerprint.
Set `GOOGLE_MAPS_IOS_API_KEY` and `GOOGLE_MAPS_ANDROID_API_KEY` in the matching
EAS environment as sensitive variables. Local key copies belong in an ignored
`.env.maps.local`; source that file explicitly for prebuild, not Metro, until the
native client has been rebuilt. Cloud builds exclude native directories through
`.easignore` and regenerate them from config/plugins, so keys are never written
into tracked native sources. Rebuild the app after changing Maps keys.
Production Maps keys belong to `Registry App Prod` (`registry-app-prod`) and
the EAS Production environment, restricted to `com.shiftgiftme.mobile`. The Android
production restriction uses the EAS signing certificate; add Google Play’s app
signing SHA-1 before distributing through Play if it signs with a different key.
The development Android key allows both the local debug certificate and EAS
development signing certificate.
Never put development keys in Production or share one key between platforms.
The basic native Maps SDK has unlimited free usage; Places, Google Geocoding,
Routes, Street View and cloud map IDs are not needed for selecting coordinates.
See [Expo setup](https://docs.expo.dev/versions/latest/sdk/map-view/) and
[Google pricing](https://developers.google.com/maps/billing-and-pricing/pricing).

For physical development builds, connect Metro over LAN. A local API URL uses
Metro's host for real phones, and Android's `10.0.2.2` loopback on an emulator.
Release builds must set `EXPO_PUBLIC_API_URL` to the deployed HTTPS API.
The `testing` profile is a standalone internal build connected to
`https://api.shopsimplist.com` and the test database. It uses the development
bundle/package, Firebase project and Maps keys from EAS Development, and needs
neither Metro nor USB. Build with `eas build --profile testing --platform all`.
Android produces an APK; iOS uses ad hoc installation for registered devices.
The Android launcher and notification icons use the Simplist brand mark.
The development profile uses the local API on port 3050 and resolves the Mac
address from Metro when a physical phone connects on the same network.
Run `eas build --platform ios --profile development` for the registered iPhone,
and `eas build --platform android --profile development` for an Android APK.
FCM v1 service-account credentials are assigned in EAS separately: Firebase
`registry-app-80b12` → `com.shiftgiftme.mobile.dev`, and `registry-app-prod` →
`com.shiftgiftme.mobile`. Both passed Google's validation-only send check. Private
service-account JSON files stay outside this repository and are not environment
variables. Firebase's `google-services.json` is the client configuration, not the
FCM service-account credential. Verify remote delivery on an installed device
build after granting notification permission.

Address entry is now two steps: a full-screen location picker followed by a compact
map preview and details form. Change location preserves the entered fields until
Continue commits the new pin. Apartment, House and Office use the appropriate
unit fields. Avenue and custom label are optional; a blank label defaults to the
address type. The Kuwait prefix is fixed at +965. Unusable profile phone numbers
are left blank rather than copied under the wrong country code.
