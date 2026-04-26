import { queryClient } from "@/api/queryClient";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/Button";
import Form from "@/components/Form";
import PencilIcon from "@/components/icons/pencil";
import Typography from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import {
  fetchRegistriesCategories,
  postRegistry,
} from "@/services/registries.service";
import {
  deleteUploadedImageByPath,
  uploadRegistryLogo,
} from "@/services/upload.service";
import { useGlobalStore } from "@/store";
import { ICreateRegistryPayload } from "@/types";
import { getEnArName, getImageUrl } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
const registryInputClassName =
  "rounded border border-primary-500 bg-[#fbfbfb] px-4 font-Poppinsregular text-base text-[#100E0E] shadow-sm shadow-neutral-100";

function CreateRegistryScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { control, handleSubmit, setValue, getValues } =
    useForm<ICreateRegistryPayload>();
  const insets = useSafeAreaInsets();
  const selectedRegistryId = useGlobalStore.use.setSelectedRegistryId();
  const registryCreatedRef = useRef(false);
  const uploadedLogoPathRef = useRef<string | null>(null);
  const [uploadedLogoPath, setUploadedLogoPath] = useState<string | null>(null);
  const [logoPreviewUri, setLogoPreviewUri] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["registryCategories"],
    queryFn: () => fetchRegistriesCategories(),
  });
  const createRegistryMutation = useMutation({
    mutationFn: (data: ICreateRegistryPayload) => postRegistry(data),
    onSuccess: (data) => {
      registryCreatedRef.current = true;
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

  useEffect(() => {
    uploadedLogoPathRef.current = uploadedLogoPath;
  }, [uploadedLogoPath]);

  useEffect(() => {
    return () => {
      if (registryCreatedRef.current || !uploadedLogoPathRef.current) return;
      deleteUploadedImageByPath(uploadedLogoPathRef.current).catch((error) => {
        console.error("Failed to cleanup temporary registry logo", error);
      });
    };
  }, []);

  const handleUploadRegistryLogo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({
        type: "error",
        text1: t("registry.photoPermissionRequired"),
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const selectedAsset = result.assets[0];
    const previousPreview = logoPreviewUri;
    const previousPath = uploadedLogoPathRef.current;
    const previousLogoValue = getValues("logo");

    // Show selected photo immediately to avoid remote-image loading flash.
    setLogoPreviewUri(selectedAsset.uri);
    setIsUploadingLogo(true);

    try {
      const response = await uploadRegistryLogo({
        uri: selectedAsset.uri,
        fileName: selectedAsset.fileName ?? undefined,
        mimeType: selectedAsset.mimeType ?? undefined,
      });

      const newPath = response.path;

      setUploadedLogoPath(newPath);
      setValue("logo", newPath);

      if (previousPath && previousPath !== newPath) {
        deleteUploadedImageByPath(previousPath).catch((error) => {
          console.error(
            "Failed to delete previously uploaded temporary logo",
            error,
          );
        });
      }
    } catch (error) {
      setLogoPreviewUri(previousPreview);
      setUploadedLogoPath(previousPath);
      setValue("logo", previousLogoValue);
      console.error("Registry logo upload error", error);
      Toast.show({
        type: "error",
        text1: t("registry.logoUploadFailed"),
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerLeft: () => <BackButton filled />,
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1">
          {/* First step */}
          <Animated.View
            style={[firstStepStyle]}
            className="absolute w-full"
            onLayout={(event) =>
              setFirstStepHeight(event.nativeEvent.layout.height)
            }
          >
            <ScrollView>
              <View className="p-6">
                <View className="py-6 gap-1">
                  <Typography.Text size="sm" type="secondary">
                    {t("registry.createregistry")}
                  </Typography.Text>
                  <Typography.Text weight="bold" size="lg">
                    {t("registry.letsCreateRegistry")}
                  </Typography.Text>
                </View>
                <Form.Item name="categoryId" control={control}>
                  {() => {
                    return (
                      <View className="flex-row justify-between flex-wrap">
                        {categories?.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={{ width: cardWidth }}
                            className="mb-4 rounded-xl bg-primary-50 border border-primary-100 shadow-sm shadow-neutral-100 gap-2 px-4 py-8"
                            onPress={() => handleCardPress(category.id)}
                          >
                            <View className="justify-center items-center">
                              <Image
                                source={
                                  category.registryBackground ||
                                  category.registryPlaceHolder
                                    ? {
                                        uri: getImageUrl(
                                          category.registryBackground ??
                                            category.registryPlaceHolder,
                                        ),
                                      }
                                    : require("@assets/images/icon.png")
                                }
                                style={{
                                  width: 50,
                                  height: 50,
                                }}
                                contentFit="contain"
                              />
                            </View>
                            <Typography.Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              weight="medium"
                              size="sm"
                              className="text-center w-full text-gray-700 flex-1 mt-2"
                            >
                              {getEnArName(category.nameEn, category.nameAr)}
                            </Typography.Text>
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
          <Animated.View style={[secondStepStyle]} className="absolute w-full">
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
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleUploadRegistryLogo}
                    className="items-center self-center mb-2"
                    disabled={isUploadingLogo}
                  >
                    <View className="relative">
                      <View
                        className="rounded-full overflow-hidden items-center justify-center"
                        style={{
                          width: 132,
                          height: 132,
                          backgroundColor: "#D9EEF8",
                        }}
                      >
                        {logoPreviewUri ? (
                          <Image
                            source={{ uri: logoPreviewUri }}
                            style={{ width: 132, height: 132 }}
                            contentFit="cover"
                          />
                        ) : (
                          <Image
                            source={require("@assets/images/icon.png")}
                            style={{ width: 60, height: 60 }}
                            contentFit="contain"
                          />
                        )}
                      </View>
                      <View className="absolute -right-1 -bottom-1 h-11 w-11 rounded-full bg-white border border-neutral-200 items-center justify-center">
                        <PencilIcon
                          size={20}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </View>
                    </View>
                    <Typography.Text size="lg" className="mt-4">
                      {t(
                        logoPreviewUri
                          ? "registry.changePhoto"
                          : "registry.uploadPhoto",
                      )}
                    </Typography.Text>
                    {isUploadingLogo && (
                      <View className="mt-2">
                        <ActivityIndicator
                          size="small"
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Form.Item
                    name="title"
                    label={t("registry.title")}
                    rules={{
                      required: t("common.required"),
                    }}
                    control={control}
                  >
                    {({ field: { onChange, value } }) => (
                      <TextInput
                        placeholder={t("registry.titlePlaceholder")}
                        onChangeText={onChange}
                        value={value}
                        className={clsx("h-[60px]", registryInputClassName)}
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
                          className={clsx(
                            "h-28 w-full py-4",
                            registryInputClassName,
                          )}
                          placeholderTextColor={
                            Colors[colorScheme ?? "light"].placeholderTextColor
                          }
                          textAlign={I18nManager.isRTL ? "right" : "left"}
                          textAlignVertical="top"
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
                      disabled={isUploadingLogo}
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
