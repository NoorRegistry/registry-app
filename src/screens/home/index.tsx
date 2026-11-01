import { CommerceText } from "@/components/Commerce";
import { queryClient } from "@/api/queryClient";
import { BrandColors as C } from "@/constants/Colors";
import CartButton from "@/components/Header/CartButton";
import { useNotificationSummary } from "@/hooks/useNotifications";
import { getUserFirstName } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeaturedGifts, FeaturedStores } from "./components/Featured";
import NextSteps from "./components/NextSteps";
import RegistryActivity from "./components/RegistryActivity";
import RegistryCard from "./components/RegistryCard";

export default function HomeScreen() {
  const { t } = useTranslation();
  const notifications = useNotificationSummary();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["registries"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "common.goodMorning"
      : hour < 17 && hour >= 12
        ? "common.goodAfternoon"
        : hour >= 17 && hour < 22
          ? "common.goodEvening"
          : "common.niceToSeeYou";
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#FEFDFD" }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={C.primary}
            onRefresh={async () => {
              setIsRefreshing(true);
              try {
                await refresh();
              } finally {
                setIsRefreshing(false);
              }
            }}
          />
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            marginBottom: 18,
          }}
        >
          <Image
            source={require("@assets/images/logo/fulllogo.png")}
            contentFit="contain"
            style={{ width: 116, height: 40 }}
            accessibilityLabel="Simplist"
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <CartButton testID="home-cart" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("notifications.title")}
              onPress={() => router.push("/notifications")}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="bell" size={24} color={C.ink} />
              {!!notifications.data?.unreadCount && (
                <View
                  style={{
                    position: "absolute",
                    top: 5,
                    end: 7,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: C.primary,
                  }}
                />
              )}
            </Pressable>
          </View>
        </View>
        <CommerceText size="2xl" weight="medium" style={{ marginBottom: 20 }}>
          {t(greeting, { name: getUserFirstName() })}
        </CommerceText>
        <RegistryCard />
        <NextSteps />
        <FeaturedGifts />
        <FeaturedStores />
        <RegistryActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
