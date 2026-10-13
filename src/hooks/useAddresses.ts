import i18n from "@/i18n";
import { fetchAddresses } from "@/services/orders.service";
import { getUserSub } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
export const useAddressChoice = create<{
  choice: { userId: string; id: string } | null;
  choose: (id: string) => void;
}>((set) => ({
  choice: null,
  choose: (id) => set({ choice: { userId: getUserSub(), id } }),
}));
export const useAddresses = () =>
  useQuery({
    queryKey: ["addresses", getUserSub()],
    queryFn: fetchAddresses,
    staleTime: 15000,
  });
export const addressLine = (address: {
  area: string;
  block: string;
  street: string;
  building: string;
  apartment?: string | null;
  floor?: string | null;
  avenue?: string | null;
}) =>
  [
    address.area,
    `${i18n.t("addresses.block")} ${address.block}`,
    `${i18n.t("addresses.street")} ${address.street}`,
    address.avenue &&
      `${i18n.t("addresses.avenue").replace(/\s*\([^)]*\)/g, "")} ${address.avenue}`,
    `${i18n.t("addresses.building")} ${address.building}`,
    address.floor &&
      `${i18n.t("addresses.floor").replace(/\s*\([^)]*\)/g, "")} ${address.floor}`,
    address.apartment &&
      `${i18n.t("addresses.apartment").replace(/\s*\([^)]*\)/g, "")} ${address.apartment}`,
  ]
    .filter(Boolean)
    .join(", ");
