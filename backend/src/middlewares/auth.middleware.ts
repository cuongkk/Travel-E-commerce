import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AccountAdmin from "../modules/auth/account-admin.model";
import { AccountRequest } from "../interfaces/request.interface";

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({
      result: "error",
      message: "Không tìm thấy token xác thực",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { _id: string };

    const existAccount = await AccountAdmin.findOne({
      _id: decoded._id,
      status: "active",
    });

    if (!existAccount) {
      res.clearCookie("token");
      res.status(401).json({
        result: "error",
        message: "Tài khoản không hợp lệ hoặc đã bị khoá",
      });
      return;
    }

    const reqWithAccount = req as AccountRequest;
    reqWithAccount.account = existAccount;
    reqWithAccount.user = {
      role: "admin",
      id: existAccount._id.toString(),
    };

    (res.locals as any).account = existAccount;

    next();
  } catch (error) {
    res.clearCookie("token");
    res.status(401).json({
      result: "error",
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
