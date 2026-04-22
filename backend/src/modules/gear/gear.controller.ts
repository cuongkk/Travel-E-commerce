import type { Request, Response } from "express";
import * as gearService from "./gear.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { HttpError } from "../../middlewares/error.middleware";

export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.list(req);
  sendSuccess(res, "Lấy danh sách gear thành công!", data);
});

export const createPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await gearService.createPost(req);
  if (result.code === "error") throw new HttpError(400, result.message);
  sendSuccess(res, result.message, result, 201);
});

export const edit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.edit(req);
  if ((data as any).code === "error") throw new HttpError(404, (data as any).message);
  sendSuccess(res, "Lấy chi tiết gear thành công!", data);
});

export const editPatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await gearService.editPatch(req);
  if (result.code === "error") throw new HttpError(400, result.message || "Đã có lỗi xảy ra");
  sendSuccess(res, result.message || "Cập nhật gear thành công!", result);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.deleteItem(req);
  sendSuccess(res, "Đã đưa gear vào thùng rác!", data);
});

export const getTrash = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.getTrash(req);
  sendSuccess(res, "Lấy danh sách thùng rác thành công!", data);
});

export const restoreItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.restoreItem(req);
  sendSuccess(res, "Khôi phục gear thành công!", data);
});

export const hardDeleteItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await gearService.hardDeleteItem(req);
  sendSuccess(res, "Xóa vĩnh viễn gear thành công!", data);
});
