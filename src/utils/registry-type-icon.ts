import type { IRegistry } from "@/types";

export function registryTypeIcon(category?: IRegistry["category"]) {
  const name = [category?.nameEn, category?.nameAr, category?.name]
    .filter(Boolean)
    .join(" ")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "");
  if (/wedding|زفاف|زواج|عرس/.test(name)) return "heart";
  if (/housewarming|home|منزل|بيت/.test(name)) return "home";
  if (/baby|مولود|طفل/.test(name)) return "smile";
  if (/graduation|تخرج/.test(name)) return "award";
  if (/holiday|عطلة|عطله/.test(name)) return "sun";
  return "gift";
}

export function registryImageSources(
  logo?: string | null,
  category?: IRegistry["category"],
) {
  return [
    ...new Set([
      logo,
      category?.registryBackground,
      category?.registryPlaceHolder,
    ]),
  ].filter((path): path is string => Boolean(path?.trim()));
}
