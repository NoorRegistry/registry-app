import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState, Linking, Pressable, StyleSheet, View } from "react-native";
import { ActionButton } from "../components";
export default function ProfileCamera({
  onScan,
  paused,
}: {
  onScan: (value: string) => void;
  paused: boolean;
}) {
  const { t } = useTranslation();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      setActive(s === "active");
      if (s === "active") void getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);
  if (!permission)
    return (
      <View style={styles.center}>
        <CommerceText>{t("qr.cameraPermission")}</CommerceText>
      </View>
    );
  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Feather name="camera" size={32} color={C.deep} />
        <CommerceText style={{ textAlign: "center", color: C.muted }}>
          {t("qr.cameraPermission")}
        </CommerceText>
        <ActionButton
          title={t(
            permission.canAskAgain ? "qr.allowCamera" : "qr.openSettings",
          )}
          onPress={() => {
            if (permission.canAskAgain) void requestPermission();
            else void Linking.openSettings();
          }}
        />
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <CommerceText style={{ textAlign: "center", color: C.muted }}>
          {t("qr.cameraError")}
        </CommerceText>
        <ActionButton
          title={t("notifications.retry")}
          onPress={() => setError(false)}
        />
      </View>
    );
  return (
    <View
      style={{
        flex: 1,
        minHeight: 230,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#171717",
      }}
    >
      {active && (
        <CameraView
          testID="profile-qr-camera"
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          enableTorch={torch}
          onBarcodeScanned={paused ? undefined : (event) => onScan(event.data)}
          onMountError={() => setError(true)}
          mute
        />
      )}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <View
          style={{
            width: "72%",
            aspectRatio: 1,
            maxWidth: 260,
            borderWidth: 2,
            borderColor: "#FFFFFFD9",
            borderRadius: 22,
            backgroundColor: "transparent",
          }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("qr.flash")}
        accessibilityState={{ selected: torch }}
        onPress={() => setTorch(!torch)}
        style={{
          position: "absolute",
          bottom: 18,
          alignSelf: "center",
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#00000070",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={torch ? "zap" : "zap-off"} color="white" size={21} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 230,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
});
