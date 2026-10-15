import { CommerceText, CommerceTopBar } from "@/components/Commerce";
import { Skeleton, SkeletonBlock } from "@/components/Skeleton";
import { textFontFamily } from "@/components/Typography/metrics";
import { BrandColors as C } from "@/constants/Colors";
import { getUserFirstLastName } from "@/utils/helper";
import {
  normalizeProfileCode,
  parseProfileQr,
  profileQrValue,
} from "@/utils/profile-qr";
import Feather from "@expo/vector-icons/Feather";
import { requireOptionalNativeModule } from "expo";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ActionButton } from "../components";
import { useFriendsSummary, useRefreshOnFocus } from "../hooks";
// Older dev clients can show codes and manual lookup until rebuilt with camera.
function Scanner({
  onScan,
  paused,
}: {
  onScan: (value: string) => void;
  paused: boolean;
}) {
  const { t } = useTranslation();
  if (Platform.OS === "web" || !requireOptionalNativeModule("ExpoCamera"))
    return (
      <View
        style={{
          flex: 1,
          minHeight: 200,
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          padding: 22,
        }}
      >
        <Feather name="camera" size={32} color={C.deep} />
        <CommerceText style={{ color: C.muted, textAlign: "center" }}>
          {t("qr.buildRequired")}
        </CommerceText>
      </View>
    );
  // Loading this module before the check would crash clients without native camera support.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ProfileCamera = require("./camera")
    .default as typeof import("./camera").default;
  return <ProfileCamera onScan={onScan} paused={paused} />;
}
export default function ProfileQrScreen() {
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState(initialTab === "scan" ? "scan" : "mine");
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const summary = useFriendsSummary();
  useRefreshOnFocus(summary.refetch);
  const [manual, setManual] = useState("");
  const [error, setError] = useState(false);
  const [active, setActive] = useState(true);
  const [scanning, setScanning] = useState(false);
  const locked = useRef(false);
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      locked.current = false;
      setScanning(false);
      return () => setActive(false);
    }, []),
  );
  const openCode = (value: string) => {
    if (locked.current) return;
    locked.current = true;
    setScanning(true);
    const code = parseProfileQr(value);
    if (!code) {
      setError(true);
      return;
    }
    setError(false);
    router.push({ pathname: "/friends/code/[code]", params: { code } });
  };
  const reset = () => {
    locked.current = false;
    setScanning(false);
    setError(false);
  };
  const code = summary.data?.profileCode;
  const normalized = code ? normalizeProfileCode(code) : null;
  const size = Math.min(236, Math.max(120, width - 144));
  const share = async () => {
    if (!normalized) return;
    try {
      await Share.share({
        message: `${getUserFirstLastName()}\n${normalized}\n${profileQrValue(normalized)}`,
      });
    } catch {
      Toast.show({ type: "error", text1: t("qr.shareError") });
    }
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom", "left", "right"]}
    >
      <CommerceTopBar
        title={t("qr.title")}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/profile")
        }
      />
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        }}
      >
        {["mine", "scan"].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: value === tab }}
            testID={`qr-tab-${value}`}
            onPress={() => {
              setTab(value);
              reset();
            }}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              borderBottomWidth: tab === value ? 2 : 0,
              borderBottomColor: C.primary,
            }}
          >
            <CommerceText
              weight={tab === value ? "medium" : "regular"}
              style={{ color: value === tab ? C.deep : C.muted }}
            >
              {t(value === "mine" ? "qr.myCode" : "qr.scan")}
            </CommerceText>
          </Pressable>
        ))}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {tab === "mine" ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 28,
              gap: 16,
            }}
          >
            <CommerceText
              size="xl"
              weight="medium"
              style={{ textAlign: "center" }}
            >
              {getUserFirstLastName() || t("profile.title")}
            </CommerceText>
            {normalized ? (
              <>
                <View
                  accessible
                  accessibilityLabel={t("qr.myCode")}
                  testID="profile-qr-code"
                  style={{
                    padding: 20,
                    backgroundColor: "white",
                    borderRadius: 18,
                  }}
                >
                  <QRCode
                    value={profileQrValue(normalized)}
                    size={size}
                    quietZone={16}
                    color="#302A27"
                    backgroundColor="white"
                    ecl="M"
                  />
                </View>
                <CommerceText
                  selectable
                  weight="medium"
                  style={{
                    writingDirection: "ltr",
                    textAlign: "center",
                    color: C.deep,
                    letterSpacing: 2,
                  }}
                >
                  {normalized}
                </CommerceText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void share()}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 9,
                    padding: 15,
                  }}
                >
                  <Feather name="share-2" size={18} color={C.deep} />
                  <CommerceText style={{ color: C.deep }}>
                    {t("qr.share")}
                  </CommerceText>
                </Pressable>
              </>
            ) : summary.isPending ? (
              <Skeleton>
                <SkeletonBlock
                  style={{ width: size, height: size, borderRadius: 14 }}
                />
              </Skeleton>
            ) : (
              <View style={{ gap: 18, alignItems: "center" }}>
                <CommerceText style={{ color: C.muted }}>
                  {t("qr.loadError")}
                </CommerceText>
                <ActionButton
                  title={t("notifications.retry")}
                  onPress={() => void summary.refetch()}
                />
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 18 }}
          >
            {active && <Scanner onScan={openCode} paused={scanning} />}
            {error && (
              <View style={{ gap: 12 }}>
                <CommerceText
                  accessibilityRole="alert"
                  style={{ textAlign: "center", color: "#B33F36" }}
                >
                  {t("qr.invalid")}
                </CommerceText>
                <ActionButton
                  title={t("qr.scanAgain")}
                  onPress={reset}
                  secondary
                />
              </View>
            )}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TextInput
                testID="profile-code-input"
                accessibilityLabel={t("qr.enterCode")}
                value={manual}
                onChangeText={(value) => {
                  setManual(value);
                  if (error) reset();
                }}
                placeholder="SS-1234-ABCD"
                maxLength={20}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (normalizeProfileCode(manual)) openCode(manual);
                }}
                style={{
                  flex: 1,
                  minHeight: 48,
                  backgroundColor: "#F7F5F3",
                  borderRadius: 10,
                  paddingHorizontal: 13,
                  color: C.ink,
                  fontSize: 15,
                  fontFamily: textFontFamily("regular", "en", manual),
                  writingDirection: "ltr",
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("qr.find")}
                testID="profile-code-find"
                disabled={!normalizeProfileCode(manual) || scanning}
                onPress={() => openCode(manual)}
                style={{
                  padding: 13,
                  opacity: !normalizeProfileCode(manual) || scanning ? 0.4 : 1,
                }}
              >
                <CommerceText style={{ color: C.deep }}>
                  {t("qr.find")}
                </CommerceText>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
