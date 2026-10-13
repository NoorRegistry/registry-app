import ResultRowsSkeleton from "@/components/ResultRowsSkeleton";
import Typography from "@/components/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ComponentProps, ReactNode, Ref, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  I18nManager,
  Pressable,
  RefreshControl,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Person } from "@/services/friends.service";

type IconName = ComponentProps<typeof Ionicons>["name"];
export const palette = {
  ink: "#302A27",
  muted: "#81736D",
  accent: "#B16B55",
  danger: "#B93D38",
  secondary: "#F5F3F1",
  peach: "#F8EAE3",
  background: "#FFFFFF",
  line: "#EFE7E1",
};
export const personName = (person: Person, fallback: string) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ").trim() ||
  fallback;

export function MotionButton({
  children,
  onPress,
  disabled = false,
  label,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() =>
          scale.set(
            withTiming(0.97, {
              duration: 100,
              reduceMotion: ReduceMotion.System,
            }),
          )
        }
        onPressOut={() =>
          scale.set(
            withTiming(1, { duration: 160, reduceMotion: ReduceMotion.System }),
          )
        }
        style={[style, { opacity: disabled ? 0.45 : 1 }]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function ActionButton({
  title,
  onPress,
  secondary = false,
  busy = false,
  disabled = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <MotionButton
      label={title}
      onPress={onPress}
      disabled={disabled || busy}
      style={{
        minHeight: 44,
        borderRadius: 10,
        backgroundColor: secondary ? palette.secondary : palette.accent,
        paddingHorizontal: 16,
        paddingVertical: 11,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 7,
      }}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? palette.ink : "white"} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={17}
              color={secondary ? palette.ink : "white"}
            />
          )}
          <Typography.Text
            weight="medium"
            size="sm"
            style={{ color: secondary ? palette.ink : "white" }}
          >
            {title}
          </Typography.Text>
        </>
      )}
    </MotionButton>
  );
}

export function FriendsTopBar({
  title,
  children,
  onBack,
}: {
  title: string;
  children?: ReactNode;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.topBar}>
      <MotionButton
        label={t("common.back")}
        onPress={
          onBack ??
          (() =>
            router.canGoBack() ? router.back() : router.replace("/profile"))
        }
        style={styles.iconButton}
      >
        <Ionicons
          name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
          color={palette.ink}
          size={22}
        />
      </MotionButton>
      <Typography.Text size="lg" weight="medium" style={{ flex: 1 }}>
        {title}
      </Typography.Text>
      {children}
    </View>
  );
}

export function PersonAvatar({
  person,
  large = false,
}: {
  person: Person;
  large?: boolean;
}) {
  const initials =
    [person.firstName, person.lastName]
      .filter(Boolean)
      .map((value) => Array.from(value!.trim())[0])
      .join("")
      .toUpperCase() || "?";
  const colors = ["#F4DED3", "#E6EADC", "#EDE2EF", "#DFEBEC"];
  const color = colors[person.id.charCodeAt(0) % colors.length];
  return (
    <View
      style={{
        width: large ? 86 : 52,
        height: large ? 86 : 52,
        borderRadius: large ? 43 : 26,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography.Text
        weight="medium"
        size={large ? "2xl" : "lg"}
        style={{ color: palette.ink }}
      >
        {initials}
      </Typography.Text>
    </View>
  );
}

export function FriendSearch({
  value,
  onChange,
  placeholder,
  inputRef,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputRef?: Ref<TextInput>;
  onSubmit?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.search}>
      <Ionicons name="search-outline" size={20} color={palette.muted} />
      <TextInput
        ref={inputRef}
        onSubmitEditing={onSubmit}
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={{
          flex: 1,
          height: 46,
          fontFamily: I18nManager.isRTL ? "Tajawalregular" : "Poppinsregular",
          fontSize: 13,
          textAlign: I18nManager.isRTL ? "right" : "left",
          color: palette.ink,
        }}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("friends.clearSearch")}
          onPress={() => onChange("")}
          hitSlop={10}
        >
          <Ionicons name="close-circle" size={18} color={palette.muted} />
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
      style={{
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 46,
        gap: 14,
      }}
    >
      <Typography.Text
        size="lg"
        weight="medium"
        style={{ textAlign: "center", color: palette.ink }}
      >
        {title}
      </Typography.Text>
      {description && (
        <Typography.Text
          style={{ textAlign: "center", color: palette.muted, lineHeight: 23 }}
        >
          {description}
        </Typography.Text>
      )}
      {children && <View style={{ marginTop: 8 }}>{children}</View>}
    </Animated.View>
  );
}

export function ErrorState({
  retry,
  compact = false,
}: {
  retry: () => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ alignItems: "center", padding: compact ? 16 : 30, gap: 14 }}>
      <Typography.Text style={{ textAlign: "center", color: palette.muted }}>
        {t("friends.loadError")}
      </Typography.Text>
      <ActionButton title={t("friends.retry")} onPress={retry} secondary />
    </View>
  );
}

export function PersonRow({
  person,
  subtitle,
  children,
  onPress,
  onPersonPress,
  index = 0,
}: {
  person: Person;
  subtitle?: string;
  children?: ReactNode;
  onPress?: () => void;
  index?: number;
  onPersonPress?: () => void;
}) {
  const { t } = useTranslation();
  const name = personName(person, t("friends.member"));
  const identity = (
    <>
      <PersonAvatar person={person} />
      <View style={{ flex: 1, gap: 4 }}>
        <Typography.Text
          size="base"
          weight="medium"
          numberOfLines={1}
          style={{ color: palette.ink }}
        >
          {name}
        </Typography.Text>
        {subtitle && (
          <Typography.Text
            size="xs"
            style={{ color: palette.muted }}
            numberOfLines={1}
          >
            {subtitle}
          </Typography.Text>
        )}
      </View>
    </>
  );
  const content = (
    <>
      {onPersonPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={onPersonPress}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {identity}
        </Pressable>
      ) : (
        identity
      )}
      {children}
    </>
  );

  return (
    <Animated.View
      entering={
        index < 8
          ? FadeInDown.delay(index * 35)
              .duration(300)
              .reduceMotion(ReduceMotion.System)
          : undefined
      }
      layout={LinearTransition.duration(220).reduceMotion(ReduceMotion.System)}
      style={{
        marginHorizontal: 22,
      }}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={onPress}
          style={styles.row}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.row}>{content}</View>
      )}
    </Animated.View>
  );
}

type PagedListProps<T> = Pick<
  FlatListProps<T>,
  "data" | "renderItem" | "keyExtractor" | "ListHeaderComponent"
> & {
  loading: boolean;
  loadingContent?: ReactNode;
  error: boolean;
  refreshing: boolean;
  more: boolean;
  loadingMore: boolean;
  moreError: boolean;
  refresh: () => unknown;
  loadMore: () => unknown;
  empty: ReactNode;
  bottomPadding?: number;
};
export function PagedList<T>({
  loading,
  loadingContent,
  error,
  refreshing,
  more,
  loadingMore,
  moreError,
  refresh,
  loadMore,
  empty,
  bottomPadding = 32,
  ...props
}: PagedListProps<T>) {
  const [pulling, setPulling] = useState(false);
  return (
    <FlatList
      {...props}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: bottomPadding, flexGrow: 1 }}
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (more && !loadingMore && !moreError && !refreshing) void loadMore();
      }}
      refreshControl={
        <RefreshControl
          tintColor={palette.accent}
          refreshing={pulling && refreshing}
          onRefresh={async () => {
            setPulling(true);
            try {
              await refresh();
            } finally {
              setPulling(false);
            }
          }}
        />
      }
      ListEmptyComponent={
        loading ? (
          <>{loadingContent ?? <ResultRowsSkeleton />}</>
        ) : error ? (
          <ErrorState retry={() => void refresh()} />
        ) : (
          <>{empty}</>
        )
      }
      ListFooterComponent={
        moreError ? (
          <ErrorState compact retry={() => void loadMore()} />
        ) : loadingMore ? (
          <ActivityIndicator color={palette.accent} style={{ padding: 24 }} />
        ) : null
      }
    />
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "white",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 13,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 10,
  },
  sectionContent: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: palette.ink },
  section: {
    marginHorizontal: 22,
    marginTop: 28,
    marginBottom: 12,
    color: palette.ink,
  },
});
