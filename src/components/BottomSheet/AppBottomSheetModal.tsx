import {
  BottomSheetModal,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { usePreventRemove } from "expo-router/react-navigation";
import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BackHandler } from "react-native";
import { useBottomSheetStore } from "@/store/bottomSheetStore";
import {
  dismissTopSheet,
  useSheetNavigationStore,
} from "@/store/sheetNavigationStore";

function NavigationGuard({ open }: { open: boolean }) {
  usePreventRemove(open, dismissTopSheet);
  return null;
}

export function GlobalBottomSheetNavigationGuard({
  children,
}: React.PropsWithChildren) {
  const open = useBottomSheetStore((state) => state.isVisible);
  usePreventRemove(open, dismissTopSheet);
  return <>{children}</>;
}

export function BottomSheetBackHandler() {
  const hasOpenSheet = useSheetNavigationStore(
    (state) => state.sheets.length > 0,
  );
  useEffect(() => {
    if (!hasOpenSheet) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      dismissTopSheet,
    );
    return () => subscription.remove();
  }, [hasOpenSheet]);
  return null;
}

export default function AppBottomSheetModal({
  ref,
  onChange,
  onDismiss,
  guardNavigation = true,
  ...props
}: BottomSheetModalProps & {
  ref?: React.Ref<BottomSheetModal>;
  guardNavigation?: boolean;
}) {
  const modalRef = useRef<BottomSheetModal>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const register = useCallback(() => {
    useSheetNavigationStore.getState().open({
      id,
      dismiss: () => modalRef.current?.dismiss(),
    });
    setOpen(true);
  }, [id]);
  const unregister = useCallback(() => {
    useSheetNavigationStore.getState().close(id);
    setOpen(false);
  }, [id]);

  useEffect(() => () => useSheetNavigationStore.getState().close(id), [id]);
  useImperativeHandle(
    ref,
    () => ({
      present: (data) => {
        register();
        modalRef.current?.present(data);
      },
      dismiss: (config) => modalRef.current?.dismiss(config),
      close: (config) => modalRef.current?.close(config),
      forceClose: (config) => modalRef.current?.forceClose(config),
      expand: (config) => modalRef.current?.expand(config),
      collapse: (config) => modalRef.current?.collapse(config),
      snapToIndex: (index, config) =>
        modalRef.current?.snapToIndex(index, config),
      snapToPosition: (position, config) =>
        modalRef.current?.snapToPosition(position, config),
    }),
    [register],
  );

  return (
    <>
      {guardNavigation && <NavigationGuard open={open} />}
      <BottomSheetModal
        accessible={false}
        {...props}
        ref={modalRef}
        onChange={(index, position, type) => {
          if (index >= 0) register();
          else unregister();
          onChange?.(index, position, type);
        }}
        onDismiss={() => {
          unregister();
          onDismiss?.();
        }}
      />
    </>
  );
}
