const AccountAdmin = require("../../models/account-admin.model");
const jwt = require("jsonwebtoken");

module.exports.edit = (req, res) => {
  res.render("admin/pages/profile-edit", {
    pageTitle: "Thông tin cá nhân",
  });
};

module.exports.editPatch = async (req, res) => {
  const id = req.account.id;

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

  // Tạo JWT
  const token = jwt.sign(
    {
      id: id,
      email: req.body.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  // Lưu token vào cookie
  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server
    sameSite: "strict", // Không cho phép lấy được cookie từ tên miền khác
  });

  res.json({
    code: "success",
    message: "Đã cập nhật khoản quản trị!",
  });
};

module.exports.changePassword = (req, res) => {
  res.render("admin/pages/change-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

module.exports.changePasswordPatch = async (req, res) => {
  const id = req.account.id;

  // Mã hóa mật khẩu
  req.body.password = await bcrypt.hash(req.body.password, 10);

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
    message: "Đã đổi mật khẩu thành công!",
  });
};
