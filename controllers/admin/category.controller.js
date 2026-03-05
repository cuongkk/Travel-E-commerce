const { buildCategoryTree } = require("../../helpers/category.helper.js");

const Category = require("../../models/category.model.js");

module.exports.list = (req, res) => {
  res.render("admin/pages/category-list", {
    pageTitle: "Quản lý danh mục",
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });

  const categoryTree = buildCategoryTree(categoryList);

  res.render("admin/pages/category-create", {
    pageTitle: "Tạo danh mục",
    categoryList: categoryTree,
  });
};

module.exports.createPost = async (req, res) => {
  if (req.file) {
    req.body.avatar = req.file.path;
  } else {
    req.body.avatar = "";
  }

  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const record = await Category.findOne().sort({ position: "desc" });

    if (record) {
      req.body.position = record.position + 1;
    } else {
      req.body.position = 1;
    }
  }
  req.body.createdBy = res.locals.account._id;

  const newRecord = new Category(req.body);

  await newRecord.save();

  res.json({
    result: "success",
    message: "Tạo danh mục thành công",
  });
};
