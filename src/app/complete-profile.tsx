import { Button } from "@/components/Button";
import Form from "@/components/Form";
import Typography from "@/components/Typography";
import constants from "@/constants";
import { Colors } from "@/constants/Colors";
import {
  IUserInfoUpdate,
  updateUserInfo,
} from "@/services/authentication.service";
import { useGlobalStore } from "@/store";
import { IAccessToken } from "@/types";
import { setStorageItem } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const signIn = useGlobalStore.use.signIn();
  const { control, handleSubmit } = useForm<IUserInfoUpdate>();
  const firstNameRef = useRef<TextInput | null>(null);
  const lastNameRef = useRef<TextInput | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: IUserInfoUpdate) => updateUserInfo(payload),
    onSuccess: (data: IAccessToken) => {
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(data));
      Toast.show({ type: "success", text1: t("common.saved") });
      signIn();
      router.replace("/(protected)/(tabs)");
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("common.error") });
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-10">
      <Stack.Screen
        options={{
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerLeft: () => null,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Typography.Text size="xl" weight="bold" className="mb-6 text-center">
            {t("common.completeProfile")}
          </Typography.Text>
          <View className="gap-4 flex-1">
            <Form.Item
              name="firstName"
              label={t("common.firstName")}
              control={control}
              rules={{ required: t("common.required") }}
            >
              {({ field: { onChange, value } }) => (
                <TextInput
                  ref={firstNameRef}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("common.firstName")}
                  className="h-14 rounded-lg bg-neutral-100 px-4 font-Poppinsregular text-black"
                  textAlign={I18nManager.isRTL ? "right" : "left"}
                  placeholderTextColor={
                    Colors[colorScheme ?? "light"].placeholderTextColor
                  }
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              )}
            </Form.Item>
            <Form.Item
              name="lastName"
              label={t("common.lastName")}
              control={control}
              rules={{ required: t("common.required") }}
            >
              {({ field: { onChange, value } }) => (
                <TextInput
                  ref={lastNameRef}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("common.lastName")}
                  className="h-14 rounded-lg bg-neutral-100 px-4 font-Poppinsregular text-black"
                  textAlign={I18nManager.isRTL ? "right" : "left"}
                  placeholderTextColor={
                    Colors[colorScheme ?? "light"].placeholderTextColor
                  }
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    handleSubmit((data) => mutation.mutate(data))();
                  }}
                />
              )}
            </Form.Item>
            <Button
              loading={mutation.isPending}
              type="primary"
              size="large"
              title={t("common.save")}
              rounded={false}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit((data) => mutation.mutate(data))();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
