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
            eventDate: registry.eventDate,
            _count: registry._count,
          }
        : item,
    ),
  );
  void queryClient.invalidateQueries({
    queryKey: ["registryGuestView"],
  });
  void queryClient.invalidateQueries({ queryKey: ["friends"] });
}
