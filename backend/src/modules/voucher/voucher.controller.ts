import type { Request, Response } from "express";
import * as voucherService from "./voucher.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";

export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.list(req);
  sendSuccess(res, "Lấy danh sách mã giảm giá thành công", data);
});

export const createPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.createPost(req);
  sendSuccess(res, data.message, data.voucher, 201);
});

export const editPatch = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.editPatch(req);
  sendSuccess(res, data.message);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.deleteItem(req);
  sendSuccess(res, data.message, data.voucher);
});

export const getTrash = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.getTrash(req);
  sendSuccess(res, "Lấy thùng rác voucher thành công", data);
});

export const restoreItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.restoreItem(req);
  sendSuccess(res, data.message, data.voucher);
});

export const hardDeleteItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.hardDeleteItem(req);
  sendSuccess(res, data.message, data.voucher);
});

export const applyVoucher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await voucherService.applyVoucher(req);
  sendSuccess(res, data.message, data);
});
