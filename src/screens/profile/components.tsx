import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import ProfileIcon, { ProfileIconName } from "@/components/icons/profile";
import { I18nManager, TouchableOpacity } from "react-native";
export type AccountIcon = ProfileIconName;
export function AccountRow({
  label,
  icon,
  onPress,
  danger = false,
  last = false,
}: {
  label: string;
  icon: AccountIcon;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const color = danger ? "#B93D38" : BrandColors.ink;
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      testID={`profile-row-${icon}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        minHeight: 64,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: BrandColors.line,
      }}
    >
      <ProfileIcon
        name={icon}
        size={18}
        color={color}
        accent={danger ? color : BrandColors.primary}
      />
      <Typography.Text size="base" style={{ flex: 1, color }}>
        {label}
      </Typography.Text>
      {!danger && (
        <Feather
          name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
          size={18}
          color="#AEA4A0"
        />
      )}
    </TouchableOpacity>
  );
}
