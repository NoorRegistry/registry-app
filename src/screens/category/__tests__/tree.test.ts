import { categoryChildren, categoryPath, findCategories } from "../tree";
import { IProductCategory } from "@/types";
const bedding = { id: "bedding", children: false } as IProductCategory;
const sleep = { id: "sleep", children: [bedding] } as IProductCategory;
const nursery = { id: "nursery", children: [sleep] } as IProductCategory;
it("resolves nested deep links and the ancestors needed for breadcrumbs and sibling switching", () => {
  expect(categoryPath([nursery], "bedding").map(({ id }) => id)).toEqual([
    "nursery",
    "sleep",
    "bedding",
  ]);
  expect(categoryChildren(categoryPath([nursery], "bedding").at(-2))).toEqual([
    bedding,
  ]);
  expect(categoryPath([nursery], "missing")).toEqual([]);
  expect(categoryChildren(bedding)).toEqual([]);
});
it("handles malformed cyclic input without hanging navigation", () => {
  const cycle = { ...nursery, children: [] as IProductCategory[] };
  cycle.children.push(cycle);
  expect(categoryPath([cycle], "missing")).toEqual([]);
});

it("finds nested categories in either language and preserves their full ancestor path", () => {
  const leaf = { ...bedding, nameEn: "Cot sheets", nameAr: "ملاءات السرير" };
  const tree = [
    {
      ...nursery,
      nameEn: "Nursery",
      nameAr: "غرفة الطفل",
      children: [
        { ...sleep, nameEn: "Sleep", nameAr: "النوم", children: [leaf] },
      ],
    },
  ];
  expect(
    findCategories(tree, " SHEETS ")[0].path.map((item) => item.id),
  ).toEqual(["nursery", "sleep", "bedding"]);
  expect(findCategories(tree, "ملاءات")[0].category.id).toBe("bedding");
  expect(findCategories(tree, "unknown")).toEqual([]);
  expect(findCategories(tree, " ")).toEqual([]);
});
