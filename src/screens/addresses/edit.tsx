import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors } from "@/constants/Colors";
import AddressMap from "@/components/AddressMap";
import { AddressPin } from "@/components/AddressMap/types";
import Typography from "@/components/Typography";
import { useAddressChoice, useAddresses } from "@/hooks/useAddresses";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { AddressInput, saveAddress } from "@/services/orders.service";
import {
  getDecodedToken,
  getUserFirstLastName,
  getUserSub,
} from "@/utils/helper";
import { kuwaitPhoneDigits } from "@/utils/address";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
const kuwait = { latitude: 29.3759, longitude: 47.9774 };
const addressTypes = ["APARTMENT", "HOUSE", "OFFICE"] as const;
const icons = {
  APARTMENT: "business-outline",
  HOUSE: "home-outline",
  OFFICE: "briefcase-outline",
} as const;
const inKuwait = (pin: AddressPin) =>
  Number.isFinite(pin.latitude) &&
  Number.isFinite(pin.longitude) &&
  pin.latitude >= 28.5 &&
  pin.latitude <= 30.12 &&
  pin.longitude >= 46.4 &&
  pin.longitude <= 48.8;
async function timed<T>(task: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Location timeout")), 15000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
export default function AddressEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height, width, fontScale } = useWindowDimensions();
  const stackedFields = width < 320 || fontScale > 1.15;
  const addresses = useAddresses();
  const client = useQueryClient();
  const choose = useAddressChoice((state) => state.choose);
  const existing = addresses.data?.find((address) => address.id === id);
  const [loaded, setLoaded] = useState<string>();
  const rawPhone = String(getDecodedToken()?.user?.mobileNumber ?? "").replace(
    /\D/g,
    "",
  );
  const [form, setForm] = useState<AddressInput>({
    addressType: "APARTMENT",
    label: "",
    fullName: getUserFirstLastName(),
    phone: /^[569]\d{7}$/.test(kuwaitPhoneDigits(rawPhone))
      ? kuwaitPhoneDigits(rawPhone)
      : "",
    country: "KW",
    governorate: null,
    area: "",
    block: "",
    street: "",
    building: "",
    floor: "",
    apartment: "",
    avenue: "",
    instructions: "",
  });
  const [step, setStep] = useState<"location" | "details">(
    id ? "details" : "location",
  );
  const [pin, setPin] = useState<AddressPin | null>(null);
  const [draftPin, setDraftPin] = useState<AddressPin>(kuwait);
  const [changed, setChanged] = useState(false);
  const [locating, setLocating] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [mapMoving, setMapMoving] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [mapHeight, setMapHeight] = useState(
    Math.max(250, height - insets.top - insets.bottom - 145),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectionVersion = useRef(0);
  const geocode = useRef<{
    key: string;
    task: Promise<Location.LocationGeocodedAddress | undefined>;
  } | null>(null);
  const lookup = (coordinate: AddressPin) => {
    const key = `${coordinate.latitude.toFixed(6)},${coordinate.longitude.toFixed(6)}`;
    if (geocode.current?.key === key) return geocode.current.task;
    const task = timed(Location.reverseGeocodeAsync(coordinate))
      .then((results) => results[0])
      .catch(() => {
        if (geocode.current?.key === key) geocode.current = null;
        return undefined;
      });
    geocode.current = { key, task };
    return task;
  };
  useEffect(() => {
    if (step !== "location" || mapMoving || !inKuwait(draftPin)) return;
    let active = true;
    const timer = setTimeout(() => {
      void lookup(draftPin).then((location) => {
        if (active)
          setLocationLabel(location?.district || location?.city || "");
      });
    }, 650);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [step, mapMoving, draftPin]);
  if (existing && loaded !== id) {
    setLoaded(id);
    setForm({
      ...existing,
      addressType: existing.addressType ?? "APARTMENT",
      phone: kuwaitPhoneDigits(existing.phone),
    });
    const savedPin =
      existing.latitude != null && existing.longitude != null
        ? { latitude: existing.latitude, longitude: existing.longitude }
        : null;
    setPin(savedPin);
    setDraftPin(savedPin ?? kuwait);
  }
  const setField = (key: keyof AddressInput, value: string) => {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: "" }));
  };
  const selectPin = (next: AddressPin) => {
    if (!Number.isFinite(next.latitude) || !Number.isFinite(next.longitude))
      return;
    selectionVersion.current++;
    setLocationLabel("");
    setDraftPin(next);
  };
  const currentLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Toast.show({ type: "error", text1: t("addresses.locationDenied") });
        return;
      }
      const position = await timed(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
      );
      if (inKuwait(position.coords)) selectPin(position.coords);
      else Toast.show({ type: "error", text1: t("addresses.kuwaitOnly") });
    } catch {
      Toast.show({ type: "error", text1: t("addresses.locationError") });
    } finally {
      setLocating(false);
    }
  };
  const continueLocation = async () => {
    if (continuing || locating || mapMoving) return;
    setContinuing(true);
    const next = draftPin;
    if (!inKuwait(next)) {
      Toast.show({ type: "error", text1: t("addresses.kuwaitOnly") });
      setContinuing(false);
      return;
    }
    const version = selectionVersion.current;
    try {
      const location = await lookup(next);
      if (version !== selectionVersion.current) return;
      if (location?.isoCountryCode && location.isoCountryCode !== "KW") {
        Toast.show({ type: "error", text1: t("addresses.kuwaitOnly") });
        return;
      }
      const moved =
        !pin ||
        Math.abs(pin.latitude - next.latitude) > 0.0001 ||
        Math.abs(pin.longitude - next.longitude) > 0.0001;
      setPin(next);
      setForm((old) => ({
        ...old,
        area: location?.district || location?.city || (moved ? "" : old.area),
        street: location?.street || (moved ? "" : old.street),
      }));
      setStep("details");
      setChanged(false);
    } finally {
      setContinuing(false);
    }
  };
  const changeLocation = () => {
    Keyboard.dismiss();
    setMapMoving(false);
    setDraftPin(pin ?? kuwait);
    setChanged(true);
    setStep("location");
  };
  const locationBack = () => {
    selectionVersion.current++;
    setMapMoving(false);
    if (changed) setStep("details");
    else if (router.canGoBack()) router.back();
    else router.replace("/addresses");
  };
  const save = useMutation({
    mutationFn: () =>
      saveAddress(
        {
          ...form,
          label: form.label.trim() || form.addressType || "APARTMENT",
          phone: `+965${kuwaitPhoneDigits(form.phone)}`,
          apartment: form.addressType === "HOUSE" ? null : form.apartment,
          floor: form.addressType === "HOUSE" ? null : form.floor,
          latitude: pin?.latitude ?? null,
          longitude: pin?.longitude ?? null,
        },
        id,
      ),
    onSuccess: async (address) => {
      choose(address.id);
      await client.invalidateQueries({ queryKey: ["addresses", getUserSub()] });
      if (router.canGoBack()) router.back();
      else router.replace("/addresses");
    },
    onError: () =>
      Toast.show({ type: "error", text1: t("addresses.saveError") }),
  });
  const submit = () => {
    const next: Record<string, string> = {};
    for (const field of [
      "fullName",
      "area",
      "block",
      "street",
      "building",
    ] as const)
      if (!form[field].trim()) next[field] = t("addresses.required");
    if (form.addressType === "APARTMENT" && !form.apartment?.trim())
      next.apartment = t("addresses.required");
    if (!/^[569]\d{7}$/.test(kuwaitPhoneDigits(form.phone)))
      next.phone = t("addresses.invalidPhone");
    if (!pin) {
      changeLocation();
      return;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    Keyboard.dismiss();
    save.mutate();
  };
  const input = (field: keyof AddressInput, label: string, numeric = false) => (
    <View style={{ flex: 1, gap: 4 }}>
      <View
        style={{
          minHeight: 54,
          borderWidth: 1,
          borderColor: errors[field] ? palette.danger : "#E7E6E2",
          borderRadius: 13,
          paddingHorizontal: 14,
          paddingVertical: form[field] ? 6 : 0,
          justifyContent: "center",
        }}
      >
        {!!form[field] && (
          <Typography.Text
            size="xs"
            style={{ fontSize: 10, color: palette.muted }}
          >
            {label}
          </Typography.Text>
        )}
        <TextInput
          accessibilityLabel={label}
          testID={`address-field-${field}`}
          value={String(form[field] ?? "")}
          onChangeText={(value) => setField(field, value)}
          placeholder={label}
          placeholderTextColor="#9B9C98"
          keyboardType={numeric ? "numbers-and-punctuation" : "default"}
          maxLength={
            field === "building"
              ? 160
              : field === "instructions"
                ? 250
                : field === "label"
                  ? 40
                  : field === "street"
                    ? 100
                    : 60
          }
          style={{
            fontSize: 14,
            color: palette.ink,
            paddingVertical: 6,
            minHeight: 30,
          }}
        />
      </View>
      {!!errors[field] && (
        <Typography.Text size="xs" type="danger">
          {errors[field]}
        </Typography.Text>
      )}
    </View>
  );
  const footer = (
    label: string,
    action: () => void,
    busy: boolean,
    disabled = false,
    floating = false,
  ) => (
    <View
      style={{
        paddingHorizontal: floating ? 0 : 20,
        paddingVertical: floating ? 0 : 12,
        borderTopWidth: floating ? 0 : 1,
        borderTopColor: "#F2F1ED",
      }}
    >
      <Pressable
        accessibilityRole="button"
        testID={step === "location" ? "address-continue" : "address-save"}
        disabled={busy || disabled}
        accessibilityState={{ disabled: busy || disabled, busy }}
        onPress={action}
        style={{
          minHeight: 52,
          borderRadius: 14,
          backgroundColor: BrandColors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Typography.Text weight="medium" style={{ color: "#fff" }}>
            {label}
          </Typography.Text>
        )}
      </Pressable>
    </View>
  );
  if (id && addresses.isLoading)
    return (
      <SafeAreaView style={styles.screen}>
        <FriendsTopBar title={t("addresses.edit")} />
        <ScreenSkeleton kind="address" />
      </SafeAreaView>
    );
  if (id && !existing)
    return (
      <SafeAreaView style={styles.screen}>
        <FriendsTopBar title={t("addresses.edit")} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 15,
          }}
        >
          <Typography.Text>{t("addresses.unavailable")}</Typography.Text>
          <Pressable onPress={() => void addresses.refetch()}>
            <Typography.Text>{t("notifications.retry")}</Typography.Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  if (step === "location")
    return (
      <View style={styles.screen}>
        <View
          style={{ flex: 1 }}
          onLayout={(event) => setMapHeight(event.nativeEvent.layout.height)}
        >
          <AddressMap
            pin={draftPin}
            onSelect={selectPin}
            onMoving={(moving) => {
              if (moving) selectionVersion.current++;
              setMapMoving(moving);
            }}
            height={mapHeight}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            testID="address-location-back"
            onPress={locationBack}
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 20,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={palette.ink} />
          </Pressable>
          {!!locationLabel && !mapMoving && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: insets.top + 18,
                maxWidth: "60%",
                alignSelf: "center",
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <Typography.Text size="sm">{locationLabel}</Typography.Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("addresses.useLocation")}
            testID="address-use-location"
            disabled={locating || continuing}
            onPress={() => void currentLocation()}
            style={{
              position: "absolute",
              right: 18,
              bottom: insets.bottom + 98,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              backgroundColor: "#fff",
              borderRadius: 25,
              paddingHorizontal: 14,
              paddingVertical: 11,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            {locating ? (
              <ActivityIndicator color={palette.accent} />
            ) : (
              <Ionicons name="locate-outline" size={20} color={palette.ink} />
            )}
            <Typography.Text size="sm">
              {t("addresses.useLocation")}
            </Typography.Text>
          </Pressable>
          <View
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: insets.bottom + 28,
            }}
          >
            {footer(
              t("addresses.continue"),
              () => void continueLocation(),
              continuing || locating,
              mapMoving,
              true,
            )}
          </View>
        </View>
      </View>
    );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar
        title={t(id ? "addresses.edit" : "addresses.add")}
        onBack={() => {
          if (!id) {
            setChanged(false);
            setDraftPin(pin ?? kuwait);
            setStep("location");
          } else if (router.canGoBack()) router.back();
          else router.replace("/addresses");
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            gap: 12,
          }}
        >
          <View style={{ marginHorizontal: -20 }}>
            <AddressMap
              pin={pin}
              onSelect={() => undefined}
              height={125}
              interactive={false}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#F0EEEB",
            }}
          >
            <Ionicons name="location-outline" size={21} color={palette.muted} />
            <View style={{ flex: 1 }}>
              <Typography.Text size="xs" style={{ color: palette.muted }}>
                {t("addresses.area")}
              </Typography.Text>
              <TextInput
                accessibilityLabel={t("addresses.area")}
                testID="address-field-area"
                placeholder={t("addresses.area")}
                value={form.area}
                onChangeText={(value) => setField("area", value)}
                maxLength={80}
                style={{ fontSize: 15, color: palette.ink, paddingVertical: 5 }}
              />
              {!!errors.area && (
                <Typography.Text size="xs" type="danger">
                  {errors.area}
                </Typography.Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("addresses.changeLocation")}
              testID="address-change-location"
              onPress={changeLocation}
              style={{ padding: 9 }}
            >
              <Typography.Text size="sm" style={{ color: palette.accent }}>
                {t("addresses.change")}
              </Typography.Text>
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: stackedFields ? "column" : "row",
              gap: 9,
              paddingVertical: 8,
            }}
          >
            {addressTypes.map((type) => (
              <Pressable
                key={type}
                testID={`address-type-${type}`}
                accessibilityRole="button"
                accessibilityLabel={t(`addresses.types.${type}`)}
                accessibilityState={{ selected: form.addressType === type }}
                onPress={() => setField("addressType", type)}
                style={{
                  flex: stackedFields ? undefined : 1,
                  minWidth: 0,
                  flexDirection: stackedFields ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  minHeight: stackedFields ? 52 : 64,
                  paddingHorizontal: 4,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor:
                    form.addressType === type ? BrandColors.primary : "#E7E6E2",
                  backgroundColor:
                    form.addressType === type ? BrandColors.primary : "#fff",
                }}
              >
                <Ionicons
                  name={icons[type]}
                  size={17}
                  color={form.addressType === type ? "#fff" : palette.ink}
                />
                <Typography.Text
                  size="sm"
                  style={{
                    color: form.addressType === type ? "#fff" : palette.ink,
                    textAlign: "center",
                    width: stackedFields ? undefined : "100%",
                    flexShrink: 1,
                  }}
                >
                  {t(`addresses.types.${type}`)}
                </Typography.Text>
              </Pressable>
            ))}
          </View>
          {input(
            "building",
            t(
              form.addressType === "HOUSE"
                ? "addresses.houseNumber"
                : "addresses.buildingName",
            ),
          )}
          {form.addressType !== "HOUSE" && (
            <View
              style={{
                flexDirection: stackedFields ? "column" : "row",
                gap: 12,
              }}
            >
              {input(
                "apartment",
                t(
                  form.addressType === "OFFICE"
                    ? "addresses.officeNumber"
                    : "addresses.apartmentNumber",
                ),
                true,
              )}
              {input("floor", t("addresses.floor"), true)}
            </View>
          )}
          {input("street", t("addresses.street"))}
          <View
            style={{ flexDirection: stackedFields ? "column" : "row", gap: 12 }}
          >
            {input("block", t("addresses.block"), true)}
            {input("avenue", t("addresses.avenue"))}
          </View>
          <View style={{ gap: 4 }}>
            <View
              style={{
                minHeight: 54,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: errors.phone ? palette.danger : "#E7E6E2",
                borderRadius: 13,
                paddingHorizontal: 14,
                gap: 12,
              }}
            >
              <Typography.Text style={{ fontSize: 14 }}>
                🇰🇼 +965
              </Typography.Text>
              <View
                style={{ width: 1, height: 26, backgroundColor: "#E7E6E2" }}
              />
              <TextInput
                accessibilityLabel={t("addresses.phone")}
                testID="address-field-phone"
                placeholder={t("addresses.phone")}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) =>
                  setField("phone", kuwaitPhoneDigits(value))
                }
                maxLength={16}
                style={{
                  flex: 1,
                  fontSize: 14,
                  paddingVertical: 12,
                  color: palette.ink,
                }}
              />
            </View>
            {!!errors.phone && (
              <Typography.Text size="xs" type="danger">
                {errors.phone}
              </Typography.Text>
            )}
          </View>
          {input("instructions", t("addresses.instructions"))}
          {input("label", t("addresses.addressLabel"))}
          {!getUserFirstLastName().trim() &&
            input("fullName", t("addresses.name"))}
        </ScrollView>
        {footer(t("addresses.save"), submit, save.isPending)}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
