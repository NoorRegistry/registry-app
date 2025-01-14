import { useBottomSheetStore } from "@/store/bottomSheetStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useRef } from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* 
How to use
const { setContent, present } = useBottomSheetStore();

  const handlePress = () => {
    setContent(
      <BottomSheetView>
        <Typography.Text>
          This is the content of the bottom sheet
        </Typography.Text>
      </BottomSheetView>,
    );
    present();
  };

*/

const BottomSheetProvider: React.FC = () => {
  const { content, isVisible, resetContent } = useBottomSheetStore();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={["50%"]}
      onDismiss={resetContent} // Reset content on dismiss
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableOverDrag={false}
      enablePanDownToClose
      enableDynamicSizing
      maxDynamicContentSize={0.7 * Dimensions.get("screen").height}
      style={{
        borderRadius: 24,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 6,
        zIndex: 999,
      }}
    >
      {content}
    </BottomSheetModal>
  );
};

export default BottomSheetProvider;
