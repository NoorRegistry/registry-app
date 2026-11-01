import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import RegistryAvatar from "..";
import RegistryPickerAvatar from "@/components/AddToRegistrySheet/RegistryAvatar";

jest.mock("expo-image", () => ({ Image: "registry-image" }));
jest.mock("@expo/vector-icons/Feather", () => "type-icon");
jest.mock("@/components/Typography", () => ({
  __esModule: true,
  default: { Text: "Text" },
}));
jest.mock("@/utils/helper", () => ({
  getImageUrl: (path?: string | null) => path || "",
}));

const category = {
  nameEn: "Baby",
  registryBackground: "/categories/baby.png",
  registryPlaceHolder: "/categories/baby-placeholder.png",
};
let tree: ReactTestRenderer;
afterEach(async () => {
  await act(async () => tree?.unmount());
});

describe.each([RegistryAvatar, RegistryPickerAvatar])("%p", (Avatar) => {
  const source = () => {
    const value = tree.root.findByType("registry-image" as any).props.source;
    return typeof value === "string" ? value : value.uri;
  };
  it("uses the configured category artwork when no registry photo exists", async () => {
    await act(async () => {
      tree = create(<Avatar category={category} />);
    });
    expect(source()).toBe(category.registryBackground);
    expect(tree.root.findByType("registry-image" as any).props.contentFit).toBe(
      "contain",
    );
    expect(tree.root.findAllByType("type-icon" as any)).toHaveLength(0);
  });

  it("prefers an uploaded photo and recovers through the configured category images", async () => {
    await act(async () => {
      tree = create(<Avatar logo="/uploaded.jpg" category={category} />);
    });
    expect(source()).toBe("/uploaded.jpg");
    expect(tree.root.findByType("registry-image" as any).props.contentFit).toBe(
      "cover",
    );
    await act(async () =>
      tree.root.findByType("registry-image" as any).props.onError(),
    );
    expect(source()).toBe(category.registryBackground);
    await act(async () =>
      tree.root.findByType("registry-image" as any).props.onError(),
    );
    expect(source()).toBe(category.registryPlaceHolder);
    await act(async () =>
      tree.root.findByType("registry-image" as any).props.onError(),
    );
    expect(tree.root.findByType("type-icon" as any).props.name).toBe("smile");
  });
});
