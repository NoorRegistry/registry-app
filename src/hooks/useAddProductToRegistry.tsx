import { queryClient } from "@/api/queryClient";
import AddToRegistrySheet from "@/components/AddToRegistrySheet";
import {
  addItemToRegistry,
  fetchRegistries,
} from "@/services/registries.service";
import { ICreateRegistryItem, IProduct } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useAddProductToRegistry = (product?: IProduct | null) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetOpenRef = useRef(false);
  const submittingRef = useRef(false);
  const completedRef = useRef(false);
  const successTitleRef = useRef<string | null>(null);
  const [pendingProduct, setPendingProduct] = useState<IProduct | null>(null);
  const registriesQuery = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
    enabled: !!pendingProduct,
  });

  const showSuccess = () => {
    if (successTitleRef.current === null) return;
    Toast.show({
      type: "registryAdded",
      text1: t("registry.addedToRegistry"),
      text2: successTitleRef.current,
      position: "bottom",
      bottomOffset: insets.bottom + 140,
      visibilityTime: 5000,
    });
    successTitleRef.current = null;
  };

  const addProductMutation = useMutation({
    mutationFn: (data: ICreateRegistryItem) => addItemToRegistry(data),
    onSuccess: (data, variables) => {
      completedRef.current = true;
      void queryClient.invalidateQueries({
        queryKey: ["registryById", variables.registryId],
      });
      void queryClient.invalidateQueries({ queryKey: ["registries"] });
      successTitleRef.current =
        registriesQuery.data?.find(({ id }) => id === variables.registryId)
          ?.title ?? data.registry.title;
      if (sheetOpenRef.current) sheetRef.current?.dismiss();
      else showSuccess();
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  // Every entry point opens a fresh picker; a registry is never inferred here.
  const addProductToRegistry = () => {
    if (!product || sheetOpenRef.current || submittingRef.current) return;
    Toast.hide();
    addProductMutation.reset();
    completedRef.current = false;
    sheetOpenRef.current = true;
    setPendingProduct(product);
  };

  const confirmRegistry = (registryId: string) => {
    if (
      !pendingProduct ||
      submittingRef.current ||
      completedRef.current ||
      !registriesQuery.data?.some(({ id }) => id === registryId)
    )
      return;
    submittingRef.current = true;
    addProductMutation.mutate({
      productId: pendingProduct.id,
      qty: 1,
      registryId,
    });
  };

  const addedToRegistryOverlay = pendingProduct ? (
    <AddToRegistrySheet
      ref={sheetRef}
      product={pendingProduct}
      registries={registriesQuery.data ?? []}
      isLoading={registriesQuery.isFetching && !registriesQuery.data}
      hasLoadError={registriesQuery.isError && !registriesQuery.data}
      isAdding={addProductMutation.isPending || addProductMutation.isSuccess}
      hasAddError={addProductMutation.isError}
      onRetry={() => void registriesQuery.refetch()}
      onSelect={() => addProductMutation.reset()}
      onConfirm={confirmRegistry}
      onDismiss={() => {
        sheetOpenRef.current = false;
        setPendingProduct(null);
        showSuccess();
      }}
    />
  ) : null;

  return {
    addProductToRegistry,
    addedToRegistryOverlay,
    isAddingProductToRegistry: addProductMutation.isPending,
  };
};
