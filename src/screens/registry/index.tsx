import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import { useTranslation } from "react-i18next";
import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import { useHeaderScrollState } from "@/hooks/useHeaderScrollState";
import { fetchRegistries, fetchRegistry } from "@/services/registries.service";
import { useRegistrySelection } from "@/hooks/useRegistrySelection";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Pressable, SectionList, View } from "react-native";
import RegistryCard from "../home/components/RegistryCard";
import EmptyRegistry from "./components/EmptyRegistry";
import RegistryHeader from "./components/RegistryHeader";
import RegistryItem from "./components/RegistryItem";

function RegistryScreen() {
  const handleHeaderScroll = useHeaderScrollState();
  const { t } = useTranslation();
  const registriesQuery = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  const registries = registriesQuery.data;
  const selected = useRegistrySelection(registries);
  const detailsQuery = useQuery({
    queryKey: ["registryById", selected?.id],
    queryFn: () => fetchRegistry(selected!.id),
    enabled: !!selected,
  });
  const registryDetails = detailsQuery.data;
  const loading =
    (!registries &&
      registriesQuery.isPending &&
      registriesQuery.fetchStatus !== "paused") ||
    (!!selected &&
      !registryDetails &&
      detailsQuery.isPending &&
      detailsQuery.fetchStatus !== "paused");
  if (loading) return <ScreenSkeleton kind="registry" />;
  if (registries?.length === 0) return <RegistryCard />;
  if (!registryDetails) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Typography.Text>{t("registry.loadError")}</Typography.Text>
        <Pressable
          testID="registry-retry"
          accessibilityRole="button"
          onPress={async () => {
            const refreshed = await registriesQuery.refetch();
            if (refreshed.data?.some(({ id }) => id === selected?.id))
              await detailsQuery.refetch();
          }}
        >
          <Typography.Text
            weight="medium"
            style={{ color: BrandColors.primary }}
          >
            {t("notifications.retry")}
          </Typography.Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SectionList
      sections={registryDetails.registryItems.items}
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <RegistryHeader key={registryDetails.id} registry={registryDetails} />
      }
      ListEmptyComponent={<EmptyRegistry />}
      renderSectionHeader={({ section }) => (
        <View className="px-4 py-2 mb-2 bg-white">
          <Typography.Text type="secondary" size="base">
            {getEnArName(section.nameEn, section.nameAr)} ({section.data.length}
            )
          </Typography.Text>
        </View>
      )}
      renderSectionFooter={() => <View className="mb-2" />}
      renderItem={({ item }) => <RegistryItem registryItem={item} />}
    />
  );
}

export default RegistryScreen;
