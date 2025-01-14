import React from "react";
import { View } from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";
import Typography from "../Typography";

const config: ToastConfig = {
  //   success: props => <BaseToast {...props} />,
  // TODO: Fix styling and add more options
  success: ({ text1, text2, props }) => {
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

const ToastProvider = () => {
  return <Toast position="bottom" bottomOffset={90} config={config} />;
};

export default ToastProvider;
