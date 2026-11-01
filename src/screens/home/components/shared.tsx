import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export function HomeSectionHeading({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={homeStyles.heading}>
      <CommerceText size="xl" weight="medium" style={{ flex: 1 }}>
        {title}
      </CommerceText>
      {onSeeAll && (
        <Pressable
          accessibilityRole="button"
          onPress={onSeeAll}
          style={{ paddingVertical: 10, paddingStart: 12 }}
        >
          <CommerceText size="sm" style={{ color: C.deep }}>
            {t("homeDesign.seeAll")}
          </CommerceText>
        </Pressable>
      )}
    </View>
  );
}
export function HomeLoadState({
  loading,
  onRetry,
}: {
  loading?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ padding: 22, alignItems: "center", gap: 10 }}>
      {loading ? (
        <ActivityIndicator color={C.primary} />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={{ padding: 10 }}
        >
          <CommerceText style={{ color: C.deep }}>
            {t("homeDesign.retry")}
          </CommerceText>
        </Pressable>
      )}
    </View>
  );
}
export function SeeAllTile({
  onPress,
  width,
  height = 90,
  label,
}: {
  onPress: () => void;
  width: number;
  height?: number;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width,
        minHeight: height,
        borderRadius: 14,
        backgroundColor: C.soft,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
      }}
    >
      <Feather
        name={I18nManager.isRTL ? "arrow-left" : "arrow-right"}
        size={23}
        color={C.deep}
      />
      <CommerceText size="sm" style={{ color: C.deep, textAlign: "center" }}>
        {t("homeDesign.seeAll")}
      </CommerceText>
    </Pressable>
  );
}
export const homeStyles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  section: { marginBottom: 28 },
});
