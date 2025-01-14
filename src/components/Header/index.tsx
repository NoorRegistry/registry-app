import { getUserFirstName } from "@/utils/helper";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Typography from "../Typography";
import HeaderRightButtons from "./HeaderRightButtons";

const Header = ({ props }: { props?: BottomTabHeaderProps }) => {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={["top"]}>
      <View className="flex-row h-14 items-center justify-between ps-4 pe-3 gap-6 border-b border-neutral-200">
        <Typography.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          weight="bold"
          size="base"
          className="flex-1"
        >{`${t("common.welcome")}${getUserFirstName()}`}</Typography.Text>
        <HeaderRightButtons />
      </View>
    </SafeAreaView>
  );
};

export default Header;
