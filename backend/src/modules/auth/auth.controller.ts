import { Request, Response } from "express";
import * as authService from "./auth.service";

export const login = (req: Request, res: Response): void => {
  res.json({
    result: "success",
    message: "Trang đăng nhập (API)",
  });
};

export const loginPost = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req);

  if (result.token) {
    res.cookie("token", result.token, {
      maxAge: result.rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });
  }

  res.json(result);
};

export const register = (req: Request, res: Response): void => {
  res.json({
    result: "success",
    message: "Trang đăng ký (API)",
  });
};

export const registerPost = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req);
  res.json(result);
};

export const forgotPassword = (req: Request, res: Response): void => {
  res.json({
    result: "success",
    message: "Trang quên mật khẩu (API)",
  });
};

export const forgotPasswordPost = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.forgotPassword(req);
  res.json(result);
};

export const otpPassword = (req: Request, res: Response): void => {
  res.json({
    result: "success",
    message: "Trang OTP mật khẩu (API)",
  });
};

export const otpPasswordPost = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.verifyOtp(req);

  if (result.token) {
    res.cookie("token", result.token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });
  }

  res.json(result);
};

export const resetPassword = (req: Request, res: Response): void => {
  res.json({
    result: "success",
    message: "Trang đặt lại mật khẩu (API)",
  });
};

export const resetPasswordPost = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.resetPassword(req as any);
  res.json(result);
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({
    result: "success",
    message: "Đăng xuất thành công",
  });
};
