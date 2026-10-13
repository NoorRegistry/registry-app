import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { logoutWithNotifications } from "@/utils/push-registration";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function RegistriesScreen() {
  const { t } = useTranslation();
  const handleLogout = async () => {
    try {
      await logoutWithNotifications();
    } catch {
      Toast.show({ type: "error", text1: t("notifications.logoutError") });
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button title={"logout"} onPress={handleLogout} />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
