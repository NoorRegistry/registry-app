# Firebase Authentication Environment Setup

This document describes how Firebase projects and Google Sign-In are organized for this app when building with Expo + EAS.

## Summary

- Two Firebase projects exist: one for development/preview and one for production.
- EAS build profiles map to those projects via the `APP_VARIANT` env and native package/bundle IDs.
- Development & Preview share the _same_ Firebase project (DEV). Production uses the PROD project.
- Google Sign-In uses different client IDs per platform and environment; only PROD IDs are trusted in production backend.

## Firebase Projects

| Purpose               | Firebase Project (suggested name) | Used By APP_VARIANT  | Android ApplicationId      | iOS Bundle Identifier      |
| --------------------- | --------------------------------- | -------------------- | -------------------------- | -------------------------- |
| Development & Preview | shiftgiftme-dev                   | development, preview | com.shiftgiftme.mobile.dev | com.shiftgiftme.mobile.dev |
| Production            | shiftgiftme-prod                  | production           | com.shiftgiftme.mobile     | com.shiftgiftme.mobile     |

> NOTE: Sharing dev & preview means those installs hit the same Auth user pool and data. Keep test accounts clearly labeled. If you later need stricter isolation create a third project (staging / preview).

## EAS Build Profiles (eas.json)

```
Build profile  | channel     | distribution | APP_VARIANT  | Firebase Project
-------------- | ----------- | ------------ | ------------ | ----------------
development    | (none)      | internal     | development  | shiftgiftme-dev
preview        | preview     | internal     | preview      | shiftgiftme-dev
production     | production  | store        | production   | shiftgiftme-prod
```

## Native Identifiers & Config Files

Android:

- Dev/Preview (flavor or variant): `com.shiftgiftme.mobile.dev`
- Prod: `com.shiftgiftme.mobile`
- google-services.json locations:
  - Dev: `./assets/firebaseconfig/development/google-services.json` (copied/pointed during build)
  - Prod: Provided through env path (`GOOGLE_SERVICE_JSON`) set in EAS or moved into android flavor folder if you enable productFlavors.

iOS:

- Dev/Preview: `com.shiftgiftme.mobile.dev`
- Prod: `com.shiftgiftme.mobile`
- GoogleService-Info.plist:
  - Dev: `./assets/firebaseconfig/development/GoogleService-Info.plist`
  - Prod: Provided via env path (`GOOGLE_SERVICE_INFO_PLIST`) or scheme-specific file.

In `app.config.ts` the correct file & bundle/package ID are selected based on `APP_VARIANT`.

## Environment Variables

Primary selector: `APP_VARIANT` (development | preview | production)
Additional (example) public vars for Google Sign-In (set per profile in `eas.json`):

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

Backend token verification should whitelist the corresponding Web client IDs (dev + prod). In production deployments you may restrict to only prod IDs.

## Google Sign-In (react-native-google-signin)

Example initialization (ensure runs once, e.g. in a bootstrap file):

```ts
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
  forceCodeForRefreshToken: false,
});
```

Sign-in flow:

```ts
const { idToken } = await GoogleSignin.signIn();
// Send idToken to backend OR use Firebase auth:
// const credential = GoogleAuthProvider.credential(idToken);
// await auth().signInWithCredential(credential);
```

## Adding SHA Fingerprints (Android)

1. For development client / preview builds, obtain the SHA-1 & SHA-256:
   - Run: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Or from EAS build logs (release keystore).
2. Add fingerprints to the corresponding Firebase Android app (Dev or Prod).
3. Download updated `google-services.json` if new fingerprints added.

## Common Tasks

| Task                          | Action                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| Add new tester (dev)          | Create account in dev build; appears in shiftgiftme-dev Auth users                                 |
| Promote feature to production | Ensure no dev-only config; build with `eas build --profile production --platform android` (or ios) |
| Rotate prod keys              | Regenerate new keystore (only if necessary) and update Firebase SHA entries                        |
| Add staging later             | Create `shiftgiftme-staging` project, new IDs (`.staging` suffix), add new EAS build profile       |

## Risks of Shared Dev & Preview

- Mixed analytics & crash reports (if enabled later).
- Preview testers can accidentally affect dev test data.
  Mitigation: Use clearly named test accounts; avoid using real production-like data in dev/preview.

## Future Improvements

- Introduce product flavors (Android) and schemes/configurations (iOS) for cleaner automatic file selection.
- Split preview into its own Firebase project if user pool or data separation becomes important.

## Troubleshooting

| Issue                                         | Likely Cause                            | Fix                                     |
| --------------------------------------------- | --------------------------------------- | --------------------------------------- |
| Google Sign-In fails on dev but works on prod | Missing dev SHA in dev Firebase project | Add SHA-1 & SHA-256, re-download config |
| iOS sign-in modal says wrong client ID        | Env vars not set for that EAS profile   | Set profile env vars or rebuild         |
| Prod build using dev bundle ID                | APP_VARIANT not set to production       | Check `eas.json` profile env            |

---

Last updated: (add date when modifying)
