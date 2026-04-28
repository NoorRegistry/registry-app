import { queryClient } from "@/api/queryClient";
import { IconButton } from "@/components/Button";
import { LoadingScreen } from "@/components/Loader/customLoader";
import QtyButton from "@/components/QtyButton";
import Radio from "@/components/Radio";
import Typography from "@/components/Typography";
import { RegistryIcon } from "@/components/icons";
import { CloseIcon } from "@/components/icons/close";
import { PlusCircleIcon } from "@/components/icons/pluscircle";
import { Colors } from "@/constants/Colors";
import {
  fetchRegistryItemById,
  postRegistryItemPurchase,
  updateRegistryItem,
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import {
  ICreateRegistryItemPurchase,
  IRegistryDetails,
  IRegistryItemDetails,
  IUpdateRegistryItemPayload,
} from "@/types";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserEmail,
  getUserFirstLastName,
} from "@/utils/helper";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import cn from "clsx";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";

function RegistryItemDetails() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const [itemNote, setItemNote] = useState<string>();
  const [qty, setItemQty] = useState<number>();
  const [showPurchasedSection, setShowPurchasedSection] = useState(false);

  const { data: registryItem, isFetching: isFetchingRegistryItem } = useQuery({
    queryKey: ["registries", "items", id],
    queryFn: () => fetchRegistryItemById(id),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (registryItem) {
      setItemNote(registryItem.notes);
      setItemQty(registryItem.qty);
    }
  }, [registryItem]);

  const updateRegistryItemMutation = useMutation({
    mutationFn: (payload: IUpdateRegistryItemPayload) =>
      updateRegistryItem(id, payload),
    onSuccess: (data, variables) => {
      const updatedItem = queryClient.setQueryData<
        IRegistryItemDetails | undefined
      >(
        ["registries", "items", id],
        (old) =>
          data ??
          (old
            ? {
                ...old,
                qty: variables.qty,
                notes: variables.notes,
              }
            : old),
      );
      const normalizedQty = updatedItem?.qty ?? variables.qty;
      const normalizedNotes = updatedItem?.notes ?? variables.notes;

      setItemNote(normalizedNotes);
      setItemQty(normalizedQty);

      queryClient.setQueriesData<IRegistryDetails | undefined>(
        {
          queryKey: ["registryById"],
        },
        (old) => {
          if (!old) return old;

          const updatedSections = old.registryItems.items
            .map((section) => {
              const updatedData = section.data
                .map((item) => {
                  if (item.id !== id) return item;

                  const purchasedQty = item.qty - item.qtyLeft;
                  return {
                    ...item,
                    qty: normalizedQty,
                    qtyLeft: Math.max(0, normalizedQty - purchasedQty),
                  };
                })
                .filter((item) => item.qtyLeft > 0);

              return {
                ...section,
                data: updatedData,
              };
            })
            .filter((section) => section.data.length > 0);

          return {
            ...old,
            registryItems: {
              ...old.registryItems,
              items: updatedSections,
            },
          };
        },
      );
      router.back();
      Toast.show({ type: "success", text1: t("common.changesSaved") });
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("common.error") });
    },
  });

  const updateQty = (qty: number) => {
    setItemQty(qty);
  };

  const originalNote = registryItem?.notes ?? "";
  const originalQty = registryItem?.qty ?? 1;
  const currentNote = itemNote ?? "";
  const currentQty = qty ?? originalQty;
  const hasChanges = currentNote !== originalNote || currentQty !== originalQty;
  const saveDisabled =
    !registryItem || !hasChanges || updateRegistryItemMutation.isPending;
  const purchases = registryItem?.purchase ?? [];

  const handleSave = () => {
    if (!registryItem) return;
    updateRegistryItemMutation.mutate({
      notes: currentNote,
      qty: currentQty,
    });
  };

  if (isFetchingRegistryItem) return <LoadingScreen />;

  return (
    <ScrollView>
      <View className="flex-1 mb-10">
        <View className="border-b p-4 border-neutral-200">
          <View className="flex-row items-center">
            <View className="w-14 items-start">
              <IconButton
                icon={<CloseIcon />}
                onPress={() => {
                  router.back();
                }}
              />
            </View>
            <View className="flex-1 items-center">
              <Typography.Text size="base" weight="medium">
                {t("registry.itemDetails")}
              </Typography.Text>
            </View>
            <View className="w-14 items-end">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saveDisabled}
                className={saveDisabled ? "opacity-50" : ""}
              >
                <Typography.Text
                  weight="medium"
                  className={cn(
                    saveDisabled ? "text-[#8A8A8A]" : "!text-[#2A2A2A]",
                  )}
                >
                  {t("common.save")}
                </Typography.Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="p-4">
          <View className="flex-row items-center gap-4 border-b border-neutral-200 pb-4">
            <Image
              source={
                registryItem?.product?.images?.[0]?.path
                  ? getImageUrl(registryItem.product.images[0].path)
                  : require("@assets/images/icon.png") // Fallback to app icon
              }
              className="w-12 h-12 rounded-md mr-4"
              style={{ width: 100, height: 100 }}
            />
            <View className="flex-1 gap-2">
              <Typography.Text size="sm">
                {getEnArName(
                  registryItem?.product.store?.nameEn,
                  registryItem?.product.store?.nameAr,
                )}
              </Typography.Text>
              <Typography.Text size="sm" weight="light">
                {getEnArName(
                  registryItem?.product.nameEn,
                  registryItem?.product.nameAr,
                )}
              </Typography.Text>
              <Typography.Text weight="medium">
                {formatPrice(
                  registryItem?.product.price ?? 0,
                  registryItem?.product.currencyCode,
                )}
              </Typography.Text>
            </View>
          </View>
          <View className="gap-6 mt-6 border-b border-neutral-200 pb-6">
            <View>
              <Typography.Text
                className="mb-2"
                type="secondary"
                size="xs"
                weight="medium"
              >
                {t("common.category")}
              </Typography.Text>
              <Typography.Text size="sm">
                {getEnArName(
                  registryItem?.product.category?.nameEn,
                  registryItem?.product.category?.nameAr,
                )}
              </Typography.Text>
            </View>
            <View>
              <Typography.Text
                className="mb-2"
                type="secondary"
                size="xs"
                weight="medium"
              >
                {t("registry.noteForRegistryItem")}
              </Typography.Text>
              <TextInput
                placeholder={t("registry.noteForRegistryItemPlaceholder")}
                onChangeText={(text) => setItemNote(text)}
                value={itemNote}
                className="min-h-20 rounded bg-neutral-100 p-4 font-Poppinsregular text-black"
                textAlign={I18nManager.isRTL ? "right" : "left"}
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].placeholderTextColor
                }
                multiline
              />
            </View>
          </View>

          {/* Quantity Requested Section */}
          <View className="gap-6 mt-6 border-b border-neutral-200 pb-6">
            <View className="flex-row gap-2 items-center justify-between">
              <Typography.Text weight="medium">
                {t("registry.quantityRequested")}
              </Typography.Text>
              <QtyButton qty={qty ?? 1} updateQty={updateQty} />
            </View>
          </View>

          {/* Purchased information */}
          <View className="gap-6 mt-6 border-b border-neutral-200 pb-6">
            <View className="justify-between flex-row">
              <View className="flex-row gap-2 items-center">
                <RegistryIcon color={Colors[colorScheme ?? "light"].tint} />
                <Typography.Text weight="medium">
                  {t("registry.purchases")}
                </Typography.Text>
              </View>
              <Typography.Text weight="medium">
                {t("registry.purchasedCount", {
                  purchased: String(
                    (registryItem?.qty ?? 0) - (registryItem?.qtyLeft ?? 0),
                  ),
                  total: String(registryItem?.qty ?? 0),
                })}
              </Typography.Text>
            </View>
            {purchases.length ? (
              <View className="mx-3">
                {purchases.map((purchase, index) => (
                  <View
                    className={cn(
                      "px-4 gap-2",
                      purchases.length - 1 !== index &&
                        "pb-6 border-s border-primary-500",
                    )}
                    key={purchase.id}
                  >
                    <View className="w-4 h-4 bg-primary-500 absolute rounded-full border-2 border-white transform -translate-x-1/2" />
                    <Typography.Text type="secondary">
                      {purchase.name}
                    </Typography.Text>
                    <Typography.Text type="secondary" size="xs" weight="light">
                      {t("registry.qty")} {purchase.qty}
                    </Typography.Text>
                  </View>
                ))}
              </View>
            ) : null}
            {showPurchasedSection ? (
              <View>
                <MarkPurchasedForm
                  id={id}
                  toggleShowMarkPurchaseSection={() =>
                    setShowPurchasedSection(!showPurchasedSection)
                  }
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowPurchasedSection(!showPurchasedSection)}
                className="flex-row gap-3 justify-center items-center bg-neutral-100 rounded-full p-3"
              >
                <PlusCircleIcon />
                <Typography.Text className="text-center" weight="medium">
                  {t("registry.markAnotherPurchase", {
                    count: registryItem?.purchase?.length ?? 0,
                  })}
                </Typography.Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </ScrollView>
  );
}

const MarkPurchasedForm = ({
  id,
  toggleShowMarkPurchaseSection,
}: {
  id: string;
  toggleShowMarkPurchaseSection: () => void;
}) => {
  const { t } = useTranslation();
  const [selected, setselected] = useState<number>();
  const [qty, setQty] = useState<number>(1);
  const [name, setName] = useState<string>();
  const [showError, setShowError] = useState(false);
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );

  const createRegistryItemMutation = useMutation({
    mutationFn: (data: ICreateRegistryItemPurchase) =>
      postRegistryItemPurchase(data),
    onSuccess: (_, variables) => {
      try {
        const detailsQueryKey = ["registries", "items", id] as const;
        const purchaseId = `local-${Date.now()}`;

        const updatedItemDetails = queryClient.setQueryData<
          IRegistryItemDetails | undefined
        >(detailsQueryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            purchase: [
              ...old.purchase,
              {
                id: purchaseId,
                name: variables.name,
                qty: variables.qty,
              },
            ],
            qtyLeft: Math.max(0, old.qtyLeft - variables.qty),
          };
        });

        queryClient.setQueriesData<IRegistryDetails | undefined>(
          {
            queryKey: ["registryById"],
          },
          (old) => {
            if (!old) return old;

            const updatedRegistrySections = old.registryItems.items
              .map((section) => {
                const updatedData = section.data
                  .map((item) => {
                    if (item.id !== id) return item;
                    return {
                      ...item,
                      qtyLeft: Math.max(0, item.qtyLeft - variables.qty),
                    };
                  })
                  .filter((item) => item.qtyLeft > 0);

                return {
                  ...section,
                  data: updatedData,
                };
              })
              .filter((section) => section.data.length > 0);

            const product = updatedItemDetails?.product;
            const category = product?.category;
            const purchasedItem = product
              ? {
                  id,
                  qty: variables.qty,
                  product: {
                    id: product.id,
                    nameEn: product.nameEn,
                    nameAr: product.nameAr,
                    images: product.images,
                    price: product.price,
                    currencyCode: product.currencyCode,
                  },
                }
              : null;

            let updatedPurchasedSections = old.purchased.items;
            if (category && purchasedItem) {
              const existingCategoryIndex = updatedPurchasedSections.findIndex(
                (section) => section.id === category.id,
              );

              if (existingCategoryIndex === -1) {
                updatedPurchasedSections = [
                  ...updatedPurchasedSections,
                  {
                    id: category.id,
                    nameEn: category.nameEn,
                    nameAr: category.nameAr,
                    data: [purchasedItem],
                  },
                ];
              } else {
                updatedPurchasedSections = updatedPurchasedSections.map(
                  (section, sectionIndex) => {
                    if (sectionIndex !== existingCategoryIndex) return section;

                    const existingPurchasedItem = section.data.find(
                      (item) => item.id === id,
                    );

                    if (!existingPurchasedItem) {
                      return {
                        ...section,
                        data: [...section.data, purchasedItem],
                      };
                    }

                    return {
                      ...section,
                      data: section.data.map((item) =>
                        item.id === id
                          ? {
                              ...item,
                              qty: item.qty + variables.qty,
                            }
                          : item,
                      ),
                    };
                  },
                );
              }
            }

            return {
              ...old,
              registryItems: {
                ...old.registryItems,
                items: updatedRegistrySections,
              },
              purchased: {
                ...old.purchased,
                items: updatedPurchasedSections,
              },
            };
          },
        );
      } catch (error) {
        console.error(error);
      }
    },
  });

  const createPurchaseItem = () => {
    setShowError(true);
    if (selected === 2 && !name) return;
    const data: ICreateRegistryItemPurchase = {
      registryId: selectedRegistryId!,
      registryItemsId: id,
      email: getUserEmail(),
      name: selected === 1 ? getUserFirstLastName() : name!,
      platform: " ",
      platformOrderId: " ",
      qty,
    };
    createRegistryItemMutation.mutate(data);
  };

  return (
    <>
      <View className="ms-4 mb-6 gap-4">
        <View className="gap-4">
          <View className="flex-row items-center">
            <Radio.Radio
              value={1}
              selectedValue={selected}
              onChange={setselected}
            />
            <Typography.Text>{t("registry.iPurchased")}</Typography.Text>
          </View>
          {selected === 1 && (
            <View className="ms-6 flex-row justify-between items-center">
              <Typography.Text size="xs" weight="light">
                {t("registry.qtyPurchased")}
              </Typography.Text>
              <QtyButton qty={qty ?? 1} updateQty={setQty} />
            </View>
          )}
        </View>
        <View className="gap-4">
          <View className="flex-row items-center">
            <Radio.Radio
              value={2}
              selectedValue={selected}
              onChange={setselected}
            />
            <Typography.Text>
              {t("registry.someoneElsePurchased")}
            </Typography.Text>
          </View>
          {selected === 2 && (
            <View className="ms-6 gap-3">
              <View className="gap-1">
                <Typography.Text size="xs" weight="light">
                  {t("registry.purchaserName")}
                </Typography.Text>
                <TextInput
                  placeholder={t("registry.purchaserName")}
                  className="rounded p-4 bg-neutral-100 font-Poppinsregular text-black text-xs"
                  onChangeText={setName}
                />
                {showError && !name && (
                  <Typography.Text size="xs" weight="light" type="danger">
                    {t("common.required")}
                  </Typography.Text>
                )}
              </View>
              <View className="flex-row justify-between items-center">
                <Typography.Text size="xs" weight="light">
                  {t("registry.qtyPurchased")}
                </Typography.Text>
                <QtyButton qty={qty ?? 1} updateQty={setQty} />
              </View>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row gap-3 justify-center items-center">
        <TouchableOpacity
          onPress={toggleShowMarkPurchaseSection}
          className="flex-1 bg-neutral-100 rounded-full p-3"
        >
          <Typography.Text className="text-center" weight="medium">
            {t("common.cancel")}
          </Typography.Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={createPurchaseItem}
          className="flex-1 bg-primary-500 rounded-full p-3"
        >
          <Typography.Text className="text-center !text-white" weight="medium">
            {t("common.save")}
          </Typography.Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default RegistryItemDetails;
