import { queryClient } from "@/api/queryClient";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { CheckCircleIcon } from "@/components/icons/circle_check";
import { PlusCircleIcon } from "@/components/icons/pluscircle";
import { Colors } from "@/constants/Colors";
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
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SwitchRegistryProps extends Omit<BottomSheetModalProps, "children"> {}

const SwitchRegistry = forwardRef<BottomSheetModal, SwitchRegistryProps>(
  ({ ...props }, forwardedRef) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const ref = useRef<BottomSheetModal>(null);
    const [navigateToNewRegistry, setNavigateToNewRegistry] = useState(false);
    const setSelectedRegistryId = useGlobalStore(
      (state) => state.setSelectedRegistryId,
    );

    const snapPoints = useMemo(() => ["20%"], []);

    const handleSelectRegistry = (registry: IRegistry) => {
      const id = registry.id;
      setSelectedRegistryId(id);
      queryClient.setQueryData<IRegistry[] | undefined>(
        ["registries"],
        (old) => {
          if (old && old.length) {
            // Find the index of the object with the matching id
            const index = old.findIndex((obj) => obj.id === id);

            // If found and not already at the first position
            if (index > -1 && index !== 0) {
              // Remove the object from its current position
              const [item] = old.splice(index, 1);
              // Add it to the start of the array
              old.unshift(item);
            }
          }
          return old;
        },
      );
      ref?.current?.close();
    };

    const handleNewRegistry = () => {
      ref?.current?.close();
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
        opacity={0.7} // Adjust opacity
        pressBehavior="close" // Close the bottom sheet on backdrop press
      />
    );

    // Render each registry item
    const renderItem = ({
      item,
      index,
    }: {
      item: IRegistry;
      index: number;
    }) => (
      <View>
        {!index && (
          <Typography.Text className="px-4" size="base" weight="medium">
            Current
          </Typography.Text>
        )}
        <View className="px-4 py-2 flex-row items-center">
          <View className="flex-1">
            <Typography.Text size="base">{item.title}</Typography.Text>
            <Typography.Text size="xs" weight="light" type="secondary">
              {t("registry.items", { count: item._count.totalItems })}
            </Typography.Text>
          </View>
          {index ? (
            <Button
              className="!px-0"
              type="text"
              title={t("registry.switch")}
              onPress={() => handleSelectRegistry(item)}
            />
          ) : (
            <CheckCircleIcon width={32} height={32} />
          )}
        </View>
      </View>
    );

    const handleSheetChanges = useCallback((index: number) => {}, []);

    useImperativeHandle(forwardedRef, () => ref.current as BottomSheetModal);

    const { data: registries } = useQuery({
      queryKey: ["registries"],
      queryFn: fetchRegistries,
    });

    return (
      <BottomSheetModal
        ref={ref}
        index={1} // Start in closed state
        snapPoints={snapPoints}
        onDismiss={handleOnDismiss}
        onChange={handleSheetChanges}
        topInset={insets.top}
        enableOverDrag={false}
        enablePanDownToClose
        enableDynamicSizing
        maxDynamicContentSize={0.7 * Dimensions.get("screen").height}
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
        <BottomSheetFlatList
          data={registries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 40,
          }}
          ListHeaderComponent={
            <Typography.Text
              weight="medium"
              size="lg"
              className="mb-3 text-center"
            >
              {t("registry.yourList")}
            </Typography.Text>
          }
          ListFooterComponent={
            <View
              style={{ paddingBottom: insets.bottom }}
              className="pt-4 border-t border-neutral-200"
            >
              <TouchableOpacity
                className="flex-row gap-2 items-center"
                onPress={handleNewRegistry}
              >
                <PlusCircleIcon color={Colors[colorScheme ?? "light"].tint} />
                <Typography.Text type="primary" size="base" weight="medium">
                  {t("registry.newRegistry")}
                </Typography.Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponentClassName={
            "bg-white flex-1 bottom-0 absolute px-4 start-0 end-0"
          }
        />
      </BottomSheetModal>
    );
  },
);

export default SwitchRegistry;
