import { CommerceText } from "@/components/Commerce";
import RegistryAvatar from "@/components/RegistryAvatar";
import { BrandColors as C } from "@/constants/Colors";
import { useRegistryPhoto } from "@/hooks/useRegistryPhoto";
import type { SharedRegistryOverview } from "@/services/registries.service";
import type { IRegistry } from "@/types";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function RegistryOverviewCard({
  registry,
  owned,
  onOpen,
}: {
  registry: IRegistry | SharedRegistryOverview;
  owned: boolean;
  onOpen: () => void;
}) {
  const { t, i18n } = useTranslation();
  const photo = useRegistryPhoto(registry);
  const category = registry.category;
  const categoryName =
    i18n.language === "ar"
      ? category?.nameAr || category?.name || category?.nameEn
      : category?.nameEn || category?.name || category?.nameAr;
  const subtitle =
    "ownerName" in registry ? registry.ownerName || categoryName : categoryName;
  const total = Math.max(0, registry._count.totalItems);
  const purchased = Math.min(
    total,
    Math.max(0, registry._count.totalPurchased),
  );
  const avatar = (
    <RegistryAvatar
      title={registry.title}
      logo={photo.previewUri || registry.logo}
      category={category ?? {}}
      size={49}
      radius={10}
      backgroundColor="#F0E0DA"
    />
  );
  return (
    <View style={styles.card} testID={`overview-registry-card-${registry.id}`}>
      {owned ? (
        <Pressable
          testID={`overview-registry-photo-${registry.id}`}
          accessibilityRole="button"
          accessibilityLabel={t(
            registry.logo
              ? "registryOverview.changePhoto"
              : "registryOverview.uploadPhoto",
            { title: registry.title },
          )}
          accessibilityState={{
            disabled: photo.isUploading,
            busy: photo.isUploading,
          }}
          disabled={photo.isUploading}
          onPress={photo.selectPhoto}
          style={styles.photo}
        >
          {avatar}
          <View style={styles.camera} pointerEvents="none">
            <Feather name="camera" size={11} color="white" />
          </View>
          {photo.isUploading && (
            <View style={styles.uploading}>
              <ActivityIndicator size="small" color={C.deep} />
            </View>
          )}
        </Pressable>
      ) : (
        <View accessible={false}>{avatar}</View>
      )}
      <Pressable
        testID={`overview-registry-open-${registry.id}`}
        accessibilityRole="button"
        accessibilityLabel={t("registryOverview.openRegistry", {
          title: registry.title,
        })}
        onPress={onOpen}
        style={styles.open}
      >
        <View style={styles.copy}>
          <CommerceText
            size="base"
            weight="medium"
            numberOfLines={2}
            style={styles.title}
          >
            {registry.title}
          </CommerceText>
          {!!subtitle && (
            <CommerceText size="xs" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </CommerceText>
          )}
          <View style={styles.counts}>
            <CommerceText size="xs" style={styles.count}>
              {t("registry.items", { count: total })}
            </CommerceText>
            <CommerceText size="xs" style={styles.count}>
              {t("registryOverview.purchased", { count: purchased })}
            </CommerceText>
          </View>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityLabel={t("homeDesign.giftsPurchased")}
            accessibilityValue={{
              min: 0,
              max: Math.max(total, 1),
              now: purchased,
            }}
          >
            <View
              style={[
                styles.fill,
                { width: `${total ? (purchased / total) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
        <Feather
          name={I18nManager.isRTL ? "chevron-left" : "chevron-right"}
          size={16}
          color={C.deep}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.soft,
    borderRadius: 20,
    padding: 14,
    minHeight: 103,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  photo: { width: 49, height: 49, flexShrink: 0 },
  camera: {
    position: "absolute",
    end: -4,
    bottom: -4,
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.soft,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  uploading: {
    ...StyleSheet.absoluteFill,
    borderRadius: 10,
    backgroundColor: "#FAF2F0CC",
    justifyContent: "center",
    alignItems: "center",
  },
  open: {
    flex: 1,
    minWidth: 0,
    minHeight: 75,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  copy: { flex: 1, minWidth: 0 },
  title: { letterSpacing: -0.3 },
  subtitle: { color: C.muted, fontSize: 11, marginTop: 2 },
  counts: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 7,
  },
  count: { color: C.muted, fontSize: 11 },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: "#EADFD9",
    overflow: "hidden",
    marginTop: 5,
  },
  fill: { height: 4, borderRadius: 4, backgroundColor: C.primary },
});
