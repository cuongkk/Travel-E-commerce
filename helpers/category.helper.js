const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];

  for (const item of categories) {
    if (item.parent == parentId) {
      const children = buildCategoryTree(categories, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        children: children,
      });
    }
  }

  return tree;
};

module.exports.buildCategoryTree = buildCategoryTree;
