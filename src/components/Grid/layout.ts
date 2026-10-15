export function gridItemWidth(
  containerWidth: number,
  columns: number,
  padding: number,
  gap: number,
  scale: number,
) {
  const available = Math.max(
    0,
    containerWidth - padding * 2 - gap * (columns - 1),
  );
  // Round down to physical pixels so fractional Android widths cannot overflow.
  return Math.floor((available / columns) * scale) / scale;
}
