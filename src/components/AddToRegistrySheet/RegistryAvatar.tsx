import { RegistryPickerColors as C } from "@/constants/RegistryPicker";
import { IRegistry } from "@/types";
import { getImageUrl } from "@/utils/helper";
import {
  registryImageSources,
  registryTypeIcon,
} from "@/utils/registry-type-icon";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function RegistryPickerAvatar({
  logo,
  category,
}: {
  logo?: string | null;
  category?: IRegistry["category"];
}) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = registryImageSources(logo, category)
    .map(getImageUrl)
    .find((path) => path && !failedSources.includes(path));
  const categorySource = [
    category?.registryBackground,
    category?.registryPlaceHolder,
  ]
    .map(getImageUrl)
    .includes(source ?? "");
  return (
    <View
      style={styles.avatar}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {source ? (
        <Image
          key={source}
          source={{ uri: source }}
          recyclingKey={source}
          style={styles.image}
          contentFit={categorySource ? "contain" : "cover"}
          accessible={false}
          onError={() => setFailedSources((previous) => [...previous, source])}
        />
      ) : (
        <Feather name={registryTypeIcon(category)} size={20} color={C.accent} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 39,
    height: 42,
    flexShrink: 0,
    borderRadius: 8,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
});
