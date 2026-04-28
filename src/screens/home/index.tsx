import GiftItUp from "@/components/GiftItUp";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import React from "react";
import { ScrollView } from "react-native";
import MostAddedProducts from "./components/MostAddedProducts";
import PopularStores from "./components/PopularStores";
import RegistryCard from "./components/RegistryCard";

export default function HomeScreen() {
  const handleHeaderScroll = useHeaderScrollState();

  return (
    <ScrollView
      className="flex-1"
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
    >
      <RegistryCard />
      <MostAddedProducts />
      <PopularStores />
      <GiftItUp />
    </ScrollView>
  );
}
