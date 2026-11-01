import { CommerceTopBar } from "@/components/Commerce";
import { Colors } from "@/constants/Colors";
import RegistryScreen from "@/screens/registry";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegistryDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: Colors.light.background }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <CommerceTopBar
        title={t("registryOverview.title")}
        onBack={() =>
          router.canGoBack()
            ? router.back()
            : router.replace("/(protected)/(tabs)/registry")
        }
      />
      <RegistryScreen
        registryId={typeof id === "string" ? id : ""}
        onSelectRegistry={(registry) => router.setParams({ id: registry.id })}
      />
    </SafeAreaView>
  );
}
