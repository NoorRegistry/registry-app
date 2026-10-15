import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { BackHandler } from "react-native";
import AppBottomSheetModal, {
  BottomSheetBackHandler,
} from "../AppBottomSheetModal";
import {
  dismissTopSheet,
  useSheetNavigationStore,
} from "@/store/sheetNavigationStore";

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockPreventRemove = jest.fn();
jest.mock("expo-router/react-navigation", () => ({
  usePreventRemove: (...args: unknown[]) => mockPreventRemove(...args),
}));
jest.mock("@/store/bottomSheetStore", () => ({
  useBottomSheetStore: (selector: (state: { isVisible: boolean }) => unknown) =>
    selector({ isVisible: false }),
}));
jest.mock("@gorhom/bottom-sheet", () => {
  const React = jest.requireActual("react");
  return {
    BottomSheetModal: React.forwardRef(function MockModal(
      props: any,
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return React.createElement("native-sheet", props);
    }),
  };
});

let tree: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  useSheetNavigationStore.setState({ sheets: [] });
});
afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  jest.restoreAllMocks();
});

it("closes an open sheet on navigation back and allows navigation after dismissal, including reopening", async () => {
  const ref = React.createRef<any>();
  const onDismiss = jest.fn();
  await act(async () => {
    tree = create(
      <AppBottomSheetModal ref={ref} onDismiss={onDismiss}>
        {null}
      </AppBottomSheetModal>,
    );
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    await act(async () => ref.current.present());
    expect(mockPreventRemove.mock.lastCall[0]).toBe(true);
    act(() =>
      mockPreventRemove.mock.lastCall[1]({
        data: { action: { type: "GO_BACK" } },
      }),
    );
    expect(mockDismiss).toHaveBeenCalledTimes(attempt + 1);
    await act(async () =>
      tree.root.findByType("native-sheet" as any).props.onDismiss(),
    );
    expect(mockPreventRemove.mock.lastCall[0]).toBe(false);
    expect(dismissTopSheet()).toBe(false);
  }
  expect(onDismiss).toHaveBeenCalledTimes(2);
});

it("consumes Android hardware back even when there is no previous screen", async () => {
  const listener = jest.spyOn(BackHandler, "addEventListener");
  const ref = React.createRef<any>();
  await act(async () => {
    tree = create(
      <>
        <AppBottomSheetModal ref={ref}>{null}</AppBottomSheetModal>
        <BottomSheetBackHandler />
      </>,
    );
  });
  await act(async () => ref.current.present());
  const back = listener.mock.calls.at(-1)?.[1] as (() => boolean) | undefined;
  expect(back?.()).toBe(true);
  expect(mockDismiss).toHaveBeenCalledTimes(1);
});

it("closes only the top sheet and clears stale entries when it unmounts", async () => {
  const lowerDismiss = jest.fn();
  useSheetNavigationStore
    .getState()
    .open({ id: "lower", dismiss: lowerDismiss });
  const ref = React.createRef<any>();
  await act(async () => {
    tree = create(<AppBottomSheetModal ref={ref}>{null}</AppBottomSheetModal>);
  });
  await act(async () => ref.current.present());
  expect(dismissTopSheet()).toBe(true);
  expect(lowerDismiss).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
  expect(dismissTopSheet()).toBe(true);
  expect(lowerDismiss).toHaveBeenCalledTimes(1);
});
