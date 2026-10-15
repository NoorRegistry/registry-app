import { ListSkeleton } from "@/components/Skeleton/layouts";
import { BrandColors } from "@/constants/Colors";
import Typography from "@/components/Typography";
import {
  addressLine,
  useAddressChoice,
  useAddresses,
} from "@/hooks/useAddresses";
import { FriendsTopBar, palette, styles } from "@/screens/friends/components";
import { useRefreshOnFocus } from "@/screens/friends/hooks";
import { deleteAddress } from "@/services/orders.service";
import { getUserSub } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function AddressesScreen() {
  const { t } = useTranslation();
  const { select } = useLocalSearchParams<{ select?: string }>();
  const addresses = useAddresses();
  useRefreshOnFocus(addresses.refetch);
  const client = useQueryClient();
  const choose = useAddressChoice((state) => state.choose);
  const remove = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["addresses", getUserSub()] }),
    onError: () => Toast.show({ type: "error", text1: t("common.error") }),
  });
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FriendsTopBar title={t("addresses.title")} />
      <FlatList
        data={addresses.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 22, flexGrow: 1 }}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 18,
              borderBottomWidth:
                index === (addresses.data?.length ?? 0) - 1 ? 0 : 1,
              borderBottomColor: "#F0EEEB",
            }}
          >
            <Pressable
              style={{ flex: 1, gap: 5 }}
              onPress={() => {
                if (select) {
                  choose(item.id);
                  router.back();
                } else
                  router.push({
                    pathname: "/addresses/edit",
                    params: { id: item.id },
                  });
              }}
            >
              <Typography.Text weight="medium">
                {t(`addresses.labels.${item.label}`, {
                  defaultValue: item.label,
                })}
              </Typography.Text>
              <Typography.Text size="sm" style={{ color: palette.muted }}>
                {addressLine(item)}
              </Typography.Text>
              <Typography.Text size="xs" style={{ color: palette.muted }}>
                {item.phone}
              </Typography.Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t("addresses.edit")}
              onPress={() =>
                router.push({
                  pathname: "/addresses/edit",
                  params: { id: item.id },
                })
              }
              style={{ padding: 8 }}
            >
              <Ionicons name="pencil-outline" size={19} color={palette.muted} />
            </Pressable>
            <Pressable
              accessibilityLabel={t("addresses.delete")}
              disabled={remove.isPending}
              onPress={() =>
                Alert.alert(t("addresses.delete"), undefined, [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("addresses.delete"),
                    style: "destructive",
                    onPress: () => remove.mutate(item.id),
                  },
                ])
              }
              style={{ padding: 8 }}
            >
              <Ionicons name="trash-outline" size={19} color={palette.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          addresses.isLoading ? (
            <ListSkeleton kind="addresses" />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {addresses.isError || addresses.fetchStatus === "paused" ? (
                <Pressable onPress={() => void addresses.refetch()}>
                  <Typography.Text>{t("notifications.retry")}</Typography.Text>
                </Pressable>
              ) : (
                <Typography.Text style={{ color: palette.muted }}>
                  {t("addresses.empty")}
                </Typography.Text>
              )}
            </View>
          )
        }
      />
      <View style={{ paddingHorizontal: 22, paddingVertical: 12 }}>
        <Pressable
          onPress={() => router.push("/addresses/edit")}
          style={{
            minHeight: 50,
            backgroundColor: BrandColors.primary,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Text weight="medium" style={{ color: "#fff" }}>
            {t("addresses.add")}
          </Typography.Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
