import { Link } from "expo-router";
import { I18nManager } from "react-native";

import { Button } from "@/components/Button";
import { Text, View } from "@/components/Themed";
import i18n from "@/i18n";
import { useGlobalStore } from "@/store";
import { clearSessionData } from "@/utils/helper";

export default function ProfileScreen() {
  const logout = useGlobalStore.use.signOut();
  const handleLogout = () => {
    clearSessionData();
    logout();
  };
  return (
    <View>
      <Link href="/registry">
        <Text>registries</Text>
      </Link>
      <Button title={"logout"} onPress={handleLogout} />
      <Button
        title={"change to en"}
        onPress={() => {
          i18n.changeLanguage("en");
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
        }}
      />
    </View>
  );
}
