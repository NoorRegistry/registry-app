import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

export default function NextSteps() {
  const { t } = useTranslation();
  const actions = [
    {
      label: t("homeDesign.addGifts"),
      icon: "gift" as const,
      onPress: () => router.push("/(protected)/(tabs)/shop"),
    },
    {
      label: t("homeDesign.create"),
      icon: "plus" as const,
      onPress: () => router.push("/(protected)/registry/create"),
    },
    {
      label: t("homeDesign.find"),
      icon: "search" as const,
      onPress: () => router.push("/registry/find"),
    },
    {
      label: t("homeDesign.friends"),
      icon: "users" as const,
      onPress: () => router.push("/friends"),
    },
  ];
  return (
    <View
      style={{
        backgroundColor: "#FCF8F5",
        borderRadius: 20,
        padding: 16,
        marginBottom: 28,
      }}
    >
      <CommerceText size="xl" weight="medium" style={{ marginBottom: 15 }}>
        {t("homeDesign.nextStep")}
      </CommerceText>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {actions.map((action, index) => (
          <Pressable
            key={action.icon}
            testID={`home-next-${action.icon}`}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: "center",
              gap: 8,
              paddingVertical: 3,
            }}
          >
            <View
              style={{
                height: 47,
                width: 47,
                borderRadius: 24,
                backgroundColor: index === 0 ? C.primary : C.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name={action.icon}
                color={index === 0 ? "white" : C.deep}
                size={25}
              />
            </View>
            <CommerceText
              size="xs"
              weight={index === 0 ? "medium" : "regular"}
              style={{ textAlign: "center" }}
            >
              {action.label}
            </CommerceText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
