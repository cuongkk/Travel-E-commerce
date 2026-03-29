import type { Request, Response } from "express";
import * as userService from "./user.service";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await userService.list(req);
    res.json({ code: "success", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy danh sách người dùng thất bại!" });
  }
};
