import Category from "./category.model";

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug?: string;
  children: CategoryTreeNode[];
}

export const buildCategoryTree = (categories: any[], parentId = ""): CategoryTreeNode[] => {
  const tree: CategoryTreeNode[] = [];

  for (const item of categories) {
    if ((item as any).parent == parentId) {
      const children = buildCategoryTree(categories, (item as any).id as string);

      tree.push({
        id: (item as any).id as string,
        name: (item as any).name as string,
        slug: (item as any).slug as string,
        children,
      });
    }
  }

  return tree;
};

export const getCategorySubId = async (parentId = ""): Promise<string[]> => {
  const listId: string[] = [];

  const children = await Category.find({
    parent: parentId,
    deleted: false,
    status: "active",
  });

  for (const item of children) {
    listId.push((item as any).id as string);
    const subIds = await getCategorySubId((item as any).id as string);
    listId.push(...subIds);
  }

  return listId;
};
