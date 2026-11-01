import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import PickerText from "./Text";
import RegistryPickerAvatar from "./RegistryAvatar";
import { RegistryPickerColors as C } from "@/constants/RegistryPicker";
import { IProduct, IRegistry } from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  ref: React.Ref<BottomSheetModal>;
  product: IProduct;
  registries: IRegistry[];
  isLoading: boolean;
  hasLoadError: boolean;
  isAdding: boolean;
  hasAddError: boolean;
  onRetry: () => void;
  onSelect: () => void;
  onConfirm: (registryId: string) => void;
  onDismiss: () => void;
}

export default function AddToRegistrySheet({
  ref,
  product,
  registries,
  isLoading,
  hasLoadError,
  isAdding,
  hasAddError,
  onRetry,
  onSelect,
  onConfirm,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const localRef = useRef<BottomSheetModal>(null);
  const createAfterDismissRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [footerHeight, setFooterHeight] = useState(insets.bottom + 79);
  const [failedImage, setFailedImage] = useState(false);
  const selectedRegistry = registries.find(({ id }) => id === selectedId);
  const storeName = getEnArName(product.store?.nameEn, product.store?.nameAr);
  const imagePath = product.images?.[0]?.path;

  useImperativeHandle(ref, () => localRef.current!, []);
  useEffect(() => {
    localRef.current?.present();
  }, []);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          onLayout={({ nativeEvent }) =>
            setFooterHeight(nativeEvent.layout.height)
          }
          style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        >
          <Pressable
            testID="registry-add-confirm"
            accessibilityRole="button"
            accessibilityLabel={t(
              isAdding ? "registry.adding" : "cart.addToRegistry",
            )}
            accessibilityState={{
              disabled: !selectedRegistry || isAdding,
              busy: isAdding,
            }}
            disabled={!selectedRegistry || isAdding}
            onPress={() => selectedRegistry && onConfirm(selectedRegistry.id)}
            style={[
              styles.confirm,
              !selectedRegistry && styles.confirmDisabled,
              isAdding && styles.confirmBusy,
            ]}
          >
            {isAdding && <ActivityIndicator size="small" color={C.onAccent} />}
            <PickerText
              weight="medium"
              style={{
                fontSize: 13,
                color: C.onAccent,
                textAlign: "center",
              }}
            >
              {t(isAdding ? "registry.adding" : "cart.addToRegistry")}
            </PickerText>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [insets.bottom, isAdding, onConfirm, selectedRegistry, t],
  );

  return (
    <AppBottomSheetModal
      ref={localRef}
      index={0}
      stackBehavior="push"
      topInset={insets.top}
      enableDynamicSizing
      maxDynamicContentSize={height * 0.85}
      enableOverDrag={false}
      enablePanDownToClose={!isAdding}
      enableContentPanningGesture={!isAdding}
      enableHandlePanningGesture={!isAdding}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      handleStyle={styles.handleContainer}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.35}
          pressBehavior={isAdding ? "none" : "close"}
        />
      )}
      footerComponent={renderFooter}
      onDismiss={() => {
        onDismiss();
        if (createAfterDismissRef.current) {
          router.push("/(protected)/registry/create");
        }
      }}
    >
      <BottomSheetFlatList<IRegistry>
        data={registries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: footerHeight + 15,
        }}
        ListHeaderComponent={
          <View>
            <View style={styles.heading}>
              <PickerText weight="medium" style={styles.title}>
                {t("cart.addToRegistry")}
              </PickerText>
              <Pressable
                testID="registry-add-close"
                accessibilityRole="button"
                accessibilityLabel={t("common.close")}
                accessibilityState={{ disabled: isAdding }}
                disabled={isAdding}
                onPress={() => localRef.current?.dismiss()}
                style={styles.close}
              >
                <Feather name="x" size={18} color={C.muted} />
              </Pressable>
            </View>
            <View style={styles.product}>
              {imagePath && !failedImage ? (
                <Image
                  source={{ uri: getImageUrl(imagePath) }}
                  style={styles.productImage}
                  contentFit="contain"
                  onError={() => setFailedImage(true)}
                />
              ) : (
                <View style={styles.productImage}>
                  <Feather name="image" size={20} color={C.muted} />
                </View>
              )}
              <View style={styles.productCopy}>
                <PickerText
                  weight="medium"
                  numberOfLines={2}
                  style={styles.productName}
                >
                  {getEnArName(product.nameEn, product.nameAr)}
                </PickerText>
                <PickerText numberOfLines={2} style={styles.productMeta}>
                  {[
                    storeName.toLocaleUpperCase(),
                    formatPrice(product.price, product.currencyCode),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </PickerText>
              </View>
            </View>
            <PickerText style={styles.sectionLabel}>
              {t("registry.chooseRegistry")}
            </PickerText>
          </View>
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          const category =
            getEnArName(item.category?.nameEn, item.category?.nameAr) ||
            item.category?.name;
          return (
            <Pressable
              testID={`registry-add-option-${item.id}`}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={item.title}
              accessibilityState={{ checked: selected, disabled: isAdding }}
              disabled={isAdding}
              onPress={() => {
                setSelectedId(item.id);
                onSelect();
              }}
              style={styles.row}
            >
              <RegistryPickerAvatar logo={item.logo} category={item.category} />
              <View style={styles.rowCopy}>
                <PickerText
                  weight="medium"
                  numberOfLines={2}
                  style={[styles.registryName, selected && { color: C.accent }]}
                >
                  {item.title}
                </PickerText>
                <PickerText numberOfLines={2} style={styles.registryMeta}>
                  {[
                    category,
                    t("registry.items", { count: item._count.totalItems }),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </PickerText>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <ActivityIndicator
                color={C.accent}
                accessibilityLabel={t("common.loading")}
              />
            ) : hasLoadError ? (
              <>
                <PickerText accessibilityRole="alert" style={styles.error}>
                  {t("registry.registriesLoadError")}
                </PickerText>
                <Pressable
                  accessibilityRole="button"
                  onPress={onRetry}
                  style={styles.emptyAction}
                >
                  <PickerText weight="medium" style={{ color: C.accent }}>
                    {t("cart.retry")}
                  </PickerText>
                </Pressable>
              </>
            ) : (
              <>
                <PickerText style={{ color: C.muted }}>
                  {t("registry.noRegistries")}
                </PickerText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    createAfterDismissRef.current = true;
                    localRef.current?.dismiss();
                  }}
                  style={styles.emptyAction}
                >
                  <PickerText weight="medium" style={{ color: C.accent }}>
                    {t("registry.newRegistry")}
                  </PickerText>
                </Pressable>
              </>
            )}
          </View>
        }
        ListFooterComponent={
          hasAddError ? (
            <PickerText
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.error}
            >
              {t("registry.addItemError")}
            </PickerText>
          ) : null
        }
      />
    </AppBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: C.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: { paddingTop: 9, paddingBottom: 0 },
  handle: { width: 32, height: 4, borderRadius: 10, backgroundColor: C.line },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  title: { flex: 1, fontSize: 20, letterSpacing: -0.5, color: C.ink },
  close: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: -6,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  productImage: {
    width: 49,
    height: 53,
    borderRadius: 5,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  productCopy: { flex: 1, minWidth: 0, gap: 4 },
  productName: { fontSize: 13, color: C.ink },
  productMeta: { fontSize: 11, color: C.muted },
  sectionLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 19,
    marginBottom: 7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
    minHeight: 70,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  registryName: { fontSize: 13, color: C.ink },
  registryMeta: { fontSize: 11, color: C.muted },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.background,
    marginEnd: 2,
  },
  radioSelected: { borderWidth: 6, borderColor: C.accent },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.line },
  footer: {
    paddingTop: 15,
    paddingHorizontal: 22,
    backgroundColor: C.background,
  },
  confirm: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
  },
  confirmDisabled: { opacity: 0.5 },
  confirmBusy: { opacity: 0.85 },
  error: { color: C.error, fontSize: 12, paddingTop: 12 },
  empty: { paddingVertical: 20, alignItems: "center" },
  emptyAction: { minHeight: 44, padding: 12, justifyContent: "center" },
});
