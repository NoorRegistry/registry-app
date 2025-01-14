import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { fetchGuidesHomeData } from "@/services/guides.service";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { SectionList, View } from "react-native";
import GuideCard from "./components/GuideCard";

function GuidesHomeScreen() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ["guides", "home"],
    queryFn: fetchGuidesHomeData,
  });

  // Map guideCategories to the expected format
  const guideSections =
    data?.map((category) => ({
      ...category,
      data: category.guides, // SectionList expects `data` for the items in each section
    })) ?? [];

  return (
    <View className="flex-1">
      <SectionList
        sections={guideSections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View className="py-2 border-b border-neutral-200">
            <Typography.Text type="secondary" weight="medium">
              {getEnArName(section.nameEn, section.nameAr)}
            </Typography.Text>
          </View>
        )}
        renderSectionFooter={({ section }) => (
          <View className="my-6 items-center">
            <Button
              className="rounded-lg  min-w-60"
              title={t("common.viewAll")}
              onPress={() => {
                router.push({
                  pathname: "/(protected)/guidecategory/[id]",
                  params: { id: section.id },
                });
              }}
            />
          </View>
        )}
        renderItem={({ item }) => <GuideCard guide={item} />}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="px-4 py-4"
      />
    </View>
  );
}

export default GuidesHomeScreen;
