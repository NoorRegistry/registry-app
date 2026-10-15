import { IProductCategory } from "@/types";
export function categoryChildren(category?: IProductCategory) {
  return Array.isArray(category?.children) ? category.children : [];
}
export function categoryPath(
  roots: IProductCategory[],
  id: string,
): IProductCategory[] {
  const visit = (
    nodes: IProductCategory[],
    path: IProductCategory[],
  ): IProductCategory[] => {
    for (const node of nodes) {
      if (path.some((parent) => parent.id === node.id)) continue;
      const next = [...path, node];
      if (node.id === id) return next;
      const result = visit(categoryChildren(node), next);
      if (result.length) return result;
    }
    return [];
  };
  return visit(roots, []);
}

export function findCategories(roots: IProductCategory[], query: string) {
  const needle = query.trim().toLocaleLowerCase().normalize("NFKC");
  const results: { category: IProductCategory; path: IProductCategory[] }[] =
    [];
  const visit = (nodes: IProductCategory[], path: IProductCategory[]) => {
    for (const category of nodes) {
      if (path.some((item) => item.id === category.id)) continue;
      const next = [...path, category];
      if (
        `${category.nameEn} ${category.nameAr}`
          .toLocaleLowerCase()
          .normalize("NFKC")
          .includes(needle)
      )
        results.push({ category, path: next });
      visit(categoryChildren(category), next);
    }
  };
  if (needle) visit(roots, []);
  return results;
}
