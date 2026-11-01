import ProductCard from "@/components/ProductCard";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import {
  fetchFeaturedGifts,
  fetchFeaturedStores,
} from "@/services/home.service";
import { IStore } from "@/types";
import { getEnArName, getImageUrl, getUserSub } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import {
  HomeLoadState,
  HomeSectionHeading,
  homeStyles,
  SeeAllTile,
} from "./shared";

export function StoreTile({ store, width }: { store: IStore; width: number }) {
  const logo = getImageUrl(store.storeLogo);
  const [failed, setFailed] = useState(false);
  const name = getEnArName(store.nameEn, store.nameAr);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() =>
        router.push({
          pathname: "/stores/[id]",
          params: { id: store.id, storeName: name },
        })
      }
      style={{
        width,
        minHeight: 76,
        borderRadius: 12,
        backgroundColor: C.soft,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      {logo && !failed ? (
        <Image
          source={logo}
          style={{ width: "100%", height: 48 }}
          contentFit="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <CommerceText
          weight="medium"
          size="sm"
          style={{ textAlign: "center" }}
          numberOfLines={2}
        >
          {name}
        </CommerceText>
      )}
    </Pressable>
  );
}

export function FeaturedGifts() {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const query = useQuery({
    queryKey: ["home", getUserSub(), i18n.language, "gifts"],
    queryFn: ({ signal }) => fetchFeaturedGifts(1, 8, signal),
    staleTime: 30000,
  });
  const cardWidth = Math.min(210, (width - 52) / 2);
  const openAll = () => router.push("/featured-gifts");
  if (query.data && !query.data.data.length) return null;
  return (
    <View style={homeStyles.section}>
      <HomeSectionHeading title={t("homeDesign.featuredGifts")} />
      {query.data ? (
        <ScrollView
          testID="home-featured-gifts"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingEnd: 4 }}
          style={{ direction: I18nManager.isRTL ? "rtl" : "ltr" }}
        >
          {query.data.data.map((product) => (
            <ProductCard key={product.id} product={product} width={cardWidth} />
          ))}
          <SeeAllTile
            width={cardWidth}
            height={cardWidth}
            label={t("homeDesign.allFeaturedGifts")}
            onPress={openAll}
          />
        </ScrollView>
      ) : (
        <HomeLoadState
          loading={query.isPending && query.fetchStatus !== "paused"}
          onRetry={() => void query.refetch()}
        />
      )}
    </View>
  );
}
export function FeaturedStores() {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const query = useQuery({
    queryKey: ["home", getUserSub(), i18n.language, "stores"],
    queryFn: ({ signal }) => fetchFeaturedStores(1, 9, signal),
    staleTime: 30000,
  });
  const tileWidth = Math.min(150, (width - 64) / 3);
  if (query.data && !query.data.data.length) return null;
  return (
    <View style={homeStyles.section}>
      <HomeSectionHeading title={t("homeDesign.featuredStores")} />
      {query.data ? (
        <ScrollView
          testID="home-featured-stores"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingEnd: 4 }}
          style={{ direction: I18nManager.isRTL ? "rtl" : "ltr" }}
        >
          {query.data.data.map((store) => (
            <StoreTile key={store.id} store={store} width={tileWidth} />
          ))}
          <SeeAllTile
            width={tileWidth}
            height={76}
            label={t("homeDesign.allFeaturedStores")}
            onPress={() => router.push("/featured-stores")}
          />
        </ScrollView>
      ) : (
        <HomeLoadState
          loading={query.isPending && query.fetchStatus !== "paused"}
          onRetry={() => void query.refetch()}
        />
      )}
    </View>
  );
}
