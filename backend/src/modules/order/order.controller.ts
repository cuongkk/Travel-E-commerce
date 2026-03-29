import type { Request, Response } from "express";
import * as orderService from "./order.service";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await orderService.list(req);
    res.json({ code: "success", message: "Lấy danh sách đơn hàng thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy danh sách đơn hàng thất bại!" });
  }
};

export const edit = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await orderService.edit(req);
    if ((data as any).code === "error") {
      res.json(data);
      return;
    }
    res.json({ code: "success", message: "Lấy chi tiết đơn hàng thành công!", ...data });
  } catch (error) {
    res.json({ code: "error", message: "Lấy chi tiết đơn hàng thất bại!" });
  }
};

export const editPatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await orderService.editPatch(req);
    res.json(result);
  } catch (error) {
    res.json({ code: "error", message: "Cập nhật đơn hàng thất bại!" });
  }
};
