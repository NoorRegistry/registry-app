import BackButton from "@/components/BackButton";
import Typography from "@/components/Typography";
import GuestViewScreen from "@/screens/registry/GuestView";
import { Stack } from "expo-router";
import { useState } from "react";

export default function GuestView() {
  const [headerTitle, setHeaderTitle] = useState("");

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: headerTitle
            ? () => (
                <Typography.Text
                  size="base"
                  weight="medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {headerTitle}
                </Typography.Text>
              )
            : "",
          headerShadowVisible: false,
          headerLeft: () => <BackButton filled />,
        }}
      />
      <GuestViewScreen onHeaderTitleChange={setHeaderTitle} />
    </>
  );
}
