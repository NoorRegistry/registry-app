import { CommerceText } from "@/components/Commerce";
import { BrandColors as C } from "@/constants/Colors";
import { SupportRequest, SupportTopic } from "@/services/support.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import Svg, { Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { textFontFamily } from "@/components/Typography/metrics";
export const topicIcons: Record<
  SupportTopic,
  React.ComponentProps<typeof Feather>["name"]
> = {
  ORDERS: "package",
  REGISTRIES: "clipboard",
  GIFTS: "gift",
  FRIENDS: "users",
  ACCOUNT: "user",
  APP: "bell",
};
export function SupportChatIcon({
  color = C.deep,
  size = 23,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 3.5h14A2.5 2.5 0 0 1 21.5 6v10a2.5 2.5 0 0 1-2.5 2.5H9l-6 4V6A2.5 2.5 0 0 1 5 3.5Z" />
      <Path d="M7.5 8.5h9M7.5 12.5h6" />
    </Svg>
  );
}
export function HelpHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        height: 54,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        onPress={onBack}
        style={{ width: 44, height: 44, justifyContent: "center", zIndex: 1 }}
      >
        <Feather
          name={I18nManager.isRTL ? "arrow-right" : "arrow-left"}
          size={24}
          color={C.ink}
        />
      </Pressable>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          start: 64,
          end: 64,
          alignItems: "center",
        }}
      >
        <CommerceText weight="bold" size="lg" numberOfLines={1}>
          {title}
        </CommerceText>
      </View>
    </View>
  );
}
export function Chevron() {
  return (
    <Ionicons
      name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
      size={18}
      color={C.muted}
    />
  );
}
export function SupportButton({
  title,
  onPress,
  disabled,
  testID,
  contact = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  contact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={[styles.button, disabled && { opacity: 0.45 }]}
    >
      {contact && <SupportChatIcon color="white" size={22} />}
      <CommerceText
        weight={contact ? "regular" : "medium"}
        size={contact ? "base" : "sm"}
        style={{ color: "white", textAlign: "center" }}
      >
        {title}
      </CommerceText>
    </Pressable>
  );
}
export function SupportInput(props: TextInputProps) {
  const { i18n } = useTranslation();
  return (
    <TextInput
      placeholderTextColor={C.muted}
      {...props}
      style={[
        styles.input,
        {
          fontFamily: textFontFamily(
            "regular",
            i18n.language,
            props.value || props.placeholder || "",
          ),
          textAlign: I18nManager.isRTL ? "right" : "left",
          writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
        },
        props.style,
      ]}
    />
  );
}
export function Status({ status }: { status: "OPEN" | "RESOLVED" }) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: status === "OPEN" ? "#FFF2D8" : "#E9F2DF",
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 6,
      }}
    >
      <CommerceText
        size="xs"
        style={{ color: status === "OPEN" ? "#8A5C18" : "#567336" }}
      >
        {t(`support.status.${status}`)}
      </CommerceText>
    </View>
  );
}
export function RequestRow({
  request,
  onPress,
  last = false,
}: {
  request: SupportRequest;
  onPress: () => void;
  last?: boolean;
}) {
  const { i18n } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, !last && styles.divider]}
    >
      <SupportChatIcon />
      <View style={{ flex: 1, gap: 4 }}>
        <CommerceText
          weight={request.unreadCount ? "bold" : "medium"}
          numberOfLines={1}
        >
          {request.subject}
        </CommerceText>
        <CommerceText size="xs" style={{ color: C.muted }}>
          {request.orderReference ? `${request.orderReference} · ` : ""}
          {new Date(request.updatedAt).toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "short",
          })}
        </CommerceText>
      </View>
      {request.unreadCount > 0 && <View style={styles.dot} />}
      <Status status={request.status} />
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 17,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: C.line },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 25,
    paddingBottom: 8,
  },
  button: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: C.primary,
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  input: {
    backgroundColor: "#F7F5F3",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: C.ink,
    minHeight: 48,
    includeFontPadding: false,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  empty: { paddingVertical: 30, gap: 15, alignItems: "center" },
});
