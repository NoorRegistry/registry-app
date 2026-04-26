import { useGlobalStore } from "@/store";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function useHeaderScrollState() {
  const setHeaderScrolled = useGlobalStore.use.setHeaderScrolled();
  const isScrolledRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isScrolledRef.current = false;
      setHeaderScrolled(false);

      return () => {
        isScrolledRef.current = false;
        setHeaderScrolled(false);
      };
    }, [setHeaderScrolled]),
  );

  return useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const isScrolled = event.nativeEvent.contentOffset.y > 0;

      if (isScrolledRef.current !== isScrolled) {
        isScrolledRef.current = isScrolled;
        setHeaderScrolled(isScrolled);
      }
    },
    [setHeaderScrolled],
  );
}
