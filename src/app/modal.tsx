import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { useGlobalStore } from "@/store";
import { clearSessionData } from "@/utils/helper";

export default function ModalScreen() {
  const logout = useGlobalStore.use.signOut();
  const handleLogout = () => {
    clearSessionData();
    logout();
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
