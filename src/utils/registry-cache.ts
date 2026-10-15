import { queryClient } from "@/api/queryClient";
import { IRegistry, IRegistryDetails } from "@/types";

export function cacheRegistryUpdate(registry: IRegistryDetails) {
  queryClient.setQueryData(["registryById", registry.id], registry);
  queryClient.setQueryData<IRegistry[]>(["registries"], (previous) =>
    previous?.map((item) =>
      item.id === registry.id
        ? {
            ...item,
            title: registry.title,
            logo: registry.logo,
            visibility: registry.visibility,
            _count: registry._count,
          }
        : item,
    ),
  );
  void queryClient.invalidateQueries({
    queryKey: ["registryGuestView", registry.id],
  });
  void queryClient.invalidateQueries({ queryKey: ["friends"] });
}
