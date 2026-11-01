import PickerText from "@/components/AddToRegistrySheet/Text";
import { RegistryPickerColors as C } from "@/constants/RegistryPicker";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

export default function RegistryAddedToast({
  title,
  registry,
}: {
  title?: string;
  registry?: string;
}) {
  const { t } = useTranslation();
  return (
    <View accessibilityLiveRegion="polite" style={styles.toast}>
      <View style={styles.icon}>
        <Feather name="check" size={17} color={C.accent} />
      </View>
      <View style={styles.copy}>
        <PickerText weight="medium" style={styles.title}>
          {title}
        </PickerText>
        <PickerText numberOfLines={2} style={styles.registry}>
          {registry}
        </PickerText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.close")}
        onPress={() => Toast.hide()}
        style={styles.close}
      >
        <Feather name="x" size={18} color={C.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    width: "92%",
    maxWidth: 480,
    backgroundColor: C.background,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingStart: 14,
    paddingEnd: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 15,
    elevation: 6,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.soft,
  },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 12, color: C.ink },
  registry: { fontSize: 11, color: C.muted },
  close: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
