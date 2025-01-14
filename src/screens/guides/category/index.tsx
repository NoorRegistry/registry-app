import AnimatedHeaderText from "@/components/AnimatedHeaderText";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import SkeletonLoader, {
  HeaderSkeleton,
} from "@/screens/shop/components/LoaderSkeleton";
import { fetchGuidesCategoryData } from "@/services/guides.service";
import { getEnArName } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GuideCard from "../components/GuideCard";

const Header = ({
  categoryName,
  categoryDesc,
  showCategoriesText,
}: {
  categoryName: string;
  categoryDesc: string;
  showCategoriesText: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <View className="mb-3">
      <Typography.Text size="lg" weight="bold">
        {categoryName}
      </Typography.Text>
      <Typography.Text
        className="mt-1"
        size="sm"
        weight="light"
        type="secondary"
      >
        {categoryDesc}
      </Typography.Text>
      {showCategoriesText && (
        <Typography.Text className="mt-6" weight="medium">
          {t("common.categories")}
        </Typography.Text>
      )}
    </View>
  );
};

function GuidesHomeScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [50, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const { data: category, isFetching } = useQuery({
    queryKey: ["guides", "categories", id],
    queryFn: () => fetchGuidesCategoryData(id),
  });

  // Map guideCategories to the expected format
  const guideSections = Array.isArray(category?.children)
    ? category?.children.map((category) => ({
        ...category,
        data: category.guides, // SectionList expects `data` for the items in each section
      }))
    : [];

  if (isFetching) {
    return (
      <View>
        <Stack.Screen
          options={{
            headerTitle: "",
          }}
        />
        <View className="px-4 pt-6">
          <HeaderSkeleton />
        </View>
        <SkeletonLoader isVisible />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <AnimatedHeaderText
              opacity={headerOpacity}
              title={getEnArName(category?.nameEn!, category?.nameAr!)}
            />
          ),
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {Array.isArray(category?.children) ? (
          <Animated.SectionList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            sections={guideSections ?? []}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <Header
                categoryName={getEnArName(category?.nameEn!, category?.nameAr!)}
                categoryDesc={getEnArName(
                  category?.descriptionEn!,
                  category?.descriptionAr!,
                )}
                showCategoriesText={false}
              />
            }
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
        ) : (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            ListHeaderComponent={
              <Header
                categoryName={getEnArName(category?.nameEn!, category?.nameAr!)}
                categoryDesc={getEnArName(
                  category?.descriptionEn!,
                  category?.descriptionAr!,
                )}
                showCategoriesText={false}
              />
            }
            data={category?.guides ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GuideCard guide={item} />}
            horizontal={false}
            contentContainerClassName="px-4 py-4"
          />
        )}
      </SafeAreaView>
    </>
  );
}

export default GuidesHomeScreen;
