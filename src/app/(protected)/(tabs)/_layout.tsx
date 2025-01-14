import { Tabs } from "expo-router";
import React from "react";

import Header from "@/components/Header";
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarLabelPosition: "below-icon",
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        header: (props) => {
          return <Header props={props} />;
        },
        headerTitleAlign: "left",
        animation: "shift",
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
        name="registry"
        options={{
          title: t("common.registry"),
          tabBarIcon: ({ color }) => <RegistryIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("common.search"),
          tabBarIcon: ({ color }) => <SearchIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: t("common.guides"),
          tabBarIcon: ({ color }) => <GuidesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("common.shop"),
          tabBarIcon: ({ color }) => <ShopIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
