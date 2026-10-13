import Typography from "@/components/Typography";
import { BrandColors } from "@/constants/Colors";
import { useFriendsSummary } from "@/screens/friends/hooks";
import {
  getDecodedToken,
  getUserEmail,
  getUserFirstLastName,
} from "@/utils/helper";
import { logoutWithNotifications } from "@/utils/push-registration";
import ProfileIcon, { ProfileIconName } from "@/components/icons/profile";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import Toast from "react-native-toast-message";
import { AccountRow } from "./components";
export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height, width, fontScale } = useWindowDimensions();
  const friends = useFriendsSummary();
  const phone = String(getDecodedToken()?.user?.mobileNumber ?? "");
  const [scroll] = useState(() => new Animated.Value(0));
  const [collapsed, setCollapsed] = useState(false);
  const [heroHeight, setHeroHeight] = useState(insets.top + 144);
  const [loggingOut, setLoggingOut] = useState(false);
  const threshold = Math.max(80, heroHeight - insets.top - 44);
  const headerStyle = {
    opacity: scroll.interpolate({
      inputRange: [threshold - 35, threshold],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: scroll.interpolate({
          inputRange: [threshold - 35, threshold],
          outputRange: [-14, 0],
          extrapolate: "clamp",
        }),
      },
    ],
  };
  const headerActions = (light: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("profile.help")}
        onPress={() => router.push("/help")}
        hitSlop={8}
        style={{
          minHeight: 28,
          paddingHorizontal: 10,
          borderRadius: 14,
          justifyContent: "center",
          backgroundColor: light ? "#FFFFFF25" : BrandColors.soft,
        }}
      >
        <Typography.Text
          weight="medium"
          style={{ color: light ? "#fff" : BrandColors.deep, fontSize: 12 }}
        >
          {t("profile.help")}
        </Typography.Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("profile.settings")}
        onPress={() => router.push("/settings")}
        hitSlop={6}
        style={{
          width: 32,
          minHeight: 32,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ProfileIcon
          name="gear"
          size={18}
          color={light ? "#fff" : BrandColors.ink}
          accent={light ? "#fff" : BrandColors.primary}
        />
      </Pressable>
    </View>
  );
  const shortcut = (
    label: string,
    icon: ProfileIconName,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      activeOpacity={0.6}
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 10,
        minWidth: 0,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: BrandColors.soft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProfileIcon name={icon} size={20} color={BrandColors.deep} />
      </View>
      <Typography.Text weight="medium" style={{ textAlign: "center" }}>
        {label}
      </Typography.Text>
    </TouchableOpacity>
  );
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutWithNotifications();
      router.replace("/login");
    } catch {
      Toast.show({ type: "error", text1: t("notifications.logoutError") });
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        testID="profile-scroll"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scroll } } }],
          {
            useNativeDriver: true,
            listener: (event: any) => {
              const next = event.nativeEvent.contentOffset.y >= threshold;
              setCollapsed(next);
            },
          },
        )}
        contentContainerStyle={{
          paddingBottom: 30,
          minHeight: height - insets.bottom + threshold,
        }}
      >
        <View
          onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
          style={{
            paddingTop: insets.top + 4,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
            backgroundColor: BrandColors.deep,
          }}
        >
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
            width={width}
            height={Math.ceil(heroHeight)}
          >
            <Defs>
              <LinearGradient
                id="profile-brand"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <Stop offset="0" stopColor={BrandColors.primary} />
                <Stop offset="0.5" stopColor="#BC7560" />
                <Stop offset="1" stopColor={BrandColors.deep} />
              </LinearGradient>
            </Defs>
            <Rect
              width={width}
              height={Math.ceil(heroHeight)}
              fill="url(#profile-brand)"
            />
          </Svg>
          <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
            {headerActions(true)}
          </View>
          <View style={{ gap: 2 }}>
            <Typography.Text
              weight="bold"
              style={{ color: "#fff", fontSize: 17, lineHeight: 23 }}
            >
              {getUserFirstLastName() || t("profile.title")}
            </Typography.Text>
            {!!friends.data?.profileCode && (
              <Typography.Text
                style={{ color: "#FFF1EA", fontSize: 10, lineHeight: 15 }}
              >
                {friends.data.profileCode}
              </Typography.Text>
            )}
          </View>
          <Typography.Text
            style={{
              color: "#FFF1EA",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 6,
            }}
          >
            {phone}
            {!!phone && (
              <Typography.Text
                weight="bold"
                style={{ color: "#fff", fontSize: 14 }}
              >
                {" • "}
              </Typography.Text>
            )}
            {getUserEmail()}
          </Typography.Text>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: fontScale > 1.3 ? "column" : "row",
              gap: 14,
              paddingVertical: 28,
            }}
          >
            {shortcut(t("orders.title"), "orders", () =>
              router.push("/orders"),
            )}
            {shortcut(t("addresses.title"), "address", () =>
              router.push("/addresses"),
            )}
            {shortcut(t("friends.title"), "friends", () =>
              router.push("/friends"),
            )}
          </View>
          <View
            style={{
              height: 7,
              backgroundColor: "#FAF7F6",
              marginHorizontal: -24,
              marginBottom: 8,
            }}
          />
          <AccountRow
            label={t("profile.settings")}
            icon="settings"
            onPress={() => router.push("/settings")}
          />
          <AccountRow
            label={t("profile.help")}
            icon="help"
            onPress={() => router.push("/help")}
          />
          <AccountRow
            label={t("profile.partner")}
            icon="partner"
            last
            onPress={() => router.push("/partner")}
          />
          <View style={{ marginTop: 24 }}>
            <AccountRow
              label={t("common.logout")}
              icon="logout"
              danger
              last
              onPress={() => void logout()}
            />
          </View>
          <Typography.Text
            size="xs"
            style={{
              color: BrandColors.muted,
              paddingTop: 16,
              textAlign: "center",
            }}
          >
            {t("profile.version", {
              version: Constants.expoConfig?.version ?? "1.0.2",
            })}
          </Typography.Text>
        </View>
      </Animated.ScrollView>
      <Animated.View
        testID="profile-sticky-header"
        pointerEvents={collapsed ? "auto" : "none"}
        accessibilityElementsHidden={!collapsed}
        importantForAccessibility={collapsed ? "auto" : "no-hide-descendants"}
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            paddingTop: insets.top,
            borderBottomWidth: 1,
            borderBottomColor: BrandColors.line,
          },
          headerStyle,
        ]}
      >
        <View
          style={{
            minHeight: 44,
            flexDirection: "row",
            paddingHorizontal: 20,
            alignItems: "center",
            gap: 8,
          }}
        >
          <Typography.Text weight="bold" style={{ flex: 1, fontSize: 16 }}>
            {t("profile.title")}
          </Typography.Text>
          {headerActions(false)}
        </View>
      </Animated.View>
    </View>
  );
}
