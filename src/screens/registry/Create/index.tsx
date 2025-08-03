import { queryClient } from "@/api/queryClient";
import { Button } from "@/components/Button";
import Form from "@/components/Form";
import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import {
  fetchRegistriesCategories,
  postRegistry,
} from "@/services/registries.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryPayload } from "@/types";
import { getEnArName } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  I18nManager,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const cardWidth = width / 2 - 24 - 8;

function CreateRegistryScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { control, handleSubmit, setValue } = useForm<ICreateRegistryPayload>();
  const insets = useSafeAreaInsets();
  const selectedRegistryId = useGlobalStore.use.setSelectedRegistryId();

  const { data: categories } = useQuery({
    queryKey: ["registryCategories"],
    queryFn: () => fetchRegistriesCategories(),
  });

  const createRegistryMutation = useMutation({
    mutationFn: (data: ICreateRegistryPayload) => postRegistry(data),
    onSuccess: (data) => {
      selectedRegistryId(data.id);
      queryClient.invalidateQueries({ queryKey: ["registries"] });
      router.dismissTo("/(protected)/(tabs)/registry");
    },
    onError: (error) => {
      console.error("Registry creation error", JSON.stringify(error));
      Toast.show({
        type: "error",
        text1: t("registry.registryCreateError"),
      });
    },
  });

  const [firstStepHeight, setFirstStepHeight] = useState(0);
  const [secondStepHeight, setSecondStepHeight] = useState(0);

  const firstStepTranslateY = useSharedValue(0); // First step starts in place
  const secondStepTranslateY = useSharedValue(height + 100); // Second step starts offscreen
  const firstStepStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(firstStepTranslateY.value, { duration: 500 }) },
    ],
  }));

  const secondStepStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withTiming(secondStepTranslateY.value, { duration: 500 }) },
    ],
  }));

  const handleCardPress = (id: string) => {
    setValue("categoryId", id);
    firstStepTranslateY.value = -(firstStepHeight + insets.top); // Slide out first step
    secondStepTranslateY.value = 0; // Slide in second step
  };

  const goToFirstStep = () => {
    // Animate back to the first step
    firstStepTranslateY.value = 0; // Bring the first step back
    secondStepTranslateY.value = height + 100; // Move the second step offscreen
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Typography.Text size="base" weight="medium">
              {t("registry.createregistry")}
            </Typography.Text>
          ),
          headerTitleStyle: { fontWeight: "light" },
          headerBackground: () => <View className="bg-primary-50 flex-1" />,
        }}
      />
      <SafeAreaView className="bg-primary-50 flex-1" edges={["bottom"]}>
        <View className="flex-1">
          {/* First step */}
          <Animated.View
            style={[firstStepStyle]}
            className="absolute w-full bg-primary-50"
            onLayout={(event) =>
              setFirstStepHeight(event.nativeEvent.layout.height)
            }
          >
            <ScrollView>
              <View className="p-6">
                <Typography.Text weight="bold" size="lg" className="py-6">
                  {t("registry.letsCreateRegistry")}
                </Typography.Text>
                <Form.Item
                  name="title"
                  // label={t("registry.title")}
                  rules={{
                    required: t("login.enterEmail"),
                  }}
                  control={control}
                >
                  {({ field: { onChange, value } }) => {
                    return (
                      <View className="flex-row justify-between flex-wrap">
                        {categories?.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={{ width: cardWidth }}
                            className="mb-4 rounded-md bg-white border border-neutral-100 shadow-sm shadow-neutral-100"
                            onPress={() => handleCardPress(category.id)}
                          >
                            <View
                              style={{ width: cardWidth, height: cardWidth }}
                            >
                              <Typography.Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                weight="medium"
                                size="sm"
                                className="absolute bottom-4 text-center w-full text-gray-700 flex-1"
                              >
                                {getEnArName(category.nameEn, category.nameAr)}
                              </Typography.Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  }}
                </Form.Item>
              </View>
            </ScrollView>
          </Animated.View>

          {/* Second step */}
          <Animated.View
            style={[secondStepStyle]}
            className="absolute w-full bg-primary-50"
            onLayout={(event) =>
              setSecondStepHeight(event.nativeEvent.layout.height)
            }
          >
            <ScrollView>
              <View className="p-6">
                <View className="py-6">
                  <Typography.Text weight="bold" size="lg">
                    {t("registry.personalizaYourRegistry")}
                  </Typography.Text>
                  <Typography.Text weight="bold" size="lg">
                    {t("registry.addPhotoGreeting")}
                  </Typography.Text>
                </View>
                <View className="gap-4">
                  <Form.Item
                    name="title"
                    label={t("registry.title")}
                    rules={{
                      required: t("login.enterEmail"),
                    }}
                    control={control}
                  >
                    {({ field: { onChange, value } }) => (
                      <TextInput
                        placeholder={t("registry.titlePlaceholder")}
                        onChangeText={onChange}
                        value={value}
                        className="h-14 rounded-lg bg-white px-4 font-Poppinsregular text-black"
                        textAlign={I18nManager.isRTL ? "right" : "left"}
                        placeholderTextColor={
                          Colors[colorScheme ?? "light"].placeholderTextColor
                        }
                        maxLength={50}
                      />
                    )}
                  </Form.Item>
                  <Form.Item
                    name="greeting"
                    label={t("registry.greetings")}
                    rules={{}}
                    control={control}
                  >
                    {({ field: { onChange, value } }) => (
                      <View className="flex-row items-center">
                        <TextInput
                          placeholder={t("registry.greetingsPlaceholder")}
                          onChangeText={onChange}
                          value={value}
                          className="w-full h-28 rounded-lg bg-white p-4 font-Poppinsregular text-black"
                          placeholderTextColor={
                            Colors[colorScheme ?? "light"].placeholderTextColor
                          }
                          textAlign={I18nManager.isRTL ? "right" : "left"}
                          multiline
                          maxLength={200}
                        />
                      </View>
                    )}
                  </Form.Item>
                  <View className="flex-row items-center gap-6">
                    <Button
                      type="text"
                      onPress={() => {
                        goToFirstStep();
                      }}
                      title={t("common.back")}
                    />
                    <Button
                      className="flex-1"
                      loading={createRegistryMutation.isPending}
                      type="primary"
                      size="large"
                      title={t("common.create")}
                      rounded={false}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSubmit((data) => {
                          createRegistryMutation.mutate(data);
                        })();
                      }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}

export default CreateRegistryScreen;
