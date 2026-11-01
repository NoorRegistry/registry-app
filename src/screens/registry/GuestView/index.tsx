import RegistryAccessGate from "./RegistryAccessGate";
import { saveRegistryReturn } from "@/utils/auth-return";
import { useGlobalStore } from "@/store";
import { IApiError } from "@/api/http";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { ScreenSkeleton } from "@/components/Skeleton/layouts";
import RegistryAvatar from "@/components/RegistryAvatar";
import AppBottomSheetModal from "@/components/BottomSheet/AppBottomSheetModal";
import { queryClient } from "@/api/queryClient";
import { Button } from "@/components/Button";
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
import {
  formatPrice,
  clearSessionData,
  getDecodedToken,
  getEnArName,
  getImageUrl,
  getUserEmail,
  getUserFirstLastName,
} from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import cx from "clsx";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
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
  TextLayoutEventData,
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

interface GuestViewScreenProps {
  onHeaderTitleChange?: (title: string) => void;
}

function GuestViewScreen({ onHeaderTitleChange }: GuestViewScreenProps) {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const registryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const viewerId = getDecodedToken()?.user?.id;
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const purchaseSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<IRegistryItem | null>(null);

  const {
    data: registry,
    refetch,
    isFetching,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["registryGuestView", viewerId, registryId],
    queryFn: () => fetchRegistryGuestView(registryId!),
    enabled: !!registryId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (
      isError &&
      (error as unknown as IApiError)?.status === 401 &&
      registryId
    ) {
      saveRegistryReturn(registryId);
      clearSessionData();
      useGlobalStore.getState().signOut();
      router.replace("/login");
    }
  }, [error, isError, registryId]);
  useRefreshOnFocus(refetch);

  useEffect(() => {
    onHeaderTitleChange?.(
      showHeaderTitle && registry && !isError && !isFetching
        ? registry.title
        : "",
    );

    return () => {
      onHeaderTitleChange?.("");
    };
  }, [onHeaderTitleChange, registry, showHeaderTitle, isError, isFetching]);

  const cacheKey = ["registryGuestView", viewerId, registryId];

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

  if (isLoading || isFetching) {
    return <ScreenSkeleton kind="registry" />;
  }

  if (isError) {
    const apiError = error as unknown as IApiError;
    const access = apiError.access;
    return <RegistryAccessGate access={access} retry={() => void refetch()} />;
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
          ListHeaderComponent={
            <GuestRegistryHeader
              key={`${registry.id}:${registry.greeting ?? ""}`}
              registry={registry}
            />
          }
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
        prefillPurchaserInfo={!Boolean(registry.isOwner)}
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
  const { t } = useTranslation();
  const ownerName = registry.ownerName?.trim();
  const greeting = registry.greeting?.trim();
  const [isGreetingExpanded, setIsGreetingExpanded] = useState(false);
  const [canExpandGreeting, setCanExpandGreeting] = useState(false);

  const handleGreetingLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      const hasOverflow = event.nativeEvent.lines.length > 2;
      setCanExpandGreeting((current) =>
        current === hasOverflow ? current : hasOverflow,
      );
    },
    [],
  );

  return (
    <View className="px-5 pt-5 pb-5 items-center gap-2.5 bg-white">
      <RegistryAvatar title={registry.title} logo={registry.logo} size={72} />
      <Typography.Text
        weight="medium"
        size="base"
        className="text-center mt-1"
        numberOfLines={2}
      >
        {registry.title}
      </Typography.Text>
      {ownerName ? (
        <View className="flex-row items-center justify-center gap-1.5">
          <MaterialCommunityIcons
            name="account-outline"
            size={15}
            color="#9CA3AF"
          />
          <Typography.Text
            size="sm"
            type="secondary"
            className="text-center"
            numberOfLines={1}
          >
            {ownerName}
          </Typography.Text>
        </View>
      ) : null}
      {greeting ? (
        <View className="w-full max-w-[620px] pt-2">
          <View className="flex-row items-start justify-center gap-2">
            <MaterialCommunityIcons
              name="message-outline"
              size={16}
              color="#D1A194"
              style={{ marginTop: 2 }}
            />
            <View className="flex-shrink max-w-[92%] gap-1.5">
              <Typography.Text
                type="secondary"
                size="sm"
                className="text-center"
                style={{ lineHeight: 20 }}
                numberOfLines={isGreetingExpanded ? undefined : 2}
                ellipsizeMode="tail"
                onTextLayout={handleGreetingLayout}
              >
                {greeting}
              </Typography.Text>
              {canExpandGreeting ? (
                <TouchableOpacity
                  onPress={() => setIsGreetingExpanded((current) => !current)}
                  className="self-center"
                  activeOpacity={0.7}
                >
                  <Typography.Text size="sm" type="primary" weight="medium">
                    {isGreetingExpanded
                      ? t("common.showLess")
                      : t("common.showMore")}
                  </Typography.Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
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
                purchased: String(registryItem.qty - registryItem.qtyLeft),
                total: String(registryItem.qty),
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

interface GuestPurchaseSheetProps extends Omit<
  BottomSheetModalProps,
  "children"
> {
  ref?: React.Ref<BottomSheetModal>;
  registryId: string;
  prefillPurchaserInfo: boolean;
  item: IRegistryItem | null;
  queryKey: readonly unknown[];
}

function GuestPurchaseSheet({
  ref,
  registryId,
  prefillPurchaserInfo,
  item,
  queryKey,
  onDismiss,
  ...props
}: GuestPurchaseSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const localRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState(() =>
    prefillPurchaserInfo ? getUserFirstLastName() : "",
  );
  const [email, setEmail] = useState(() =>
    prefillPurchaserInfo ? getUserEmail() : "",
  );
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
    const initialName = prefillPurchaserInfo ? getUserFirstLastName() : "";
    const initialEmail = prefillPurchaserInfo ? getUserEmail() : "";

    setName(initialName);
    setEmail(initialEmail);
    setPurchaseQty(MIN_PURCHASE_QTY);
    setShowErrors(false);
  }, [prefillPurchaserInfo]);

  const [formSource, setFormSource] = useState({
    itemId: item?.id,
    prefillPurchaserInfo,
  });
  if (
    formSource.itemId !== item?.id ||
    formSource.prefillPurchaserInfo !== prefillPurchaserInfo
  ) {
    setFormSource({ itemId: item?.id, prefillPurchaserInfo });
    setName(prefillPurchaserInfo ? getUserFirstLastName() : "");
    setEmail(prefillPurchaserInfo ? getUserEmail() : "");
    setPurchaseQty(MIN_PURCHASE_QTY);
    setShowErrors(false);
  }

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
    onError: async (error) => {
      Toast.show({ type: "error", text1: t("common.error") });
      if (
        [401, 403, 404].includes((error as unknown as IApiError).status ?? 0)
      ) {
        localRef.current?.dismiss();
        await queryClient.resetQueries({ queryKey });
      }
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
    <AppBottomSheetModal
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
    </AppBottomSheetModal>
  );
}

export default GuestViewScreen;
