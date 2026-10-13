import { IApiError } from "@/api/http";
import {
  addCartItem,
  Cart,
  fetchCart,
  removeCartItem,
  setCartQuantity,
} from "@/services/cart.service";
import { useGlobalStore } from "@/store";
import { getUserSub } from "@/utils/helper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

type CartAction =
  | { kind: "add"; productId: string }
  | { kind: "set"; productId: string; quantity: number }
  | { kind: "remove"; productId: string };

export function useCart() {
  const isAuthenticated = useGlobalStore.use.isAuthenticated();
  const userId = isAuthenticated ? getUserSub() : "";
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: fetchCart,
    enabled: Boolean(userId),
    staleTime: 15000,
  });
}

export function useCartActions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = getUserSub();
  return useMutation<Cart, IApiError, CartAction>({
    mutationFn: (action) => {
      if (action.kind === "add") return addCartItem(action.productId);
      if (action.kind === "remove") return removeCartItem(action.productId);
      return setCartQuantity(action.productId, action.quantity);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart", userId], cart);
    },
    onError: (error) => {
      Toast.show({ type: "error", text1: error.detail || t("common.error") });
    },
  });
}
