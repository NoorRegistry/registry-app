import GiftItUp from "@/components/GiftItUp";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { queryClient } from "@/api/queryClient";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import MostAddedProducts from "./components/MostAddedProducts";
import PopularStores from "./components/PopularStores";
import RegistryCard from "./components/RegistryCard";

export default function HomeScreen() {
  const handleHeaderScroll = useHeaderScrollState();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["registries"] }),
        queryClient.invalidateQueries({ queryKey: ["products", "mostAdded"] }),
        queryClient.invalidateQueries({ queryKey: ["stores"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      className="flex-1"
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <RegistryCard />
      <MostAddedProducts />
      <PopularStores />
      <GiftItUp />
    </ScrollView>
  );
}
