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
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryItemPurchase } from "@/types";
import {
  formatPrice,
  getEnArName,
  getImageUrl,
  getUserEmail,
  getUserFirstLastName,
} from "@/utils/helper";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
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

  const updateQty = (qty: number) => {
    setItemQty(qty);
  };

  if (isFetchingRegistryItem) return <LoadingScreen />;

  return (
    <ScrollView>
      <View className="flex-1 mb-10">
        <IconButton
          icon={<CloseIcon />}
          onPress={() => {
            router.back();
          }}
          className="absolute top-0 right-0 p-4 z-10"
        />
        <View className="items-center border-b p-4 border-neutral-200">
          <Typography.Text size="base" weight="medium">
            {t("registry.itemDetails")}
          </Typography.Text>
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
                className="min-h-20 rounded-lg bg-neutral-100 p-4 font-Poppinsregular text-black"
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
                  purchased:
                    (registryItem?.qty ?? 0) - (registryItem?.qtyLeft ?? 0),
                  total: registryItem?.qty,
                })}
              </Typography.Text>
            </View>
            {registryItem?.purchase.length ? (
              <View className="mx-3">
                {registryItem?.purchase.map((purchase, index) => (
                  <View
                    className={clsx(
                      "px-4 gap-2",
                      registryItem?.purchase.length - 1 !== index &&
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
    onSuccess: (data, variables) => {
      try {
        queryClient.invalidateQueries({
          queryKey: ["registries", "items", id],
        });
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
                  className="rounded-lg p-4 bg-neutral-100 font-Poppinsregular text-black text-xs"
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
