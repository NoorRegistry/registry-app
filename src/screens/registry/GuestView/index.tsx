import { queryClient } from "@/api/queryClient";
import { Button } from "@/components/Button";
import { LoadingScreen } from "@/components/Loader/customLoader";
import QtyButton from "@/components/QtyButton";
import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import {
  fetchRegistryGuestView,
  postRegistryItemPurchase,
} from "@/services/registries.service";
import {
  ICreateRegistryItemPurchase,
  IPurchasedItem,
  IRegistryDetails,
  IRegistryItem,
} from "@/types";
import { formatPrice, getEnArName, getImageUrl } from "@/utils/helper";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import cx from "clsx";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SectionList,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const MIN_PURCHASE_QTY = 1;
const REGISTRY_HEADER_TITLE_SCROLL_THRESHOLD = 120;

type GuestSectionItem =
  | { type: "needed"; item: IRegistryItem }
  | { type: "purchased"; item: IPurchasedItem };

type GuestSection = {
  type: "needed" | "purchased";
  id: string;
  nameEn?: string;
  nameAr?: string;
  data: GuestSectionItem[];
};

const getErrorDetail = (error: unknown): string => {
  if (
    error &&
    typeof error === "object" &&
    "detail" in error &&
    typeof (error as { detail?: unknown }).detail === "string"
  ) {
    return ((error as { detail: string }).detail || "").toLowerCase();
  }
  return "";
};

const canBePasswordError = (error: unknown, hasCode: boolean): boolean => {
  if (hasCode) return true;
  const detail = getErrorDetail(error);
  return (
    detail.includes("password") ||
    detail.includes("code") ||
    detail.includes("protected") ||
    detail.includes("unauthorized") ||
    detail.includes("forbidden")
  );
};

interface GuestViewScreenProps {
  onHeaderTitleChange?: (title: string) => void;
}

function GuestViewScreen({ onHeaderTitleChange }: GuestViewScreenProps) {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; code?: string }>();
  const registryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialRegistryCode = Array.isArray(params.code)
    ? params.code[0]
    : params.code;
  const [registryCode, setRegistryCode] = useState(initialRegistryCode ?? "");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showPasswordRequired, setShowPasswordRequired] = useState(false);
  const [showInvalidPassword, setShowInvalidPassword] = useState(false);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const purchaseSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<IRegistryItem | null>(null);

  const {
    data: registry,
    isFetching,
    error,
    isError,
  } = useQuery({
    queryKey: ["registryGuestView", registryId, registryCode ?? ""],
    queryFn: () => fetchRegistryGuestView(registryId, registryCode),
    enabled: !!registryId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!registry) return;
    setShowPasswordPrompt(false);
    setShowPasswordRequired(false);
    setShowInvalidPassword(false);
  }, [registry]);

  useEffect(() => {
    if (!isError) return;
    if (!canBePasswordError(error, Boolean(registryCode))) {
      return;
    }

    setShowPasswordPrompt(true);
    setShowPasswordRequired(false);
    setShowInvalidPassword(Boolean(registryCode));
  }, [error, isError, registryCode]);

  useEffect(() => {
    onHeaderTitleChange?.(showHeaderTitle && registry ? registry.title : "");

    return () => {
      onHeaderTitleChange?.("");
    };
  }, [onHeaderTitleChange, registry, showHeaderTitle]);

  const cacheKey = ["registryGuestView", registryId, registryCode ?? ""];

  const handlePurchasePress = useCallback((item: IRegistryItem) => {
    setSelectedItem(item);
    purchaseSheetRef.current?.present();
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleGuestScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextShowHeaderTitle =
        event.nativeEvent.contentOffset.y >
        REGISTRY_HEADER_TITLE_SCROLL_THRESHOLD;
      setShowHeaderTitle((current) =>
        current === nextShowHeaderTitle ? current : nextShowHeaderTitle,
      );
    },
    [],
  );

  const handlePasswordSubmit = useCallback(() => {
    const normalizedPassword = passwordInput.trim();
    if (!normalizedPassword) {
      setShowPasswordRequired(true);
      return;
    }
    setShowPasswordRequired(false);
    setShowInvalidPassword(false);
    setRegistryCode(normalizedPassword);
  }, [passwordInput]);

  const sections = useMemo<GuestSection[]>(() => {
    if (!registry) return [];
    const registrySections = registry.registryItems?.items ?? [];
    const remainingIds = new Set<string>();

    const neededSections = registrySections.map((section) => {
      section.data.forEach((item) => remainingIds.add(item.id));
      return {
        type: "needed" as const,
        id: section.id,
        nameEn: section.nameEn,
        nameAr: section.nameAr,
        data: section.data.map((item) => ({ type: "needed" as const, item })),
      };
    });

    const purchasedFlat = (registry.purchased?.items ?? []).flatMap(
      (section) => section.data,
    );
    const purchasedOnly = purchasedFlat.filter(
      (item) => !remainingIds.has(item.id),
    );

    const purchasedSection: GuestSection[] = purchasedOnly.length
      ? [
          {
            type: "purchased" as const,
            id: "purchased",
            data: purchasedOnly.map((item) => ({
              type: "purchased" as const,
              item,
            })),
          },
        ]
      : [];

    return [...neededSections, ...purchasedSection];
  }, [registry]);

  if (!registryId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography.Text type="secondary">{t("common.error")}</Typography.Text>
      </View>
    );
  }

  if (isFetching) {
    return <LoadingScreen />;
  }

  if (!registry && showPasswordPrompt) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 px-4 pt-8 gap-5">
          <View className="gap-2">
            <Typography.Text size="xl" weight="bold">
              {t("registry.registryPassword")}
            </Typography.Text>
            <Typography.Text type="secondary">
              {t("registry.passwordRequired")}
            </Typography.Text>
          </View>

          <View className="gap-2">
            <TextInput
              placeholder={t("registry.registryPasswordPlaceholder")}
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
              className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
            />
            {showPasswordRequired && (
              <Typography.Text size="xs" type="danger">
                {t("common.required")}
              </Typography.Text>
            )}
            {showInvalidPassword && (
              <Typography.Text size="xs" type="danger">
                {t("registry.invalidPassword")}
              </Typography.Text>
            )}
          </View>

          <Button
            title={t("common.submit")}
            type="primary"
            onPress={handlePasswordSubmit}
            loading={isFetching}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!registry) {
    return (
      <View className="flex-1 items-center justify-center">
        <Typography.Text type="secondary">{t("common.error")}</Typography.Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.item.id}
          onScroll={handleGuestScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={<GuestRegistryHeader registry={registry} />}
          ListEmptyComponent={
            <View className="px-4 py-8">
              <Typography.Text type="secondary" className="text-center">
                {t("registry.emptyRegistry")}
              </Typography.Text>
            </View>
          }
          renderSectionHeader={({ section }) => {
            if (section.type === "purchased") {
              return (
                <View className="px-4 py-2 mb-2 bg-white">
                  <Typography.Text size="base" weight="medium">
                    {t("registry.purchasedSection", {
                      count: section.data.length,
                    })}
                  </Typography.Text>
                </View>
              );
            }
            return (
              <View className="px-4 py-2 mb-2 bg-white">
                <Typography.Text type="secondary" size="base">
                  {getEnArName(section.nameEn!, section.nameAr!)} (
                  {section.data.length})
                </Typography.Text>
              </View>
            );
          }}
          renderSectionFooter={() => <View className="mb-2" />}
          renderItem={({ item }) => {
            if (item.type === "purchased") {
              return <PurchasedRegistryItem purchasedItem={item.item} />;
            }
            return (
              <GuestRegistryItem
                registryItem={item.item}
                onPurchase={() => handlePurchasePress(item.item)}
                disabled={Boolean(registry.isOwner)}
              />
            );
          }}
        />
      </SafeAreaView>
      <GuestPurchaseSheet
        ref={purchaseSheetRef}
        registryId={registry.id}
        item={selectedItem}
        queryKey={cacheKey}
        onDismiss={handleSheetDismiss}
      />
    </>
  );
}

interface GuestRegistryHeaderProps {
  registry: IRegistryDetails;
}

function GuestRegistryHeader({ registry }: GuestRegistryHeaderProps) {
  return (
    <View className="px-4 pt-5 pb-2 items-center gap-2">
      <Image
        source={getImageUrl(registry.logo)}
        style={{ width: 72, height: 72, borderRadius: 36 }}
        contentFit="cover"
      />
      <Typography.Text weight="medium" size="lg">
        {registry.title}
      </Typography.Text>
      {registry.greeting && (
        <Typography.Text type="secondary" size="sm" className="text-center">
          {registry.greeting}
        </Typography.Text>
      )}
    </View>
  );
}

interface GuestRegistryItemProps {
  registryItem: IRegistryItem;
  onPurchase: () => void;
  disabled?: boolean;
}

function GuestRegistryItem({
  registryItem,
  onPurchase,
  disabled = false,
}: GuestRegistryItemProps) {
  const { t } = useTranslation();
  const isSoldOut = registryItem.qtyLeft <= 0;
  const isPurchaseDisabled = isSoldOut || disabled;
  const showWants = registryItem.qty > 1 && registryItem.qtyLeft > 0;

  return (
    <View className="bg-white p-3 rounded-md mb-4 shadow shadow-neutral-200 mx-4 gap-3">
      <View className="flex-row items-center gap-4">
        <Image
          source={
            registryItem.product.images?.[0]?.path
              ? getImageUrl(registryItem.product.images[0].path)
              : require("@assets/images/icon.png")
          }
          style={{ width: 80, height: 80, borderRadius: 6 }}
        />
        <View className="flex-1 gap-2">
          <Typography.Text size="xs" weight="light">
            {getEnArName(
              registryItem.product.nameEn,
              registryItem.product.nameAr,
            )}
          </Typography.Text>
          {registryItem.qty - registryItem.qtyLeft > 0 && (
            <Typography.Text className="text-xs text-gray-400">
              {t("registry.purchasedOutOf", {
                purchased: registryItem.qty - registryItem.qtyLeft,
                total: registryItem.qty,
              })}
            </Typography.Text>
          )}
          <Typography.Text weight="medium">
            {formatPrice(
              registryItem.product.price,
              registryItem.product.currencyCode,
            )}
          </Typography.Text>
          {showWants && (
            <Typography.Text size="xs" type="secondary">
              {t("registry.wantsCount", { count: registryItem.qtyLeft })}
            </Typography.Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        className={cx(
          "h-11 flex-row items-center justify-center gap-2 rounded-md",
          isPurchaseDisabled ? "opacity-40" : "bg-primary-50",
        )}
        onPress={onPurchase}
        disabled={isPurchaseDisabled}
      >
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={20}
          color={isPurchaseDisabled ? "#8A8A8A" : "#CF8169"}
        />
        <Typography.Text
          className={
            isPurchaseDisabled ? "text-neutral-500" : "text-primary-500"
          }
          weight="medium"
        >
          {t("registry.iPurchased")}
        </Typography.Text>
      </TouchableOpacity>
    </View>
  );
}

function PurchasedRegistryItem({
  purchasedItem,
}: {
  purchasedItem: IPurchasedItem;
}) {
  const { t } = useTranslation();
  const badgeLabel = purchasedItem.purchasedByYou
    ? t("registry.purchasedByYouLabel")
    : t("registry.purchasedLabel");

  return (
    <View className="bg-white p-3 rounded-md mb-4 shadow shadow-neutral-200 mx-4 gap-3">
      <View className="flex-row items-center gap-4">
        <Image
          source={
            purchasedItem.product.images?.[0]?.path
              ? getImageUrl(purchasedItem.product.images[0].path)
              : require("@assets/images/icon.png")
          }
          style={{ width: 80, height: 80, borderRadius: 6 }}
        />
        <View className="flex-1 gap-2">
          <View className="self-start rounded-full bg-neutral-900 px-3 py-1">
            <Typography.Text size="xs" className="text-white">
              {badgeLabel}
            </Typography.Text>
          </View>
          <Typography.Text size="xs" weight="light">
            {getEnArName(
              purchasedItem.product.nameEn,
              purchasedItem.product.nameAr,
            )}
          </Typography.Text>
          <Typography.Text weight="medium">
            {formatPrice(
              purchasedItem.product.price,
              purchasedItem.product.currencyCode,
            )}
          </Typography.Text>
        </View>
      </View>
    </View>
  );
}

interface GuestPurchaseSheetProps
  extends Omit<BottomSheetModalProps, "children"> {
  ref?: React.Ref<BottomSheetModal>;
  registryId: string;
  item: IRegistryItem | null;
  queryKey: readonly unknown[];
}

function GuestPurchaseSheet({
  ref,
  registryId,
  item,
  queryKey,
  onDismiss,
  ...props
}: GuestPurchaseSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const localRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purchaseQty, setPurchaseQty] = useState(MIN_PURCHASE_QTY);
  const [showErrors, setShowErrors] = useState(false);

  // Compose the passed ref with the local ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else if (ref && "current" in ref) {
      ref.current = localRef.current;
    }
  }, [ref]);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPurchaseQty(MIN_PURCHASE_QTY);
    setShowErrors(false);
  }, []);

  useEffect(() => {
    resetForm();
  }, [item?.id, resetForm]);

  const snapPoints = useMemo(() => ["80%"], []);

  const renderBackdrop = (backdropProps: any) => (
    <BottomSheetBackdrop
      {...backdropProps}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7}
      pressBehavior="close"
    />
  );

  const updateRegistryItems = useCallback(
    (data: IRegistryDetails, registryItem: IRegistryItem, qty: number) => {
      const updatedSections = data.registryItems.items
        .map((section) => {
          const updatedData = section.data
            .map((entry) =>
              entry.id === registryItem.id
                ? {
                    ...entry,
                    qtyLeft: Math.max(0, entry.qtyLeft - qty),
                  }
                : entry,
            )
            .filter((entry) => entry.qtyLeft > 0);
          return { ...section, data: updatedData };
        })
        .filter((section) => section.data.length > 0);

      const purchasedSections = data.purchased.items.map((section) => ({
        ...section,
        data: [...section.data],
      }));
      const categoryId = registryItem.product.category?.id;
      const categoryNameEn = registryItem.product.category?.nameEn ?? "";
      const categoryNameAr = registryItem.product.category?.nameAr ?? "";

      if (categoryId) {
        let targetSection = purchasedSections.find(
          (section) => section.id === categoryId,
        );
        if (!targetSection) {
          targetSection = {
            id: categoryId,
            nameEn: categoryNameEn,
            nameAr: categoryNameAr,
            data: [],
          };
          purchasedSections.push(targetSection);
        }

        const existingItem = targetSection.data.find(
          (entry) => entry.id === registryItem.id,
        );
        if (existingItem) {
          existingItem.qty += qty;
          existingItem.purchasedByYou = true;
        } else {
          targetSection.data.push({
            id: registryItem.id,
            product: registryItem.product,
            qty,
            purchasedByYou: true,
          });
        }
      }

      return {
        ...data,
        registryItems: { items: updatedSections },
        purchased: { items: purchasedSections },
      };
    },
    [],
  );

  const purchaseMutation = useMutation({
    mutationFn: (payload: ICreateRegistryItemPurchase) =>
      postRegistryItemPurchase(payload),
    onSuccess: () => {
      if (item) {
        queryClient.setQueryData<IRegistryDetails | undefined>(
          queryKey,
          (old) => (old ? updateRegistryItems(old, item, purchaseQty) : old),
        );
        queryClient.setQueryData<IRegistryDetails | undefined>(
          ["registryById", registryId],
          (old) => (old ? updateRegistryItems(old, item, purchaseQty) : old),
        );
      }
      localRef.current?.dismiss();
      Toast.show({ type: "success", text1: t("registry.purchaseRecorded") });
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("common.error") });
    },
  });

  const handleSubmit = () => {
    setShowErrors(true);
    if (!item) return;
    if (!name.trim() || !email.trim()) return;
    purchaseMutation.mutate({
      registryId,
      registryItemsId: item.id,
      name: name.trim(),
      email: email.trim(),
      platform: "",
      platformOrderId: "",
      qty: purchaseQty,
    });
  };

  const handleDismiss = () => {
    resetForm();
    if (onDismiss) {
      onDismiss();
    }
  };

  const isDisabled = purchaseMutation.isPending || !item || item.qtyLeft <= 0;
  const showQtySelector = !!item && item.qty > 1 && item.qtyLeft > 1;
  const maxQty = item ? item.qtyLeft : MIN_PURCHASE_QTY;

  return (
    <BottomSheetModal
      ref={localRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      topInset={insets.top}
      enableOverDrag={false}
      enablePanDownToClose
      enableDynamicSizing
      maxDynamicContentSize={0.8 * Dimensions.get("screen").height}
      style={{
        borderRadius: 24,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 6,
      }}
      backdropComponent={renderBackdrop}
      {...props}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom ? insets.bottom + 24 : 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-4 gap-5">
          <View className="gap-2">
            <Typography.Text size="xl" weight="bold">
              {t("registry.recordPurchaseTitle")}
            </Typography.Text>
            <Typography.Text type="secondary">
              {t("registry.recordPurchaseSubtitle")}
            </Typography.Text>
          </View>

          {item && (
            <View className="flex-row gap-4 items-center">
              <Image
                source={
                  item.product.images?.[0]?.path
                    ? getImageUrl(item.product.images[0].path)
                    : require("@assets/images/icon.png")
                }
                style={{ width: 92, height: 92, borderRadius: 8 }}
              />
              <View className="flex-1 gap-2">
                <Typography.Text size="sm" weight="medium">
                  {getEnArName(item.product.nameEn, item.product.nameAr)}
                </Typography.Text>
                <Typography.Text weight="medium">
                  {formatPrice(item.product.price, item.product.currencyCode)}
                </Typography.Text>
              </View>
            </View>
          )}

          <View className="gap-3">
            <Typography.Text size="base" weight="medium">
              {t("registry.giftFromQuestion")}
            </Typography.Text>
            <View className="gap-2">
              <Typography.Text size="xs" type="secondary">
                {t("registry.guestNameLabel")}
              </Typography.Text>
              <TextInput
                placeholder={t("registry.guestNameLabel")}
                value={name}
                onChangeText={setName}
                className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].placeholderTextColor
                }
              />
              {showErrors && !name.trim() && (
                <Typography.Text size="xs" type="danger">
                  {t("common.required")}
                </Typography.Text>
              )}
            </View>
            <View className="gap-2">
              <Typography.Text size="xs" type="secondary">
                {t("registry.guestEmailLabel")}
              </Typography.Text>
              <TextInput
                placeholder={t("registry.guestEmailLabel")}
                value={email}
                onChangeText={setEmail}
                className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].placeholderTextColor
                }
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              {showErrors && !email.trim() && (
                <Typography.Text size="xs" type="danger">
                  {t("common.required")}
                </Typography.Text>
              )}
            </View>
            {showQtySelector && (
              <View className="flex-row items-center justify-between">
                <Typography.Text size="sm" weight="medium">
                  {t("registry.howManyPurchased")}
                </Typography.Text>
                <QtyButton
                  qty={purchaseQty}
                  updateQty={(qty) => {
                    const clamped = Math.max(
                      MIN_PURCHASE_QTY,
                      Math.min(qty, maxQty),
                    );
                    setPurchaseQty(clamped);
                  }}
                />
              </View>
            )}
          </View>

          <Button
            title={t("registry.recordPurchaseCta")}
            type="primary"
            onPress={handleSubmit}
            loading={purchaseMutation.isPending}
            disabled={isDisabled}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export default GuestViewScreen;
