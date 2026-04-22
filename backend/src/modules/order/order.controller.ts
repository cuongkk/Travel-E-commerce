import type { Request, Response } from "express";
import * as orderService from "./order.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { HttpError } from "../../middlewares/error.middleware";

export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await orderService.list(req);
  sendSuccess(res, "Lấy danh sách đơn hàng thành công!", data);
});

export const edit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await orderService.edit(req);
  if ((data as any).code === "error") throw new HttpError(404, (data as any).message || "Đơn hàng không tồn tại!");
  sendSuccess(res, "Lấy chi tiết đơn hàng thành công!", data);
});

export const editPatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await orderService.editPatch(req);
  if ((result as any).code === "error") throw new HttpError(400, (result as any).message || "Cập nhật đơn hàng thất bại!");
  sendSuccess(res, (result as any).message || "Đã cập nhật đơn hàng!", result);
});

export const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await orderService.create(req);
  sendSuccess(res, "Đặt hàng thành công!", result);
});
