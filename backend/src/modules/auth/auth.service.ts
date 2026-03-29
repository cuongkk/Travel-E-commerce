import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import AccountAdmin from "./account-admin.model";
import ForgotPassword from "./forgot-password.model";
import { generateRandomNumber } from "../../utils/generate.helper";
import { sendMail } from "../../utils/mail.helper";
import { Request } from "express";

export const login = async (req: Request) => {
  const { email, password, rememberPassword } = req.body as { email: string; password: string; rememberPassword?: boolean };

  const existAccount = await AccountAdmin.findOne({ email });

  if (!existAccount) {
    return {
      result: "error" as const,
      message: "Email không tồn tại trong hệ thống",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);

  if (!isPasswordValid) {
    return {
      result: "error" as const,
      message: "Mật khẩu không đúng",
    };
  }

  if (existAccount.status === "initial") {
    return {
      result: "error" as const,
      message: "Tài khoản chưa được kích hoạt",
    };
  }

  const token = jwt.sign({ _id: existAccount._id }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: rememberPassword ? "30d" : "7d",
  });

  return {
    result: "success" as const,
    message: "Đăng nhập thành công",
    token,
    rememberPassword: Boolean(rememberPassword),
  };
};

export const register = async (req: Request) => {
  const { fullName, email, password, ...rest } = req.body as any;

  const existAccount = await AccountAdmin.findOne({ email });

  if (existAccount) {
    return {
      result: "error" as const,
      message: "Email đã tồn tại, vui lòng sử dụng email khác",
    };
  }

  const data: any = {
    ...rest,
    fullName,
    email,
    status: "initial",
  };

  if (fullName) {
    data.slug = slugify(fullName, { lower: true, strict: true });
  }

  data.password = await bcrypt.hash(password, 10);

  const newAccount = new AccountAdmin(data);
  await newAccount.save();

  return {
    result: "success" as const,
    message: "Đăng ký thành công",
  };
};

export const forgotPassword = async (req: Request) => {
  const { email } = req.body as { email: string };

  const existAccount = await AccountAdmin.findOne({ email, status: "active" });

  if (!existAccount) {
    return {
      result: "error" as const,
      message: "Email không tồn tại trong hệ thống",
    };
  }

  const existingOTP = await ForgotPassword.findOne({ email });

  if (existingOTP) {
    return {
      result: "error" as const,
      message: "Mã OTP đã được gửi. Vui lòng kiểm tra email của bạn.",
    };
  }

  const otpCode = generateRandomNumber(6);

  const newRecord = new ForgotPassword({
    email,
    otp: otpCode,
    expireAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await newRecord.save();

  const subject = "Mã OTP đặt lại mật khẩu";
  const content = `Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút.`;

  await sendMail(email, subject, content);

  return {
    result: "success" as const,
    message: "Đã gửi mã OTP đến email của bạn",
  };
};

export const verifyOtp = async (req: Request) => {
  const { email, otp } = req.body as { email: string; otp: string };

  const existRecord = await ForgotPassword.findOne({ email, otp });

  if (!existRecord) {
    return {
      result: "error" as const,
      message: "Mã OTP không đúng hoặc đã hết hạn",
    };
  }

  await ForgotPassword.deleteOne({ email, otp });

  const existAccount = await AccountAdmin.findOne({ email });

  if (!existAccount) {
    return {
      result: "error" as const,
      message: "Tài khoản không tồn tại",
    };
  }

  const token = jwt.sign(
    {
      _id: existAccount._id,
      email: existAccount.email,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "1d" },
  );

  return {
    result: "success" as const,
    message: "Xác thực OTP thành công",
    token,
  };
};

export const resetPassword = async (req: Request & { account?: any }) => {
  const { password } = req.body as { password: string };

  const account = (req as any).account;

  if (!account) {
    return {
      result: "error" as const,
      message: "Token không hợp lệ hoặc đã hết hạn",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await AccountAdmin.updateOne({ email: account.email }, { $set: { password: hashedPassword } });

  return {
    result: "success" as const,
    message: "Đặt lại mật khẩu thành công",
  };
};
