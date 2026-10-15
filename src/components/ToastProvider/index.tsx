import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";
import { BrandColors } from "@/constants/Colors";
import Typography from "../Typography";

const config: ToastConfig = {
  error: ({ text1, text2 }) => (
    <Pressable
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      onPress={() => Toast.hide()}
      style={styles.errorToast}
    >
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle-outline" size={20} color="#B5473D" />
      </View>
      <View style={styles.message}>
        {!!text1 && (
          <Typography.Text weight="medium" size="sm" style={styles.title}>
            {text1}
          </Typography.Text>
        )}
        {!!text2 && (
          <Typography.Text size="sm" style={styles.description}>
            {text2}
          </Typography.Text>
        )}
      </View>
    </Pressable>
  ),
  success: ({ text1 }) => {
    return (
      <View className="w-full px-10">
        <View className="rounded-xl bg-gray-700/90 px-6 py-3">
          <Typography.Text
            weight="medium"
            size="base"
            className="text-white text-center"
          >
            {text1}
          </Typography.Text>
        </View>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  errorToast: {
    width: "90%",
    maxWidth: 480,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: BrandColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FCEDEA",
    alignItems: "center",
    justifyContent: "center",
  },
  message: { flex: 1, gap: 3 },
  title: { color: BrandColors.ink, lineHeight: 20 },
  description: { color: BrandColors.muted, lineHeight: 20 },
});

const ToastProvider = () => {
  return <Toast position="bottom" bottomOffset={90} config={config} />;
};

export default ToastProvider;
