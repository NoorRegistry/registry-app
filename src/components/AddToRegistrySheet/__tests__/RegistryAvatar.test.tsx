import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import RegistryPickerAvatar from "../RegistryAvatar";

jest.mock("@expo/vector-icons/Feather", () => "registry-type-icon");
jest.mock("expo-image", () => ({ Image: "registry-logo" }));
jest.mock("@/utils/helper", () => ({
  getImageUrl: (path?: string | null) => path || "",
}));
let tree: ReactTestRenderer;
afterEach(async () => {
  await act(async () => tree?.unmount());
});

it.each([
  ["Wedding Registry", "heart"],
  ["House warming", "home"],
  ["Birthday", "gift"],
  ["Baby", "smile"],
  ["Graduation", "award"],
  ["Holiday Gift", "sun"],
  ["قائمة هدايا الزفاف", "heart"],
  ["تدفئة المنزل", "home"],
  ["عيد ميلاد", "gift"],
  ["قائمة هدايا المولود", "smile"],
  ["تخرُّج", "award"],
  ["هدية عطلة", "sun"],
  ["Unknown type", "gift"],
])(
  "uses the %s registry type icon when no image exists",
  async (name, expected) => {
    await act(async () => {
      tree = create(<RegistryPickerAvatar category={{ name }} />);
    });
    expect(tree.root.findByType("registry-type-icon" as any).props.name).toBe(
      expected,
    );
    expect(tree.root.findAllByType("registry-logo" as any)).toHaveLength(0);
  },
);

it("prefers a registry logo and falls back to its type if loading fails", async () => {
  const category = { nameEn: "Wedding Registry" };
  await act(async () => {
    tree = create(
      <RegistryPickerAvatar logo="/wedding.jpg" category={category} />,
    );
  });
  expect(tree.root.findAllByType("registry-type-icon" as any)).toHaveLength(0);
  const image = tree.root.findByType("registry-logo" as any);
  expect(image.props.source).toEqual({ uri: "/wedding.jpg" });
  await act(async () => image.props.onError());
  expect(tree.root.findByType("registry-type-icon" as any).props.name).toBe(
    "heart",
  );
  await act(async () =>
    tree.update(
      <RegistryPickerAvatar logo="/replacement.jpg" category={category} />,
    ),
  );
  expect(tree.root.findByType("registry-logo" as any).props.source).toEqual({
    uri: "/replacement.jpg",
  });
});
