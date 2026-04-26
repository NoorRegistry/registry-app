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
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const signIn = useGlobalStore.use.signIn();
  const { control, handleSubmit } = useForm<IUserInfoUpdate>({
    defaultValues: {
      gender: "Male",
    },
  });
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
    <SafeAreaView className="flex-1 bg-white px-6">
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
          <Typography.Text size="lg" weight="bold" className="mb-1">
            {t("login.fillDetails")}
          </Typography.Text>
          <Typography.Text size="sm" weight="light" className="mb-6">
            {t("login.helpsPersonliseExperience")}
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
                  className="h-14 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
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
                  className="h-14 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
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
            <Controller
              control={control}
              name="gender"
              rules={{ required: t("common.required") }}
              render={({ field: { onChange, value }, fieldState }) => (
                <View className="gap-2">
                  <Typography.Text
                    size="base"
                    weight="medium"
                    className="text-center"
                  >
                    {t("common.selectGender")}
                  </Typography.Text>
                  <View className="flex-row gap-3">
                    <GenderOption
                      label={t("common.male")}
                      value="Male"
                      selected={value === "Male"}
                      onPress={onChange}
                      image={require("@assets/images/login/male.png")}
                    />
                    <GenderOption
                      label={t("common.female")}
                      value="Female"
                      selected={value === "Female"}
                      onPress={onChange}
                      image={require("@assets/images/login/female.png")}
                    />
                  </View>
                  <Typography.Text
                    size="xs"
                    type="danger"
                    className="h-6 text-center leading-6"
                  >
                    {fieldState.error?.message ?? ""}
                  </Typography.Text>
                </View>
              )}
            />
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

type GenderValue = NonNullable<IUserInfoUpdate["gender"]>;

type GenderOptionProps = {
  label: string;
  value: GenderValue;
  selected: boolean;
  onPress: (value: GenderValue) => void;
  image: number;
};

function GenderOption({
  label,
  value,
  selected,
  onPress,
  image,
}: GenderOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => onPress(value)}
      className={`h-[152px] flex-1 items-center justify-center gap-3 rounded-xl border bg-primary-50 p-4 ${
        selected ? "border-primary-500" : "border-[#FAF2F0]"
      }`}
    >
      <Image
        source={image}
        style={{ width: 68, height: 68 }}
        contentFit="contain"
      />
      <Typography.Text size="base" weight="medium" className="text-center">
        {label}
      </Typography.Text>
    </Pressable>
  );
}
