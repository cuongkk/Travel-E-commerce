const accountAdmin = require("../../models/account-admin.model.js");
const forgotPasswordModel = require("../../models/forgot-password.model.js");
const generateHelper = require("../../helpers/generate.helper.js");
const mailHelper = require("../../helpers/mail.helper.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.login = (req, res) => {
  res.render("admin/pages/login", {
    pageTitle: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;

  const existAccount = await accountAdmin.findOne({ email: email });

  if (!existAccount) {
    return res.json({
      result: "error",
      message: "Email không tồn tại trong hệ thống",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);

  if (isPasswordValid === false) {
    return res.json({
      result: "error",
      message: "Mật khẩu không đúng",
    });
  }

  if (existAccount.status === "initial") {
    return res.json({
      result: "error",
      message: "Tài khoản chưa được kích hoạt",
    });
  }

  // Tạo JWT token
  const token = jwt.sign({ _id: existAccount._id }, process.env.JWT_SECRET_KEY, { expiresIn: rememberPassword ? "30d" : "7d" });

  // Lưu token vào cookie
  res.cookie("token", token, {
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days depending on rememberPassword
    httpOnly: true, // Chỉ cho phép truy cập cookie từ phía server
    sameSite: "strict", // Không gửi cookie trong các yêu cầu bên thứ ba
  });
  res.json({
    result: "success",
    message: "Đăng nhập thành công",
  });
};

module.exports.register = (req, res) => {
  res.render("admin/pages/register", {
    pageTitle: "Đăng ký",
  });
};

module.exports.registerPost = async (req, res) => {
  const existAccount = await accountAdmin.findOne({ email: req.body.email });

  if (existAccount) {
    return res.json({
      result: "error",
      message: "Email đã tồn tại, vui lòng sử dụng email khác",
    });
  }

  req.body.status = "initial";

  // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu

  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newAccount = new accountAdmin(req.body);

  await newAccount.save();

  res.json({
    result: "success",
    message: "Đăng ký thành công",
  });
};

module.exports.registerInitial = (req, res) => {
  res.render("admin/pages/register-initial", {
    pageTitle: "Thành công",
  });
};

module.exports.forgotPassword = (req, res) => {
  res.render("admin/pages/forget-password", {
    pageTitle: "Quên mật khẩu",
  });
};

module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  // Kiểm tra email có tồn tại trong hệ thống không

  const existAccount = await accountAdmin.findOne({ email: email, status: "active" });

  if (!existAccount) {
    return res.json({
      result: "error",
      message: "Email không tồn tại trong hệ thống",
    });
  }

  // Kiểm tra nếu đã có mã OTP chưa và chưa hết hạn

  const existingOTP = await forgotPasswordModel.findOne({
    email: email,
  });

  if (existingOTP) {
    return res.json({
      result: "error",
      message: "Mã OTP đã được gửi. Vui lòng kiểm tra email của bạn.",
    });
  }

  // Tạo mã OTP và thời gian hết hạn
  const otpCode = generateHelper.generateRandomNumber(6);

  // Lưu mã OTP vào cơ sở dữ liệu
  const newRecord = new forgotPasswordModel({
    email: email,
    otp: otpCode,
    expireAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await newRecord.save();

  // Gửi mã OTP đến email của người dùng
  const subject = "Mã OTP đặt lại mật khẩu";
  const content = `Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút.`;
  await mailHelper.sendMail(email, subject, content);

  res.json({
    result: "success",
    message: "Đã gửi mã OTP đến email của bạn",
  });
};

module.exports.otpPassword = (req, res) => {
  res.render("admin/pages/otp-password", {
    pageTitle: "Xác nhận OTP",
  });
};

module.exports.otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;
  const existRecord = await forgotPasswordModel.findOne({ email: email, otp: otp });

  if (!existRecord) {
    return res.json({
      result: "error",
      message: "Mã OTP không đúng hoặc đã hết hạn",
    });
  }

  await forgotPasswordModel.deleteOne({ email: email, otp: otp });

  const existAccount = await accountAdmin.findOne({ email: email });
  const token = jwt.sign(
    {
      _id: existAccount._id,
      email: existAccount.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" },
  );

  // Lưu token vào cookie
  res.cookie("token", token, {
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true, // Chỉ cho phép truy cập cookie từ phía server
    sameSite: "strict", // Không gửi cookie trong các yêu cầu bên thứ ba
  });

  res.json({
    result: "success",
    message: "Xác thực OTP thành công",
  });
};
module.exports.resetPassword = (req, res) => {
  res.render("admin/pages/reset-password", {
    pageTitle: "Đặt lại mật khẩu",
  });
};

module.exports.resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  console.log(password);
  try {
    const { email, _id } = req.account;

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(_id, email);
    await accountAdmin.updateOne({ email: email }, { $set: { password: hashedPassword } });
    res.json({
      result: "success",
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    res.json({
      result: "error",
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`/${pathAdmin}/account/login`);
};
