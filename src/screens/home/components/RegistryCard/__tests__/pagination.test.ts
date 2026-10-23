import { paginationWindow, selectedRegistryFirst } from "../pagination";

it("puts the selected registry first without reordering the API cache", () => {
  const rows = [{ id: "one" }, { id: "two" }, { id: "three" }];
  expect(selectedRegistryFirst(rows, "two").map(({ id }) => id)).toEqual([
    "two",
    "one",
    "three",
  ]);
  expect(rows.map(({ id }) => id)).toEqual(["one", "two", "three"]);
  expect(selectedRegistryFirst(rows, "deleted")).toEqual(rows);
});

it("moves at most five dots across ten registries, keeping the active dot visible", () => {
  for (let active = 0; active < 10; active++) {
    const dots = paginationWindow(10, active);
    expect(dots).toHaveLength(5);
    expect(dots.some(({ index, small }) => index === active && !small)).toBe(
      true,
    );
    expect(dots.every(({ index }) => index >= 0 && index < 10)).toBe(true);
  }
  expect(paginationWindow(10, 0).map(({ index }) => index)).toEqual([
    0, 1, 2, 3, 4,
  ]);
  expect(paginationWindow(10, 6).map(({ index }) => index)).toEqual([
    4, 5, 6, 7, 8,
  ]);
  expect(paginationWindow(10, 9).map(({ index }) => index)).toEqual([
    5, 6, 7, 8, 9,
  ]);
});

it("handles empty, single and short registry lists", () => {
  expect(paginationWindow(0, 0)).toEqual([]);
  expect(paginationWindow(1, 0)).toEqual([{ index: 0, small: false }]);
  expect(paginationWindow(3, 1).map(({ index }) => index)).toEqual([0, 1, 2]);
});
