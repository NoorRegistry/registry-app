import GiftItUp from "@/components/GiftItUp";
import React from "react";
import { ScrollView } from "react-native";
import PopularStores from "./components/PopularStores";
import RegistryCard from "./components/RegistryCard";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1">
      <RegistryCard />
      <PopularStores />
      <GiftItUp />
    </ScrollView>
  );
}
