import { SvgProps } from "react-native-svg";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export interface IPaginatedResponse<T> {
  data: T[];
  limit: null | number;
  page: null | number;
  total: number;
  totalPages: null | number;
}

export interface ITokenInfo {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    mobileNumber: string | null;
    countryCode: string | null;
    gender: "Male" | "Female" | null;
    getUserData: boolean;
  };
  iat: string;
  exp: string;
}

export interface IAccessToken {
  accessToken: string;
  refreshToken: string;
}

export interface IStore {
  id: string;
  nameEn: string;
  nameAr: string;
  storeLogo: string;
}

export interface IStoreDetails extends IStore {
  descriptionEn: string;
  descriptionAr: string;
  products: TProductCard[];
}

export type TCreateStore = Omit<IStoreDetails, "id">;

export interface IProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  qty: number;
  images: TProductImage[];
  category?: {
    nameEn: string;
    nameAr: string;
    id: string;
  };
  store?: {
    nameEn: string;
    nameAr: string;
    id: string;
  };
  currencyCode: string;
}

export type TProductImage = { id: string; path: string };

export type TProductCard = Pick<
  IProduct,
  "id" | "nameEn" | "nameAr" | "images" | "price" | "currencyCode"
>;

export interface IProductDetails extends IProduct {
  descriptionEn: string;
  descriptionAr: string;
  addedInRegistryItemCount: {
    days: number;
    lifetime: number;
    recentlyAdded: number;
  };
}

export interface IProductCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  logo: string;
  parentId: string | null;
  children: IProductCategory[] | boolean;
}

export interface IProductCategoryDetails extends IProductCategory {
  descriptionEn: string;
  descriptionAr: string;
  _count: {
    products: number;
  };
}

export type TUploadType = "store" | "product";

export interface IQueryState {
  current: number;
  pageSize: number;
  search: string;
}

export type TLoginMethod = "apple" | "facebook" | "google" | "email";

export interface IRegistry {
  id: string;
  title: string;
  logo: string;
  categoryId?: string;
  isActive: boolean;
  visibility: "Private" | "Public";
  _count: {
    totalItems: number;
    totalPurchased: number;
  };
  category: {
    id?: string;
    nameEn?: string;
    nameAr?: string;
    name?: string;
  };
}

export interface IRegistryDetails extends IRegistry {
  greeting: string | null;
  isProtected: boolean;
  isOwner?: boolean;
  code?: string | null;
  purchased: {
    items: IRegistryPurchaseCategorySection[];
  };
  registryItems: {
    items: IRegistryItemsCategorySection[];
  };
}

export interface IRegistryItemsCategorySection {
  id: string;
  nameEn: string;
  nameAr: string;
  data: IRegistryItem[];
}

export interface IRegistryPurchaseCategorySection {
  id: string;
  nameEn: string;
  nameAr: string;
  data: IPurchasedItem[];
}

export interface IPurchasedItem {
  id: string;
  product: TProductCard;
  qty: number;
  purchasedByYou?: boolean;
}

export interface IRegistryItem {
  id: string;
  product: Omit<IProduct, "store">;
  qty: number;
  qtyLeft: number;
}

export interface IRegistryItemDetails {
  id: string;
  notes: string;
  product: IProduct;
  purchase: {
    id: string;
    name: string;
    qty: number;
  }[];
  qty: number;
  qtyLeft: number;
}

export interface SVGIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export interface ICreateRegistryItem {
  productId: string;
  registryId: string;
  qty: number;
}

export interface ICreateRegistryItemResponse {
  id: string;
  qty: number;
  registry: {
    id: string;
    title: string;
    categoryId?: string;
  };
}

export interface ICreateRegistryItemPurchase {
  registryItemsId: string;
  registryId: string;
  name: string;
  email: string;
  platform: string;
  platformOrderId: string;
  qty: number;
}

export interface IUpdateRegistryItemPayload {
  qty: number;
  notes: string;
}

export interface ISearchRegistry {
  id: string;
  title: string;
  isProtected: boolean;
  logo: string | null;
}

export type ISearchProduct = Pick<
  IProduct,
  "id" | "nameEn" | "nameAr" | "price" | "qty" | "images" | "currencyCode"
> & {
  store?: {
    id: string;
    nameEn: string;
    nameAr: string;
  } | null;
};

export type ISearchStore = IStore;

export type ISearchGuide = IGuide;

export interface IGlobalSearchCounts {
  registries: number;
  products: number;
  stores: number;
  guides: number;
}

export interface IGlobalSearchResults {
  total: number;
  counts: IGlobalSearchCounts;
  registries: ISearchRegistry[];
  products: ISearchProduct[];
  stores: ISearchStore[];
  guides: ISearchGuide[];
}

export type TGlobalSearchResultsType =
  | "stores"
  | "products"
  | "guides"
  | "registries";

export interface IRegistryCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  registryBackground: string | null;
  registryPlaceHolder: string | null;
}

export interface ICreateRegistryPayload {
  title: string;
  categoryId: string;
  logo?: string;
  greeting?: string;
  code?: string;
}

export interface IUpdateRegistryPayload {
  visibility?: "Private" | "Public";
  isProtected?: boolean;
  code?: string;
}

export interface IGuideHomeCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  guides: IGuide[];
}

export interface IGuide {
  id: string;
  nameEn: string;
  nameAr: string;
  url: string;
  bannerImage: string;
}

export interface IGuideCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  guides: IGuide[];
  descriptionEn: string;
  descriptionAr: string;
  parentId: string;
  children: boolean | IGuideCategory[];
}
