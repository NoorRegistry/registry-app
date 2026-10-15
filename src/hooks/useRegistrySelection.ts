import { useEffect } from "react";
import { useGlobalStore } from "@/store";
import { IRegistry } from "@/types";

export function useRegistrySelection(registries?: IRegistry[]) {
  const selectedId = useGlobalStore((state) => state.selectedRegistryId);
  const select = useGlobalStore((state) => state.setSelectedRegistryId);
  const registry =
    registries?.find(({ id }) => id === selectedId) ?? registries?.[0];
  const activeId = registry?.id;
  useEffect(() => {
    if (activeId && selectedId !== activeId) select(activeId);
  }, [activeId, selectedId, select]);
  return registry;
}
