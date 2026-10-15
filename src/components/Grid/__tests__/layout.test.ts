import { gridItemWidth } from "../layout";

it("keeps complete rows inside their container at phone, pane and tablet widths", () => {
  for (const width of [240, 320, 360, 384, 411.428571, 600, 768]) {
    for (const scale of [1, 2, 2.625, 3, 3.5]) {
      for (const columns of [1, 2, 3, 5]) {
        for (const padding of [0, 16, 24]) {
          const item = gridItemWidth(width, columns, padding, 12, scale);
          const rowWidth = item * columns + (columns - 1) * 12 + padding * 2;
          expect(item).toBeGreaterThan(0);
          expect(rowWidth).toBeLessThanOrEqual(width + 1e-8);
          expect(
            Math.abs(item * scale - Math.round(item * scale)),
          ).toBeLessThan(1e-8);
          // At most one physical pixel per column is left unused.
          expect(width - rowWidth).toBeLessThan(columns / scale + 1e-8);
        }
      }
    }
  }
});

it("clamps the initial tile width when a container has not been measured yet", () => {
  expect(gridItemWidth(0, 3, 16, 12, 3)).toBe(0);
});
