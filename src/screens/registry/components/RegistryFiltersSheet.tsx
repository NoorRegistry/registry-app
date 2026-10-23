import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { getEnArName } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RegistryRow, RegistrySort } from "../items";

export default function RegistryFiltersSheet({
  ref,
  categories,
  categoryId,
  sort,
  onCategory,
  onSort,
}: {
  ref: React.Ref<BottomSheetModal>;
  categories: RegistryRow["category"][];
  categoryId: string;
  sort: RegistrySort;
  onCategory: (id: string) => void;
  onSort: (sort: RegistrySort) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const option = (
    key: string,
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={key}
      testID={`registry-filter-${key}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        minHeight: 46,
        paddingVertical: 10,
      }}
    >
      <CommerceText style={{ flex: 1 }}>{label}</CommerceText>
      {selected && <Feather name="check" size={20} color={C.primary} />}
    </Pressable>
  );
  return (
    <AppBottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.8}
      topInset={insets.top}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            marginBottom: 12,
          }}
        >
          <CommerceText weight="bold" size="lg" style={{ flex: 1 }}>
            {t("registry.filterItems")}
          </CommerceText>
          <Pressable
            onPress={() => {
              onCategory("");
              onSort("default");
            }}
            style={{ padding: 8 }}
          >
            <CommerceText style={{ color: C.deep }}>
              {t("search.clear")}
            </CommerceText>
          </Pressable>
        </View>
        <CommerceText weight="medium" style={{ color: C.muted }}>
          {t("store.sort")}
        </CommerceText>
        {(["default", "name", "priceAsc", "priceDesc"] as const).map((value) =>
          option(
            value,
            t(`store.sorts.${value === "default" ? "featured" : value}`),
            sort === value,
            () => onSort(value),
          ),
        )}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: C.line,
            paddingTop: 18,
            marginTop: 10,
          }}
        >
          <CommerceText weight="medium" style={{ color: C.muted }}>
            {t("common.category")}
          </CommerceText>
          {option("all", t("registry.tabs.all"), !categoryId, () =>
            onCategory(""),
          )}
          {categories.map((category) =>
            option(
              category.id,
              getEnArName(category.nameEn, category.nameAr),
              category.id === categoryId,
              () => onCategory(category.id),
            ),
          )}
        </View>
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
}
