const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const { buildCategoryTree } = require("../../helpers/category.helper");
const Tour = require("../../models/tour.model.js");
const AccountAdmin = require("../../models/account-admin.model");
const PaginationHelper = require("../../helpers/pagination.helper.js");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  const pagination = await PaginationHelper.pagination(Tour, find, req);

  const tourList = await Tour.find(find)
    .sort({
      position: "desc",
    })
    .limit(pagination.limitItems)
    .skip(pagination.skip);

  for (const item of tourList) {
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

  res.render("admin/pages/tour-list", {
    pageTitle: "Quản lý tour",
    tourList: tourList,
    pagination: pagination,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });

  const categoryTree = buildCategoryTree(categoryList);

  const cityList = await City.find({});

  res.render("admin/pages/tour-create", {
    pageTitle: "Tạo tour",
    categoryList: categoryTree,
    cityList: cityList,
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
    const record = await Tour.findOne({}).sort({
      position: "desc",
    });
    if (record) {
      req.body.position = record.position + 1;
    } else {
      req.body.position = 1;
    }
  }

  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
  req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
  req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
  req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;
  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
  req.body.endDate = req.body.endDate ? new Date(req.body.endDate) : null;

  // Tính thời gian tour (số ngày, làm tròn lên)
  if (req.body.departureDate && req.body.endDate) {
    const diffMs = req.body.endDate.getTime() - req.body.departureDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil(diffMs / dayMs));
    req.body.time = `${days} ngày`;
  } else {
    req.body.time = "";
  }
  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];
  req.body.createdBy = req.account.id;

  const newRecord = new Tour(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Đã tạo tour!",
  });
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  const tourList = await Tour.find(find).sort({
    deletedAt: "desc",
  });

  for (const item of tourList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.createdBy,
      });
      if (infoAccount) {
        item.createdByFullName = infoAccount.fullName;
        item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
      }
    }

    if (item.deletedBy) {
      const infoAccount = await AccountAdmin.findOne({
        _id: item.deletedBy,
      });
      if (infoAccount) {
        item.deletedByFullName = infoAccount.fullName;
        item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
      }
    }
  }
  res.render("admin/pages/tour-trash", {
    pageTitle: "Thùng rác tour",
    tourList: tourList,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false,
    });

    if (!tourDetail) {
      res.redirect(`/${pathAdmin}/tour/list`);
      return;
    }

    if (tourDetail.departureDate) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("YYYY-MM-DD");
    }

    const categoryList = await Category.find({
      deleted: false,
    });

    const categoryTree = buildCategoryTree(categoryList);

    const cityList = await City.find({});

    res.render("admin/pages/tour-edit", {
      pageTitle: "Chỉnh sửa tour",
      categoryList: categoryTree,
      tourDetail: tourDetail,
      cityList: cityList,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false,
    });

    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
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
      const record = await Tour.findOne({}).sort({
        position: "desc",
      });
      if (record) {
        req.body.position = record.position + 1;
      } else {
        req.body.position = 1;
      }
    }

    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
    req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.vehicle = req.body.vehicle || tourDetail.vehicle || "";
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : tourDetail.departureDate || null;
    req.body.endDate = req.body.endDate ? new Date(req.body.endDate) : tourDetail.endDate || null;

    // Tính lại thời gian tour khi chỉnh sửa (số ngày, làm tròn lên)
    if (req.body.departureDate && req.body.endDate) {
      const diffMs = req.body.endDate.getTime() - req.body.departureDate.getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      const days = Math.max(1, Math.ceil(diffMs / dayMs));
      req.body.time = `${days} ngày`;
    } else {
      req.body.time = tourDetail.time || "";
    }
    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];
    req.body.updatedBy = req.account.id;

    await Tour.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Đã cập nhật tour!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Tour không tồn tại!",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false,
    });

    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      });
      return;
    }

    await Tour.updateOne(
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
      message: "Đã xóa tour!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Tour không tồn tại!",
    });
  }
};

module.exports.undoPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: true,
    });

    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      });
      return;
    }

    await Tour.updateOne(
      {
        _id: id,
        deleted: true,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Đã khôi phục tour!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Tour không tồn tại!",
    });
  }
};

module.exports.destroyDel = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: true,
    });

    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      });
      return;
    }

    await Tour.deleteOne({
      _id: id,
      deleted: true,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn tour!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Tour không tồn tại!",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { listId, option } = req.body;

    switch (option) {
      case "active":
      case "inactive":
        await Tour.updateMany(
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
          message: "Đã cập nhật trạng thái tour!",
        });
        break;

      case "delete":
        await Tour.updateMany(
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
          message: "Đã chuyển tour vào thùng rác!",
        });
        break;

      case "undo":
        await Tour.updateMany(
          {
            _id: { $in: listId },
            deleted: true,
          },
          {
            deleted: false,
          },
        );
        res.json({
          code: "success",
          message: "Đã khôi phục các tour!",
        });
        break;

      case "destroy":
        await Tour.deleteMany({
          _id: { $in: listId },
          deleted: true,
        });
        res.json({
          code: "success",
          message: "Đã xóa vĩnh viễn các tour!",
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
