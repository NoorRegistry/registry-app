export function selectedRegistryFirst<T extends { id: string }>(
  registries: T[],
  selectedId?: string,
) {
  const selected = registries.find((registry) => registry.id === selectedId);
  return selected
    ? [selected, ...registries.filter((registry) => registry.id !== selectedId)]
    : registries;
}

export function paginationWindow(total: number, active: number) {
  const count = Math.min(5, total);
  const start = Math.max(
    0,
    Math.min(active - Math.floor(count / 2), total - count),
  );
  return Array.from({ length: count }, (_, offset) => ({
    index: start + offset,
    small:
      (offset === 0 && start > 0) ||
      (offset === count - 1 && start + count < total),
  }));
}
