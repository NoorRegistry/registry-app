import { Tabs } from "expo-router";
import React from "react";

import Header from "@/components/Header";
import CartBar from "@/components/CartBar";
import {
  GuidesIcon,
  HomeIcon,
  RegistryIcon,
  SearchIcon,
  ShopIcon,
} from "@/components/icons";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { UserIcon } from "@/components/icons/user";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarLabelStyle: { fontSize: 10 },
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
          header: (props) => {
            return <Header props={props} />;
          },
          headerTitleAlign: "left",
          // Fade/shift can leave detached iOS tab scenes blank on repeated switches.
          animation: "none",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("common.home"),
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            headerShown: false,
            title: t("common.shop"),
            tabBarIcon: ({ color }) => <ShopIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="registry"
          options={{
            tabBarButtonTestID: "tab-registry",
            title: t("common.registry"),
            tabBarIcon: ({ color }) => <RegistryIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            headerShown: false,
            title: t("common.search"),
            tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="guides"
          options={{
            // Re-enable once guides are ready.
            href: null,
            title: t("common.guides"),
            tabBarIcon: ({ color }) => <GuidesIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: t("profile.title"),
            tabBarIcon: ({ color }) => <UserIcon color={color} />,
          }}
        />
      </Tabs>
      <CartBar />
    </View>
  );
}
