const { permissionList } = require("../../configs/variable.config");
const Role = require("../../models/role.model");
const AccountAdmin = require("../../models/account-admin.model");

const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

module.exports.list = (req, res) => {
  res.render("admin/pages/setting", {
    pageTitle: "Cài đặt",
  });
};

module.exports.websiteInfo = async (req, res) => {
  const existRecord = await SettingWebsiteInfo.findOne({});

  const settingWebsiteInfo = existRecord || {
    websiteName: "",
    phone: "",
    email: "",
    address: "",
    logo: "",
    favicon: "",
  };

  res.render("admin/pages/info-web", {
    pageTitle: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo,
  });
};

module.exports.websiteInfoPatch = async (req, res) => {
  const existRecord = await SettingWebsiteInfo.findOne({});

  // Map tên field từ form sang schema
  const websiteName = req.body.name || (existRecord && existRecord.websiteName) || "";
  const phone = req.body.phone || (existRecord && existRecord.phone) || "";
  const email = req.body.émail || (existRecord && existRecord.email) || "";
  const address = req.body.address || (existRecord && existRecord.address) || "";

  let logo = existRecord && existRecord.logo;
  let favicon = existRecord && existRecord.favicon;

  if (req.files && req.files.logo && req.files.logo[0]) {
    logo = req.files.logo[0].path;
  }

  if (req.files && req.files.favicon && req.files.favicon[0]) {
    favicon = req.files.favicon[0].path;
  }

  const payload = {
    websiteName,
    phone,
    email,
    address,
    logo: logo || "",
    favicon: favicon || "",
  };

  if (!existRecord) {
    const newRecord = new SettingWebsiteInfo(payload);
    await newRecord.save();
  } else {
    await SettingWebsiteInfo.updateOne({}, payload);
  }

  res.json({
    code: "success",
    message: "Cập nhật thành công!",
  });
};
module.exports.accountAdminList = async (req, res) => {
  const accountAdminList = await AccountAdmin.find({
    deleted: false,
  }).sort({
    createdAt: "desc",
  });

  for (const item of accountAdminList) {
    if (item.role) {
      const role = await Role.findOne({
        _id: item.role,
        deleted: false,
      });
      if (role) {
        item.roleName = role.name;
      }
    }
  }
  res.render("admin/pages/account-admin-list", {
    pageTitle: "Tài khoản quản trị",
    accountAdminList: accountAdminList,
  });
};

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/account-admin-create", {
    pageTitle: "Tạo tài khoản quản trị",
    roleList: roleList,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  const existEmail = await AccountAdmin.findOne({
    email: req.body.email,
  });

  if (existEmail) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!",
    });
    return;
  }

  if (req.file) {
    req.body.avatar = req.file.path;
  } else {
    req.body.avatar = "";
  }

  req.body.createdBy = req.account.id;

  // Tạo slug từ fullName để đảm bảo unique cho index slug_1
  if (req.body.fullName) {
    req.body.slug = slugify(req.body.fullName, { lower: true, strict: true });
  }

  // Mã hóa mật khẩu
  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newAccount = new AccountAdmin(req.body);
  await newAccount.save();

  res.json({
    code: "success",
    message: "Đã tạo tài khoản quản trị!",
  });
};

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const accountDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if (!accountDetail) {
      res.redirect(`/${pathAdmin}/account-admin/list`);
      return;
    }

    const roleList = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/account-admin-edit", {
      pageTitle: "Chỉnh sửa tài khoản quản trị",
      roleList: roleList,
      accountDetail: accountDetail,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/account-admin/list`);
  }
};

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const accountDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if (!accountDetail) {
      res.json({
        code: "error",
        message: "Tài khoản không tồn tại!",
      });
      return;
    }

    const existEmail = await AccountAdmin.findOne({
      _id: { $ne: id }, // not equal
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      });
      return;
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    } else {
      req.body.avatar = "";
    }

    req.body.updatedBy = req.account.id;

    await AccountAdmin.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Đã cập nhật khoản quản trị!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Email không tồn tại!",
    });
  }
};

module.exports.roleList = async (req, res) => {
  const find = {
    deleted: false,
  };

  const roleList = await Role.find(find).sort({
    createdAt: "desc",
  });

  for (const item of roleList) {
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

  res.render("admin/pages/role-list", {
    pageTitle: "Quản lý nhóm quyền",
    roleList: roleList,
  });
};

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/role-create", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  req.body.createdBy = req.account.id;

  const newRecord = new Role(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Đã tạo nhóm quyền",
  });
};

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false,
    });

    if (!roleDetail) {
      res.redirect(`/${pathAdmin}/role/list`);
      return;
    }

    res.render("admin/pages/role-edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      permissionList: permissionList,
      roleDetail: roleDetail,
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/role/list`);
  }
};

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false,
    });

    if (!roleDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    await Role.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
