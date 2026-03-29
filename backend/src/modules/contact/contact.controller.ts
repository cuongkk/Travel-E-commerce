import type { Request, Response } from "express";
import * as contactService from "./contact.service";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await contactService.list(req);
    res.json({ code: "success", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy dữ liệu liên hệ thất bại!" });
  }
};
