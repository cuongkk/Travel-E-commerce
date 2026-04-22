import bcrypt from "bcryptjs";
import slugify from "slugify";
import AccountAdmin from "./account.model";
import ForgotPassword from "./forgot-password.model";
import Tour from "../tour/tour.model";
import { generateRandomNumber } from "../../utils/generate.helper";
import { sendMail } from "../../utils/mail.helper";
import { Request } from "express";
import { newJti, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./auth.tokens";
import { HttpError } from "../../middlewares/error.middleware";

const serializeAccount = (accountInput: any) => {
  const account = accountInput?.toObject ? accountInput.toObject() : accountInput;

  return {
    id: account?._id?.toString?.() || "",
    fullName: account?.fullName || "",
    email: account?.email || "",
    phone: account?.phone || "",
    avatar: account?.avatar || "",
    role: account?.role || "client",
    status: account?.status || "",
    walletBalance: Number(account?.walletBalance || 0),
    wishlist: account?.wishlist || [],
    createdAt: account?.createdAt,
    updatedAt: account?.updatedAt,
  };
};

export const login = async (req: Request) => {
  const { email, password, rememberPassword } = req.body as { email: string; password: string; rememberPassword?: boolean };

  const existAccount = await AccountAdmin.findOne({ email, deleted: false });

  if (!existAccount) {
    throw new HttpError(401, "Email không tồn tại trong hệ thống");
  }

  const isPasswordValid = await bcrypt.compare(password, existAccount.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Mật khẩu không đúng");
  }

  if (existAccount.status === "initial") {
    throw new HttpError(403, "Tài khoản chưa được kích hoạt");
  }

  const userId = existAccount._id.toString();
  const userType = ((existAccount.role || "client") as string).toLowerCase() === "admin" ? "admin" : "client";

  const accessToken = signAccessToken({ sub: userId, userType });

  const jti = newJti();
  const refreshToken = signRefreshToken({ sub: userId, userType, jti }, Boolean(rememberPassword));
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await AccountAdmin.updateOne(
    { _id: existAccount._id },
    {
      $set: {
        refreshTokenHash,
        refreshTokenJti: jti,
      },
    },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      role: userType,
    },
  };
};

export const register = async (req: Request) => {
  const { fullName, email, password, ...rest } = req.body as any;

  const existAccount = await AccountAdmin.findOne({ email, deleted: false });

  if (existAccount) {
    throw new HttpError(409, "Email đã tồn tại, vui lòng sử dụng email khác");
  }

  const data: any = {
    ...rest,
    fullName,
    email,
    status: "active",
    role: rest.role || "client",
  };

  if (fullName) {
    data.slug = slugify(fullName, { lower: true, strict: true });
  }

  data.password = await bcrypt.hash(password, 10);

  const newAccount = new AccountAdmin(data);
  await newAccount.save();

  return {
    id: newAccount._id.toString(),
  };
};

export const forgotPassword = async (req: Request) => {
  const { email } = req.body as { email: string };

  const existAccount = await AccountAdmin.findOne({ email, status: "active" });

  if (!existAccount) {
    throw new HttpError(404, "Email không tồn tại trong hệ thống");
  }

  const existingOTP = await ForgotPassword.findOne({ email });

  if (existingOTP) {
    throw new HttpError(429, "Mã OTP đã được gửi. Vui lòng kiểm tra email của bạn.");
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
    ok: true,
  };
};

export const verifyOtp = async (req: Request) => {
  const { email, otp } = req.body as { email: string; otp: string };

  const existRecord = await ForgotPassword.findOne({ email, otp });

  if (!existRecord) {
    throw new HttpError(400, "Mã OTP không đúng hoặc đã hết hạn");
  }

  await ForgotPassword.deleteOne({ email, otp });

  const existAccount = await AccountAdmin.findOne({ email });

  if (!existAccount) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  // Issue a short-lived access token to allow password reset flow.
  const token = signAccessToken({ sub: existAccount._id.toString(), userType: "admin" });

  return {
    token,
  };
};

export const resetPassword = async (req: Request & { account?: any }) => {
  const { password } = req.body as { password: string };

  const account = (req as any).account;

  if (!account) {
    throw new HttpError(401, "Token không hợp lệ hoặc đã hết hạn");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await AccountAdmin.updateOne({ email: account.email }, { $set: { password: hashedPassword } });

  return {
    ok: true,
  };
};

export const getMe = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (accountFromMiddleware) {
    return {
      account: serializeAccount(accountFromMiddleware),
    };
  }

  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : undefined;
  const token = tokenFromHeader;

  if (!token) {
    throw new HttpError(401, "Không tìm thấy token xác thực");
  }

  try {
    const decoded = verifyAccessToken(token);
    const account = await AccountAdmin.findById(decoded.sub);

    if (!account) {
      throw new HttpError(404, "Tài khoản không tồn tại");
    }

    return {
      account: serializeAccount(account),
    };
  } catch (error) {
    throw new HttpError(401, "Token không hợp lệ hoặc đã hết hạn");
  }
};

export const updateMe = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;

  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để cập nhật thông tin");
  }

  const { fullName, phone, avatar } = req.body as {
    fullName?: string;
    phone?: string | null;
    avatar?: string | null;
  };

  const updates: Record<string, unknown> = {};

  if (typeof fullName === "string") {
    const normalizedName = fullName.trim();
    if (!normalizedName) {
      throw new HttpError(400, "Họ và tên không hợp lệ");
    }

    updates.fullName = normalizedName;
    updates.slug = slugify(normalizedName, { lower: true, strict: true });
  }

  if (phone !== undefined) {
    updates.phone = typeof phone === "string" ? phone.trim() : "";
  }

  if (avatar !== undefined) {
    updates.avatar = typeof avatar === "string" ? avatar.trim() : "";
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "Không có dữ liệu để cập nhật");
  }

  const updatedAccount = await AccountAdmin.findByIdAndUpdate(accountFromMiddleware._id, { $set: updates }, { new: true });

  if (!updatedAccount) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  return {
    account: serializeAccount(updatedAccount),
  };
};

export const changePassword = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;

  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để đổi mật khẩu");
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  if (currentPassword === newPassword) {
    throw new HttpError(400, "Mật khẩu mới phải khác mật khẩu hiện tại");
  }

  const account = await AccountAdmin.findById(accountFromMiddleware._id);
  if (!account) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, account.password);
  if (!isPasswordValid) {
    throw new HttpError(400, "Mật khẩu hiện tại không chính xác");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await AccountAdmin.updateOne(
    { _id: account._id },
    {
      $set: {
        password: newPasswordHash,
      },
      $unset: {
        refreshTokenHash: "",
        refreshTokenJti: "",
      },
    },
  );

  return {
    ok: true,
  };
};

export const uploadMyAvatar = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để cập nhật ảnh đại diện");
  }

  const uploadedFile = (req as any).file;
  const avatarUrl = uploadedFile?.path || uploadedFile?.secure_url;

  if (!avatarUrl) {
    throw new HttpError(400, "Không tìm thấy tệp ảnh hợp lệ");
  }

  const updatedAccount = await AccountAdmin.findByIdAndUpdate(accountFromMiddleware._id, { $set: { avatar: String(avatarUrl).trim() } }, { new: true });

  if (!updatedAccount) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  return {
    avatar: updatedAccount.avatar || "",
    account: serializeAccount(updatedAccount),
  };
};

export const getWalletBalance = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để xem số dư");
  }

  const account = await AccountAdmin.findById(accountFromMiddleware._id);
  if (!account) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  return {
    balance: Number(account.walletBalance || 0),
  };
};

export const walletPay = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để thanh toán");
  }

  const { amount } = req.body as { amount: number };
  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new HttpError(400, "Số tiền thanh toán không hợp lệ");
  }

  const account = await AccountAdmin.findById(accountFromMiddleware._id);
  if (!account) {
    throw new HttpError(404, "Tài khoản không tồn tại");
  }

  const currentBalance = Number(account.walletBalance || 0);
  if (currentBalance < normalizedAmount) {
    throw new HttpError(400, "Số dư không đủ để thanh toán");
  }

  const nextBalance = Number((currentBalance - normalizedAmount).toFixed(2));
  await AccountAdmin.updateOne({ _id: account._id }, { $set: { walletBalance: nextBalance } });

  return {
    paidAmount: normalizedAmount,
    balance: nextBalance,
    transactionCode: `PAY-${Date.now()}`,
  };
};

export const getWishlist = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để xem danh sách yêu thích");
  }

  const account = await AccountAdmin.findById(accountFromMiddleware._id);
  if (!account) throw new HttpError(404, "Tài khoản không tồn tại");

  const wishlistIds = account.wishlist || [];
  
  const tours = await Tour.find({
    _id: { $in: wishlistIds },
    deleted: false,
    status: "active"
  });

  return { wishlist: tours };
};

export const toggleWishlist = async (req: Request) => {
  const accountFromMiddleware = (req as any).account;
  if (!accountFromMiddleware?._id) {
    throw new HttpError(401, "Bạn cần đăng nhập để thực hiện tác vụ này");
  }

  const { tourId } = req.body as { tourId: string };
  if (!tourId) throw new HttpError(400, "Thiếu id của Tour");

  const tourInfo = await Tour.findOne({ _id: tourId, deleted: false });
  if (!tourInfo) throw new HttpError(404, "Tour không tồn tại");

  const account = await AccountAdmin.findById(accountFromMiddleware._id);
  if (!account) throw new HttpError(404, "Tài khoản không tồn tại");

  let currentWishlist = account.wishlist || [];
  let action = "added";

  if (currentWishlist.includes(tourId)) {
    currentWishlist = currentWishlist.filter(id => id !== tourId);
    action = "removed";
  } else {
    currentWishlist.push(tourId);
  }

  await AccountAdmin.updateOne(
    { _id: account._id },
    { $set: { wishlist: currentWishlist } }
  );

  return { action, tourId };
};

export const refresh = async (req: Request) => {
  const { refreshToken } = req.body as { refreshToken: string };

  const decoded = verifyRefreshToken(refreshToken);

  if (decoded.userType !== "admin" && decoded.userType !== "client") {
    throw new HttpError(403, "Unsupported user type");
  }

  const account = await AccountAdmin.findOne({
    _id: decoded.sub,
    status: "active",
  });

  if (!account || account.deleted) {
    throw new HttpError(401, "Tài khoản không hợp lệ hoặc đã bị khoá");
  }

  if (!account.refreshTokenHash || !account.refreshTokenJti) {
    throw new HttpError(401, "Refresh token not recognized");
  }

  if (account.refreshTokenJti !== decoded.jti) {
    throw new HttpError(401, "Refresh token has been rotated");
  }

  const matches = await bcrypt.compare(refreshToken, account.refreshTokenHash);
  if (!matches) {
    throw new HttpError(401, "Refresh token invalid");
  }

  // Rotate refresh token
  const newRefreshJti = newJti();
  const newRefreshToken = signRefreshToken({ sub: account._id.toString(), userType: decoded.userType, jti: newRefreshJti }, true);
  const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);

  await AccountAdmin.updateOne(
    { _id: account._id },
    {
      $set: {
        refreshTokenHash: newRefreshHash,
        refreshTokenJti: newRefreshJti,
      },
    },
  );

  const newAccessToken = signAccessToken({ sub: account._id.toString(), userType: decoded.userType });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
