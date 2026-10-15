import SearchScreen from "@/screens/search";
import { Stack } from "expo-router";
export default function ShopSearch() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SearchScreen standalone />
    </>
  );
}
