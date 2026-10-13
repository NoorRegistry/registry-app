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
import { getApiErrorMessage } from "@/utils/api-error";
import { getDecodedToken } from "@/utils/helper";
import { setStorageItem } from "@/utils/storage";
import { useHeaderHeight } from "expo-router/react-navigation";
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
  const headerHeight = useHeaderHeight();
  const signIn = useGlobalStore.use.signIn();
  const user = getDecodedToken()?.user;
  const { control, handleSubmit } = useForm<IUserInfoUpdate>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      gender: user?.gender ?? "Male",
      countryCode: user?.countryCode ?? "+965",
      mobileNumber: user?.mobileNumber ?? "",
    },
  });
  const firstNameRef = useRef<TextInput | null>(null);
  const lastNameRef = useRef<TextInput | null>(null);
  const mobileNumberRef = useRef<TextInput | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: IUserInfoUpdate) =>
      updateUserInfo({
        ...payload,
        mobileNumber: payload.mobileNumber?.replace(/[\s()-]/g, ""),
      }),
    onSuccess: (data: IAccessToken) => {
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(data));
      Toast.show({ type: "success", text1: t("common.saved") });
      signIn();
      router.replace("/(protected)/(tabs)");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("common.error")),
      });
    },
  });

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white px-6">
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
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Typography.Text size="lg" weight="bold" className="mb-1">
            {t("login.fillDetails")}
          </Typography.Text>
          <Typography.Text size="sm" weight="light" className="mb-6">
            {t("login.helpsPersonliseExperience")}
          </Typography.Text>
          <View className="gap-2">
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
                  className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
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
                  className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
                  textAlign={I18nManager.isRTL ? "right" : "left"}
                  placeholderTextColor={
                    Colors[colorScheme ?? "light"].placeholderTextColor
                  }
                  returnKeyType="next"
                  onSubmitEditing={() => mobileNumberRef.current?.focus()}
                />
              )}
            </Form.Item>
            <View className="flex-row gap-3">
              <Form.Item
                name="countryCode"
                label={t("common.countryCode")}
                control={control}
                containerClassName="w-28"
                rules={{
                  required: t("common.required"),
                  pattern: {
                    value: /^\+[1-9]\d{0,2}$/,
                    message: t("login.enterValidCountryCode"),
                  },
                }}
              >
                {({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    accessibilityLabel={t("common.countryCode")}
                    onChangeText={(text) => onChange(text.replace(/\s/g, ""))}
                    onBlur={onBlur}
                    value={value}
                    placeholder="+965"
                    keyboardType="phone-pad"
                    autoComplete="tel-country-code"
                    maxLength={4}
                    className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
                    textAlign="left"
                    placeholderTextColor={
                      Colors[colorScheme ?? "light"].placeholderTextColor
                    }
                  />
                )}
              </Form.Item>
              <Form.Item
                name="mobileNumber"
                label={t("common.mobileNumber")}
                control={control}
                containerClassName="flex-1"
                rules={{
                  required: t("common.required"),
                  validate: (value, values) => {
                    const number = value?.replace(/[\s()-]/g, "") ?? "";
                    return (
                      (/^\d{6,15}$/.test(number) &&
                        `${values.countryCode?.replace("+", "") ?? ""}${number}`
                          .length <= 15) ||
                      t("login.enterValidMobileNumber")
                    );
                  },
                }}
              >
                {({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={mobileNumberRef}
                    accessibilityLabel={t("common.mobileNumber")}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    placeholder={t("common.mobileNumber")}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel-national"
                    maxLength={20}
                    className="h-12 rounded bg-neutral-100 px-4 font-Poppinsregular text-black"
                    textAlign="left"
                    placeholderTextColor={
                      Colors[colorScheme ?? "light"].placeholderTextColor
                    }
                  />
                )}
              </Form.Item>
            </View>
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
          </View>
        </ScrollView>
        <View className="border-t border-neutral-100 bg-white py-3">
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
