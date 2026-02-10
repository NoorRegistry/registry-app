import { queryClient } from "@/api/queryClient";
import RegistryListItem from "@/components/RegistryListItem";
import Typography from "@/components/Typography";
import { PlusIcon } from "@/components/icons/plus";
import { fetchRegistries } from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SwitchRegistryProps extends Omit<BottomSheetModalProps, "children"> {
  ref?: React.Ref<BottomSheetModal>;
}

function SwitchRegistry({ ref, ...props }: SwitchRegistryProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const localRef = useRef<BottomSheetModal>(null);
  const [navigateToNewRegistry, setNavigateToNewRegistry] = useState(false);
  const setSelectedRegistryId = useGlobalStore(
    (state) => state.setSelectedRegistryId,
  );
  const selectedRegistryId = useGlobalStore(
    (state) => state.selectedRegistryId,
  );

  // Compose the passed ref with the local ref
  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else if (ref && "current" in ref) {
      ref.current = localRef.current;
    }
  }, [ref]);

  const snapPoints = useMemo(() => ["55%"], []);

  const handleSelectRegistry = (registry: IRegistry) => {
    const id = registry.id;
    setSelectedRegistryId(id);
    queryClient.setQueryData<IRegistry[] | undefined>(["registries"], (old) => {
      if (old && old.length) {
        const index = old.findIndex((obj) => obj.id === id);
        if (index > -1 && index !== 0) {
          const [item] = old.splice(index, 1);
          old.unshift(item);
        }
      }
      return old;
    });
    localRef?.current?.close();
  };

  const handleNewRegistry = () => {
    localRef?.current?.close();
    setNavigateToNewRegistry(true);
  };

  const handleOnDismiss = () => {
    if (navigateToNewRegistry) {
      setNavigateToNewRegistry(false);
      router.push("/(protected)/registry/create");
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7}
      pressBehavior="close"
    />
  );

  const renderItem = ({ item }: { item: IRegistry }) => {
    const isSelected = item.id === selectedRegistryId;
    return (
      <RegistryListItem
        registry={item}
        selected={isSelected}
        showBadge={isSelected}
        badgeLabel={t("registry.currentList")}
        actionLabel={t("registry.switch")}
        subtitle={t("registry.items", { count: item._count.totalItems })}
        onPress={isSelected ? undefined : handleSelectRegistry}
      />
    );
  };

  const handleSheetChanges = useCallback((index: number) => {}, []);

  const { data: registries } = useQuery({
    queryKey: ["registries"],
    queryFn: fetchRegistries,
  });

  return (
    <BottomSheetModal
      ref={localRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={handleOnDismiss}
      onChange={handleSheetChanges}
      topInset={insets.top}
      enableOverDrag={false}
      enablePanDownToClose
      enableDynamicSizing
      maxDynamicContentSize={0.7 * Dimensions.get("screen").height}
      style={{
        borderRadius: 32,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 6,
      }}
      backgroundStyle={{ backgroundColor: "#FAFAFA" }}
      handleIndicatorStyle={{
        backgroundColor: "#EFE7E2",
        width: 51,
        height: 3,
        borderRadius: 999,
      }}
      backdropComponent={renderBackdrop}
      {...props}
    >
      <BottomSheetFlatList
        data={registries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom ? insets.bottom + 84 : 84,
          paddingHorizontal: 16,
          gap: 8,
        }}
        ListHeaderComponent={
          <Typography.Text weight="bold" size="lg" className="mb-4 text-center">
            {t("registry.myRegistries")}
          </Typography.Text>
        }
      />
      <View
        style={{ paddingBottom: insets.bottom }}
        className="pt-3 border-t border-[#EFE7E2] bg-white px-4"
      >
        <TouchableOpacity
          className="flex-row gap-3 items-center"
          onPress={handleNewRegistry}
        >
          <View className="bg-[#CF8169] rounded-lg items-center justify-center w-[26px] h-[26px]">
            <PlusIcon size={16} color="#FFFFFF" />
          </View>
          <Typography.Text size="base" weight="medium">
            {t("registry.newRegistry")}
          </Typography.Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

export default SwitchRegistry;
