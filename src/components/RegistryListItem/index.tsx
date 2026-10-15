import RegistryAvatar from "@/components/RegistryAvatar";
import Typography from "@/components/Typography";
import { CheckCircleIcon } from "@/components/icons/circle_check";
import { Colors } from "@/constants/Colors";
import { IRegistry } from "@/types";
import React from "react";
import { Pressable, View, useColorScheme } from "react-native";

type RegistryListItemProps = {
  registry: IRegistry;
  selected?: boolean;
  actionLabel?: string;
  subtitle?: string;
  onPress?: (registry: IRegistry) => void;
  showBadge?: boolean;
  badgeLabel?: string;
};

const RegistryListItem = ({
  registry,
  selected = false,
  actionLabel,
  subtitle,
  onPress,
  showBadge = false,
  badgeLabel,
}: RegistryListItemProps) => {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      className={
        selected
          ? "relative overflow-hidden bg-[#FAF7F6] border border-[#D99A87] rounded-lg"
          : "relative overflow-hidden bg-[#FAF7F6] border border-[#F0D8D1] rounded-lg"
      }
      disabled={!onPress}
      onPress={() => onPress?.(registry)}
    >
      {showBadge && badgeLabel ? (
        <View className="absolute right-0 top-0 bg-[#CF8169] rounded-bl-[10px] rounded-tr-[8px] px-[9px] py-[6px]">
          <Typography.Text
            weight="bold"
            className="!text-[#FAF2F0]"
            style={{ fontSize: 12, lineHeight: 18 }}
          >
            {badgeLabel}
          </Typography.Text>
        </View>
      ) : null}
      <View className="px-3 py-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <RegistryAvatar
              title={registry.title}
              logo={registry.logo}
              size={50}
            />
            <View className="gap-1">
              <Typography.Text weight="medium" size="base">
                {registry.title}
              </Typography.Text>
              {subtitle ? (
                <Typography.Text size="xs" className="text-[#403E3E]">
                  {subtitle}
                </Typography.Text>
              ) : null}
            </View>
          </View>
          {selected ? (
            <CheckCircleIcon
              width={24}
              height={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
          ) : actionLabel ? (
            <Typography.Text
              weight="bold"
              className="uppercase !text-[#CF8169]"
              style={{ fontSize: 12, lineHeight: 18 }}
            >
              {actionLabel}
            </Typography.Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default RegistryListItem;
