import { Request, Response } from "express";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";

const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge,
});

export const login = (req: Request, res: Response): void => {
  sendSuccess(res, "Trang đăng nhập (API)");
};

export const loginPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.login(req);

  const rememberPassword = Boolean((req.body as { rememberPassword?: boolean }).rememberPassword);

  res.cookie("accessToken", data.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", data.refreshToken, getCookieOptions(rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));

  sendSuccess(res, "Đăng nhập thành công", data);
});

export const register = (req: Request, res: Response): void => {
  sendSuccess(res, "Trang đăng ký (API)");
};

export const registerPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.register(req);
  sendSuccess(res, "Đăng ký thành công", data, 201);
});

export const forgotPassword = (req: Request, res: Response): void => {
  sendSuccess(res, "Trang quên mật khẩu (API)");
};

export const forgotPasswordPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.forgotPassword(req);
  sendSuccess(res, "Đã gửi mã OTP đến email của bạn", data);
});

export const otpPassword = (req: Request, res: Response): void => {
  sendSuccess(res, "Trang OTP mật khẩu (API)");
};

export const otpPasswordPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.verifyOtp(req);

  // Temporary auth for reset password flow.
  res.cookie("accessToken", data.token, getCookieOptions(10 * 60 * 1000));

  sendSuccess(res, "Xác thực OTP thành công", data);
});

export const resetPassword = (req: Request, res: Response): void => {
  sendSuccess(res, "Trang đặt lại mật khẩu (API)");
};

export const resetPasswordPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.resetPassword(req as any);
  sendSuccess(res, "Đặt lại mật khẩu thành công", data);
});

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendSuccess(res, "Đăng xuất thành công");
};

export const getWishlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.getWishlist(req);
  sendSuccess(res, "Lấy danh sách yêu thích thành công", data);
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.toggleWishlist(req);
  sendSuccess(res, data.action === "added" ? "Đã thêm vào danh sách yêu thích" : "Đã gỡ khỏi danh sách yêu thích", data);
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.getMe(req);
  sendSuccess(res, "Lấy thông tin người dùng thành công", data);
});

export const updateMePatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.updateMe(req);
  sendSuccess(res, "Cập nhật thông tin người dùng thành công", data);
});

export const changePasswordPatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.changePassword(req);
  sendSuccess(res, "Đổi mật khẩu thành công", data);
});

export const uploadAvatarPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.uploadMyAvatar(req);
  sendSuccess(res, "Tải ảnh đại diện thành công", data);
});

export const walletBalance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.getWalletBalance(req);
  sendSuccess(res, "Lấy số dư tài khoản thành công", data);
});

export const walletPayPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.walletPay(req);
  sendSuccess(res, "Thanh toán thành công", data);
});

export const refreshPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await authService.refresh(req);

  res.cookie("accessToken", data.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", data.refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));

  sendSuccess(res, "Làm mới token thành công", data);
});
