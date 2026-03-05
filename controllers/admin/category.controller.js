const { buildCategoryTree } = require("../../helpers/category.helper.js");

const Category = require("../../models/category.model.js");
const AccountAdmin = require("../../models/account-admin.model.js");
const moment = require("moment");
const slugify = require("slugify");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }

  const filterDate = {};
  if (req.query.startDate) {
    filterDate.$gte = moment(req.query.startDate).toDate();
    find.createdAt = filterDate;
  }
  if (req.query.endDate) {
    filterDate.$lte = moment(req.query.endDate).toDate();
    find.createdAt = filterDate;
  }

  if (req.query.keyword) {
    let regex = req.query.keyword.trim();
    regex = regex.replace(/\s\s+/g, " ");
    regex = slugify(regex);
    regex = new RegExp(regex, "i");
    find.slug = regex;
  }

  // Phân trang
  const limitItems = 2;
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page);
  }
  const totalRecord = await Category.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalPage: totalPage,
    totalRecord: totalRecord,
    skip: skip,
  };
  // Hết Phân trang

  const categoryList = await Category.find(find)
    .sort({
      position: "asc",
    })
    .limit(limitItems)
    .skip(skip);
  const accountAdminList = await AccountAdmin.find({}).select("id fullName");

  for (const item of categoryList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAccount) {
        item.createdByFullName = infoAccount.fullName;
        item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
      }
    }

    if (item.updatedBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.updatedBy,
      });
      if (infoAccount) {
        item.updatedByFullName = infoAccount.fullName;
        item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
      }
    }
  }
  res.render("admin/pages/category-list", {
    pageTitle: "Quản lý danh mục",
    categoryList: categoryList,
    accountAdminList: accountAdminList,
    pagination: pagination,
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

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryDetail = await Category.findOne({
      _id: id,
      deleted: false,
    });

    if (!categoryDetail) {
      res.redirect(`/${pathAdmin}/category/list`);
      return;
    }

    const categoryList = await Category.find({
      deleted: false,
    });

    const categoryTree = buildCategoryTree(categoryList);

    res.render("admin/pages/category-edit", {
      pageTitle: "Chỉnh sửa danh mục",
      categoryList: categoryTree,
      categoryDetail: categoryDetail,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/category/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryDetail = await Category.findOne({
      _id: id,
      deleted: false,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Danh mục không tồn tại!",
      });
      return;
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      req.body.avatar = "";
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const record = await Category.findOne({}).sort({
        position: "desc",
      });
      if (record) {
        req.body.position = record.position + 1;
      } else {
        req.body.position = 1;
      }
    }

    req.body.updatedBy = req.account.id;

    await Category.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Đã cập nhật danh mục!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Danh mục không tồn tại!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryDetail = await Category.findOne({
      _id: id,
      deleted: false,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Danh mục không tồn tại!",
      });
      return;
    }

    await Category.updateOne(
      {
        _id: id,
        deleted: false,
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Đã xóa danh mục!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Danh mục không tồn tại!",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { listId, option } = req.body;

    switch (option) {
      case "active":
      case "inactive":
        await Category.updateMany(
          {
            _id: { $in: listId },
            deleted: false,
          },
          {
            status: option,
            updatedBy: req.account.id,
          },
        );
        res.json({
          code: "success",
          message: "Đã cập nhật trạng thái!",
        });
        break;
      case "delete":
        await Category.updateMany(
          {
            _id: { $in: listId },
            deleted: false,
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now(),
          },
        );
        res.json({
          code: "success",
          message: "Đã xóa các bản ghi!",
        });
        break;
      default:
        res.json({
          code: "error",
          message: "Dữ liệu không hợp lệ!",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
