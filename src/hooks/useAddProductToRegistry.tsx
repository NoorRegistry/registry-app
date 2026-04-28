import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import Typography from "@/components/Typography";
import SwitchRegistry from "@/screens/registry/components/SwitchRegistrySheet";
import {
  addItemToRegistry,
  deleteRegistryItem,
  fetchRegistries,
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryItem, IProduct, IRegistry } from "@/types";
import { getImageUrl } from "@/utils/helper";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CONFIRMATION_VISIBLE_MS = 5000;

type AddProductTarget = Pick<IProduct, "id" | "images">;

type AddedRegistry = Pick<IRegistry, "id" | "title">;

type AddedProductState = {
  product: AddProductTarget;
  registry: AddedRegistry;
  registryItemId: string;
};

export const useAddProductToRegistry = (product?: AddProductTarget | null) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const switchRegistryRef = useRef<BottomSheetModal>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shouldShowConfirmationRef = useRef(true);
  const [addedProductState, setAddedProductState] =
    useState<AddedProductState | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );
  const setSelectedRegistryId = useGlobalStore(
    (state) => state.setSelectedRegistryId,
  );

  const {
    data: registries,
    isFetching: isFetchingRegistries,
    isError: isRegistriesError,
  } = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  const selectedRegistry = useMemo(() => {
    return (
      registries?.find((registry) => registry.id === selectedRegistryId) ??
      registries?.[0]
    );
  }, [registries, selectedRegistryId]);

  const currentProduct = addedProductState?.product ?? product;
  const currentRegistry = addedProductState?.registry ?? selectedRegistry;
  const showChangeButton = (registries?.length ?? 0) > 1;
  const productImage = currentProduct?.images?.[0]?.path
    ? { uri: getImageUrl(currentProduct.images[0].path) }
    : require("@assets/images/icon.png");
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["100%", "0%"],
  });

  useEffect(() => {
    if (!isOverlayVisible) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      return;
    }

    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: CONFIRMATION_VISIBLE_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        setIsOverlayVisible(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [isOverlayVisible, progressAnim]);

  const addProductMutation = useMutation({
    mutationFn: (data: ICreateRegistryItem) => addItemToRegistry(data),
    onSuccess: (data, variables) => {
      const targetRegistry =
        registries?.find((registry) => registry.id === variables.registryId) ??
        data.registry;

      setSelectedRegistryId(variables.registryId);
      queryClient.invalidateQueries({
        queryKey: ["registryById", variables.registryId],
      });
      queryClient.invalidateQueries({ queryKey: ["registries"] });

      if (currentProduct && shouldShowConfirmationRef.current) {
        setAddedProductState({
          product: currentProduct,
          registry: targetRegistry,
          registryItemId: data.id,
        });
        setIsOverlayVisible(true);
      }
    },
    onError: (err: IApiError) => {
      Toast.show({
        type: "error",
        text1: err?.detail ?? t("common.error"),
      });
    },
  });

  const addProductToRegistry = (registryId?: string) => {
    const targetRegistryId =
      registryId ?? selectedRegistryId ?? selectedRegistry?.id;

    if (!product) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
      });
      return;
    }

    if (isFetchingRegistries && !registries) {
      return;
    }

    if (isRegistriesError || !targetRegistryId) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
      });
      return;
    }

    addProductMutation.mutate({
      productId: product.id,
      qty: 1,
      registryId: targetRegistryId,
    });
  };

  const handleChangeRegistry = () => {
    progressAnim.stopAnimation();
    setIsOverlayVisible(false);
    requestAnimationFrame(() => {
      switchRegistryRef.current?.present();
    });
  };

  const handleSelectRegistry = (registry: IRegistry) => {
    if (!currentProduct) return;
    shouldShowConfirmationRef.current = false;
    addProductMutation.mutate(
      {
        productId: currentProduct.id,
        qty: 1,
        registryId: registry.id,
      },
      {
        onSuccess: async () => {
          if (!addedProductState?.registryItemId) return;
          try {
            await deleteRegistryItem(addedProductState.registryItemId);
            queryClient.invalidateQueries({
              queryKey: ["registryById", addedProductState.registry.id],
            });
            queryClient.invalidateQueries({ queryKey: ["registries"] });
          } catch (error) {
            console.error(
              "Failed to remove product from previous registry",
              error,
            );
            Toast.show({
              type: "error",
              text1: t("common.error"),
            });
          }
        },
        onSettled: () => {
          shouldShowConfirmationRef.current = true;
        },
      },
    );
  };

  const addedToRegistryOverlay = (
    <>
      <Modal
        visible={isOverlayVisible && !!currentRegistry}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOverlayVisible(false)}
      >
        <View className="flex-1">
          <View style={styles.backdrop} />
          <Pressable
            className="flex-1"
            onPress={() => setIsOverlayVisible(false)}
          />
          <View className="px-4" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="overflow-hidden rounded-2xl bg-white p-3 shadow-lg shadow-black/20">
              <View className="flex-row items-center gap-3">
                <Image
                  source={productImage}
                  style={{ width: 80, height: 64, borderRadius: 8 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Typography.Text size="sm" type="secondary">
                    {t("registry.addedToRegistry")}
                  </Typography.Text>
                  <Typography.Text
                    size="base"
                    weight="bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {currentRegistry?.title}
                  </Typography.Text>
                </View>
                {showChangeButton && (
                  <TouchableOpacity
                    className="px-1 py-2"
                    onPress={handleChangeRegistry}
                  >
                    <Typography.Text
                      size="xs"
                      weight="bold"
                      className="uppercase !text-[#CF8169]"
                    >
                      {t("common.change")}
                    </Typography.Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressBar, { width: progressWidth }]}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <SwitchRegistry
        ref={switchRegistryRef}
        selectedRegistryId={currentRegistry?.id}
        onSelectRegistry={handleSelectRegistry}
      />
    </>
  );

  return {
    addProductToRegistry,
    addedToRegistryOverlay,
    isAddingProductToRegistry:
      addProductMutation.isPending || (isFetchingRegistries && !registries),
  };
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 242, 239, 0.78)",
  },
  progressTrack: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: "#F0D8D1",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#CF8169",
  },
});
