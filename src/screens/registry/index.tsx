import { LoadingScreen } from "@/components/Loader/customLoader";
import Typography from "@/components/Typography";
import { fetchRegistries, fetchRegistry } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SectionList, View } from "react-native";
import RegistryCard from "../home/components/RegistryCard";
import EmptyRegistry from "./components/EmptyRegistry";
import RegistryHeader from "./components/RegistryHeader";
import RegistryItem from "./components/RegistryItem";

function RegistryScreen() {
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );
  const setSelectedRegistryId = useGlobalStore(
    (state) => state.setSelectedRegistryId,
  );

  const { data: registries, isFetching: isFetchingRegistries } = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  useEffect(() => {
    if (registries && registries.length) {
      if (selectedRegistryId !== registries?.[0]?.id)
        setSelectedRegistryId(registries?.[0]?.id);
    }
  }, [registries]);

  const { data: registryDetails, isFetching: isFetchingRegistryDetails } =
    useQuery({
      queryKey: ["registryById", selectedRegistryId],
      queryFn: () =>
        selectedRegistryId
          ? fetchRegistry(selectedRegistryId)
          : Promise.reject(),
      enabled: !!selectedRegistryId, // Only fetch details if registryId is available
    });

  if (isFetchingRegistries || isFetchingRegistryDetails)
    return <LoadingScreen />;

  if (registries && registries.length === 0) return <RegistryCard />;

  if (!registryDetails)
    return <Typography.Text>No details found</Typography.Text>;

  return (
    <>
      <SectionList
        sections={registryDetails.registryItems.items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<RegistryHeader registry={registryDetails} />}
        ListEmptyComponent={<EmptyRegistry />}
        renderSectionHeader={({ section }) => (
          <View className="px-4 py-2 mb-2 bg-white">
            <Typography.Text type="secondary" size="base">
              {getEnArName(section.nameEn, section.nameAr)} (
              {section.data.length})
            </Typography.Text>
          </View>
        )}
        renderSectionFooter={() => <View className="mb-2" />}
        renderItem={({ item }) => <RegistryItem registryItem={item} />}
      />
    </>
  );
}

export default RegistryScreen;
