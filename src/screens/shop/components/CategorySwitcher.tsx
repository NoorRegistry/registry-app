import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { CommerceText } from "@/components/Commerce";
import { BrandColors as colors } from "@/constants/Colors";
import { IProductCategory } from "@/types";
import { getEnArName } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { categoryChildren, categoryPath } from "@/screens/category/tree";
import { browseStyles } from "./Browse";

export default function CategorySwitcher({
  roots,
  path,
  onSelect,
}: {
  roots: IProductCategory[];
  path: IProductCategory[];
  onSelect: (id: string, all: boolean) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);
  const pending = useRef<{ id: string; all: boolean } | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const branch = branchId ? categoryPath(roots, branchId) : [];
  const parent = branch.at(-1);
  const choices = parent ? categoryChildren(parent) : roots;
  const select = (id: string, all: boolean) => {
    pending.current = { id, all };
    ref.current?.dismiss();
  };
  return (
    <>
      <Pressable
        testID="category-breadcrumb"
        accessibilityRole="button"
        accessibilityLabel={t("shop.changeCategory")}
        onPress={() => {
          setBranchId(path.at(-2)?.id ?? null);
          ref.current?.present();
        }}
        style={[
          browseStyles.row,
          { paddingHorizontal: 16, paddingVertical: 10 },
        ]}
      >
        <CommerceText
          size="xs"
          numberOfLines={1}
          style={{ flex: 1, color: colors.muted }}
        >
          {path
            .map((item) => getEnArName(item.nameEn, item.nameAr))
            .join(" / ")}
        </CommerceText>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>
      <AppBottomSheetModal
        ref={ref}
        snapPoints={["65%"]}
        enableDynamicSizing={false}
        topInset={insets.top}
        enablePanDownToClose
        onDismiss={() => {
          const target = pending.current;
          pending.current = null;
          if (target) onSelect(target.id, target.all);
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={{ backgroundColor: colors.line }}
      >
        <View
          style={[
            browseStyles.row,
            { paddingHorizontal: 20, paddingVertical: 8 },
          ]}
        >
          <CommerceText size="base" weight="bold" style={{ flex: 1 }}>
            {t("common.categories")}
          </CommerceText>
          <Pressable
            testID="category-switch-close"
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            onPress={() => ref.current?.dismiss()}
            style={browseStyles.iconButton}
          >
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
        </View>
        {parent && (
          <Pressable
            testID="category-switch-up"
            accessibilityRole="button"
            onPress={() => setBranchId(branch.at(-2)?.id ?? null)}
            style={[browseStyles.row, { paddingHorizontal: 20, minHeight: 44 }]}
          >
            <Ionicons
              name={I18nManager.isRTL ? "chevron-forward" : "chevron-back"}
              size={18}
              color={colors.ink}
            />
            <CommerceText size="xs" numberOfLines={1} style={{ flex: 1 }}>
              {branch
                .map((item) => getEnArName(item.nameEn, item.nameAr))
                .join(" / ")}
            </CommerceText>
          </Pressable>
        )}
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          {parent && (
            <Pressable
              testID="category-switch-all"
              accessibilityRole="button"
              onPress={() => select(parent.id, true)}
              style={{ minHeight: 48, justifyContent: "center" }}
            >
              <CommerceText weight="medium" style={{ color: colors.deep }}>
                {t("shop.allIn", {
                  name: getEnArName(parent.nameEn, parent.nameAr),
                })}
              </CommerceText>
            </Pressable>
          )}
          {choices.map((category, index) => (
            <Pressable
              testID={`category-switch-${category.id}`}
              key={category.id}
              accessibilityRole="button"
              accessibilityState={{ selected: path.at(-1)?.id === category.id }}
              onPress={() =>
                categoryChildren(category).length
                  ? setBranchId(category.id)
                  : select(category.id, false)
              }
              style={[
                browseStyles.row,
                {
                  minHeight: 52,
                  paddingVertical: 10,
                  borderBottomWidth:
                    index < choices.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: colors.line,
                },
              ]}
            >
              <CommerceText style={{ flex: 1 }}>
                {getEnArName(category.nameEn, category.nameAr)}
              </CommerceText>
              <Ionicons
                name={
                  categoryChildren(category).length
                    ? I18nManager.isRTL
                      ? "chevron-back"
                      : "chevron-forward"
                    : path.at(-1)?.id === category.id
                      ? "checkmark"
                      : undefined
                }
                size={18}
                color={
                  path.at(-1)?.id === category.id
                    ? colors.primary
                    : colors.muted
                }
              />
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </AppBottomSheetModal>
    </>
  );
}
