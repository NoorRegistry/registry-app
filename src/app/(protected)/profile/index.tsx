import BackButton from "@/components/BackButton";
import ProfileScreen from "@/screens/profile";
import { Stack } from "expo-router";

export default function ProfilePage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerLeft: () => <BackButton filled />,
        }}
      />
      <ProfileScreen />
    </>
  );
}
