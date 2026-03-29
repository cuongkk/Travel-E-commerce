import { NextFunction, Response } from "express";
import { AccountRequest } from "../interfaces/request.interface";

export const isAdmin = (req: AccountRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      result: "error",
      message: "Không có quyền truy cập (admin)!",
    });
    return;
  }
  next();
};

export const isClient = (req: AccountRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "client") {
    res.status(403).json({
      result: "error",
      message: "Không có quyền truy cập (client)!",
    });
    return;
  }
  next();
};
